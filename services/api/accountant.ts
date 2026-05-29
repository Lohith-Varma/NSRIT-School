import { mockStore, nextReceiptId } from '@/data/mock/store';
import type { FeeReceipt, FeeStatus, User } from '@/types';
import { ApiError, mockRequest } from './client';
import { assertRole, requireBranchId } from './rbac';

/** POST /accountant/payments */
export async function recordPayment(
  actor: User,
  feeStatusId: string,
  amount: number,
  method: FeeReceipt['paymentMethod'],
): Promise<FeeReceipt> {
  assertRole(actor, 'accountant', 'branch_admin');
  const branchId = requireBranchId(actor);

  const index = mockStore.fees.findIndex((f) => f.id === feeStatusId && f.branchId === branchId);
  if (index < 0) throw new ApiError('Fee status record not found', 404);

  const fee = mockStore.fees[index];
  if (amount <= 0) throw new ApiError('Amount must be greater than 0', 400);
  if (amount > fee.dueAmount) {
    throw new ApiError(`Cannot pay more than outstanding amount: ₹${fee.dueAmount}`, 400);
  }

  const student = mockStore.users.find((u) => u.id === fee.studentId);
  const studentName = student ? student.name : 'Unknown Student';

  const date = new Date().toISOString().split('T')[0];
  const receiptNumber = `RCPT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const newReceipt: FeeReceipt = {
    id: nextReceiptId(),
    branchId,
    feeStatusId,
    studentId: fee.studentId,
    studentName,
    amountPaid: amount,
    paymentMethod: method,
    transactionDate: date,
    receiptNumber,
  };

  // Update mockStore fees
  const updatedPaidAmount = fee.paidAmount + amount;
  const updatedDueAmount = fee.dueAmount - amount;
  const updatedStatus = updatedDueAmount === 0 ? 'paid' : 'partial';

  mockStore.fees[index] = {
    ...fee,
    paidAmount: updatedPaidAmount,
    dueAmount: updatedDueAmount,
    status: updatedStatus,
    lastPaymentDate: date,
  };

  mockStore.receipts.push(newReceipt);
  return mockRequest(newReceipt);
}

/** GET /accountant/receipts */
export async function getTransactions(actor: User): Promise<FeeReceipt[]> {
  assertRole(actor, 'accountant', 'branch_admin');
  const branchId = requireBranchId(actor);
  const list = mockStore.receipts.filter((r) => r.branchId === branchId);
  return mockRequest(list.sort((a, b) => b.transactionDate.localeCompare(a.transactionDate)));
}

/** GET /accountant/outstanding */
export async function getOutstandingFees(actor: User): Promise<FeeStatus[]> {
  assertRole(actor, 'accountant', 'coordinator', 'branch_admin');
  const branchId = requireBranchId(actor);
  const list = mockStore.fees.filter((f) => f.branchId === branchId && f.status !== 'paid');
  return mockRequest(list.sort((a, b) => b.dueAmount - a.dueAmount));
}

/** GET /accountant/analytics */
export async function getAccountantAnalytics(actor: User): Promise<{
  totalCollected: number;
  totalOutstanding: number;
  totalTarget: number;
  collectionRate: number;
  paymentMethodDistribution: { method: string; amount: number }[];
  recentReceipts: FeeReceipt[];
}> {
  assertRole(actor, 'accountant', 'branch_admin');
  const branchId = requireBranchId(actor);

  const fees = mockStore.fees.filter((f) => f.branchId === branchId);
  const totalCollected = fees.reduce((sum, f) => sum + f.paidAmount, 0);
  const totalOutstanding = fees.reduce((sum, f) => sum + f.dueAmount, 0);
  const totalTarget = totalCollected + totalOutstanding;
  const collectionRate = totalTarget > 0 ? Math.round((totalCollected / totalTarget) * 100) : 0;

  const receipts = mockStore.receipts.filter((r) => r.branchId === branchId);
  const methods = ['Cash', 'Cheque', 'Card', 'Online'] as const;
  const paymentMethodDistribution = methods.map((m) => {
    const amount = receipts.filter((r) => r.paymentMethod === m).reduce((s, r) => s + r.amountPaid, 0);
    return { method: m, amount };
  });

  return mockRequest({
    totalCollected,
    totalOutstanding,
    totalTarget,
    collectionRate,
    paymentMethodDistribution,
    recentReceipts: receipts.sort((a, b) => b.transactionDate.localeCompare(a.transactionDate)).slice(0, 5),
  });
}

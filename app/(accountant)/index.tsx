import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TextInput, Pressable, ScrollView, Alert } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FormField } from '@/components/ui/FormField';
import { Screen } from '@/components/ui/Screen';
import { StatCard, StatRow } from '@/components/ui/StatCard';
import { AppTheme, formatCurrency, formatDate } from '@/constants/Theme';
import { useActor } from '@/hooks/useActor';
import { useAuth } from '@/context/AuthContext';
import { getAccountantAnalytics, recordPayment, listAnnouncements } from '@/services/api';
import type { FeeReceipt, Announcement } from '@/types';
import { mockStore } from '@/data/mock/store';
import { useRouter } from 'expo-router';

export default function AccountantDashboardScreen() {
  const actor = useActor();
  const { signOut } = useAuth();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<any>(null);
  const [notices, setNotices] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [studentSearch, setStudentSearch] = useState('');
  const [foundFees, setFoundFees] = useState<any[]>([]);
  const [selectedFeeId, setSelectedFeeId] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<FeeReceipt['paymentMethod']>('Cash');
  const [submitting, setSubmitting] = useState(false);
  const [formErr, setFormErr] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const loadData = async () => {
    try {
      const [data, ann] = await Promise.all([
        getAccountantAnalytics(actor),
        listAnnouncements(actor),
      ]);
      setAnalytics(data);
      const filtered = ann.filter(n => n.targetAudience === 'All');
      setNotices(filtered.slice(0, 2));
    } catch (e) {
      console.warn('Failed to load accountant data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [actor]);

  // Real-time student fee search
  useEffect(() => {
    if (!studentSearch.trim()) {
      setFoundFees([]);
      return;
    }
    const q = studentSearch.trim().toLowerCase();
    const matches = mockStore.fees.filter((fee) => {
      const student = mockStore.users.find((u) => u.id === fee.studentId);
      const studentName = student ? student.name.toLowerCase() : '';
      return studentName.includes(q) && fee.status !== 'paid';
    }).map((fee) => {
      const student = mockStore.users.find((u) => u.id === fee.studentId);
      const cls = mockStore.classes.find((c) => c.id === fee.classId);
      return {
        id: fee.id,
        studentName: student ? student.name : 'Unknown',
        className: cls ? `${cls.name} (${cls.section})` : '—',
        dueAmount: fee.dueAmount,
      };
    });
    setFoundFees(matches.slice(0, 5));
  }, [studentSearch]);

  const handleCollect = async () => {
    if (!selectedFeeId) {
      setFormErr('Please select a student');
      return;
    }
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      setFormErr('Please enter a valid payment amount');
      return;
    }
    
    setSubmitting(true);
    setFormErr(null);
    try {
      await recordPayment(actor, selectedFeeId, amt, method);
      setAmount('');
      setSelectedFeeId('');
      setStudentSearch('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      await loadData();
    } catch (e: any) {
      setFormErr(e.message || 'Failed to collect payment');
    } finally {
      setSubmitting(false);
    }
  };

  const initials = actor.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  return (
    <Screen loading={loading} scroll>
      {/* 1. Profile Hero Card */}
      <Card style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.welcome}>Finance & Accounts Console</Text>
            <Text style={styles.name}>{actor.name}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.metaText}>Role: School Accountant</Text>
            </View>
          </View>
          <Pressable onPress={signOut} style={styles.logoutBtn} hitSlop={8}>
            <Text style={styles.logoutBtnText}>Logout</Text>
          </Pressable>
        </View>
      </Card>

      {analytics ? (
        <>
          {/* 2. Key Finance Summary Stats */}
          <StatRow>
            <StatCard label="Total Collected" value={formatCurrency(analytics.totalCollected)} color={AppTheme.success} />
            <StatCard label="Outstanding Dues" value={formatCurrency(analytics.totalOutstanding)} color={AppTheme.warning} />
            <StatCard label="Collection Rate" value={`${analytics.collectionRate}%`} color={AppTheme.primary} />
          </StatRow>

          <View style={styles.container}>
            {/* Left form column */}
            <View style={styles.formCol}>
              <Card style={styles.cardPadding}>
                <Text style={styles.sectionTitle}>💰 Collect Fee Payment</Text>
                
                <FormField label="Search Student">
                  <TextInput
                    style={styles.input}
                    placeholder="Enter student name..."
                    placeholderTextColor={AppTheme.textMuted}
                    value={studentSearch}
                    onChangeText={setStudentSearch}
                  />
                </FormField>

                {foundFees.length > 0 ? (
                  <View style={styles.resultsList}>
                    {foundFees.map((f) => (
                      <Pressable
                        key={f.id}
                        style={[styles.resultItem, selectedFeeId === f.id ? styles.resultItemActive : null]}
                        onPress={() => {
                          setSelectedFeeId(f.id);
                          setAmount(String(f.dueAmount));
                        }}>
                        <View style={styles.resultItemHeader}>
                          <Text style={styles.resultItemName}>{f.studentName}</Text>
                          <Text style={styles.resultItemDue}>Due: ₹{f.dueAmount.toLocaleString('en-IN')}</Text>
                        </View>
                        <Text style={styles.resultItemMeta}>{f.className}</Text>
                      </Pressable>
                    ))}
                  </View>
                ) : null}

                {selectedFeeId ? (
                  <View style={styles.paymentDetails}>
                    <FormField label="Payment Amount (₹)">
                      <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        value={amount}
                        onChangeText={setAmount}
                      />
                    </FormField>

                    <FormField label="Payment Method">
                      <View style={styles.methodRow}>
                        {(['Cash', 'Card', 'Cheque', 'Online'] as const).map((m) => (
                          <Pressable
                            key={m}
                            style={[styles.methodOption, method === m ? styles.methodOptionActive : null]}
                            onPress={() => setMethod(m)}>
                            <Text style={[styles.methodText, method === m ? styles.methodTextActive : null]}>
                              {m}
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                    </FormField>
                  </View>
                ) : null}

                {formErr ? <Text style={styles.errorText}>{formErr}</Text> : null}
                {success ? <Text style={styles.successText}>🎉 Payment recorded successfully!</Text> : null}

                <Button
                  title="Collect & Generate Receipt"
                  loading={submitting}
                  onPress={handleCollect}
                  style={styles.btnMargin}
                  disabled={!selectedFeeId}
                />
              </Card>
            </View>

            {/* Right history column */}
            <View style={styles.historyCol}>
              <View style={styles.historySectionHeader}>
                <Text style={styles.sectionTitle}>📄 Recent Payments</Text>
                <Pressable
                  style={styles.exportBtn}
                  onPress={() =>
                    Alert.alert(
                      'Ledger Export',
                      'The branch fee collection log ledger has been compiled and downloaded as an Excel sheet.',
                      [{ text: 'OK' }]
                    )
                  }>
                  <Text style={styles.exportBtnText}>📊 Export Ledger</Text>
                </Pressable>
              </View>
              <ScrollView showsVerticalScrollIndicator={false} style={styles.historyScroll}>
                {analytics.recentReceipts.map((rcpt: FeeReceipt) => (
                  <Card key={rcpt.id} style={styles.receiptCard}>
                    <View style={styles.receiptHeader}>
                      <Text style={styles.receiptStudent}>{rcpt.studentName}</Text>
                      <Text style={styles.receiptAmt}>{formatCurrency(rcpt.amountPaid)}</Text>
                    </View>
                    <View style={styles.receiptFooter}>
                      <Text style={styles.receiptMeta}>{rcpt.receiptNumber} • {rcpt.paymentMethod}</Text>
                      <Text style={styles.receiptDate}>{formatDate(rcpt.transactionDate)}</Text>
                    </View>
                  </Card>
                ))}
                {analytics.recentReceipts.length === 0 ? (
                  <Text style={styles.emptyText}>No transactions recorded today.</Text>
                ) : null}
              </ScrollView>
            </View>
          </View>

          {/* Recent Bulletins section */}
          {notices.length > 0 ? (
            <View style={styles.noticesSection}>
              <Text style={styles.sectionTitle}>📢 Campus Announcements</Text>
              {notices.map((n) => (
                <Card key={n.id} style={styles.noticeCard}>
                  <View style={styles.noticeCardHeader}>
                    <Text style={styles.noticeTitle}>{n.title}</Text>
                    <Text style={styles.noticeDate}>{new Date(n.createdAt).toLocaleDateString()}</Text>
                  </View>
                  <Text style={styles.noticeContent} numberOfLines={2}>{n.content}</Text>
                </Card>
              ))}
            </View>
          ) : null}
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    padding: 20,
    marginBottom: 16,
    backgroundColor: AppTheme.primary,
    borderColor: AppTheme.primary,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.22)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 14,
  },
  welcome: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
  },
  name: {
    fontSize: 19,
    fontWeight: '800',
    color: '#ffffff',
    marginVertical: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  metaText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  logoutBtn: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  logoutBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 8,
  },
  formCol: {
    flex: 1.1,
    minWidth: 320,
  },
  historyCol: {
    flex: 0.9,
    minWidth: 300,
  },
  cardPadding: {
    padding: 20,
    backgroundColor: '#ffffff',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: AppTheme.textMuted,
    textTransform: 'uppercase',
    marginBottom: 10,
    marginTop: 14,
    letterSpacing: 0.8,
  },
  input: {
    borderWidth: 1,
    borderColor: AppTheme.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: AppTheme.text,
    backgroundColor: AppTheme.background,
  },
  resultsList: {
    backgroundColor: AppTheme.background,
    borderRadius: 8,
    padding: 8,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: AppTheme.border,
  },
  resultItem: {
    padding: 10,
    borderRadius: 6,
    marginBottom: 6,
    backgroundColor: '#ffffff',
  },
  resultItemActive: {
    backgroundColor: `${AppTheme.accent}08`,
    borderColor: AppTheme.accent,
    borderWidth: 1.5,
  },
  resultItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: AppTheme.text,
  },
  resultItemDue: {
    fontSize: 13,
    fontWeight: '700',
    color: AppTheme.danger,
  },
  resultItemMeta: {
    fontSize: 11,
    color: AppTheme.textMuted,
    marginTop: 2,
  },
  paymentDetails: {
    marginTop: 8,
  },
  methodRow: {
    flexDirection: 'row',
    gap: 6,
  },
  methodOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: AppTheme.border,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodOptionActive: {
    backgroundColor: AppTheme.accent,
    borderColor: AppTheme.accent,
  },
  methodText: {
    fontSize: 13,
    fontWeight: '600',
    color: AppTheme.text,
  },
  methodTextActive: {
    color: '#ffffff',
  },
  btnMargin: {
    marginTop: 16,
    backgroundColor: AppTheme.accent,
  },
  errorText: {
    color: AppTheme.danger,
    fontSize: 14,
    marginTop: 8,
  },
  successText: {
    color: AppTheme.success,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  historySectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  exportBtn: {
    backgroundColor: `${AppTheme.primary}12`,
    borderColor: AppTheme.primary,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  exportBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: AppTheme.primary,
  },
  historyScroll: {
    maxHeight: 460,
  },
  receiptCard: {
    padding: 14,
    marginBottom: 8,
    backgroundColor: '#ffffff',
  },
  receiptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  receiptStudent: {
    fontSize: 14,
    fontWeight: '600',
    color: AppTheme.text,
  },
  receiptAmt: {
    fontSize: 14,
    fontWeight: '700',
    color: AppTheme.success,
  },
  receiptFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  receiptMeta: {
    fontSize: 11,
    color: AppTheme.textMuted,
  },
  receiptDate: {
    fontSize: 11,
    color: AppTheme.textMuted,
  },
  emptyText: {
    textAlign: 'center',
    color: AppTheme.textMuted,
    paddingTop: 32,
    fontSize: 13,
  },
  noticesSection: {
    marginTop: 16,
  },
  noticeCard: {
    padding: 14,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: AppTheme.coordinator,
  },
  noticeCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  noticeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: AppTheme.text,
  },
  noticeDate: {
    fontSize: 11,
    color: AppTheme.textMuted,
  },
  noticeContent: {
    fontSize: 12,
    color: AppTheme.textMuted,
    lineHeight: 17,
  },
});

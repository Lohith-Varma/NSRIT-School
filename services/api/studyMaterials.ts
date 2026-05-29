import { mockStore, nextStudyMaterialId } from '@/data/mock/store';
import type { StudyMaterial, User } from '@/types';
import { ApiError, mockRequest } from './client';
import { assertRole, requireBranchId } from './rbac';

/** POST /study-materials */
export async function uploadStudyMaterial(
  actor: User,
  classId: string,
  subject: string,
  title: string,
  description: string,
  fileType: StudyMaterial['fileType'],
  url: string,
): Promise<StudyMaterial> {
  assertRole(actor, 'teacher');
  const branchId = requireBranchId(actor);

  const cls = mockStore.classes.find((c) => c.id === classId && c.branchId === branchId);
  if (!cls) throw new ApiError('Class not found', 404);

  const dateStr = new Date().toISOString().split('T')[0];

  const newMaterial: StudyMaterial = {
    id: nextStudyMaterialId(),
    branchId,
    classId,
    className: `${cls.name} (${cls.section})`,
    subject,
    title: title.trim(),
    description: description.trim(),
    fileType,
    url: url.trim(),
    uploadedBy: actor.id,
    uploadedByName: actor.name,
    uploadedAt: dateStr,
  };

  mockStore.studyMaterials.push(newMaterial);
  return mockRequest(newMaterial);
}

/** GET /study-materials/:classId */
export async function listStudyMaterialsForClass(actor: User, classId: string): Promise<StudyMaterial[]> {
  const branchId = requireBranchId(actor);
  const materials = mockStore.studyMaterials.filter(
    (m) => m.classId === classId && m.branchId === branchId
  );
  return mockRequest(materials.sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt)));
}

/** DELETE /study-materials/:materialId */
export async function deleteStudyMaterial(actor: User, materialId: string): Promise<void> {
  assertRole(actor, 'teacher');
  const index = mockStore.studyMaterials.findIndex(
    (m) => m.id === materialId && m.uploadedBy === actor.id
  );
  if (index < 0) throw new ApiError('Study material not found or forbidden', 404);

  mockStore.studyMaterials.splice(index, 1);
  return mockRequest(undefined);
}

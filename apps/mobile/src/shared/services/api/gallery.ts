import { mockStore, nextGalleryAlbumId } from '@/data/mock/store';
import type { GalleryAlbum, User } from '@/types';
import { ApiError, mockRequest } from './client';
import { assertRole, requireBranchId } from './rbac';

/** GET /gallery */
export async function listGalleryAlbums(actor: User): Promise<GalleryAlbum[]> {
  const branchId = requireBranchId(actor);
  const albums = mockStore.galleryAlbums.filter((a) => a.branchId === branchId);
  return mockRequest(albums.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
}

/** POST /gallery */
export async function createGalleryAlbum(
  actor: User,
  title: string,
  description: string,
  coverImage: string,
): Promise<GalleryAlbum> {
  assertRole(actor, 'branch_admin', 'coordinator', 'principal');
  const branchId = requireBranchId(actor);

  const dateStr = new Date().toISOString().split('T')[0];

  const newAlbum: GalleryAlbum = {
    id: nextGalleryAlbumId(),
    branchId,
    title: title.trim(),
    description: description.trim(),
    coverImage: coverImage.trim() || 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=600&auto=format&fit=crop',
    images: [coverImage.trim()],
    createdAt: dateStr,
  };

  mockStore.galleryAlbums.push(newAlbum);
  return mockRequest(newAlbum);
}

/** POST /gallery/:albumId/photos */
export async function addPhotoToAlbum(actor: User, albumId: string, url: string): Promise<GalleryAlbum> {
  assertRole(actor, 'branch_admin', 'coordinator', 'principal', 'teacher');
  const branchId = requireBranchId(actor);

  const album = mockStore.galleryAlbums.find((a) => a.id === albumId && a.branchId === branchId);
  if (!album) throw new ApiError('Album not found', 404);

  album.images.push(url.trim());
  return mockRequest(album);
}

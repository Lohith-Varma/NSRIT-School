import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { AppTheme, formatDate } from '@/constants/Theme';
import { listGalleryAlbums } from '@/services/api';
import type { GalleryAlbum } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, ScrollView, Pressable, Modal, Dimensions } from 'react-native';

export function GalleryScreen() {
  const { user } = useAuth();
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<GalleryAlbum | null>(null);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    listGalleryAlbums(user)
      .then(setAlbums)
      .catch((err) => console.warn('Failed to load gallery albums', err))
      .finally(() => setLoading(false));
  }, [user]);

  const handleOpenAlbum = (album: GalleryAlbum) => {
    setSelectedAlbum(album);
  };

  const handleViewImage = (img: string) => {
    setSelectedImage(img);
    setViewerVisible(true);
  };

  return (
    <Screen title="School Gallery" subtitle="Moments & events of campus activities" loading={loading} scroll={!selectedAlbum}>
      {selectedAlbum ? (
        // Album Details View
        <View style={styles.albumViewContainer}>
          <View style={styles.headerRow}>
            <Pressable style={styles.backLinkBtn} onPress={() => setSelectedAlbum(null)}>
              <Text style={styles.backLinkText}>⬅ Back to Albums</Text>
            </Pressable>
            <Text style={styles.albumTitleText}>{selectedAlbum.title}</Text>
          </View>
          <Text style={styles.albumDescText}>{selectedAlbum.description}</Text>
          <Text style={styles.albumDateText}>Published: {formatDate(selectedAlbum.createdAt)}</Text>

          <ScrollView contentContainerStyle={styles.imagesGrid} showsVerticalScrollIndicator={false}>
            {selectedAlbum.images.map((img, idx) => (
              <Pressable key={idx} style={styles.imageCardBtn} onPress={() => handleViewImage(img)}>
                <Image source={{ uri: img }} style={styles.gridImage} />
              </Pressable>
            ))}
          </ScrollView>
        </View>
      ) : (
        // Albums Overview Listing
        <View style={styles.grid}>
          {albums.map((album) => (
            <Pressable key={album.id} style={styles.albumCardBtn} onPress={() => handleOpenAlbum(album)}>
              <Card style={styles.albumCard}>
                <Image source={{ uri: album.coverImage }} style={styles.coverImage} />
                <View style={styles.albumInfo}>
                  <Text style={styles.albumTitle}>{album.title}</Text>
                  <Text style={styles.albumMeta}>{album.images.length} photos • {formatDate(album.createdAt)}</Text>
                  <Text style={styles.albumDesc} numberOfLines={2}>{album.description}</Text>
                </View>
              </Card>
            </Pressable>
          ))}

          {albums.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>No photo albums published in the school gallery yet.</Text>
            </Card>
          ) : null}
        </View>
      )}

      {/* Full Screen Image Viewer Modal */}
      <Modal visible={viewerVisible} transparent animationType="fade" onRequestClose={() => setViewerVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setViewerVisible(false)}>
          <View style={styles.modalContent}>
            <Pressable style={styles.closeBtn} onPress={() => setViewerVisible(false)}>
              <Text style={styles.closeText}>✕ Close</Text>
            </Pressable>
            {selectedImage ? (
              <Image source={{ uri: selectedImage }} style={styles.largeImage} resizeMode="contain" />
            ) : null}
          </View>
        </Pressable>
      </Modal>
    </Screen>
  );
}

const { width } = Dimensions.get('window');
const columnWidth = (width - 48) / 2;

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 8,
  },
  albumCardBtn: {
    width: '100%',
    maxWidth: 320,
    marginBottom: 8,
  },
  albumCard: {
    overflow: 'hidden',
    padding: 0,
    elevation: 4,
  },
  coverImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#cbd5e1',
  },
  albumInfo: {
    padding: 14,
  },
  albumTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: AppTheme.text,
  },
  albumMeta: {
    fontSize: 11,
    color: AppTheme.textMuted,
    marginTop: 4,
    fontWeight: '600',
  },
  albumDesc: {
    fontSize: 13,
    color: AppTheme.textMuted,
    marginTop: 8,
    lineHeight: 18,
  },
  albumViewContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 6,
  },
  backLinkBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: AppTheme.border,
    borderRadius: 6,
  },
  backLinkText: {
    fontSize: 12,
    fontWeight: '600',
    color: AppTheme.text,
  },
  albumTitleText: {
    fontSize: 18,
    fontWeight: '700',
    color: AppTheme.text,
  },
  albumDescText: {
    fontSize: 14,
    color: AppTheme.textMuted,
    marginBottom: 4,
  },
  albumDateText: {
    fontSize: 12,
    color: AppTheme.accent,
    fontWeight: '600',
    marginBottom: 16,
  },
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingBottom: 40,
  },
  imageCardBtn: {
    width: columnWidth > 180 ? 180 : columnWidth,
    height: 130,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: AppTheme.border,
  },
  gridImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e2e8f0',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    height: '80%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    zIndex: 10,
  },
  closeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  largeImage: {
    width: '100%',
    height: '100%',
  },
  emptyCard: {
    padding: 32,
    alignItems: 'center',
    width: '100%',
  },
  emptyText: {
    color: AppTheme.textMuted,
    fontSize: 14,
  },
});

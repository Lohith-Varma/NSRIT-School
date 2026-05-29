import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { AppTheme, formatDate } from '@/constants/Theme';
import { useAuth } from '@/context/AuthContext';
import { listStudyMaterialsForClass } from '@/services/api';
import type { StudyMaterial } from '@/types';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, Pressable, Alert } from 'react-native';

export default function ParentMaterialsScreen() {
  const { user, activeChild } = useAuth();
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [filtered, setFiltered] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'pdf' | 'notes' | 'ppt'>('all');

  useEffect(() => {
    if (!user || !activeChild || !activeChild.classId) return;
    setLoading(true);
    listStudyMaterialsForClass(user, activeChild.classId)
      .then((data) => {
        setMaterials(data);
        setFiltered(data);
      })
      .catch((err) => console.warn('Failed to load materials', err))
      .finally(() => setLoading(false));
  }, [user, activeChild]);

  useEffect(() => {
    let result = [...materials];

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.subject.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q)
      );
    }

    // Type filter
    if (selectedType !== 'all') {
      result = result.filter((m) => m.fileType === selectedType);
    }

    setFiltered(result);
  }, [search, selectedType, materials]);

  const handleDownload = (material: StudyMaterial) => {
    Alert.alert(
      'Download Started',
      `Downloading "${material.title}" (${material.fileType.toUpperCase()}) for ${activeChild?.name}...`,
      [{ text: 'OK' }]
    );
  };

  if (!activeChild) {
    return (
      <Screen title="Study Materials">
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyText}>Please select a child profile to view study materials.</Text>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen title={`Study Materials: ${activeChild.name}`} subtitle="View and download notes uploaded by teachers" loading={loading} scroll>
      <Card style={styles.filterCard}>
        <Text style={styles.filterTitle}>Search & Filter</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by title, subject, or description..."
          placeholderTextColor={AppTheme.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        <View style={styles.tabsRow}>
          {(['all', 'pdf', 'notes', 'ppt'] as const).map((type) => (
            <Pressable
              key={type}
              style={[styles.tabButton, selectedType === type ? styles.tabButtonActive : null]}
              onPress={() => setSelectedType(type)}>
              <Text style={[styles.tabLabel, selectedType === type ? styles.tabLabelActive : null]}>
                {type === 'all' ? 'All Formats' : type.toUpperCase()}
              </Text>
            </Pressable>
          ))}
        </View>
      </Card>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        <View style={styles.grid}>
          {filtered.map((mat) => (
            <Card key={mat.id} style={styles.materialCard}>
              <View style={styles.cardHeader}>
                <View style={styles.titleBlock}>
                  <Text style={styles.subjectText}>{mat.subject}</Text>
                  <Text style={styles.materialTitle}>{mat.title}</Text>
                </View>
                <Badge
                  label={mat.fileType.toUpperCase()}
                  color={
                    mat.fileType === 'pdf'
                      ? '#ef4444'
                      : mat.fileType === 'ppt'
                        ? '#f97316'
                        : '#3b82f6'
                  }
                />
              </View>

              <Text style={styles.descText}>{mat.description}</Text>

              <View style={styles.metaRow}>
                <Text style={styles.metaText}>Uploaded by: {mat.uploadedByName}</Text>
                <Text style={styles.metaText}>Date: {formatDate(mat.uploadedAt)}</Text>
              </View>

              <Button
                title="Download Material"
                variant="outline"
                onPress={() => handleDownload(mat)}
                style={styles.downloadBtn}
              />
            </Card>
          ))}

          {filtered.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>No study materials found matching filters.</Text>
            </Card>
          ) : null}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  filterCard: {
    padding: 16,
    marginBottom: 16,
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: AppTheme.text,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: AppTheme.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: AppTheme.text,
    backgroundColor: AppTheme.background,
    marginBottom: 12,
  },
  tabsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tabButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: AppTheme.background,
    borderWidth: 1,
    borderColor: AppTheme.border,
  },
  tabButtonActive: {
    backgroundColor: AppTheme.primary,
    borderColor: AppTheme.primary,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: AppTheme.text,
  },
  tabLabelActive: {
    color: '#fff',
  },
  scroll: {
    marginTop: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  materialCard: {
    flex: 1,
    minWidth: 280,
    padding: 16,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  titleBlock: {
    flex: 1,
  },
  subjectText: {
    fontSize: 11,
    fontWeight: '700',
    color: AppTheme.accent,
    textTransform: 'uppercase',
  },
  materialTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: AppTheme.text,
    marginTop: 2,
  },
  descText: {
    fontSize: 13,
    color: AppTheme.textMuted,
    marginVertical: 10,
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: AppTheme.border,
    marginBottom: 12,
  },
  metaText: {
    fontSize: 11,
    color: AppTheme.textMuted,
  },
  downloadBtn: {
    marginTop: 4,
  },
  emptyCard: {
    flex: 1,
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: AppTheme.textMuted,
    fontSize: 14,
  },
});

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FormField } from '@/components/ui/FormField';
import { Screen } from '@/components/ui/Screen';
import { Badge } from '@/components/ui/Badge';
import { AppTheme, formatDate } from '@/constants/Theme';
import { useActor } from '@/hooks/useActor';
import {
  getClassesForTeacher,
  uploadStudyMaterial,
  listStudyMaterialsForClass,
  deleteStudyMaterial,
} from '@/services/api';
import type { Class, StudyMaterial } from '@/types';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TextInput, Pressable, ScrollView, Alert } from 'react-native';

export default function TeacherMaterialsScreen() {
  const actor = useActor();
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [materialsList, setMaterialsList] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [subject, setSubject] = useState('');
  const [fileType, setFileType] = useState<'pdf' | 'notes' | 'ppt'>('pdf');
  const [fileUrl, setFileUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formErr, setFormErr] = useState<string | null>(null);

  const loadClasses = async () => {
    try {
      const data = await getClassesForTeacher(actor, actor.id);
      setClasses(data);
      if (data.length > 0) {
        setSelectedClassId(data[0].id);
        setSubject(data[0].subject || 'General');
      }
    } catch (e) {
      console.warn('Failed to load teacher classes', e);
    }
  };

  const loadMaterials = async (classId: string) => {
    if (!classId) return;
    try {
      const data = await listStudyMaterialsForClass(actor, classId);
      setMaterialsList(data);
    } catch (e) {
      console.warn('Failed to load materials', e);
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadClasses();
      setLoading(false);
    })();
  }, [actor]);

  useEffect(() => {
    if (selectedClassId) {
      loadMaterials(selectedClassId);
      const cls = classes.find((c) => c.id === selectedClassId);
      if (cls) setSubject(cls.subject || 'General');
    }
  }, [selectedClassId, classes]);

  const handleUpload = async () => {
    if (!title.trim() || !desc.trim() || !fileUrl.trim()) {
      setFormErr('Please fill out all fields');
      return;
    }
    setSubmitting(true);
    setFormErr(null);
    try {
      await uploadStudyMaterial(actor, selectedClassId, subject, title, desc, fileType, fileUrl);
      setTitle('');
      setDesc('');
      setFileUrl('');
      loadMaterials(selectedClassId);
      Alert.alert('Upload Successful', 'Material is now visible to parents and students!');
    } catch (e: any) {
      setFormErr(e.message || 'Failed to upload material');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (matId: string) => {
    Alert.alert(
      'Delete Material',
      'Are you sure you want to remove this study material?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteStudyMaterial(actor, matId);
              loadMaterials(selectedClassId);
            } catch (e: any) {
              Alert.alert('Error', e.message || 'Failed to delete');
            }
          },
        },
      ]
    );
  };

  return (
    <Screen title="Study Materials" subtitle="Upload and manage study materials" loading={loading} scroll>
      {classes.length > 0 ? (
        <View style={styles.classSelector}>
          <Text style={styles.selectorLabel}>Select Class:</Text>
          <View style={styles.tabsRow}>
            {classes.map((cls) => (
              <Pressable
                key={cls.id}
                style={[styles.tabButton, selectedClassId === cls.id ? styles.tabButtonActive : null]}
                onPress={() => setSelectedClassId(cls.id)}>
                <Text style={[styles.tabLabel, selectedClassId === cls.id ? styles.tabLabelActive : null]}>
                  {cls.name} ({cls.section})
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}

      <View style={styles.layoutContainer}>
        <View style={styles.formCol}>
          <Card style={styles.cardPadding}>
            <Text style={styles.sectionTitle}>Upload New Material</Text>

            <FormField label="Subject/Topic">
              <TextInput
                style={styles.input}
                value={subject}
                onChangeText={setSubject}
              />
            </FormField>

            <FormField label="Material Title">
              <TextInput
                style={styles.input}
                placeholder="e.g. Chapter 3: Algebra Formulas"
                placeholderTextColor={AppTheme.textMuted}
                value={title}
                onChangeText={setTitle}
              />
            </FormField>

            <FormField label="Description">
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Brief summary or description of the document..."
                placeholderTextColor={AppTheme.textMuted}
                multiline
                numberOfLines={3}
                value={desc}
                onChangeText={setDesc}
              />
            </FormField>

            <FormField label="Format Type">
              <View style={styles.formatsRow}>
                {(['pdf', 'notes', 'ppt'] as const).map((type) => (
                  <Pressable
                    key={type}
                    style={[styles.formatBtn, fileType === type ? styles.formatBtnActive : null]}
                    onPress={() => setFileType(type)}>
                    <Text style={[styles.formatBtnText, fileType === type ? styles.formatBtnTextActive : null]}>
                      {type.toUpperCase()}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </FormField>

            <FormField label="Document URL Link">
              <TextInput
                style={styles.input}
                placeholder="e.g. https://server.com/file.pdf"
                placeholderTextColor={AppTheme.textMuted}
                value={fileUrl}
                onChangeText={setFileUrl}
              />
            </FormField>

            {formErr ? <Text style={styles.errorText}>{formErr}</Text> : null}

            <Button
              title="Upload to Cloud"
              loading={submitting}
              onPress={handleUpload}
              style={styles.uploadBtn}
            />
          </Card>
        </View>

        <View style={styles.listCol}>
          <Card style={styles.cardPadding}>
            <Text style={styles.sectionTitle}>Uploaded Files</Text>
            <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
              {materialsList.map((mat) => (
                <View key={mat.id} style={styles.itemRow}>
                  <View style={styles.itemInfo}>
                    <View style={styles.headerRow}>
                      <Text style={styles.itemTitle}>{mat.title}</Text>
                      <Badge
                        label={mat.fileType.toUpperCase()}
                        color={mat.fileType === 'pdf' ? '#ef4444' : mat.fileType === 'ppt' ? '#f97316' : '#3b82f6'}
                      />
                    </View>
                    <Text style={styles.itemSubject}>Subject: {mat.subject}</Text>
                    <Text style={styles.itemDate}>Uploaded: {formatDate(mat.uploadedAt)}</Text>
                  </View>
                  <Pressable style={styles.deleteBtn} onPress={() => handleDelete(mat.id)}>
                    <Text style={styles.deleteText}>Delete</Text>
                  </Pressable>
                </View>
              ))}

              {materialsList.length === 0 ? (
                <Text style={styles.emptyText}>No materials uploaded for this class yet.</Text>
              ) : null}
            </ScrollView>
          </Card>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  classSelector: {
    marginBottom: 16,
  },
  selectorLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: AppTheme.textMuted,
    marginBottom: 8,
  },
  tabsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: AppTheme.surface,
    borderWidth: 1.5,
    borderColor: AppTheme.border,
  },
  tabButtonActive: {
    backgroundColor: AppTheme.primary,
    borderColor: AppTheme.primary,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: AppTheme.text,
  },
  tabLabelActive: {
    color: '#fff',
  },
  layoutContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  formCol: {
    flex: 1,
    minWidth: 320,
  },
  listCol: {
    flex: 1.2,
    minWidth: 340,
  },
  cardPadding: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: AppTheme.text,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: AppTheme.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: AppTheme.text,
  },
  textArea: {
    height: 70,
    textAlignVertical: 'top',
  },
  formatsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  formatBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: AppTheme.border,
    alignItems: 'center',
    backgroundColor: AppTheme.background,
  },
  formatBtnActive: {
    borderColor: AppTheme.primary,
    backgroundColor: `${AppTheme.primary}06`,
  },
  formatBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: AppTheme.textMuted,
  },
  formatBtnTextActive: {
    color: AppTheme.primary,
  },
  errorText: {
    color: AppTheme.danger,
    fontSize: 14,
    marginTop: 6,
  },
  uploadBtn: {
    marginTop: 12,
  },
  scroll: {
    maxHeight: 460,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.border,
    gap: 12,
  },
  itemInfo: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: AppTheme.text,
  },
  itemSubject: {
    fontSize: 12,
    color: AppTheme.textMuted,
  },
  itemDate: {
    fontSize: 11,
    color: AppTheme.textMuted,
    marginTop: 2,
  },
  deleteBtn: {
    borderColor: AppTheme.danger,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  deleteText: {
    fontSize: 12,
    color: AppTheme.danger,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: AppTheme.textMuted,
    fontSize: 14,
    paddingVertical: 20,
  },
});

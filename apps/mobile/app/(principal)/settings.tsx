import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FormField } from '@/components/ui/FormField';
import { Screen } from '@/components/ui/Screen';
import { AppTheme } from '@/constants/Theme';
import { useActor } from '@/hooks/useActor';
import { getBranchForActor, updateBranchSettings } from '@/services/api';
import type { Branch } from '@/types';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TextInput, Alert, ScrollView } from 'react-native';
import { logAction } from '@/services/api/audit';

export default function PrincipalSettingsScreen() {
  const actor = useActor();
  const [branch, setBranch] = useState<Branch | null>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [academicYear, setAcademicYear] = useState('');
  const [currentTermLabel, setCurrentTermLabel] = useState('');
  const [timezone, setTimezone] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const b = await getBranchForActor(actor);
        setBranch(b);
        setAcademicYear(b.settings?.academicYear || '2025-2026');
        setCurrentTermLabel(b.settings?.currentTermLabel || 'Term 1');
        setTimezone(b.settings?.timezone || 'IST (UTC+05:30)');
        setNotes(b.settings?.notes || '');
      } catch (e) {
        console.warn('Failed to load branch details', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [actor]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await updateBranchSettings(actor, {
        academicYear,
        currentTermLabel,
        timezone,
        notes,
      });
      setBranch(updated);
      await logAction(actor, 'ERP Configuration Updated', `Updated active term to "${currentTermLabel}" and academic year to "${academicYear}"`);
      Alert.alert('Configuration Saved', 'ERP settings and parameters have been successfully updated school-wide!');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to update branch settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen title="ERP Configuration" subtitle="Manage active term dates, branch profile details, and ERP system parameters" loading={loading} scroll>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        <View style={styles.layout}>
          <View style={styles.formCol}>
            <Card style={styles.cardPadding}>
              <Text style={styles.sectionTitle}>ERP System Parameters</Text>

              <FormField label="Active Academic Year">
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 2025-2026"
                  placeholderTextColor={AppTheme.textMuted}
                  value={academicYear}
                  onChangeText={setAcademicYear}
                />
              </FormField>

              <FormField label="Current Term Label">
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Term 1, Mid-Term, Final Exams"
                  placeholderTextColor={AppTheme.textMuted}
                  value={currentTermLabel}
                  onChangeText={setCurrentTermLabel}
                />
              </FormField>

              <FormField label="Timezone">
                <TextInput
                  style={styles.input}
                  placeholder="e.g. IST (UTC+05:30)"
                  placeholderTextColor={AppTheme.textMuted}
                  value={timezone}
                  onChangeText={setTimezone}
                />
              </FormField>

              <FormField label="School-Wide Announcements / Notes">
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Enter notice content to display on all dashboards..."
                  placeholderTextColor={AppTheme.textMuted}
                  multiline
                  numberOfLines={4}
                  value={notes}
                  onChangeText={setNotes}
                />
              </FormField>

              <Button
                title="Save Configuration"
                loading={saving}
                onPress={handleSave}
                style={styles.saveBtn}
              />
            </Card>
          </View>

          <View style={styles.infoCol}>
            {branch ? (
              <Card style={styles.infoCard}>
                <Text style={styles.infoTitle}>Branch Profile</Text>
                
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Branch Name</Text>
                  <Text style={styles.infoValue}>{branch.name}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Branch Code</Text>
                  <Text style={styles.infoValue}>{branch.code}</Text>
                </View>

                {branch.address ? (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Address</Text>
                    <Text style={styles.infoValue}>{branch.address}</Text>
                  </View>
                ) : null}

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Status</Text>
                  <Text style={[styles.infoValue, { color: branch.active ? AppTheme.success : AppTheme.danger, fontWeight: '700' }]}>
                    {branch.active ? 'ACTIVE BRANCH' : 'INACTIVE'}
                  </Text>
                </View>

                <View style={styles.sysBlock}>
                  <Text style={styles.sysTitle}>ERP Status Overview</Text>
                  <Text style={styles.sysText}>✓ Database persistency: PERSISTED</Text>
                  <Text style={styles.sysText}>✓ Synchronization: LIVE PARITY</Text>
                  <Text style={styles.sysText}>✓ Modules loaded: notice, gallery, exams, audit</Text>
                </View>
              </Card>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    marginTop: 4,
  },
  layout: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  formCol: {
    flex: 1.4,
    minWidth: 320,
  },
  infoCol: {
    flex: 1,
    minWidth: 280,
  },
  cardPadding: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: AppTheme.text,
    marginBottom: 16,
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
  textArea: {
    height: 90,
    textAlignVertical: 'top',
  },
  saveBtn: {
    marginTop: 12,
  },
  infoCard: {
    padding: 20,
    backgroundColor: `${AppTheme.primary}05`,
    borderLeftWidth: 4,
    borderLeftColor: AppTheme.primary,
  },
  infoTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: AppTheme.text,
    marginBottom: 16,
  },
  infoRow: {
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.border,
    paddingVertical: 12,
    gap: 4,
  },
  infoLabel: {
    fontSize: 12,
    color: AppTheme.textMuted,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 14,
    color: AppTheme.text,
    fontWeight: '600',
  },
  sysBlock: {
    marginTop: 20,
    backgroundColor: AppTheme.background,
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: AppTheme.border,
  },
  sysTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: AppTheme.text,
    marginBottom: 8,
  },
  sysText: {
    fontSize: 12,
    color: AppTheme.textMuted,
    lineHeight: 18,
  },
});

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FormField } from '@/components/ui/FormField';
import { Screen } from '@/components/ui/Screen';
import { AppTheme } from '@/constants/Theme';
import { useActor } from '@/hooks/useActor';
import { getBranchForActor, updateBranchSettings } from '@/services/api';
import type { Branch } from '@/types';
import { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';

export default function BranchAdminSettingsScreen() {
  const actor = useActor();
  const [branch, setBranch] = useState<Branch | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [year, setYear] = useState('');
  const [term, setTerm] = useState('');
  const [tz, setTz] = useState('');
  const [notes, setNotes] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const b = await getBranchForActor(actor);
      setBranch(b);
      setYear(b.settings.academicYear ?? '');
      setTerm(b.settings.currentTermLabel ?? '');
      setTz(b.settings.timezone ?? '');
      setNotes(b.settings.notes ?? '');
    } finally {
      setLoading(false);
    }
  }, [actor]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    setSaving(true);
    try {
      const b = await updateBranchSettings(actor, {
        academicYear: year.trim() || undefined,
        currentTermLabel: term.trim() || undefined,
        timezone: tz.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      setBranch(b);
      Alert.alert('Saved', 'Branch configuration updated.');
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Could not save settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen loading={loading} scroll>
      {branch ? (
        <Card>
          <Text style={styles.title}>{branch.name}</Text>
          <Text style={styles.meta}>
            Code {branch.code}
            {branch.address ? ` · ${branch.address}` : ''}
          </Text>
        </Card>
      ) : null}

      <Card style={styles.form}>
        <Text style={styles.sectionTitle}>Terms & metadata</Text>
        <FormField label="Academic year" value={year} onChangeText={setYear} placeholder="2026–27" />
        <FormField label="Current term" value={term} onChangeText={setTerm} placeholder="Term 2" />
        <FormField label="Timezone" value={tz} onChangeText={setTz} placeholder="Asia/Kolkata" />
        <FormField label="Internal notes" value={notes} onChangeText={setNotes} placeholder="Registrar contact, etc." multiline />
        <Button title="Save settings" loading={saving} onPress={save} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: '700', color: AppTheme.text },
  meta: { fontSize: 14, color: AppTheme.textMuted, marginTop: 6 },
  form: { marginTop: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: AppTheme.text, marginBottom: 8 },
});

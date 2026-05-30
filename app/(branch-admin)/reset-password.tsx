import { AdminCard } from '@/components/admin/AdminCard';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Screen } from '@/components/ui/Screen';
import { AppTheme } from '@/constants/Theme';
import { useActor } from '@/hooks/useActor';
import { resetPassword } from '@/services/api';
import type { PasswordAccountType } from '@/types/branchAdmin';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const actor = useActor();
  const [accountType, setAccountType] = useState<PasswordAccountType>('student');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!identifier.trim() || !password || password !== confirm) {
      Alert.alert('Validation', 'Check ID and matching passwords.');
      return;
    }
    setSaving(true);
    try {
      await resetPassword(actor);
      Alert.alert('Success', 'Password reset recorded (demo).', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen scroll embedded>
      <AdminPageHeader title="Reset Password" subtitle="Invalidate active sessions after password change." />
      <AdminCard style={styles.warning}>
        <MaterialIcons name="warning" size={24} color={AppTheme.admin.error} />
        <View style={styles.warningText}>
          <Text style={styles.warningTitle}>Security Warning</Text>
          <Text style={styles.warningBody}>
            Changing a password immediately invalidates all active sessions across devices.
          </Text>
        </View>
      </AdminCard>
      <Text style={styles.label}>Account Type</Text>
      <View style={styles.segment}>
        {(['student', 'staff'] as const).map((t) => (
          <Pressable
            key={t}
            style={[styles.segBtn, accountType === t && styles.segBtnActive]}
            onPress={() => setAccountType(t)}>
            <Text style={[styles.segText, accountType === t && styles.segTextActive]}>
              {t === 'student' ? 'Student' : 'Staff/Teacher'}
            </Text>
          </Pressable>
        ))}
      </View>
      <FormField
        label="Roll Number / Employee ID"
        value={identifier}
        onChangeText={setIdentifier}
        placeholder="e.g. 2024-CSE-001"
      />
      <FormField
        label="New Password"
        value={password}
        onChangeText={setPassword}
        placeholder="Enter new password"
        secureTextEntry={!showPw}
      />
      <Pressable onPress={() => setShowPw((v) => !v)} style={styles.togglePw}>
        <Text style={styles.togglePwText}>{showPw ? 'Hide' : 'Show'} password</Text>
      </Pressable>
      <FormField
        label="Confirm Password"
        value={confirm}
        onChangeText={setConfirm}
        placeholder="Re-type new password"
        secureTextEntry
      />
      <AdminCard>
        <Text style={styles.reqTitle}>Security Requirements</Text>
        <Text style={styles.reqItem}>✓ Minimum 12 characters</Text>
        <Text style={styles.reqItem}>✓ Includes special characters and numbers</Text>
        <Text style={[styles.reqItem, styles.reqFail]}>✗ Must not contain institutional data</Text>
      </AdminCard>
      <Button title="Reset Password" onPress={submit} loading={saving} />
      <Button title="Cancel" variant="outline" onPress={() => router.back()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  warning: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: AppTheme.admin.errorContainer,
    borderLeftWidth: 4,
    borderLeftColor: AppTheme.admin.error,
  },
  warningText: { flex: 1 },
  warningTitle: { fontWeight: '700', fontSize: 12, color: AppTheme.admin.onErrorContainer, textTransform: 'uppercase' },
  warningBody: { fontSize: 13, color: AppTheme.admin.onErrorContainer, marginTop: 4 },
  label: { fontSize: 12, fontWeight: '600', color: AppTheme.admin.outline, textTransform: 'uppercase', marginBottom: 8 },
  segment: { flexDirection: 'row', backgroundColor: AppTheme.admin.surfaceContainerLow, padding: 4, borderRadius: 12, marginBottom: 16 },
  segBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 10 },
  segBtnActive: { backgroundColor: AppTheme.admin.surfaceContainerLowest },
  segText: { fontSize: 12, fontWeight: '600', color: AppTheme.admin.onSurfaceVariant },
  segTextActive: { color: AppTheme.admin.primary },
  togglePw: { alignSelf: 'flex-end', marginBottom: 12 },
  togglePwText: { color: AppTheme.admin.primary, fontSize: 13 },
  reqTitle: { fontWeight: '600', color: AppTheme.admin.primary, marginBottom: 8 },
  reqItem: { fontSize: 13, color: AppTheme.admin.onSurfaceVariant, marginBottom: 4 },
  reqFail: { color: AppTheme.admin.error },
});

import { AdminCard } from '@/components/admin/AdminCard';
import { Screen } from '@/components/ui/Screen';
import { AppTheme } from '@/constants/Theme';
import { useAuth } from '@/context/AuthContext';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

export function AdminProfileScreen({ securityRoute }: { securityRoute: string }) {
  const { user } = useAuth();
  const router = useRouter();
  const [twoFa, setTwoFa] = useState(true);

  return (
    <Screen scroll embedded>
      <View style={styles.hero}>
        <View style={styles.avatarRing}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0) ?? 'A'}</Text>
        </View>
        <Text style={styles.name}>{user?.name ?? 'Alexander Hamilton'}</Text>
        <Text style={styles.role}>Senior Administrator</Text>
      </View>

      <AdminCard style={styles.verifyCard}>
        <FontAwesome name="shield" size={40} color={AppTheme.admin.onPrimaryContainer} />
        <Text style={styles.verifyTitle}>Admin Verified</Text>
        <Text style={styles.verifySub}>Access Level: Tier 1</Text>
      </AdminCard>

      <AdminCard>
        <Text style={styles.sectionTitle}>Account Settings</Text>
        <Pressable style={styles.settingRow}>
          <FontAwesome name="lock" size={18} color={AppTheme.textMuted} />
          <Text style={styles.settingLabel}>Change Password</Text>
          <FontAwesome name="chevron-right" size={14} color={AppTheme.outline} />
        </Pressable>
        <View style={styles.settingRow}>
          <FontAwesome name="shield" size={18} color={AppTheme.accent} />
          <View style={styles.settingText}>
            <Text style={styles.settingLabel}>Two-Factor Auth</Text>
            <Text style={styles.settingActive}>Active</Text>
          </View>
          <Switch value={twoFa} onValueChange={setTwoFa} trackColor={{ true: AppTheme.accent }} />
        </View>
        <Pressable style={styles.settingRow} onPress={() => router.push(securityRoute as never)}>
          <FontAwesome name="shield" size={18} color={AppTheme.textMuted} />
          <Text style={styles.settingLabel}>Security Center</Text>
          <FontAwesome name="chevron-right" size={14} color={AppTheme.outline} />
        </Pressable>
      </AdminCard>

      <AdminCard>
        <Text style={styles.fieldLabel}>EMAIL</Text>
        <Text style={styles.fieldValue}>{user?.email ?? 'admin@nsrit.edu'}</Text>
        <Text style={[styles.fieldLabel, { marginTop: 12 }]}>PORTAL VERSION</Text>
        <Text style={styles.fieldValue}>NSRIT Connect v2.4.0</Text>
      </AdminCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', marginBottom: 20 },
  avatarRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: AppTheme.admin.surfaceContainerLowest,
    backgroundColor: AppTheme.admin.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 48, fontWeight: '700', color: AppTheme.primary },
  name: { fontSize: 28, fontWeight: '700', color: AppTheme.primary, marginTop: 16 },
  role: { fontSize: 16, color: AppTheme.accent, fontWeight: '500', marginTop: 4 },
  verifyCard: {
    alignItems: 'center',
    backgroundColor: AppTheme.admin.primaryContainer,
    marginBottom: 16,
  },
  verifyTitle: { fontSize: 18, fontWeight: '700', color: '#fff', marginTop: 12 },
  verifySub: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: AppTheme.primary, marginBottom: 12 },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.admin.surfaceContainerHigh,
  },
  settingText: { flex: 1 },
  settingLabel: { fontSize: 16, color: AppTheme.text, flex: 1 },
  settingActive: { fontSize: 12, fontWeight: '600', color: AppTheme.accent },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: AppTheme.textMuted, letterSpacing: 0.5 },
  fieldValue: { fontSize: 16, color: AppTheme.text, marginTop: 4 },
});

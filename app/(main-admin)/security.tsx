import { AdminCard } from '@/components/admin/AdminCard';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminStatGrid } from '@/components/admin/AdminStatGrid';
import { Screen } from '@/components/ui/Screen';
import { AppTheme } from '@/constants/Theme';
import { useActor } from '@/hooks/useActor';
import {
  getSecurityPosture,
  listAccessLogs,
  listSecuritySessions,
  revokeSecuritySession,
  terminateAllSessions,
} from '@/services/api';
import type { AdminAccessLog, AdminSecurityPosture, AdminSecuritySession } from '@/types/admin';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

export default function SecurityCenterScreen() {
  const actor = useActor();
  const [posture, setPosture] = useState<AdminSecurityPosture | null>(null);
  const [sessions, setSessions] = useState<AdminSecuritySession[]>([]);
  const [logs, setLogs] = useState<AdminAccessLog[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [p, s, l] = await Promise.all([
        getSecurityPosture(actor),
        listSecuritySessions(actor),
        listAccessLogs(actor),
      ]);
      setPosture(p);
      setSessions(s);
      setLogs(l);
    } finally {
      setLoading(false);
    }
  }, [actor]);

  useEffect(() => {
    load();
  }, [load]);

  const onTerminateAll = () => {
    Alert.alert('Terminate all sessions', 'This will sign out all devices except guidance to re-login.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Terminate',
        style: 'destructive',
        onPress: async () => {
          await terminateAllSessions(actor);
          await load();
        },
      },
    ]);
  };

  return (
    <Screen loading={loading} scroll embedded>
      <AdminPageHeader
        title="Security Center"
        subtitle="Monitor active sessions, device authorizations, and system security posture."
        action={
          <Pressable style={styles.dangerBtn} onPress={onTerminateAll}>
            <FontAwesome name="sign-out" size={14} color="#fff" />
            <Text style={styles.dangerBtnText}>Terminate All</Text>
          </Pressable>
        }
      />

      {posture ? (
        <AdminStatGrid
          items={[
            { label: 'Active Sessions', value: String(posture.activeSessions) },
            { label: 'Auth Devices', value: String(posture.authDevices) },
            { label: 'Failed Logins (24h)', value: String(posture.failedLogins24h), tone: 'error' },
            { label: 'Threat Level', value: posture.threatLevel, tone: 'secondary' },
          ]}
        />
      ) : null}

      {posture && posture.adminsWithout2fa > 0 ? (
        <AdminCard accent="error" style={styles.alertCard}>
          <Text style={styles.alertTitle}>Action Required</Text>
          <Text style={styles.alertBody}>
            2FA is not enabled for {posture.adminsWithout2fa} admin accounts. This poses a security risk.
          </Text>
          <Pressable onPress={() => Alert.alert('Review', 'Open user management to enable 2FA.')}>
            <Text style={styles.alertLink}>Review Accounts →</Text>
          </Pressable>
        </AdminCard>
      ) : null}

      <Text style={styles.section}>Active Sessions</Text>
      {sessions.map((session) => (
        <AdminCard key={session.id} style={styles.sessionCard}>
          <View style={styles.sessionRow}>
            <View style={styles.sessionIcon}>
              <FontAwesome name="laptop" size={20} color={AppTheme.primary} />
            </View>
            <View style={styles.sessionInfo}>
              <Text style={styles.sessionDevice}>{session.device}</Text>
              <Text style={styles.sessionMeta}>
                {session.ip} • {session.location} • {session.lastSeen}
              </Text>
            </View>
            {session.isCurrent ? (
              <View style={styles.activeBadge}>
                <Text style={styles.activeBadgeText}>Active</Text>
              </View>
            ) : (
              <Pressable
                onPress={async () => {
                  await revokeSecuritySession(actor, session.id);
                  await load();
                }}>
                <FontAwesome name="times-circle" size={24} color={AppTheme.danger} />
              </Pressable>
            )}
          </View>
        </AdminCard>
      ))}

      <Text style={styles.section}>Recent Access Logs</Text>
      <AdminCard>
        {logs.map((log) => (
          <View key={log.id} style={styles.logRow}>
            <FontAwesome
              name={log.type === 'failed' ? 'ban' : log.type === 'permission' ? 'key' : 'sign-in'}
              size={18}
              color={log.type === 'failed' ? AppTheme.danger : AppTheme.accent}
            />
            <View style={styles.logText}>
              <Text style={styles.logLabel}>{log.label}</Text>
              <Text style={styles.logDetail}>{log.detail}</Text>
            </View>
          </View>
        ))}
      </AdminCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  dangerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: AppTheme.danger,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: AppTheme.radius.lg,
  },
  dangerBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  alertCard: { marginTop: 16, marginBottom: 8 },
  alertTitle: { fontSize: 18, fontWeight: '600', color: AppTheme.text },
  alertBody: { fontSize: 13, color: AppTheme.textMuted, marginTop: 6 },
  alertLink: { fontSize: 13, fontWeight: '600', color: AppTheme.accent, marginTop: 12 },
  section: {
    fontSize: 13,
    fontWeight: '600',
    color: AppTheme.textMuted,
    textTransform: 'uppercase',
    marginTop: 20,
    marginBottom: 10,
  },
  sessionCard: { marginBottom: 10 },
  sessionRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sessionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: AppTheme.admin.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionInfo: { flex: 1 },
  sessionDevice: { fontSize: 16, fontWeight: '600', color: AppTheme.text },
  sessionMeta: { fontSize: 12, color: AppTheme.textMuted, marginTop: 4 },
  activeBadge: {
    backgroundColor: AppTheme.admin.secondaryContainer,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  activeBadgeText: { fontSize: 11, fontWeight: '700', color: AppTheme.admin.onSecondaryContainer },
  logRow: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  logText: { flex: 1 },
  logLabel: { fontSize: 14, fontWeight: '600', color: AppTheme.text },
  logDetail: { fontSize: 12, color: AppTheme.textMuted, marginTop: 2 },
});

import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { Badge } from '@/components/ui/Badge';
import { AppTheme, formatDate } from '@/constants/Theme';
import { useActor } from '@/hooks/useActor';
import { listAuditLogs } from '@/services/api';
import type { AuditLog } from '@/types';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, Pressable } from 'react-native';

export default function CoordinatorAuditScreen() {
  const actor = useActor();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filtered, setFiltered] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<'all' | string>('all');

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await listAuditLogs(actor);
      setLogs(data);
      setFiltered(data);
    } catch (e) {
      console.warn('Failed to load audit logs', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [actor]);

  useEffect(() => {
    let result = [...logs];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (l) =>
          l.action.toLowerCase().includes(q) ||
          l.actorName.toLowerCase().includes(q) ||
          l.details.toLowerCase().includes(q)
      );
    }

    if (selectedRole !== 'all') {
      result = result.filter((l) => l.actorRole === selectedRole);
    }

    setFiltered(result);
  }, [search, selectedRole, logs]);

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'principal':
        return AppTheme.primary;
      case 'coordinator':
        return AppTheme.coordinator;
      case 'accountant':
        return '#10b981';
      case 'front_desk':
        return '#f59e0b';
      case 'teacher':
        return AppTheme.accent;
      default:
        return AppTheme.textMuted;
    }
  };

  const getActionColor = (action: string) => {
    const act = action.toLowerCase();
    if (act.includes('delete') || act.includes('remove') || act.includes('reject')) {
      return AppTheme.danger;
    }
    if (act.includes('create') || act.includes('add') || act.includes('collect') || act.includes('post') || act.includes('generate')) {
      return AppTheme.success;
    }
    if (act.includes('update') || act.includes('modify') || act.includes('verify') || act.includes('reset')) {
      return AppTheme.warning;
    }
    return AppTheme.primary;
  };

  return (
    <Screen title="ERP Audit Logs" subtitle="Track all actions, access logs, and administrative operations" loading={loading} scroll>
      <Card style={styles.searchCard}>
        <Text style={styles.filterTitle}>Search & Filter Logs</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by action, actor, or description..."
          placeholderTextColor={AppTheme.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        <View style={styles.roleTabs}>
          {(['all', 'coordinator', 'teacher', 'accountant', 'front_desk', 'principal'] as const).map((role) => (
            <Pressable
              key={role}
              style={[styles.roleTab, selectedRole === role ? styles.roleTabActive : null]}
              onPress={() => setSelectedRole(role)}>
              <Text style={[styles.roleTabText, selectedRole === role ? styles.roleTabTextActive : null]}>
                {role.toUpperCase()}
              </Text>
            </Pressable>
          ))}
        </View>
      </Card>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        <View style={styles.timeline}>
          {filtered.map((log) => (
            <Card key={log.id} style={styles.logCard}>
              <View style={styles.cardHeader}>
                <View style={styles.actionBlock}>
                  <Badge label={log.action} color={getActionColor(log.action)} />
                  <Text style={styles.timestamp}>{formatDate(log.timestamp)} {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                </View>
                <Badge label={log.actorRole.toUpperCase()} color={getRoleColor(log.actorRole)} />
              </View>

              <Text style={styles.detailsText}>{log.details}</Text>

              <View style={styles.actorRow}>
                <Text style={styles.actorLabel}>Performed by:</Text>
                <Text style={styles.actorName}>{log.actorName} ({log.actorId})</Text>
              </View>
            </Card>
          ))}

          {filtered.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>No matching audit logs found.</Text>
            </Card>
          ) : null}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchCard: {
    padding: 16,
    marginBottom: 16,
  },
  filterTitle: {
    fontSize: 13,
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
  roleTabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  roleTab: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: AppTheme.background,
    borderWidth: 1,
    borderColor: AppTheme.border,
  },
  roleTabActive: {
    backgroundColor: AppTheme.coordinator,
    borderColor: AppTheme.coordinator,
  },
  roleTabText: {
    fontSize: 10,
    fontWeight: '700',
    color: AppTheme.text,
  },
  roleTabTextActive: {
    color: '#fff',
  },
  scroll: {
    marginTop: 4,
  },
  timeline: {
    gap: 12,
    marginBottom: 20,
  },
  logCard: {
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: AppTheme.coordinator,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 10,
  },
  actionBlock: {
    flex: 1,
    alignItems: 'flex-start',
    gap: 4,
  },
  timestamp: {
    fontSize: 11,
    color: AppTheme.textMuted,
    marginTop: 2,
  },
  detailsText: {
    fontSize: 14,
    color: AppTheme.text,
    lineHeight: 20,
    marginBottom: 10,
  },
  actorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: AppTheme.border,
  },
  actorLabel: {
    fontSize: 12,
    color: AppTheme.textMuted,
  },
  actorName: {
    fontSize: 12,
    fontWeight: '600',
    color: AppTheme.text,
  },
  emptyCard: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: AppTheme.textMuted,
    fontSize: 14,
  },
});

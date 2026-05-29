import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { Badge } from '@/components/ui/Badge';
import { AppTheme } from '@/constants/Theme';
import { useActor } from '@/hooks/useActor';
import { listVisitorLogs } from '@/services/api';
import type { VisitorLog } from '@/types';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TextInput, ScrollView } from 'react-native';

export default function FrontDeskVisitorsScreen() {
  const actor = useActor();
  const [visitorLogs, setVisitorLogs] = useState<VisitorLog[]>([]);
  const [filtered, setFiltered] = useState<VisitorLog[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await listVisitorLogs(actor);
      setVisitorLogs(data);
      setFiltered(data);
    } catch (e) {
      console.warn('Failed to load visitor logs', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [actor]);

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(visitorLogs);
      return;
    }
    const q = search.toLowerCase();
    const result = visitorLogs.filter(
      (log) =>
        log.name.toLowerCase().includes(q) ||
        log.purpose.toLowerCase().includes(q) ||
        log.contactNumber.toLowerCase().includes(q)
    );
    setFiltered(result);
  }, [search, visitorLogs]);

  const formatTime = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' (' + d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ')';
  };

  return (
    <Screen title="Campus Visitor Log" subtitle="Search-enabled visitor records and check-in history" loading={loading} scroll>
      <Card style={styles.searchCard}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search visitors by name, contact, or purpose..."
          placeholderTextColor={AppTheme.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </Card>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        <View style={styles.list}>
          {filtered.map((log) => (
            <Card key={log.id} style={styles.logCard}>
              <View style={styles.logHeader}>
                <View>
                  <Text style={styles.logName}>{log.name}</Text>
                  <Text style={styles.logPhone}>{log.contactNumber}</Text>
                </View>
                {log.checkOutTime ? (
                  <Badge label="Checked Out" color={AppTheme.textMuted} />
                ) : (
                  <Badge label="Active In Campus" color={AppTheme.accent} />
                )}
              </View>
              <Text style={styles.logPurpose}>Purpose of Visit: <Text style={styles.boldText}>{log.purpose}</Text></Text>
              <View style={styles.logTimes}>
                <Text style={styles.timeLabel}>Check-In: {formatTime(log.checkInTime)}</Text>
                {log.checkOutTime ? (
                  <Text style={styles.timeLabel}>Check-Out: {formatTime(log.checkOutTime)}</Text>
                ) : null}
              </View>
            </Card>
          ))}
          {filtered.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>No visitors found matching filters.</Text>
            </Card>
          ) : null}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchCard: {
    padding: 12,
    marginBottom: 16,
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
  },
  scroll: {
    marginTop: 4,
  },
  list: {
    gap: 12,
    marginBottom: 20,
  },
  logCard: {
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: AppTheme.accent,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logName: {
    fontSize: 15,
    fontWeight: '700',
    color: AppTheme.text,
  },
  logPhone: {
    fontSize: 12,
    color: AppTheme.textMuted,
    marginTop: 2,
  },
  logPurpose: {
    fontSize: 13,
    color: AppTheme.textMuted,
    marginTop: 8,
  },
  boldText: {
    color: AppTheme.text,
    fontWeight: '600',
  },
  logTimes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: AppTheme.border,
  },
  timeLabel: {
    fontSize: 11,
    color: AppTheme.textMuted,
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

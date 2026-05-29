import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { Badge } from '@/components/ui/Badge';
import { AppTheme, formatDate } from '@/constants/Theme';
import { useActor } from '@/hooks/useActor';
import { listEnquiries } from '@/services/api';
import type { ParentEnquiry } from '@/types';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TextInput, ScrollView } from 'react-native';

export default function FrontDeskEnquiriesScreen() {
  const actor = useActor();
  const [enquiries, setEnquiries] = useState<ParentEnquiry[]>([]);
  const [filtered, setFiltered] = useState<ParentEnquiry[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadEnquiries = async () => {
    setLoading(true);
    try {
      const data = await listEnquiries(actor);
      setEnquiries(data);
      setFiltered(data);
    } catch (e) {
      console.warn('Failed to load enquiries', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEnquiries();
  }, [actor]);

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(enquiries);
      return;
    }
    const q = search.toLowerCase();
    const result = enquiries.filter(
      (enq) =>
        enq.parentName.toLowerCase().includes(q) ||
        enq.email.toLowerCase().includes(q) ||
        enq.studentGrade.toLowerCase().includes(q) ||
        enq.comments.toLowerCase().includes(q)
    );
    setFiltered(result);
  }, [search, enquiries]);

  return (
    <Screen title="Admission Enquiries" subtitle="Search-enabled database of prospective student enquiries" loading={loading} scroll>
      <Card style={styles.searchCard}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search enquiries by parent name, email, grade, or query..."
          placeholderTextColor={AppTheme.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </Card>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        <View style={styles.list}>
          {filtered.map((enq) => (
            <Card key={enq.id} style={styles.enqCard}>
              <View style={styles.enqHeader}>
                <View>
                  <Text style={styles.enqParent}>{enq.parentName}</Text>
                  <Text style={styles.enqMeta}>Interested Grade: <Text style={styles.boldText}>{enq.studentGrade}</Text> · {enq.contactNumber}</Text>
                </View>
                <Badge label={enq.status === 'responded' ? 'Responded' : 'Pending'} color={enq.status === 'responded' ? AppTheme.success : AppTheme.warning} />
              </View>
              <Text style={styles.enqEmail}>Email: {enq.email}</Text>
              <Text style={styles.enqComments}>{enq.comments}</Text>
              <Text style={styles.enqDate}>Logged: {formatDate(enq.createdAt)}</Text>
            </Card>
          ))}
          {filtered.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>No enquiries found matching filters.</Text>
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
  enqCard: {
    padding: 16,
  },
  enqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.border,
    paddingBottom: 8,
    marginBottom: 8,
  },
  enqParent: {
    fontSize: 15,
    fontWeight: '700',
    color: AppTheme.text,
  },
  enqMeta: {
    fontSize: 12,
    color: AppTheme.textMuted,
    marginTop: 2,
  },
  boldText: {
    color: AppTheme.text,
    fontWeight: '600',
  },
  enqEmail: {
    fontSize: 12,
    color: AppTheme.textMuted,
    marginTop: 2,
  },
  enqComments: {
    fontSize: 14,
    color: AppTheme.text,
    marginTop: 8,
    lineHeight: 20,
  },
  enqDate: {
    fontSize: 11,
    color: AppTheme.textMuted,
    marginTop: 8,
    textAlign: 'right',
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

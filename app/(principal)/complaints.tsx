import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FormField } from '@/components/ui/FormField';
import { Screen } from '@/components/ui/Screen';
import { Badge } from '@/components/ui/Badge';
import { AppTheme } from '@/constants/Theme';
import { useActor } from '@/hooks/useActor';
import { listComplaints, updateComplaintStatus } from '@/services/api';
import type { Complaint } from '@/types';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TextInput, Pressable, ScrollView } from 'react-native';

export default function PrincipalComplaintsScreen() {
  const actor = useActor();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);

  // Action / Resolution form state
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const data = await listComplaints(actor);
      // Principals see verified/forwarded or resolved/rejected complaints
      const filtered = data.filter((c) => ['Verified', 'Forwarded to Principal', 'Resolved', 'Rejected'].includes(c.status));
      setComplaints(filtered);
      if (selectedComplaint) {
        const updated = filtered.find((c) => c.id === selectedComplaint.id);
        setSelectedComplaint(updated || null);
      }
    } catch (e) {
      console.warn('Failed to load complaints', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [actor]);

  const handleAction = async (status: Complaint['status']) => {
    if (!selectedComplaint) return;
    if (!comments.trim()) {
      setErr('Please provide resolution notes or comments');
      return;
    }
    setSubmitting(true);
    setErr(null);
    try {
      await updateComplaintStatus(actor, selectedComplaint.id, status, comments);
      setComments('');
      await loadData();
    } catch (e: any) {
      setErr(e.message || 'Failed to resolve complaint');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: Complaint['status']) => {
    switch (status) {
      case 'Verified':
        return '#10b981';
      case 'Forwarded to Principal':
        return '#8b5cf6';
      case 'Resolved':
        return AppTheme.success;
      case 'Rejected':
        return AppTheme.danger;
      default:
        return AppTheme.textMuted;
    }
  };

  return (
    <Screen title="Complaint Resolution" subtitle="View and resolve escalated school complaints" loading={loading} scroll>
      <View style={styles.container}>
        <View style={styles.listCol}>
          <Text style={styles.sectionTitle}>Escalated Complaints</Text>
          <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
            {complaints.map((comp) => (
              <Pressable
                key={comp.id}
                style={[styles.itemCard, selectedComplaint?.id === comp.id ? styles.itemCardActive : null]}
                onPress={() => {
                  setSelectedComplaint(comp);
                  setComments(comp.principalComments || '');
                }}>
                <View style={styles.cardHeader}>
                  <Text style={styles.itemTitle}>{comp.title}</Text>
                  <Badge label={comp.status} color={getStatusColor(comp.status)} />
                </View>
                <Text style={styles.itemMeta}>Student: {comp.studentName} · Filed: {comp.createdAt}</Text>
              </Pressable>
            ))}
            {complaints.length === 0 ? (
              <Text style={styles.emptyText}>No escalated complaints found.</Text>
            ) : null}
          </ScrollView>
        </View>

        <View style={styles.detailCol}>
          {selectedComplaint ? (
            <Card style={styles.detailCard}>
              <View style={styles.detailHeader}>
                <Text style={styles.detailTitle}>{selectedComplaint.title}</Text>
                <Badge label={selectedComplaint.status} color={getStatusColor(selectedComplaint.status)} />
              </View>
              <Text style={styles.detailMeta}>
                From Parent: {selectedComplaint.parentName} · Student: {selectedComplaint.studentName} · Date: {selectedComplaint.createdAt}
              </Text>

              <Text style={styles.detailDescLabel}>Description:</Text>
              <Text style={styles.detailDesc}>{selectedComplaint.description}</Text>

              {selectedComplaint.coordinatorComments ? (
                <View style={styles.coordinatorBox}>
                  <Text style={styles.boxTitle}>Coordinator Verification Notes:</Text>
                  <Text style={styles.boxText}>{selectedComplaint.coordinatorComments}</Text>
                </View>
              ) : null}

              {/* Action and remarks form */}
              {['Verified', 'Forwarded to Principal'].includes(selectedComplaint.status) ? (
                <View style={styles.remarksForm}>
                  <Text style={styles.remarksFormTitle}>Resolution Action</Text>
                  
                  <FormField label="Resolution Notes / Action Taken">
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      placeholder="Specify resolution steps, directives, parent communications..."
                      placeholderTextColor={AppTheme.textMuted}
                      multiline
                      numberOfLines={4}
                      value={comments}
                      onChangeText={setComments}
                    />
                  </FormField>

                  {err ? <Text style={styles.errText}>{err}</Text> : null}

                  <View style={styles.btnRow}>
                    <Button
                      title="Resolve Complaint"
                      loading={submitting}
                      onPress={() => handleAction('Resolved')}
                      style={styles.actionBtn}
                    />
                    <Button
                      title="Reject"
                      loading={submitting}
                      onPress={() => handleAction('Rejected')}
                      style={styles.actionBtn}
                      variant="danger"
                    />
                  </View>
                </View>
              ) : (
                <View style={styles.resolvedBox}>
                  <Text style={styles.boxTitle}>Principal Action Taken:</Text>
                  <Text style={styles.boxText}>{selectedComplaint.principalComments || 'No comments left.'}</Text>
                </View>
              )}
            </Card>
          ) : (
            <Card style={[styles.detailCard, styles.centeredCard]}>
              <Text style={styles.emptyText}>Select an escalated complaint from the left panel to resolve.</Text>
            </Card>
          )}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  listCol: {
    flex: 1,
    minWidth: 320,
  },
  detailCol: {
    flex: 1.2,
    minWidth: 340,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: AppTheme.text,
    marginBottom: 12,
  },
  scroll: {
    maxHeight: 520,
  },
  itemCard: {
    backgroundColor: AppTheme.surface,
    borderRadius: 8,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: AppTheme.border,
  },
  itemCardActive: {
    borderColor: AppTheme.principal,
    backgroundColor: `${AppTheme.principal}06`,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: AppTheme.text,
    flex: 1,
  },
  itemMeta: {
    fontSize: 12,
    color: AppTheme.textMuted,
    marginTop: 4,
  },
  detailCard: {
    padding: 20,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: AppTheme.text,
    flex: 1,
  },
  detailMeta: {
    fontSize: 12,
    color: AppTheme.textMuted,
    marginTop: 6,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.border,
    paddingBottom: 10,
  },
  detailDescLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: AppTheme.text,
    marginTop: 14,
  },
  detailDesc: {
    fontSize: 14,
    color: AppTheme.text,
    lineHeight: 20,
    marginTop: 6,
  },
  coordinatorBox: {
    backgroundColor: `${AppTheme.coordinator}08`,
    borderRadius: 6,
    padding: 12,
    marginTop: 14,
    borderLeftWidth: 3,
    borderLeftColor: AppTheme.coordinator,
  },
  resolvedBox: {
    backgroundColor: `${AppTheme.success}08`,
    borderRadius: 6,
    padding: 12,
    marginTop: 14,
    borderLeftWidth: 3,
    borderLeftColor: AppTheme.success,
  },
  boxTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: AppTheme.text,
    marginBottom: 4,
  },
  boxText: {
    fontSize: 13,
    color: AppTheme.textMuted,
  },
  remarksForm: {
    backgroundColor: AppTheme.background,
    borderRadius: 8,
    padding: 14,
    marginTop: 16,
  },
  remarksFormTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: AppTheme.text,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: AppTheme.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: AppTheme.text,
    backgroundColor: AppTheme.surface,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  errText: {
    color: AppTheme.danger,
    fontSize: 13,
    marginBottom: 8,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  actionBtn: {
    flex: 1,
    minHeight: 40,
    paddingVertical: 8,
  },
  centeredCard: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 280,
  },
  emptyText: {
    textAlign: 'center',
    color: AppTheme.textMuted,
    fontSize: 14,
  },
});

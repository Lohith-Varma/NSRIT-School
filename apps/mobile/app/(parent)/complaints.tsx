import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FormField } from '@/components/ui/FormField';
import { Screen } from '@/components/ui/Screen';
import { Badge } from '@/components/ui/Badge';
import { AppTheme } from '@/constants/Theme';
import { useActor } from '@/hooks/useActor';
import { useAuth } from '@/context/AuthContext';
import { submitComplaint, listComplaints } from '@/services/api';
import type { Complaint } from '@/types';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TextInput, Pressable, ScrollView } from 'react-native';

export default function ParentComplaintsScreen() {
  const actor = useActor();
  const { children, activeChild } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const loadData = async () => {
    try {
      const data = await listComplaints(actor);
      setComplaints(data);
    } catch (e) {
      console.warn('Failed to load complaints', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [actor]);

  const handleSubmit = async () => {
    if (!title.trim() || !desc.trim()) {
      setErr('Please fill out all fields');
      return;
    }
    if (!activeChild) {
      setErr('No active student profile selected');
      return;
    }
    setSubmitting(true);
    setErr(null);
    try {
      await submitComplaint(actor, activeChild.id, title, desc);
      setTitle('');
      setDesc('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      loadData();
    } catch (e: any) {
      setErr(e.message || 'Failed to submit complaint');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: Complaint['status']) => {
    switch (status) {
      case 'Submitted':
        return '#3b82f6';
      case 'Under Review':
        return '#eab308';
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
    <Screen title="Grievance Redressal" subtitle="Submit and track complaints" loading={loading} scroll embedded>
      <View style={styles.container}>
        <View style={styles.leftCol}>
          <Card style={styles.formCard}>
            <Text style={styles.sectionTitle}>Submit New Complaint</Text>
            <Text style={styles.targetLabel}>Filing on behalf of: <Text style={styles.boldText}>{activeChild?.name}</Text></Text>

            <FormField label="Title / Subject" error={err && !title ? 'Required' : undefined}>
              <TextInput
                style={styles.input}
                placeholder="e.g. Broken bench, drinking water issues..."
                placeholderTextColor={AppTheme.textMuted}
                value={title}
                onChangeText={setTitle}
              />
            </FormField>

            <FormField label="Description Details" error={err && !desc ? 'Required' : undefined}>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Please describe the issue in detail..."
                placeholderTextColor={AppTheme.textMuted}
                multiline
                numberOfLines={5}
                value={desc}
                onChangeText={setDesc}
              />
            </FormField>

            {err ? <Text style={styles.errorText}>{err}</Text> : null}
            {success ? <Text style={styles.successText}>Complaint submitted successfully!</Text> : null}

            <Button
              title="Submit Complaint"
              loading={submitting}
              onPress={handleSubmit}
              style={styles.submitBtn}
            />
          </Card>
        </View>

        <View style={styles.rightCol}>
          <Text style={styles.sectionTitle}>History & Tracking</Text>
          <ScrollView showsVerticalScrollIndicator={false} style={styles.historyScroll}>
            {complaints.map((comp) => (
              <Card key={comp.id} style={styles.complaintCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.complaintTitle}>{comp.title}</Text>
                  <Badge label={comp.status} color={getStatusColor(comp.status)} />
                </View>
                <Text style={styles.complaintMeta}>For student: {comp.studentName} · Filed on: {comp.createdAt}</Text>
                <Text style={styles.complaintDesc}>{comp.description}</Text>
                
                {comp.coordinatorComments ? (
                  <View style={styles.commentBox}>
                    <Text style={styles.commentLabel}>Coordinator Remarks:</Text>
                    <Text style={styles.commentText}>{comp.coordinatorComments}</Text>
                  </View>
                ) : null}

                {comp.principalComments ? (
                  <View style={styles.commentBox}>
                    <Text style={styles.commentLabel}>Principal Action Remarks:</Text>
                    <Text style={styles.commentText}>{comp.principalComments}</Text>
                  </View>
                ) : null}
              </Card>
            ))}
            {complaints.length === 0 ? (
              <Text style={styles.emptyText}>No complaints filed yet.</Text>
            ) : null}
          </ScrollView>
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
  leftCol: {
    flex: 1,
    minWidth: 320,
  },
  rightCol: {
    flex: 1.2,
    minWidth: 340,
  },
  formCard: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: AppTheme.text,
    marginBottom: 16,
  },
  targetLabel: {
    fontSize: 14,
    color: AppTheme.textMuted,
    marginBottom: 16,
  },
  boldText: {
    fontWeight: '700',
    color: AppTheme.primary,
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
    height: 100,
    textAlignVertical: 'top',
  },
  submitBtn: {
    marginTop: 16,
    backgroundColor: AppTheme.accent,
  },
  errorText: {
    color: AppTheme.danger,
    fontSize: 14,
    marginTop: 8,
  },
  successText: {
    color: AppTheme.success,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  historyScroll: {
    maxHeight: 520,
  },
  complaintCard: {
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: AppTheme.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  complaintTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: AppTheme.text,
    flex: 1,
  },
  complaintMeta: {
    fontSize: 12,
    color: AppTheme.textMuted,
    marginTop: 4,
  },
  complaintDesc: {
    fontSize: 14,
    color: AppTheme.text,
    marginTop: 10,
    lineHeight: 20,
  },
  commentBox: {
    backgroundColor: AppTheme.background,
    borderRadius: 6,
    padding: 10,
    marginTop: 10,
    borderLeftWidth: 3,
    borderLeftColor: AppTheme.primary,
  },
  commentLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: AppTheme.text,
    marginBottom: 2,
  },
  commentText: {
    fontSize: 13,
    color: AppTheme.textMuted,
  },
  emptyText: {
    textAlign: 'center',
    color: AppTheme.textMuted,
    marginTop: 32,
  },
});

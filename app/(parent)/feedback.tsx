import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FormField } from '@/components/ui/FormField';
import { Screen } from '@/components/ui/Screen';
import { AppTheme } from '@/constants/Theme';
import { useActor } from '@/hooks/useActor';
import { useAuth } from '@/context/AuthContext';
import { submitFeedback, listFeedback } from '@/services/api';
import type { Feedback } from '@/types';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TextInput, Pressable, ScrollView } from 'react-native';

export default function ParentFeedbackScreen() {
  const actor = useActor();
  const { activeChild } = useAuth();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [rating, setRating] = useState(5);
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const loadData = async () => {
    try {
      const data = await listFeedback(actor);
      setFeedbacks(data);
    } catch (e) {
      console.warn('Failed to load feedback', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [actor]);

  const handleSubmit = async () => {
    if (!comments.trim()) {
      setErr('Please provide comments');
      return;
    }
    if (!activeChild) {
      setErr('No active student profile selected');
      return;
    }
    setSubmitting(true);
    setErr(null);
    try {
      await submitFeedback(actor, activeChild.id, rating, comments);
      setComments('');
      setRating(5);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      loadData();
    } catch (e: any) {
      setErr(e.message || 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen title="Feedback & Reviews" subtitle="Help us improve your experience" loading={loading} scroll embedded>
      <View style={styles.container}>
        <View style={styles.leftCol}>
          <Card style={styles.formCard}>
            <Text style={styles.sectionTitle}>Share Your Review</Text>
            <Text style={styles.targetLabel}>Feedback for: <Text style={styles.boldText}>{activeChild?.name}</Text></Text>

            <Text style={styles.ratingLabel}>Overall Rating</Text>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Pressable key={star} onPress={() => setRating(star)} style={styles.star}>
                  <FontAwesome
                    name={star <= rating ? 'star' : 'star-o'}
                    size={28}
                    color={star <= rating ? '#eab308' : AppTheme.textMuted}
                  />
                </Pressable>
              ))}
            </View>

            <FormField label="Comments & Suggestions" error={err && !comments ? 'Required' : undefined}>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Share details of your experience, staff reviews, or suggestions..."
                placeholderTextColor={AppTheme.textMuted}
                multiline
                numberOfLines={4}
                value={comments}
                onChangeText={setComments}
              />
            </FormField>

            {err ? <Text style={styles.errorText}>{err}</Text> : null}
            {success ? <Text style={styles.successText}>Feedback submitted successfully!</Text> : null}

            <Button
              title="Submit Feedback"
              loading={submitting}
              onPress={handleSubmit}
              style={styles.submitBtn}
            />
          </Card>
        </View>

        <View style={styles.rightCol}>
          <Text style={styles.sectionTitle}>Previous Reviews</Text>
          <ScrollView showsVerticalScrollIndicator={false} style={styles.historyScroll}>
            {feedbacks.map((fb) => (
              <Card key={fb.id} style={styles.reviewCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.studentName}>{fb.studentName}</Text>
                  <View style={styles.starsRow}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FontAwesome
                        key={star}
                        name={star <= fb.rating ? 'star' : 'star-o'}
                        size={14}
                        color={star <= fb.rating ? '#eab308' : AppTheme.textMuted}
                        style={{ marginRight: 2 }}
                      />
                    ))}
                  </View>
                </View>
                <Text style={styles.feedbackDate}>Submitted on: {fb.createdAt}</Text>
                <Text style={styles.feedbackComments}>{fb.comments}</Text>
              </Card>
            ))}
            {feedbacks.length === 0 ? (
              <Text style={styles.emptyText}>No feedback submitted yet.</Text>
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
  ratingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: AppTheme.text,
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  star: {
    marginRight: 10,
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
  reviewCard: {
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  studentName: {
    fontSize: 15,
    fontWeight: '600',
    color: AppTheme.text,
  },
  starsRow: {
    flexDirection: 'row',
  },
  feedbackDate: {
    fontSize: 11,
    color: AppTheme.textMuted,
    marginTop: 2,
  },
  feedbackComments: {
    fontSize: 14,
    color: AppTheme.text,
    marginTop: 10,
    lineHeight: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: AppTheme.textMuted,
    marginTop: 32,
  },
});

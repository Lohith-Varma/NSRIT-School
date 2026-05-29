import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { AppTheme } from '@/constants/Theme';
import { formatWing } from '@/constants/Wings';
import { useAuth } from '@/context/AuthContext';
import { useActor } from '@/hooks/useActor';
import { CoordinatorPageHeader } from '@/components/coordinator/CoordinatorPageHeader';
import { ApprovalRequestCard } from '@/components/coordinator/ApprovalRequestCard';
import { CircularReviewCard } from '@/components/coordinator/CircularReviewCard';
import { DiaryEntryCard } from '@/components/coordinator/DiaryEntryCard';
import { getCoordinatorApprovalRequests, getCoordinatorCircularReviews, getCoordinatorDiaryEntries } from '@/services/api';
import type { CoordinatorApprovalRequest, CoordinatorCircularReview, CoordinatorDiaryEntry } from '@/types';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

const VISIBLE_APPROVALS = 2;
const VISIBLE_DIARY_ENTRIES = 3;
const VISIBLE_CIRCULARS = 2;

export default function CoordinatorDashboardScreen() {
  const { user } = useAuth();
  const actor = useActor();

  const [approvals, setApprovals] = useState<CoordinatorApprovalRequest[]>([]);
  const [diaryEntries, setDiaryEntries] = useState<CoordinatorDiaryEntry[]>([]);
  const [circularReviews, setCircularReviews] = useState<CoordinatorCircularReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getCoordinatorApprovalRequests(actor),
      getCoordinatorDiaryEntries(actor),
      getCoordinatorCircularReviews(actor),
    ])
      .then(([requests, entries, reviews]) => {
        setApprovals(requests);
        setDiaryEntries(entries);
        setCircularReviews(reviews);
      })
      .finally(() => setLoading(false));
  }, [actor]);

  const visibleApprovals = approvals.slice(0, VISIBLE_APPROVALS);
  const visibleDiaryEntries = diaryEntries.slice(0, VISIBLE_DIARY_ENTRIES);
  const visibleCirculars = circularReviews.slice(0, VISIBLE_CIRCULARS);

  const approvalOverflow = Math.max(0, approvals.length - VISIBLE_APPROVALS);
  const diaryOverflow = Math.max(0, diaryEntries.length - VISIBLE_DIARY_ENTRIES);
  const circularOverflow = Math.max(0, circularReviews.length - VISIBLE_CIRCULARS);

  const diaryOverflowLabel = diaryOverflow === 1 ? 'entry' : 'entries';
  const wingLabel = user?.wing ? formatWing(user.wing) : undefined;

  return (
    <Screen loading={loading} scroll>
      <CoordinatorPageHeader
        title="Approvals & Tasks"
        subtitle={`Pending requests, diary reviews, and circular approvals${wingLabel ? ` for ${wingLabel}` : ''}`}
      />

      <View style={styles.section}>
        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>Student Leave Requests</Text>
          <Text style={styles.sectionBadge}>{approvals.length} pending</Text>
        </View>

        {visibleApprovals.map((request) => (
          <ApprovalRequestCard key={request.id} request={request} />
        ))}

        {approvalOverflow > 0 ? (
          <Button
            title={`View ${approvalOverflow} more request${approvalOverflow > 1 ? 's' : ''}`}
            variant="outline"
            onPress={() => undefined}
            style={styles.fullWidthButton}
          />
        ) : null}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>Teacher Diary Entries</Text>
          <Text style={styles.sectionHint}>{diaryEntries.length} items</Text>
        </View>

        {visibleDiaryEntries.map((entry) => (
          <DiaryEntryCard key={entry.id} entry={entry} />
        ))}

        {diaryOverflow > 0 ? (
          <Button
            title={`View ${diaryOverflow} more ${diaryOverflowLabel}`}
            variant="outline"
            onPress={() => undefined}
            style={styles.fullWidthButton}
          />
        ) : null}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>Circular Reviews</Text>
          <Text style={styles.sectionHint}>{circularReviews.length} pending</Text>
        </View>

        {visibleCirculars.map((review) => (
          <CircularReviewCard key={review.id} review={review} />
        ))}

        {circularOverflow > 0 ? (
          <Button
            title="View all Circulars"
            variant="outline"
            onPress={() => undefined}
            style={styles.fullWidthButton}
          />
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: AppTheme.spacing.lg,
  },
  sectionHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: AppTheme.spacing.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: AppTheme.text,
  },
  sectionHint: {
    fontSize: 13,
    color: AppTheme.textMuted,
  },
  sectionBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: AppTheme.primary,
    textTransform: 'uppercase',
  },
  fullWidthButton: {
    marginTop: AppTheme.spacing.sm,
  },
});

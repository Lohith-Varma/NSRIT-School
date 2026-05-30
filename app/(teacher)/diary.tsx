import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { AppTheme } from '@/constants/Theme';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const diaryDates = [
  { id: '2023-10-23', label: 'Mon 23' },
  { id: '2023-10-24', label: 'Tue 24' },
  { id: '2023-10-25', label: 'Wed 25' },
  { id: '2023-10-26', label: 'Thu 26' },
  { id: '2023-10-27', label: 'Fri 27' },
  { id: '2023-10-28', label: 'Sat 28' },
];

const entries = [
  {
    id: 'd1',
    date: '2023-10-24',
    subject: 'Mathematics',
    title: 'Calculus - Integration by Parts',
    summary: 'Complete exercises 4.2 to 4.5 from the textbook. Show all intermediate steps for problem 12.',
    status: 'COMPLETED',
    badge: 'success',
    students: 24,
  },
  {
    id: 'd2',
    date: '2023-10-24',
    subject: 'Physics',
    title: 'Thermodynamics Lab Report',
    summary: 'Submit the digital report for the heat transfer experiment conducted on Monday. Include all graphs.',
    status: 'PENDING',
    badge: 'warning',
    students: 32,
  },
  {
    id: 'd3',
    date: '2023-10-24',
    subject: 'Literature',
    title: 'Poetry Analysis: The Wasteland',
    summary: 'Read Section I and write a 300-word reflection on the imagery used by Eliot.',
    status: 'DUE TOMORROW',
    badge: 'normal',
    students: 28,
  },
];

type DiaryStatus = 'success' | 'warning' | 'normal';

function statusColor(status: DiaryStatus) {
  if (status === 'success') return AppTheme.success;
  if (status === 'warning') return AppTheme.warning;
  return AppTheme.textMuted;
}

export default function TeacherDiaryScreen() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(diaryDates[1].id);

  const filteredEntries = useMemo(
    () => entries.filter((entry) => entry.date === selectedDate),
    [selectedDate],
  );

  return (
    <Screen title="Diary Works" scroll>
      <Card style={styles.card}>
        <Text style={styles.intro}>Diary works for selected date and class.</Text>
      </Card>

      <View style={styles.dateRow}>
        {diaryDates.map((date) => (
          <Pressable
            key={date.id}
            style={[
              styles.dateChip,
              selectedDate === date.id && styles.dateChipActive,
            ]}
            onPress={() => setSelectedDate(date.id)}>
            <Text
              style={[
                styles.dateChipLabel,
                selectedDate === date.id && styles.dateChipLabelActive,
              ]}>
              {date.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.list}>
        {filteredEntries.map((entry) => (
          <Card key={entry.id} style={styles.entryCard}>
            <View style={styles.entryHeader}>
              <Text style={styles.entrySubject}>{entry.subject}</Text>
              <Badge label={entry.status} color={statusColor(entry.badge as DiaryStatus)} />
            </View>
            <Text style={styles.entryTitle}>{entry.title}</Text>
            <Text style={styles.entrySummary}>{entry.summary}</Text>
            <View style={styles.entryFooter}>
              <Text style={styles.entryMeta}>{entry.students} students</Text>
              <Text style={styles.entryMeta}>Details</Text>
            </View>
          </Card>
        ))}
        {filteredEntries.length === 0 ? (
          <Text style={styles.empty}>No diary entries for this date.</Text>
        ) : null}
      </View>

      <Button title="New diary entry" onPress={() => router.push('/(teacher)/diary/new')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  intro: {
    color: AppTheme.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  dateRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  dateChip: {
    backgroundColor: AppTheme.surface,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 18,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: AppTheme.border,
  },
  dateChipActive: {
    backgroundColor: AppTheme.primary,
    borderColor: AppTheme.primary,
  },
  dateChipLabel: {
    color: AppTheme.text,
    fontWeight: '600',
  },
  dateChipLabelActive: {
    color: '#fff',
  },
  list: {
    marginBottom: 24,
  },
  entryCard: {
    marginBottom: 12,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  entrySubject: {
    fontSize: 13,
    fontWeight: '700',
    color: AppTheme.primary,
  },
  entryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: AppTheme.text,
    marginBottom: 8,
  },
  entrySummary: {
    fontSize: 14,
    color: AppTheme.textMuted,
    lineHeight: 20,
    marginBottom: 12,
  },
  entryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  entryMeta: {
    fontSize: 12,
    color: AppTheme.textMuted,
  },
  empty: {
    color: AppTheme.textMuted,
    textAlign: 'center',
    marginTop: 12,
  },
});
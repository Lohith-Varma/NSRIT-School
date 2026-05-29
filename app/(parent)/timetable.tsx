import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { AppTheme } from '@/constants/Theme';
import { useActor } from '@/hooks/useActor';
import { useAuth } from '@/context/AuthContext';
import { getTimetableForClass } from '@/services/api';
import type { Timetable, TimetableSlot } from '@/types';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

export default function ParentTimetableScreen() {
  const actor = useActor();
  const { activeChild } = useAuth();
  const [timetable, setTimetable] = useState<Timetable | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeChild?.className) {
      setLoading(false);
      return;
    }
    setLoading(true);
    (async () => {
      try {
        // Find class matching the child's class ID
        const student = mockStore.users.find((u) => u.id === activeChild.id);
        if (student?.classId) {
          const data = await getTimetableForClass(actor, student.classId);
          setTimetable(data);
        }
      } catch (e) {
        console.warn('Failed to load timetable', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [actor, activeChild]);

  // Helper to find slot
  const getSlot = (day: string, period: number): TimetableSlot | undefined => {
    return timetable?.slots.find((s) => s.day === day && s.period === period);
  };

  return (
    <Screen title="Weekly Timetable" subtitle={`Schedule for ${activeChild?.name}`} loading={loading} scroll embedded>
      {timetable ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.grid}>
            {/* Header row */}
            <View style={styles.row}>
              <View style={[styles.cell, styles.headerCell, styles.dayCellWidth]}>
                <Text style={styles.headerText}>Day / Period</Text>
              </View>
              {PERIODS.map((p) => (
                <View key={p} style={[styles.cell, styles.headerCell, styles.periodCellWidth]}>
                  <Text style={styles.headerText}>Period {p}</Text>
                </View>
              ))}
            </View>

            {/* Days rows */}
            {DAYS.map((day) => (
              <View key={day} style={styles.row}>
                <View style={[styles.cell, styles.dayCell, styles.dayCellWidth]}>
                  <Text style={styles.dayLabel}>{day}</Text>
                </View>
                {PERIODS.map((period) => {
                  const slot = getSlot(day, period);
                  return (
                    <View key={period} style={[styles.cell, slot ? styles.slotCellActive : styles.slotCellEmpty, styles.periodCellWidth]}>
                      {slot ? (
                        <>
                          <Text style={styles.subjectText}>{slot.subject}</Text>
                          <Text style={styles.teacherText}>{slot.teacherName}</Text>
                        </>
                      ) : (
                        <Text style={styles.emptyDash}>—</Text>
                      )}
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        </ScrollView>
      ) : (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyText}>No timetable allocated for this class yet.</Text>
        </Card>
      )}
    </Screen>
  );
}

// Access internal mockStore directly for class matching fallback
import { mockStore } from '@/data/mock/store';

const styles = StyleSheet.create({
  grid: {
    backgroundColor: AppTheme.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: AppTheme.border,
    overflow: 'hidden',
    marginTop: 8,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.border,
  },
  cell: {
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: AppTheme.border,
    minHeight: 65,
  },
  dayCellWidth: {
    width: 110,
  },
  periodCellWidth: {
    width: 140,
  },
  headerCell: {
    backgroundColor: AppTheme.primary,
  },
  headerText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  dayCell: {
    backgroundColor: `${AppTheme.primary}08`,
  },
  dayLabel: {
    fontWeight: '700',
    color: AppTheme.text,
    fontSize: 13,
  },
  slotCellActive: {
    backgroundColor: `${AppTheme.accent}06`,
  },
  slotCellEmpty: {},
  subjectText: {
    fontSize: 14,
    fontWeight: '600',
    color: AppTheme.primary,
    textAlign: 'center',
  },
  teacherText: {
    fontSize: 11,
    color: AppTheme.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  emptyDash: {
    color: AppTheme.textMuted,
    fontSize: 14,
  },
  emptyCard: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: AppTheme.textMuted,
    fontSize: 15,
  },
});

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FormField } from '@/components/ui/FormField';
import { Screen } from '@/components/ui/Screen';
import { AppTheme } from '@/constants/Theme';
import { useActor } from '@/hooks/useActor';
import { getWingClasses, getWingTeachers, getTimetableForClass, saveTimetable } from '@/services/api';
import type { Class, Timetable, TimetableSlot, User } from '@/types';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TextInput, Pressable, ScrollView } from 'react-native';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

export default function CoordinatorTimetablesScreen() {
  const actor = useActor();
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [timetable, setTimetable] = useState<Timetable | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit Slot form state
  const [selectedDay, setSelectedDay] = useState<TimetableSlot['day']>('Monday');
  const [selectedPeriod, setSelectedPeriod] = useState<number>(1);
  const [subject, setSubject] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [cls, tchr] = await Promise.all([
        getWingClasses(actor),
        getWingTeachers(actor),
      ]);
      setClasses(cls);
      setTeachers(tchr);
      if (cls.length > 0) {
        setSelectedClassId(cls[0].id);
      }
      if (tchr.length > 0) {
        setSelectedTeacherId(tchr[0].id);
      }
    } catch (e) {
      console.warn('Failed to load initial data', e);
    } finally {
      setLoading(false);
    }
  };

  const loadTimetable = async (classId: string) => {
    if (!classId) return;
    try {
      const data = await getTimetableForClass(actor, classId);
      setTimetable(data);
    } catch (e) {
      console.warn('Failed to load timetable', e);
    }
  };

  useEffect(() => {
    loadData();
  }, [actor]);

  useEffect(() => {
    if (selectedClassId) {
      loadTimetable(selectedClassId);
    }
  }, [selectedClassId]);

  const getSlot = (day: string, period: number): TimetableSlot | undefined => {
    return timetable?.slots.find((s) => s.day === day && s.period === period);
  };

  const handleSaveSlot = async () => {
    if (!subject.trim()) {
      setErr('Please enter a subject');
      return;
    }
    setSaving(true);
    setErr(null);

    const teacherObj = teachers.find((t) => t.id === selectedTeacherId);
    const teacherName = teacherObj ? teacherObj.name : 'Unknown';

    // Build the new list of slots
    const currentSlots = timetable ? [...timetable.slots] : [];
    const index = currentSlots.findIndex((s) => s.day === selectedDay && s.period === selectedPeriod);

    const newSlot: TimetableSlot = {
      day: selectedDay,
      period: selectedPeriod,
      subject: subject.trim(),
      teacherId: selectedTeacherId,
      teacherName,
    };

    if (index >= 0) {
      currentSlots[index] = newSlot;
    } else {
      currentSlots.push(newSlot);
    }

    try {
      await saveTimetable(actor, selectedClassId, currentSlots);
      setSubject('');
      await loadTimetable(selectedClassId);
    } catch (e: any) {
      setErr(e.message || 'Failed to save timetable slot');
    } finally {
      setSaving(false);
    }
  };

  const handleClearSlot = async (day: TimetableSlot['day'], period: number) => {
    if (!timetable) return;
    setSaving(true);
    const filteredSlots = timetable.slots.filter((s) => !(s.day === day && s.period === period));
    try {
      await saveTimetable(actor, selectedClassId, filteredSlots);
      await loadTimetable(selectedClassId);
    } catch (e: any) {
      setErr(e.message || 'Failed to clear slot');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen title="Timetable Management" subtitle="Define subjects and allocate teachers for periods" loading={loading} scroll>
      {classes.length > 0 ? (
        <View style={styles.selector}>
          <Text style={styles.selectorLabel}>Select Class to Manage:</Text>
          <View style={styles.tabsRow}>
            {classes.map((cls) => (
              <Pressable
                key={cls.id}
                style={[styles.tabButton, selectedClassId === cls.id ? styles.tabButtonActive : null]}
                onPress={() => setSelectedClassId(cls.id)}>
                <Text style={[styles.tabLabel, selectedClassId === cls.id ? styles.tabLabelActive : null]}>
                  {cls.name} ({cls.section})
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}

      <View style={styles.container}>
        <View style={styles.formCol}>
          <Card style={styles.cardPadding}>
            <Text style={styles.sectionTitle}>Allocate Period Slot</Text>
            
            <FormField label="Day of Week">
              <View style={styles.dropdownRow}>
                {DAYS.map((d) => (
                  <Pressable
                    key={d}
                    style={[styles.dropdownOption, selectedDay === d ? styles.dropdownOptionActive : null]}
                    onPress={() => setSelectedDay(d)}>
                    <Text style={[styles.dropdownText, selectedDay === d ? styles.dropdownTextActive : null]}>
                      {d.slice(0, 3)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </FormField>

            <FormField label="Period Number">
              <View style={styles.dropdownRow}>
                {PERIODS.map((p) => (
                  <Pressable
                    key={p}
                    style={[styles.dropdownOptionCircle, selectedPeriod === p ? styles.dropdownOptionCircleActive : null]}
                    onPress={() => setSelectedPeriod(p)}>
                    <Text style={[styles.dropdownText, selectedPeriod === p ? styles.dropdownTextActive : null]}>
                      {p}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </FormField>

            <FormField label="Subject Name">
              <TextInput
                style={styles.input}
                placeholder="e.g. Physics, History, Math"
                placeholderTextColor={AppTheme.textMuted}
                value={subject}
                onChangeText={setSubject}
              />
            </FormField>

            <FormField label="Assign Teacher">
              <View style={styles.teachersRow}>
                {teachers.map((t) => (
                  <Pressable
                    key={t.id}
                    style={[styles.teacherBtn, selectedTeacherId === t.id ? styles.teacherBtnActive : null]}
                    onPress={() => setSelectedTeacherId(t.id)}>
                    <Text style={[styles.teacherBtnText, selectedTeacherId === t.id ? styles.teacherBtnTextActive : null]}>
                      {t.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </FormField>

            {err ? <Text style={styles.errorText}>{err}</Text> : null}

            <Button
              title="Save Period Allocation"
              loading={saving}
              onPress={handleSaveSlot}
              style={styles.btnMargin}
            />
          </Card>
        </View>

        <View style={styles.gridCol}>
          <Text style={styles.sectionTitle}>Weekly Class Timetable</Text>
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
                          <View style={styles.slotContainer}>
                            <Text style={styles.subjectText}>{slot.subject}</Text>
                            <Text style={styles.teacherText}>{slot.teacherName}</Text>
                            <Pressable onPress={() => handleClearSlot(day, period)} style={styles.clearBtn}>
                              <Text style={styles.clearBtnText}>Remove</Text>
                            </Pressable>
                          </View>
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
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  selector: {
    marginBottom: 16,
  },
  selectorLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: AppTheme.textMuted,
    marginBottom: 8,
  },
  tabsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: AppTheme.surface,
    borderWidth: 1.5,
    borderColor: AppTheme.border,
  },
  tabButtonActive: {
    backgroundColor: AppTheme.primary,
    borderColor: AppTheme.primary,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: AppTheme.text,
  },
  tabLabelActive: {
    color: '#fff',
  },
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  formCol: {
    flex: 1,
    minWidth: 320,
  },
  gridCol: {
    flex: 1.8,
    minWidth: 360,
  },
  cardPadding: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: AppTheme.text,
    marginBottom: 14,
  },
  dropdownRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  dropdownOption: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: AppTheme.border,
    backgroundColor: '#fff',
  },
  dropdownOptionActive: {
    backgroundColor: AppTheme.coordinator,
    borderColor: AppTheme.coordinator,
  },
  dropdownOptionCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: AppTheme.border,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownOptionCircleActive: {
    backgroundColor: AppTheme.coordinator,
    borderColor: AppTheme.coordinator,
  },
  dropdownText: {
    fontSize: 12,
    fontWeight: '600',
    color: AppTheme.text,
  },
  dropdownTextActive: {
    color: '#fff',
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
  teachersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  teacherBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: AppTheme.border,
    backgroundColor: '#fff',
  },
  teacherBtnActive: {
    backgroundColor: AppTheme.coordinator,
    borderColor: AppTheme.coordinator,
  },
  teacherBtnText: {
    fontSize: 12,
    color: AppTheme.text,
    fontWeight: '600',
  },
  teacherBtnTextActive: {
    color: '#fff',
  },
  btnMargin: {
    marginTop: 16,
    backgroundColor: AppTheme.coordinator,
  },
  errorText: {
    color: AppTheme.danger,
    fontSize: 14,
    marginTop: 8,
  },
  grid: {
    backgroundColor: AppTheme.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: AppTheme.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.border,
  },
  cell: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: AppTheme.border,
    minHeight: 80,
  },
  dayCellWidth: {
    width: 100,
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
  slotContainer: {
    alignItems: 'center',
    width: '100%',
  },
  subjectText: {
    fontSize: 13,
    fontWeight: '600',
    color: AppTheme.primary,
    textAlign: 'center',
  },
  teacherText: {
    fontSize: 10,
    color: AppTheme.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
  clearBtn: {
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: `${AppTheme.danger}12`,
  },
  clearBtnText: {
    fontSize: 10,
    color: AppTheme.danger,
    fontWeight: '600',
  },
  emptyDash: {
    color: AppTheme.textMuted,
    fontSize: 14,
  },
});

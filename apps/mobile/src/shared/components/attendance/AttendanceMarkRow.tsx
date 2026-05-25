import { AppTheme } from '@/constants/Theme';
import type { AttendanceStatus } from '@/types';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface AttendanceMarkRowProps {
  studentName: string;
  status: AttendanceStatus;
  onChange: (status: AttendanceStatus) => void;
}

export function AttendanceMarkRow({ studentName, status, onChange }: AttendanceMarkRowProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.name} numberOfLines={1}>
        {studentName}
      </Text>
      <View style={styles.toggle}>
        <Pressable
          style={[styles.chip, status === 'present' && styles.chipPresentActive]}
          onPress={() => onChange('present')}>
          <Text style={[styles.chipText, status === 'present' && styles.chipTextActive]}>
            Present
          </Text>
        </Pressable>
        <Pressable
          style={[styles.chip, status === 'absent' && styles.chipAbsentActive]}
          onPress={() => onChange('absent')}>
          <Text
            style={[
              styles.chipText,
              status === 'absent' && styles.chipTextActiveAbsent,
            ]}>
            Absent
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.border,
  },
  name: {
    flex: 1,
    fontSize: 16,
    color: AppTheme.text,
    marginRight: 12,
  },
  toggle: {
    flexDirection: 'row',
    gap: 6,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: AppTheme.background,
    borderWidth: 1,
    borderColor: AppTheme.border,
  },
  chipPresentActive: {
    backgroundColor: AppTheme.present,
    borderColor: AppTheme.present,
  },
  chipAbsentActive: {
    backgroundColor: AppTheme.absent,
    borderColor: AppTheme.absent,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: AppTheme.textMuted,
  },
  chipTextActive: {
    color: '#fff',
  },
  chipTextActiveAbsent: {
    color: '#fff',
  },
});

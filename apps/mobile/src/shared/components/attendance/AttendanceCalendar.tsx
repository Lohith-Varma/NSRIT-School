import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { AppTheme } from '@/constants/Theme';
import type { AttendanceRecord } from '@/types';
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface AttendanceCalendarProps {
  records: AttendanceRecord[];
}

export function AttendanceCalendar({ records }: AttendanceCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 15)); // Default to May 2026 (matching mock timeline)

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  // Month names
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Days of the week
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const getDaysInMonth = (y: number, m: number) => {
    return new Date(y, m + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (y: number, m: number) => {
    // getDay() returns 0 for Sunday, 1 for Monday, etc.
    // We adjust it so 0 is Monday, 6 is Sunday
    const day = new Date(y, m, 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const totalDays = getDaysInMonth(year, month);
  const startOffset = getFirstDayOfMonth(year, month);

  // Generate calendar grid items
  const calendarCells = [];

  // Empty cells for offset
  for (let i = 0; i < startOffset; i++) {
    calendarCells.push(<View key={`empty-${i}`} style={styles.calendarDayEmpty} />);
  }

  // Actual day cells
  for (let day = 1; day <= totalDays; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    // Find record
    const record = records.find((r) => r.date === dateStr);
    
    // Check if weekend (Sat/Sun)
    const dayOfWeek = new Date(year, month, day).getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    let cellStyle: any = styles.calendarDay;
    let textStyle: any = styles.calendarDayText;
    let dotColor = null;

    if (record) {
      if (record.status === 'present') {
        cellStyle = [styles.calendarDay, styles.presentCell];
        textStyle = [styles.calendarDayText, styles.presentText];
        dotColor = AppTheme.success;
      } else if (record.status === 'absent') {
        cellStyle = [styles.calendarDay, styles.absentCell];
        textStyle = [styles.calendarDayText, styles.absentText];
        dotColor = AppTheme.absent;
      }
    } else if (isWeekend) {
      cellStyle = [styles.calendarDay, styles.weekendCell];
      textStyle = [styles.calendarDayText, styles.weekendText];
    }

    calendarCells.push(
      <View key={`day-${day}`} style={cellStyle}>
        <Text style={textStyle}>{day}</Text>
        {dotColor ? (
          <View style={[styles.statusDot, { backgroundColor: dotColor }]} />
        ) : null}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Month Navigation Header */}
      <View style={styles.header}>
        <Pressable onPress={handlePrevMonth} style={styles.navBtn} hitSlop={8}>
          <FontAwesome name="chevron-left" size={14} color={AppTheme.text} />
        </Pressable>
        <Text style={styles.monthLabel}>
          {monthNames[month]} {year}
        </Text>
        <Pressable onPress={handleNextMonth} style={styles.navBtn} hitSlop={8}>
          <FontAwesome name="chevron-right" size={14} color={AppTheme.text} />
        </Pressable>
      </View>

      {/* Weekday Names Header */}
      <View style={styles.weekDaysHeader}>
        {weekDays.map((day) => (
          <Text key={day} style={styles.weekDayLabel}>
            {day}
          </Text>
        ))}
      </View>

      {/* Calendar Grid */}
      <View style={styles.grid}>{calendarCells}</View>

      {/* Legend Footer */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: AppTheme.success }]} />
          <Text style={styles.legendText}>Present</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: AppTheme.absent }]} />
          <Text style={styles.legendText}>Absent</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#f1f5f9' }]} />
          <Text style={styles.legendText}>No Record</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: AppTheme.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: AppTheme.border,
    padding: 16,
    marginVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  monthLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: AppTheme.text,
  },
  weekDaysHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDayLabel: {
    width: '14.28%',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: AppTheme.textMuted,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: '14.28%',
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#f1f5f9',
    position: 'relative',
  },
  calendarDayEmpty: {
    width: '14.28%',
    height: 44,
  },
  calendarDayText: {
    fontSize: 14,
    fontWeight: '500',
    color: AppTheme.text,
  },
  presentCell: {
    backgroundColor: `${AppTheme.success}10`,
  },
  presentText: {
    color: AppTheme.success,
    fontWeight: '700',
  },
  absentCell: {
    backgroundColor: `${AppTheme.absent}10`,
  },
  absentText: {
    color: AppTheme.absent,
    fontWeight: '700',
  },
  weekendCell: {
    backgroundColor: '#f8fafc',
  },
  weekendText: {
    color: AppTheme.textMuted,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    position: 'absolute',
    bottom: 6,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    color: AppTheme.textMuted,
    fontWeight: '500',
  },
});

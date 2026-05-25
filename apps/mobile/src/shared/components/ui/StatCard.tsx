import { AppTheme } from '@/constants/Theme';
import { Children } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card } from './Card';

interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
  color?: string;
}

export function StatCard({ label, value, hint, color = AppTheme.primary }: StatCardProps) {
  return (
    <Card style={styles.stat}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color }]}>{value}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </Card>
  );
}

export function StatRow({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.row}>
      {Children.map(children, (child, index) => (
        <View key={index} style={styles.cell}>
          {child}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginHorizontal: -5,
  },
  cell: {
    flex: 1,
    marginHorizontal: 5,
  },
  stat: {
    marginBottom: 0,
  },
  label: {
    fontSize: 12,
    color: AppTheme.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
  },
  hint: {
    fontSize: 12,
    color: AppTheme.textMuted,
    marginTop: 4,
  },
});

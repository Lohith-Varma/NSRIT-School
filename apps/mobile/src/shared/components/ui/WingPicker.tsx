import { formatWing } from '@/constants/Wings';
import { AppTheme } from '@/constants/Theme';
import type { Wing } from '@/types';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const WINGS: Wing[] = ['primary', 'secondary', 'higher_secondary'];

interface WingPickerProps {
  value: Wing;
  onChange: (wing: Wing) => void;
}

export function WingPicker({ value, onChange }: WingPickerProps) {
  return (
    <View style={styles.row}>
      {WINGS.map((wing) => (
        <Pressable
          key={wing}
          style={[styles.chip, value === wing && styles.chipActive]}
          onPress={() => onChange(wing)}>
          <Text style={[styles.chipText, value === wing && styles.chipTextActive]}>
            {formatWing(wing).replace(' Wing', '')}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: AppTheme.border,
    backgroundColor: AppTheme.background,
  },
  chipActive: {
    backgroundColor: AppTheme.primary,
    borderColor: AppTheme.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: AppTheme.textMuted,
  },
  chipTextActive: {
    color: '#fff',
  },
});

import { AppTheme } from '@/constants/Theme';
import { sx } from '@/utils/styles';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export function AdminChipTabs<T extends string>({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: T; label: string }[];
  active: T;
  onChange: (id: T) => void;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
      <View style={styles.row}>
        {tabs.map((tab) => {
          const isActive = tab.id === active;
          return (
            <Pressable
              key={tab.id}
              onPress={() => onChange(tab.id)}
              style={sx(styles.chip, isActive && styles.chipActive)}>
              <Text style={sx(styles.chipText, isActive && styles.chipTextActive)}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { marginBottom: 12 },
  row: { flexDirection: 'row', gap: 8, paddingVertical: 4 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: AppTheme.radius.full,
    backgroundColor: AppTheme.surfaceContainer,
  },
  chipActive: {
    backgroundColor: AppTheme.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: AppTheme.textMuted,
  },
  chipTextActive: {
    color: AppTheme.white,
  },
});

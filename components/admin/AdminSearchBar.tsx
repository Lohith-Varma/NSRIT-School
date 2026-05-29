import { AppTheme } from '@/constants/Theme';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { StyleSheet, TextInput, View } from 'react-native';

export function AdminSearchBar({
  value,
  onChangeText,
  placeholder,
}: {
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
}) {
  return (
    <View style={styles.wrap}>
      <FontAwesome name="search" size={16} color={AppTheme.outline} style={styles.icon} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder ?? 'Search...'}
        placeholderTextColor={AppTheme.textMuted}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppTheme.admin.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: AppTheme.border,
    borderRadius: AppTheme.radius.lg,
    paddingHorizontal: 12,
    minHeight: 44,
  },
  icon: { marginRight: 8 },
  input: {
    flex: 1,
    fontSize: 16,
    color: AppTheme.text,
    paddingVertical: 10,
  },
});

import { AppTheme } from '@/constants/Theme';
import { StyleSheet, Text, TextInput, type TextInputProps } from 'react-native';

interface FormFieldProps extends TextInputProps {
  label: string;
}

export function FormField({ label, style, ...rest }: FormFieldProps) {
  return (
    <>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, style]}
        placeholderTextColor={AppTheme.textMuted}
        {...rest}
      />
    </>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: AppTheme.text,
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: AppTheme.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: AppTheme.text,
    backgroundColor: AppTheme.surface,
  },
});

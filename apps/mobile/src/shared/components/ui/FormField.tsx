import { AppTheme } from '@/constants/Theme';
import { StyleSheet, Text, TextInput, type TextInputProps, View } from 'react-native';

interface FormFieldProps extends TextInputProps {
  label: string;
  error?: string;
  children?: React.ReactNode;
}

export function FormField({ label, style, children, error, ...rest }: FormFieldProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      {children ? (
        children
      ) : (
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={AppTheme.textMuted}
          {...rest}
        />
      )}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: AppTheme.text,
    marginBottom: 6,
    marginTop: 6,
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
  errorText: {
    fontSize: 12,
    color: AppTheme.danger,
    marginTop: 4,
  },
});

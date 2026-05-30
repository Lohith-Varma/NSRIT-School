import { AppTheme } from '@/constants/Theme';
import { sx } from '@/utils/styles';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
} from 'react-native';

interface ButtonProps extends PressableProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  loading?: boolean;
}

export function Button({
  title,
  variant = 'primary',
  loading,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const variantTextStyle =
    variant === 'primary'
      ? styles.primaryText
      : variant === 'secondary'
        ? styles.secondaryText
        : variant === 'outline'
          ? styles.outlineText
          : styles.dangerText;

  return (
    <Pressable
      style={({ pressed }) =>
        sx(
          styles.base,
          styles[variant],
          pressed && !isDisabled ? styles.pressed : null,
          isDisabled ? styles.disabled : null,
          style,
        )
      }
      disabled={isDisabled}
      {...rest}>
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? AppTheme.primary : '#fff'} />
      ) : (
        <Text style={[styles.text, variantTextStyle]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  primary: {
    backgroundColor: AppTheme.primary,
  },
  secondary: {
    backgroundColor: AppTheme.accent,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: AppTheme.primary,
  },
  danger: {
    backgroundColor: AppTheme.danger,
  },
  pressed: {
    opacity: 0.88,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryText: { color: '#fff' },
  secondaryText: { color: '#fff' },
  outlineText: { color: AppTheme.primary },
  dangerText: { color: '#fff' },
});

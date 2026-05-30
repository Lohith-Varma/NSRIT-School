import { AppTheme } from '@/constants/Theme';
import { sx } from '@/utils/styles';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View, type ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ScreenProps extends ViewProps {
  title?: string;
  subtitle?: string;
  scroll?: boolean;
  loading?: boolean;
  headerRight?: React.ReactNode;
  /** When nested inside a shell that already handles safe area (e.g. ParentShell) */
  embedded?: boolean;
  children: React.ReactNode;
}

export function Screen({
  title,
  subtitle,
  scroll = true,
  loading,
  headerRight,
  embedded,
  children,
  style,
  ...rest
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const content = loading ? (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color={AppTheme.primary} />
    </View>
  ) : (
    children
  );

  const body = scroll ? (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled">
      {content}
    </ScrollView>
  ) : (
    <View style={styles.flex}>{content}</View>
  );

  return (
    <View
      style={sx(styles.root, embedded ? undefined : { paddingTop: insets.top }, style)}
      {...rest}>
      {(title || headerRight) && (
        <View style={styles.header}>
          <View style={styles.headerText}>
            {title ? <Text style={styles.title}>{title}</Text> : null}
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
          {headerRight}
        </View>
      )}
      {body}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: AppTheme.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: AppTheme.primary,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
});

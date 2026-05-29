import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { AppTheme } from '@/constants/Theme';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/services/api';
import { DEMO_ACCOUNTS_CONFIG } from '@/data/mock/users';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const { signIn, isLoading } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (loginEmail: string) => {
    setError(null);
    try {
      await signIn({ email: loginEmail, password: 'demo' });
      router.replace('/');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Login failed. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { paddingTop: insets.top + 16 }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.brand}>
          <Text style={styles.brandTitle}>NSRIT School</Text>
          <Text style={styles.brandSubtitle}>Parent portal · Attendance & fees</Text>
        </View>

        <Card style={styles.loginCard}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="you@nsrit.edu"
            placeholderTextColor={AppTheme.textMuted}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Button
            title="Sign In"
            loading={isLoading}
            onPress={() => handleLogin(email)}
            style={styles.signInBtn}
          />
        </Card>

        <Text style={styles.demoLabel}>Quick demo access</Text>
        <View style={styles.demoGrid}>
          {Object.entries(DEMO_ACCOUNTS_CONFIG).map(([key, config]) => (
            <Pressable
              key={key}
              style={({ pressed }) => [
                styles.demoCard,
                pressed ? styles.demoCardPressed : null,
                isLoading ? styles.demoCardDisabled : null,
              ]}
              onPress={() => handleLogin(config.email)}
              disabled={isLoading}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardIcon}>{config.icon}</Text>
                <Text style={styles.cardRole}>{config.roleLabel}</Text>
              </View>
              {config.name ? (
                <Text style={styles.cardUser} numberOfLines={1}>
                  {config.name}
                </Text>
              ) : null}
              <Text style={styles.cardBtnText} numberOfLines={1}>
                {config.buttonText}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: AppTheme.primary,
  },
  scroll: {
    padding: 16,
    paddingBottom: 32,
  },
  brand: {
    marginBottom: 16,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
  },
  brandSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
    textAlign: 'center',
  },
  loginCard: {
    padding: 16,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: AppTheme.text,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: AppTheme.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: AppTheme.text,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  error: {
    color: AppTheme.danger,
    marginBottom: 10,
    fontSize: 13,
  },
  signInBtn: {
    marginTop: 2,
    height: 44,
    minHeight: 44,
  },
  demoLabel: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.95)',
    fontWeight: '700',
    marginBottom: 10,
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  demoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  demoCard: {
    width: '48.5%',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: AppTheme.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    marginBottom: 2,
  },
  demoCardPressed: {
    opacity: 0.8,
    backgroundColor: AppTheme.background,
  },
  demoCardDisabled: {
    opacity: 0.5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  cardIcon: {
    fontSize: 18,
  },
  cardRole: {
    fontSize: 13,
    fontWeight: '700',
    color: AppTheme.text,
    flex: 1,
  },
  cardUser: {
    fontSize: 11,
    color: AppTheme.textMuted,
    marginBottom: 2,
  },
  cardBtnText: {
    fontSize: 9,
    fontWeight: '600',
    color: AppTheme.primary,
    opacity: 0.8,
    marginTop: 2,
  },
});

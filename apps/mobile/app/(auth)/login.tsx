import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { AppTheme } from '@/constants/Theme';
import { useAuth } from '@/context/AuthContext';
import { ApiError, DEMO_ACCOUNTS } from '@/services/api';
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
      style={[styles.root, { paddingTop: insets.top + 24 }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.brand}>
          <Text style={styles.brandTitle}>NSRIT School</Text>
          <Text style={styles.brandSubtitle}>Parent portal · Attendance & fees</Text>
        </View>

        <Card>
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
        <Button
          title="Login as Main Admin"
          variant="secondary"
          loading={isLoading}
          onPress={() => handleLogin(DEMO_ACCOUNTS.mainAdmin)}
        />
        <Button
          title="Login as Branch Admin"
          variant="secondary"
          loading={isLoading}
          onPress={() => handleLogin(DEMO_ACCOUNTS.branchAdmin)}
          style={styles.demoBtnAlt}
        />
        <Button
          title="Login as Principal"
          variant="outline"
          loading={isLoading}
          onPress={() => handleLogin(DEMO_ACCOUNTS.principal)}
          style={styles.demoBtn}
        />
        <Button
          title="Login as Coordinator"
          variant="outline"
          loading={isLoading}
          onPress={() => handleLogin(DEMO_ACCOUNTS.coordinator)}
          style={styles.demoBtn}
        />
        <Button
          title="Login as Teacher"
          variant="outline"
          loading={isLoading}
          onPress={() => handleLogin(DEMO_ACCOUNTS.teacher)}
          style={styles.demoBtn}
        />
        <Button
          title="Login as Parent (2 children)"
          variant="secondary"
          loading={isLoading}
          onPress={() => handleLogin(DEMO_ACCOUNTS.parent)}
          style={styles.demoBtnAlt}
        />
        <Button
          title="Login as Parent (1 child)"
          variant="outline"
          loading={isLoading}
          onPress={() => handleLogin(DEMO_ACCOUNTS.parentSingle)}
          style={styles.demoBtn}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0A0F1C', // Super dark, rich background
  },
  scroll: {
    padding: 24,
    paddingBottom: 48,
    flexGrow: 1,
    justifyContent: 'center',
  },
  brand: {
    marginBottom: 40,
    marginTop: 20,
  },
  brandTitle: {
    fontSize: 40,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -1,
  },
  brandSubtitle: {
    fontSize: 16,
    color: '#94A3B8', // Muted slate
    marginTop: 8,
    fontWeight: '500',
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: AppTheme.text,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: AppTheme.text,
    marginBottom: 16,
  },
  error: {
    color: AppTheme.danger,
    marginBottom: 16,
    fontSize: 14,
    fontWeight: '600',
  },
  signInBtn: {
    marginTop: 8,
  },
  demoLabel: {
    textAlign: 'center',
    color: '#94A3B8',
    marginTop: 32,
    marginBottom: 16,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '600',
  },
  demoBtn: {
    marginTop: 12,
    backgroundColor: '#fff',
    borderColor: '#CBD5E1',
  },
  demoBtnAlt: {
    marginTop: 12,
  },
});

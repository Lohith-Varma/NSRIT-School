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
    backgroundColor: AppTheme.primary,
  },
  scroll: {
    padding: 24,
    paddingBottom: 48,
  },
  brand: {
    marginBottom: 32,
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
  },
  brandSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: AppTheme.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: AppTheme.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: AppTheme.text,
    marginBottom: 12,
  },
  error: {
    color: AppTheme.danger,
    marginBottom: 12,
    fontSize: 14,
  },
  signInBtn: {
    marginTop: 4,
  },
  demoLabel: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.85)',
    marginTop: 24,
    marginBottom: 12,
    fontSize: 14,
  },
  demoBtn: {
    marginTop: 10,
    backgroundColor: '#fff',
  },
  demoBtnAlt: {
    marginTop: 10,
  },
});

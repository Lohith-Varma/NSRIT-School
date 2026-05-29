import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FormField } from '@/components/ui/FormField';
import { Screen } from '@/components/ui/Screen';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

export default function SuggestionBoxScreen() {
  const [category, setCategory] = useState('general');
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const submit = async () => {
    if (!text.trim()) return Alert.alert('Please enter your suggestion');
    setSending(true);
    // Mock submit — in future hook to real API
    setTimeout(() => {
      setSending(false);
      setText('');
      Alert.alert('Thank you', 'Your suggestion has been submitted.');
    }, 600);
  };

  return (
    <Screen scroll embedded>
      <Card>
        <Text style={styles.title}>Suggestion Box</Text>
        <Text style={styles.hint}>We value your feedback. Submit ideas or issues here.</Text>
        <View style={{ marginTop: 12 }}>
          <FormField label="Category" value={category} onChangeText={setCategory} />
          <FormField label="Your suggestion" value={text} onChangeText={setText} multiline numberOfLines={5} style={{ height: 120 }} />
          <Button title={sending ? 'Sending…' : 'Submit Suggestion'} onPress={submit} disabled={sending} style={{ marginTop: 12 }} />
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 18, fontWeight: '700' },
  hint: { fontSize: 13, color: '#666', marginTop: 8 },
});

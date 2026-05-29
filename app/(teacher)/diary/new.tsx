import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { AppTheme } from '@/constants/Theme';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput } from 'react-native';

export default function TeacherDiaryNewScreen() {
  const router = useRouter();
  const [subject, setSubject] = useState('Mathematics');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [className, setClassName] = useState('Grade 10 - A');

  const handleSubmit = () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert('Please add a title and details.');
      return;
    }

    Alert.alert('Saved', 'Diary entry has been created.');
    router.back();
  };

  return (
    <Screen title="New Diary Entry" scroll>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Card style={styles.card}>
          <Text style={styles.label}>Subject</Text>
          <TextInput
            style={styles.input}
            value={subject}
            onChangeText={setSubject}
            placeholder="Subject"
            placeholderTextColor={AppTheme.textMuted}
          />
        </Card>

        <Card style={styles.card}>
          <Text style={styles.label}>Class & Section</Text>
          <TextInput
            style={styles.input}
            value={className}
            onChangeText={setClassName}
            placeholder="Grade 10 - A"
            placeholderTextColor={AppTheme.textMuted}
          />
        </Card>

        <Card style={styles.card}>
          <Text style={styles.label}>Entry Title</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Quadratic Equations Assignment"
            placeholderTextColor={AppTheme.textMuted}
          />
        </Card>

        <Card style={styles.card}>
          <Text style={styles.label}>Detailed Instructions</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Write your notes here..."
            placeholderTextColor={AppTheme.textMuted}
            multiline
          />
        </Card>

        <Button title="Save and Publish" onPress={handleSubmit} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 32,
  },
  card: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: AppTheme.textMuted,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: AppTheme.border,
    borderRadius: 14,
    padding: 14,
    fontSize: 16,
    color: AppTheme.text,
    backgroundColor: AppTheme.surface,
  },
  textArea: {
    minHeight: 140,
    textAlignVertical: 'top',
  },
});
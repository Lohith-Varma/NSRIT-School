import { AdminCard } from '@/components/admin/AdminCard';
import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { AppTheme } from '@/constants/Theme';
import { useActor } from '@/hooks/useActor';
import { sendBroadcast } from '@/services/api';
import type { AdminComposeDraft, AdminNotificationCategory } from '@/types/admin';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

const CATEGORIES: { value: AdminNotificationCategory; label: string }[] = [
  { value: 'urgent', label: 'Urgent Announcement' },
  { value: 'academic', label: 'Academic Update' },
  { value: 'event', label: 'Event Invitation' },
  { value: 'general', label: 'General Information' },
];

export function ComposeNotificationScreen() {
  const actor = useActor();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<AdminNotificationCategory>('general');
  const [audience, setAudience] = useState(['Grade 4', 'Grade 5']);
  const [body, setBody] = useState('');
  const [push, setPush] = useState(true);
  const [email, setEmail] = useState(true);
  const [sms, setSms] = useState(false);
  const [schedule, setSchedule] = useState<'now' | 'later'>('now');
  const [sending, setSending] = useState(false);

  const draft: AdminComposeDraft = {
    title,
    category,
    audience,
    body,
    delivery: [
      ...(push ? (['push'] as const) : []),
      ...(email ? (['email'] as const) : []),
      ...(sms ? (['sms'] as const) : []),
    ],
    schedule,
  };

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) {
      Alert.alert('Missing fields', 'Add a title and message body.');
      return;
    }
    setSending(true);
    try {
      await sendBroadcast(actor, draft);
      Alert.alert('Sent', 'Broadcast queued for delivery.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <Screen scroll embedded>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <FontAwesome name="arrow-left" size={20} color={AppTheme.primary} />
        </Pressable>
        <Text style={styles.topTitle}>Compose Notification</Text>
        <View style={{ width: 24 }} />
      </View>

      <AdminCard>
        <Text style={styles.sectionTitle}>Draft Notification</Text>
        <FormField label="TITLE / SUBJECT" value={title} onChangeText={setTitle} placeholder="e.g., Annual Sports Day Update" />
        <Text style={styles.fieldLabel}>CATEGORY</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
          {CATEGORIES.map((c) => (
            <Pressable
              key={c.value}
              style={[styles.catChip, category === c.value && styles.catChipActive]}
              onPress={() => setCategory(c.value)}>
              <Text style={[styles.catChipText, category === c.value && styles.catChipTextActive]}>
                {c.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
        <Text style={styles.fieldLabel}>AUDIENCE</Text>
        <View style={styles.audienceBox}>
          {audience.map((tag) => (
            <View key={tag} style={styles.audienceTag}>
              <Text style={styles.audienceTagText}>{tag}</Text>
              <Pressable onPress={() => setAudience((a) => a.filter((x) => x !== tag))}>
                <FontAwesome name="times" size={12} color={AppTheme.admin.onPrimaryContainer} />
              </Pressable>
            </View>
          ))}
        </View>
      </AdminCard>

      <AdminCard style={styles.block}>
        <Text style={styles.sectionTitle}>Message Content</Text>
        <TextInput
          style={styles.textarea}
          multiline
          numberOfLines={6}
          placeholder="Type your message here..."
          placeholderTextColor={AppTheme.textMuted}
          value={body}
          onChangeText={setBody}
          textAlignVertical="top"
        />
      </AdminCard>

      <AdminCard style={styles.block}>
        <Text style={styles.sectionTitle}>Delivery Methods</Text>
        {[
          { label: 'Push Notification', value: push, set: setPush, icon: 'bell' as const },
          { label: 'Email', value: email, set: setEmail, icon: 'envelope' as const },
          { label: 'SMS Message', value: sms, set: setSms, icon: 'comment' as const },
        ].map((row) => (
          <View key={row.label} style={styles.deliveryRow}>
            <View style={styles.deliveryLeft}>
              <FontAwesome name={row.icon} size={18} color={AppTheme.primary} />
              <Text style={styles.deliveryLabel}>{row.label}</Text>
            </View>
            <Switch value={row.value} onValueChange={row.set} trackColor={{ true: AppTheme.primary }} />
          </View>
        ))}
      </AdminCard>

      <AdminCard style={styles.block}>
        <Text style={styles.sectionTitle}>Scheduling</Text>
        <View style={styles.scheduleRow}>
          <Pressable
            style={[styles.scheduleOpt, schedule === 'now' && styles.scheduleOptActive]}
            onPress={() => setSchedule('now')}>
            <Text style={[styles.scheduleText, schedule === 'now' && styles.scheduleTextActive]}>Send Now</Text>
          </Pressable>
          <Pressable
            style={[styles.scheduleOpt, schedule === 'later' && styles.scheduleOptActive]}
            onPress={() => setSchedule('later')}>
            <Text style={[styles.scheduleText, schedule === 'later' && styles.scheduleTextActive]}>Later</Text>
          </Pressable>
        </View>
      </AdminCard>

      <Button title="Send Broadcast" onPress={handleSend} loading={sending} />
      <View style={styles.secondaryRow}>
        <Button title="Preview" variant="secondary" onPress={() => Alert.alert('Preview', body || '(empty)')} />
        <Button title="Save Draft" variant="secondary" onPress={() => Alert.alert('Saved', 'Draft saved locally.')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  topTitle: { fontSize: 20, fontWeight: '600', color: AppTheme.primary },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: AppTheme.text, marginBottom: 12 },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: AppTheme.textMuted,
    letterSpacing: 0.5,
    marginTop: 12,
    marginBottom: 6,
  },
  catScroll: { marginBottom: 4 },
  catChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: AppTheme.border,
    marginRight: 8,
  },
  catChipActive: { borderColor: AppTheme.primary, backgroundColor: '#e0e0ff33' },
  catChipText: { fontSize: 13, color: AppTheme.textMuted },
  catChipTextActive: { color: AppTheme.primary, fontWeight: '600' },
  audienceBox: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, padding: 12, borderWidth: 1, borderColor: AppTheme.border, borderRadius: 8 },
  audienceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: AppTheme.admin.primaryContainer,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: AppTheme.radius.full,
  },
  audienceTagText: { fontSize: 12, fontWeight: '600', color: AppTheme.admin.onPrimaryContainer },
  block: { marginTop: 12 },
  textarea: {
    borderWidth: 1,
    borderColor: AppTheme.border,
    borderRadius: 8,
    padding: 12,
    minHeight: 140,
    fontSize: 16,
    color: AppTheme.text,
  },
  deliveryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.admin.surfaceContainerHigh,
  },
  deliveryLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  deliveryLabel: { fontSize: 16, color: AppTheme.text },
  scheduleRow: { flexDirection: 'row', gap: 12 },
  scheduleOpt: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: AppTheme.border,
    alignItems: 'center',
  },
  scheduleOptActive: { borderColor: AppTheme.primary, borderWidth: 2, backgroundColor: '#e0e0ff33' },
  scheduleText: { fontSize: 15, color: AppTheme.textMuted },
  scheduleTextActive: { color: AppTheme.primary, fontWeight: '600' },
  secondaryRow: { flexDirection: 'row', gap: 12, marginTop: 12 },
});

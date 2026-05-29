import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { Badge } from '@/components/ui/Badge';
import { AppTheme, formatDate } from '@/constants/Theme';
import { mockStore } from '@/data/mock/store';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput } from 'react-native';
import type { Announcement } from '@/types';

interface NoticesScreenProps {
  audienceFilter: 'All' | 'Parents' | 'Teachers' | 'Student';
}

export function NoticesScreen({ audienceFilter }: NoticesScreenProps) {
  const [notices, setNotices] = useState<Announcement[]>([]);
  const [filtered, setFiltered] = useState<Announcement[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    // Load announcements from mock store matching current audience
    const list = mockStore.announcements.filter((ann) => {
      if (ann.targetAudience === 'All') return true;
      if (audienceFilter === 'Parents' && ann.targetAudience === 'Parents') return true;
      if (audienceFilter === 'Teachers' && ann.targetAudience === 'Teachers') return true;
      return false;
    });
    setNotices(list);
    setFiltered(list);
  }, [audienceFilter]);

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(notices);
      return;
    }
    const q = search.toLowerCase();
    const result = notices.filter(
      (n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)
    );
    setFiltered(result);
  }, [search, notices]);

  return (
    <Screen title="Notice Board" subtitle="Official bulletins and campus updates" scroll>
      <Card style={styles.searchCard}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search notices..."
          placeholderTextColor={AppTheme.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </Card>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        {filtered.map((note) => (
          <Card key={note.id} style={styles.noticeCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.title}>{note.title}</Text>
              <Badge
                label={note.targetAudience.toUpperCase()}
                color={
                  note.targetAudience === 'All'
                    ? AppTheme.accent
                    : note.targetAudience === 'Parents'
                      ? AppTheme.coordinator
                      : AppTheme.warning
                }
              />
            </View>
            <Text style={styles.date}>Posted on: {formatDate(note.createdAt)}</Text>
            <Text style={styles.content}>{note.content}</Text>
          </Card>
        ))}

        {filtered.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>No bulletins found on the Notice Board.</Text>
          </Card>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchCard: {
    padding: 12,
    marginBottom: 16,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: AppTheme.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: AppTheme.text,
    backgroundColor: AppTheme.background,
  },
  scroll: {
    marginTop: 4,
  },
  noticeCard: {
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: AppTheme.accent,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: AppTheme.text,
    flex: 1,
  },
  date: {
    fontSize: 11,
    color: AppTheme.textMuted,
    marginTop: 4,
  },
  content: {
    fontSize: 14,
    color: AppTheme.text,
    marginTop: 10,
    lineHeight: 20,
  },
  emptyCard: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: AppTheme.textMuted,
    fontSize: 14,
  },
});

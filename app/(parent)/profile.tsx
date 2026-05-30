import { childGradeLabel } from '@/components/parent/childUtils';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { useActiveStudent } from '@/hooks/useActiveStudent';
import { StyleSheet, Text, View } from 'react-native';

export default function ParentProfileScreen() {
  const { child } = useActiveStudent();

  if (!child) {
    return (
      <Screen scroll embedded>
        <Text style={{ textAlign: 'center', marginTop: 24 }}>No child selected.</Text>
      </Screen>
    );
  }

  return (
    <Screen scroll embedded>
      <Card>
        <View style={styles.headerRow}>
          <Text style={styles.name}>{child.name}</Text>
          <Text style={styles.meta}>{childGradeLabel(child)}</Text>
        </View>
        <View style={styles.details}>
          <Text style={styles.label}>Class</Text>
          <Text style={styles.value}>{child.className ?? '—'}{child.section ? ` · ${child.section}` : ''}</Text>
          <Text style={styles.label}>Wing</Text>
          <Text style={styles.value}>{child.wing}</Text>
          <Text style={styles.label}>Branch</Text>
          <Text style={styles.value}>{child.branchId ?? '—'}</Text>
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: { marginBottom: 12 },
  name: { fontSize: 20, fontWeight: '700' },
  meta: { fontSize: 13, color: '#666', marginTop: 6 },
  details: { marginTop: 8 },
  label: { fontSize: 12, color: '#888', marginTop: 10 },
  value: { fontSize: 15, color: '#111', marginTop: 4 },
});

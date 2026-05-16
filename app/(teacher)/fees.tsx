import { FeeStatusRow } from '@/components/fees/FeeStatusRow';
import { Screen } from '@/components/ui/Screen';
import { AppTheme } from '@/constants/Theme';
import { useAuth } from '@/context/AuthContext';
import { getClassFeeStatuses, getClassesForTeacher, type ClassFeeRow } from '@/services/api';
import { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';

export default function TeacherFeesScreen() {
  const { user } = useAuth();
  const [rows, setRows] = useState<ClassFeeRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      try {
        const classes = await getClassesForTeacher(user, user.id);
        const cid = classes[0]?.id;
        if (cid) {
          const data = await getClassFeeStatuses(user, cid);
          setRows(data);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  return (
    <Screen loading={loading} scroll>
      <Text style={styles.intro}>
        Fee status for all students in your class. Paid, pending, and due amounts are shown below.
      </Text>
      {rows.map((row) => (
        <FeeStatusRow key={row.id} row={row} />
      ))}
      {!loading && rows.length === 0 ? (
        <Text style={styles.empty}>No fee records found.</Text>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: {
    fontSize: 14,
    color: AppTheme.textMuted,
    marginBottom: 16,
    lineHeight: 20,
  },
  empty: {
    textAlign: 'center',
    color: AppTheme.textMuted,
    marginTop: 24,
  },
});

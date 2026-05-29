import { AdminCard } from '@/components/admin/AdminCard';
import { AppTheme } from '@/constants/Theme';
import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  title: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  iconColor?: string;
  primary?: { label: string; onPress: () => void };
  secondary?: { label: string; onPress: () => void };
};

export function HubActionCard({ title, icon, iconColor, primary, secondary }: Props) {
  return (
    <AdminCard style={styles.card}>
      <View style={styles.header}>
        <MaterialIcons name={icon} size={32} color={iconColor ?? AppTheme.admin.primary} />
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.actions}>
        {primary ? (
          <Pressable style={[styles.btn, styles.btnPrimary]} onPress={primary.onPress}>
            <MaterialIcons name="person-add" size={20} color={AppTheme.admin.onPrimary} />
            <Text style={styles.btnPrimaryText}>{primary.label}</Text>
          </Pressable>
        ) : null}
        {secondary ? (
          <Pressable style={[styles.btn, styles.btnOutline]} onPress={secondary.onPress}>
            <MaterialIcons name="badge" size={20} color={AppTheme.admin.primary} />
            <Text style={styles.btnOutlineText}>{secondary.label}</Text>
          </Pressable>
        ) : null}
      </View>
    </AdminCard>
  );
}

const styles = StyleSheet.create({
  card: { padding: 24 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  title: { fontSize: 22, fontWeight: '600', color: AppTheme.admin.onSurface, flex: 1 },
  actions: { gap: 12 },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 12,
  },
  btnPrimary: { backgroundColor: AppTheme.admin.primary },
  btnPrimaryText: { color: AppTheme.admin.onPrimary, fontWeight: '700', fontSize: 14 },
  btnOutline: { borderWidth: 2, borderColor: `${AppTheme.admin.primary}33` },
  btnOutlineText: { color: AppTheme.admin.primary, fontWeight: '700', fontSize: 14 },
});

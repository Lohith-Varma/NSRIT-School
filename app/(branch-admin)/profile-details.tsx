import { AdminCard } from '@/components/admin/AdminCard';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminStatGrid } from '@/components/admin/AdminStatGrid';
import { Screen } from '@/components/ui/Screen';
import { AppTheme } from '@/constants/Theme';
import { useActor } from '@/hooks/useActor';
import { getBranchProfileDetails } from '@/services/api';
import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { BranchProfileDetails } from '@/types/branchAdmin';

export default function BranchProfileDetailsScreen() {
  const actor = useActor();
  const [profile, setProfile] = useState<BranchProfileDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBranchProfileDetails(actor).then(setProfile).finally(() => setLoading(false));
  }, [actor]);

  return (
    <Screen loading={loading} scroll embedded>
      {profile ? (
        <>
          <View style={styles.hero}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{profile.name.slice(0, 2)}</Text>
            </View>
            <Text style={styles.name}>{profile.name}</Text>
            <Text style={styles.role}>{profile.role}</Text>
            <View style={styles.location}>
              <MaterialIcons name="location-on" size={16} color={AppTheme.admin.secondary} />
              <Text style={styles.locationText}>{profile.branch}</Text>
            </View>
          </View>
          <AdminCard>
            <View style={styles.cardHead}>
              <MaterialIcons name="corporate-fare" size={22} color={AppTheme.admin.primary} />
              <Text style={styles.cardTitle}>Professional Position</Text>
            </View>
            <Detail label="Branch" value={profile.branch} />
            <Detail label="Department" value={profile.department} />
            <Detail label="Date of Joining" value={profile.joinDate} />
            <Detail label="Employee ID" value={profile.employeeId} />
          </AdminCard>
          <AdminCard>
            <View style={styles.cardHead}>
              <MaterialIcons name="person" size={22} color={AppTheme.admin.secondary} />
              <Text style={styles.cardTitle}>Personal Details</Text>
            </View>
            <Detail label="Contact" value={profile.phone} />
            <Detail label="Email" value={profile.email} />
            <Detail label="Date of Birth" value={profile.dob} />
            <Detail label="Address" value={profile.address} />
          </AdminCard>
          <AdminStatGrid
            items={[
              { label: 'Reports Managed', value: String(profile.reportsManaged) },
              { label: 'Service Period', value: `${profile.serviceYears} Years`, tone: 'secondary' },
            ]}
          />
        </>
      ) : (
        <AdminPageHeader title="My Profile" />
      )}
    </Screen>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detail}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', marginBottom: 24 },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: AppTheme.admin.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#fff',
  },
  avatarText: { fontSize: 36, fontWeight: '700', color: AppTheme.admin.onPrimaryFixed },
  name: { fontSize: 28, fontWeight: '700', color: AppTheme.admin.primary, marginTop: 16 },
  role: { fontSize: 16, color: AppTheme.admin.secondary, fontWeight: '500', marginTop: 4 },
  location: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8, backgroundColor: `${AppTheme.admin.secondaryContainer}44`, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  locationText: { fontSize: 13, color: AppTheme.admin.onSecondaryContainer },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  cardTitle: { fontSize: 18, fontWeight: '600', color: AppTheme.admin.primary },
  detail: { marginBottom: 12 },
  detailLabel: { fontSize: 12, color: AppTheme.admin.outline },
  detailValue: { fontSize: 15, fontWeight: '500', color: AppTheme.admin.onSurface, marginTop: 2 },
});

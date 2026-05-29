import { BranchAnnouncementCard } from '@/components/branch-admin/BranchAnnouncementCard';
import { Screen } from '@/components/ui/Screen';
import { useActiveStudent } from '@/hooks/useActiveStudent';
import { useActor } from '@/hooks/useActor';
import { listBranchAnnouncements } from '@/services/api/branchAdmin';
import { useEffect, useState } from 'react';
import { Text } from 'react-native';

export default function ParentNotificationsScreen() {
  const actor = useActor();
  const { child } = useActiveStudent();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    listBranchAnnouncements(actor)
      .then((all) => {
        if (!child) return setItems(all);
        const filtered = all.filter((a: any) => !a.wing || a.wing === 'All Wings' || a.wing === child.wing);
        setItems(filtered);
      })
      .finally(() => setLoading(false));
  }, [actor, child]);

  return (
    <Screen loading={loading} scroll embedded>
      {items.length === 0 && !loading ? (
        <Text style={{ textAlign: 'center', marginTop: 24 }}>No notices available.</Text>
      ) : (
        items.map((it) => <BranchAnnouncementCard key={it.id} item={it} />)
      )}
    </Screen>
  );
}

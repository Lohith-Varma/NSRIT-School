import { ProfileTabScreen } from '@/components/profile/ProfileTabScreen';
import { AppTheme } from '@/constants/Theme';

export default function ParentProfileScreen() {
  return <ProfileTabScreen accentColor={AppTheme.accent} embedded />;
}

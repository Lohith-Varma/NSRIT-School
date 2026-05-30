import { StudentSearchPanel } from '@/components/students/StudentSearchPanel';
import { Screen } from '@/components/ui/Screen';
import { AppTheme } from '@/constants/Theme';

export default function PrincipalStudentsScreen() {
  return (
    <Screen scroll>
      <StudentSearchPanel
        accentColor={AppTheme.principal}
        scopeHint="Search all students in your branch across every wing."
      />
    </Screen>
  );
}

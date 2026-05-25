import { StudentSearchPanel } from '@/components/students/StudentSearchPanel';
import { Screen } from '@/components/ui/Screen';
import { AppTheme } from '@/constants/Theme';

export default function TeacherStudentsScreen() {
  return (
    <Screen scroll>
      <StudentSearchPanel
        accentColor={AppTheme.primary}
        scopeHint="Search students enrolled in your assigned classes only."
      />
    </Screen>
  );
}

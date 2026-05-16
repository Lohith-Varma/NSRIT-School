import { ChildSwitcher } from '@/components/parent/ChildSwitcher';
import { childGradeLabel, childInitials } from '@/components/parent/childUtils';
import { formatWing } from '@/constants/Wings';
import { AppTheme } from '@/constants/Theme';
import { useAuth } from '@/context/AuthContext';
import { sx } from '@/utils/styles';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { usePathname, useRouter } from 'expo-router';
import { useState, type ReactNode } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const NAV = [
  { href: '/(parent)' as const, label: 'Dashboard', icon: 'home' as const, segment: '' },
  { href: '/(parent)/attendance' as const, label: 'Attendance', icon: 'calendar' as const, segment: 'attendance' },
  { href: '/(parent)/fees' as const, label: 'Fees', icon: 'credit-card' as const, segment: 'fees' },
];

function NavLinks({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  const router = useRouter();

  return (
    <>
      {NAV.map((item) => {
        const active =
          item.segment === ''
            ? !pathname.includes('attendance') && !pathname.includes('fees')
            : pathname.includes(item.segment);
        return (
          <Pressable
            key={item.href}
            style={sx(styles.navItem, active ? styles.navItemActive : null)}
            onPress={() => {
              router.push(item.href);
              onNavigate?.();
            }}>
            <FontAwesome
              name={item.icon}
              size={18}
              color={active ? AppTheme.accent : AppTheme.textMuted}
            />
            <Text style={sx(styles.navLabel, active ? styles.navLabelActive : null)}>{item.label}</Text>
          </Pressable>
        );
      })}
    </>
  );
}

function SidebarChildList() {
  const { children, activeChild, setActiveStudentId } = useAuth();
  if (children.length <= 1) {
    return activeChild ? (
      <View style={styles.sidebarChildBox}>
        <Text style={styles.sidebarChildLabel}>Viewing</Text>
        <Text style={styles.sidebarChildName}>{activeChild.name}</Text>
        <Text style={styles.sidebarChildMeta}>{childGradeLabel(activeChild)}</Text>
      </View>
    ) : null;
  }

  return (
    <View style={styles.sidebarChildBox}>
      <Text style={styles.sidebarChildLabel}>Children</Text>
      {children.map((child) => {
        const active = child.id === activeChild?.id;
        return (
          <Pressable
            key={child.id}
            style={sx(styles.siblingRow, active ? styles.siblingRowActive : null)}
            onPress={() => setActiveStudentId(child.id)}>
            <View style={sx(styles.siblingAvatar, active ? styles.siblingAvatarActive : null)}>
              <Text style={sx(styles.siblingInitials, active ? styles.siblingInitialsActive : null)}>
                {childInitials(child.name)}
              </Text>
            </View>
            <View style={styles.siblingText}>
              <Text style={sx(styles.siblingName, active ? styles.siblingNameActive : null)}>{child.name}</Text>
              <Text style={styles.siblingMeta}>Gr {child.grade}</Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

export function ParentShell({ children }: { children: ReactNode }) {
  const { user, signOut, activeChild } = useAuth();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.headerLeft}>
          {!isDesktop ? (
            <Pressable onPress={() => setMenuOpen(true)} style={styles.burger} hitSlop={8}>
              <FontAwesome name="bars" size={22} color="#fff" />
            </Pressable>
          ) : null}
          <View>
            <Text style={styles.headerTitle}>Parent Portal</Text>
            {activeChild ? (
              <Text style={styles.headerSub} numberOfLines={1}>
                {activeChild.name} · {formatWing(activeChild.wing)}
              </Text>
            ) : null}
          </View>
        </View>
        <View style={styles.headerRight}>
          <ChildSwitcher compact={!isDesktop} />
          <Pressable onPress={signOut} style={styles.logout}>
            <Text style={styles.logoutText}>Logout</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.body}>
        {isDesktop ? (
          <View style={styles.sidebar}>
            <Text style={styles.sidebarBrand}>NSRIT School</Text>
            <Text style={styles.sidebarParent}>{user?.name}</Text>
            <SidebarChildList />
            <NavLinks pathname={pathname} />
          </View>
        ) : null}
        <View style={styles.content}>{children}</View>
      </View>

      <Modal visible={!isDesktop && menuOpen} animationType="slide" transparent>
        <Pressable style={styles.drawerBackdrop} onPress={closeMenu}>
          <View
            style={[styles.drawer, { paddingTop: insets.top }]}
            onStartShouldSetResponder={() => true}>
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerTitle}>Menu</Text>
              <Pressable onPress={closeMenu}>
                <FontAwesome name="times" size={22} color={AppTheme.text} />
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <SidebarChildList />
              <NavLinks pathname={pathname} onNavigate={closeMenu} />
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: AppTheme.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: AppTheme.accent,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  burger: {
    marginRight: 12,
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  headerSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
    maxWidth: 200,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logout: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  logoutText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  body: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 260,
    backgroundColor: AppTheme.surface,
    borderRightWidth: 1,
    borderRightColor: AppTheme.border,
    padding: 16,
  },
  sidebarBrand: {
    fontSize: 16,
    fontWeight: '700',
    color: AppTheme.primary,
  },
  sidebarParent: {
    fontSize: 13,
    color: AppTheme.textMuted,
    marginTop: 4,
    marginBottom: 16,
  },
  sidebarChildBox: {
    backgroundColor: AppTheme.background,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  sidebarChildLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: AppTheme.textMuted,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  sidebarChildName: {
    fontSize: 15,
    fontWeight: '600',
    color: AppTheme.text,
  },
  sidebarChildMeta: {
    fontSize: 12,
    color: AppTheme.textMuted,
    marginTop: 4,
  },
  siblingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 8,
    marginBottom: 4,
  },
  siblingRowActive: {
    backgroundColor: `${AppTheme.accent}18`,
  },
  siblingAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: AppTheme.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  siblingAvatarActive: {
    backgroundColor: AppTheme.accent,
  },
  siblingInitials: {
    fontSize: 12,
    fontWeight: '700',
    color: AppTheme.textMuted,
  },
  siblingInitialsActive: {
    color: '#fff',
  },
  siblingText: {
    marginLeft: 10,
    flex: 1,
  },
  siblingName: {
    fontSize: 14,
    fontWeight: '600',
    color: AppTheme.text,
  },
  siblingNameActive: {
    color: AppTheme.accent,
  },
  siblingMeta: {
    fontSize: 11,
    color: AppTheme.textMuted,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 4,
  },
  navItemActive: {
    backgroundColor: `${AppTheme.accent}12`,
  },
  navLabel: {
    marginLeft: 12,
    fontSize: 15,
    color: AppTheme.textMuted,
    fontWeight: '500',
  },
  navLabelActive: {
    color: AppTheme.accent,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  drawerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    flexDirection: 'row',
  },
  drawer: {
    width: '82%',
    maxWidth: 320,
    backgroundColor: AppTheme.surface,
    paddingHorizontal: 16,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.border,
    marginBottom: 12,
  },
  drawerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: AppTheme.text,
  },
});

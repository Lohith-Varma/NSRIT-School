import { navForRole, type AdminNavItem } from '@/components/admin/adminNav';
import { AppTheme } from '@/constants/Theme';
import { useAuth } from '@/context/AuthContext';
import type { UserRole } from '@/types';
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

function NavIcon({ name, color }: { name: AdminNavItem['icon']; color: string }) {
  const map: Record<AdminNavItem['icon'], React.ComponentProps<typeof FontAwesome>['name']> = {
    dashboard: 'th-large',
    bell: 'bell',
    'line-chart': 'line-chart',
    history: 'history',
    'credit-card': 'credit-card',
    shield: 'shield',
    users: 'users',
    building: 'building',
    book: 'book',
    user: 'user',
    home: 'home',
    'graduation-cap': 'graduation-cap',
    'calendar-check-o': 'calendar-check-o',
    bank: 'bank',
    lock: 'lock',
    group: 'group',
  };
  return <FontAwesome name={map[name]} size={18} color={color} />;
}

function isNavActive(pathname: string, item: AdminNavItem): boolean {
  if (item.segment === 'index') {
    return (
      pathname.endsWith('(main-admin)') ||
      pathname.endsWith('/(main-admin)') ||
      pathname.match(/\(main-admin\)\/?$/) != null ||
      pathname.endsWith('(branch-admin)') ||
      pathname.endsWith('/(branch-admin)') ||
      pathname.match(/\(branch-admin\)\/?$/) != null
    );
  }
  return pathname.includes(item.segment);
}

function NavLinks({
  items,
  pathname,
  onNavigate,
}: {
  items: AdminNavItem[];
  pathname: string;
  onNavigate?: () => void;
}) {
  const router = useRouter();

  return (
    <>
      {items.map((item) => {
        const active = isNavActive(pathname, item);
        return (
          <Pressable
            key={item.href}
            style={sx(styles.navItem, active ? styles.navItemActive : null)}
            onPress={() => {
              router.push(item.href as never);
              onNavigate?.();
            }}>
            <NavIcon name={item.icon} color={active ? AppTheme.accent : AppTheme.textMuted} />
            <Text style={sx(styles.navLabel, active ? styles.navLabelActive : null)}>{item.label}</Text>
          </Pressable>
        );
      })}
    </>
  );
}

export function AdminShell({
  children,
  role,
  title = 'NSRIT – Connect',
  subtitle = 'Admin Portal',
}: {
  children: ReactNode;
  role: UserRole;
  title?: string;
  subtitle?: string;
}) {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const [menuOpen, setMenuOpen] = useState(false);
  const navItems = navForRole(role);
  const headerBg = role === 'main_admin' ? AppTheme.mainAdmin : AppTheme.branchAdmin;

  const closeMenu = () => setMenuOpen(false);

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: headerBg }]}>
        <View style={styles.headerLeft}>
          {!isDesktop ? (
            <Pressable onPress={() => setMenuOpen(true)} style={styles.burger} hitSlop={8}>
              <FontAwesome name="bars" size={22} color="#fff" />
            </Pressable>
          ) : null}
          <View>
            <Text style={styles.headerTitle}>{title}</Text>
            <Text style={styles.headerSub}>{subtitle}</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <Pressable
            onPress={() => {
              if (role === 'main_admin') router.push('/(main-admin)/notifications' as never);
              else router.push('/(branch-admin)/notifications' as never);
            }}
            style={styles.iconBtn}
            hitSlop={8}>
            <FontAwesome name="bell" size={20} color="#fff" />
          </Pressable>
          <Pressable onPress={signOut} style={styles.logout}>
            <Text style={styles.logoutText}>Logout</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.body}>
        {isDesktop ? (
          <View style={styles.sidebar}>
            <View style={styles.sidebarBrand}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{user?.name?.charAt(0) ?? 'A'}</Text>
              </View>
              <View>
                <Text style={styles.sidebarTitle}>Admin Portal</Text>
                <Text style={styles.sidebarVer}>v2.4.0</Text>
              </View>
            </View>
            <NavLinks items={navItems} pathname={pathname} />
            <Pressable
              style={styles.composeBtn}
              onPress={() => {
                if (role === 'main_admin') router.push('/(main-admin)/notifications-compose' as never);
                else router.push('/(branch-admin)/notifications-compose' as never);
              }}>
              <FontAwesome name="edit" size={14} color={AppTheme.primary} />
              <Text style={styles.composeBtnText}>Compose Notification</Text>
            </Pressable>
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
              <Text style={styles.drawerSection}>SYSTEM</Text>
              <NavLinks items={navItems} pathname={pathname} onNavigate={closeMenu} />
              <Pressable
                style={styles.drawerCompose}
                onPress={() => {
                  closeMenu();
                  if (role === 'main_admin') router.push('/(main-admin)/notifications-compose' as never);
                  else router.push('/(branch-admin)/notifications-compose' as never);
                }}>
                <FontAwesome name="bell" size={16} color={AppTheme.primary} />
                <Text style={styles.drawerComposeText}>Create Notification</Text>
              </Pressable>
            </ScrollView>
            <Pressable style={styles.drawerLogout} onPress={signOut}>
              <FontAwesome name="sign-out" size={18} color={AppTheme.admin.onErrorContainer} />
              <Text style={styles.drawerLogoutText}>Logout</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: AppTheme.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  burger: { marginRight: 12, padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: { padding: 8, marginRight: 4 },
  logout: { paddingHorizontal: 8, paddingVertical: 6 },
  logoutText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  body: { flex: 1, flexDirection: 'row' },
  sidebar: {
    width: 288,
    backgroundColor: AppTheme.admin.surfaceContainerLow,
    borderRightWidth: 1,
    borderRightColor: AppTheme.admin.surfaceContainerHighest,
    padding: 16,
  },
  sidebarBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.admin.surfaceContainerHighest,
    marginBottom: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: AppTheme.admin.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: AppTheme.admin.onPrimaryContainer, fontWeight: '700', fontSize: 18 },
  sidebarTitle: { fontSize: 16, fontWeight: '600', color: AppTheme.primary },
  sidebarVer: { fontSize: 12, color: AppTheme.textMuted, marginTop: 2 },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: AppTheme.radius.lg,
    marginBottom: 4,
  },
  navItemActive: {
    backgroundColor: AppTheme.admin.secondaryContainer,
  },
  navLabel: { fontSize: 15, color: AppTheme.textMuted, fontWeight: '500' },
  navLabelActive: { color: AppTheme.admin.onSecondaryContainer, fontWeight: '600' },
  composeBtn: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: AppTheme.admin.surfaceContainerLowest,
    borderRadius: AppTheme.radius.lg,
    borderWidth: 1,
    borderColor: AppTheme.border,
  },
  composeBtnText: { fontSize: 13, fontWeight: '600', color: AppTheme.primary },
  content: { flex: 1 },
  drawerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    flexDirection: 'row',
  },
  drawer: {
    width: '82%',
    maxWidth: 320,
    backgroundColor: AppTheme.admin.surfaceContainerLow,
    paddingHorizontal: 16,
    paddingBottom: 24,
    borderTopRightRadius: AppTheme.radius.xl,
    borderBottomRightRadius: AppTheme.radius.xl,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.border,
    marginBottom: 8,
  },
  drawerTitle: { fontSize: 18, fontWeight: '700', color: AppTheme.text },
  drawerSection: {
    fontSize: 11,
    fontWeight: '600',
    color: AppTheme.outline,
    marginTop: 8,
    marginBottom: 4,
    paddingHorizontal: 12,
    letterSpacing: 0.5,
  },
  drawerCompose: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    marginTop: 8,
    borderRadius: AppTheme.radius.lg,
    backgroundColor: AppTheme.admin.surfaceContainerLowest,
  },
  drawerComposeText: { fontSize: 15, fontWeight: '500', color: AppTheme.text },
  drawerLogout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    padding: 14,
    backgroundColor: AppTheme.admin.errorContainer,
    borderRadius: AppTheme.radius.lg,
  },
  drawerLogoutText: {
    fontSize: 15,
    fontWeight: '600',
    color: AppTheme.admin.onErrorContainer,
  },
});

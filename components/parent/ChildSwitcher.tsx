import { AppTheme } from '@/constants/Theme';
import { useAuth } from '@/context/AuthContext';
import { formatWing } from '@/constants/Wings';
import { sx } from '@/utils/styles';
import type { ParentChildSummary } from '@/types';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { childGradeLabel, childInitials } from './childUtils';

interface ChildSwitcherProps {
  compact?: boolean;
}

export function ChildSwitcher({ compact }: ChildSwitcherProps) {
  const { children, activeChild, setActiveStudentId } = useAuth();
  const [open, setOpen] = useState(false);
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  if (!activeChild || children.length === 0) return null;

  const onSelect = (child: ParentChildSummary) => {
    setActiveStudentId(child.id);
    setOpen(false);
  };

  return (
    <>
      <Pressable
        style={sx(styles.trigger, compact ? styles.triggerCompact : null)}
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel="Switch child profile">
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{childInitials(activeChild.name)}</Text>
        </View>
        {!compact || isDesktop ? (
          <View style={styles.labelBlock}>
            <Text style={styles.name} numberOfLines={1}>
              {activeChild.name}
            </Text>
            {children.length > 1 ? (
              <Text style={styles.hint}>{children.length} children</Text>
            ) : null}
          </View>
        ) : null}
        <View style={styles.chevronWrap}>
          <FontAwesome name="chevron-down" size={12} color="#fff" />
        </View>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={sx(styles.menu, isDesktop ? styles.menuDesktop : null)} onPress={(e) => e.stopPropagation?.()}>
            <Text style={styles.menuTitle}>Switch child profile</Text>
            {children.map((child) => {
              const active = child.id === activeChild.id;
              return (
                <Pressable
                  key={child.id}
                  style={sx(styles.row, active ? styles.rowActive : null)}
                  onPress={() => onSelect(child)}>
                  <View style={sx(styles.rowAvatar, active ? styles.rowAvatarActive : null)}>
                    <Text style={sx(styles.rowAvatarText, active ? styles.rowAvatarTextActive : null)}>
                      {childInitials(child.name)}
                    </Text>
                  </View>
                  <View style={styles.rowText}>
                    <Text style={sx(styles.rowName, active ? styles.rowNameActive : null)}>{child.name}</Text>
                    <Text style={styles.rowMeta}>{childGradeLabel(child)}</Text>
                    <Text style={styles.rowMeta}>{formatWing(child.wing)}</Text>
                  </View>
                  {active ? <FontAwesome name="check" size={16} color={AppTheme.accent} /> : null}
                </Pressable>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 24,
    maxWidth: 220,
  },
  triggerCompact: {
    maxWidth: 160,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '700',
    color: AppTheme.accent,
  },
  labelBlock: {
    marginLeft: 8,
    flexShrink: 1,
  },
  name: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  hint: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
  },
  chevronWrap: {
    marginLeft: 6,
    justifyContent: 'center',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 56,
    paddingRight: 12,
  },
  menu: {
    backgroundColor: AppTheme.surface,
    borderRadius: 12,
    padding: 12,
    minWidth: 280,
    maxWidth: 340,
    borderWidth: 1,
    borderColor: AppTheme.border,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  menuDesktop: {
    marginTop: 8,
  },
  menuTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: AppTheme.textMuted,
    textTransform: 'uppercase',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    marginBottom: 4,
  },
  rowActive: {
    backgroundColor: `${AppTheme.accent}14`,
  },
  rowAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: AppTheme.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowAvatarActive: {
    backgroundColor: AppTheme.accent,
  },
  rowAvatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: AppTheme.textMuted,
  },
  rowAvatarTextActive: {
    color: '#fff',
  },
  rowText: {
    flex: 1,
    marginLeft: 10,
  },
  rowName: {
    fontSize: 15,
    fontWeight: '600',
    color: AppTheme.text,
  },
  rowNameActive: {
    color: AppTheme.accent,
  },
  rowMeta: {
    fontSize: 12,
    color: AppTheme.textMuted,
    marginTop: 2,
  },
});

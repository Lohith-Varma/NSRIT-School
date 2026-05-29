import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppTheme } from '@/constants/Theme';
import type { User } from '@/types';

interface StudentIdCardProps {
  student: User;
  className?: string;
}

export function StudentIdCard({ student, className }: StudentIdCardProps) {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'Active':
        return AppTheme.success;
      case 'Inactive':
        return AppTheme.textMuted;
      case 'Graduated':
        return '#3b82f6';
      case 'Transferred':
        return AppTheme.warning;
      case 'Dropped':
        return AppTheme.danger;
      default:
        return AppTheme.success;
    }
  };

  const statusColor = getStatusColor(student.status);

  // Generate initials for profile placeholder
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <View style={styles.cardContainer}>
      {/* Top Header Section */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>NSRIT</Text>
        </View>
        <View style={styles.headerTextContainer}>
          <Text style={styles.schoolName}>NSRIT SCHOOL</Text>
          <Text style={styles.schoolBranch}>Chaitanya Branch • ID CARD</Text>
        </View>
      </View>

      {/* Decorative Ribbon */}
      <View style={styles.ribbon} />

      {/* Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(student.name)}</Text>
        </View>
        <Text style={styles.studentName}>{student.name}</Text>
        <View style={[styles.statusBadge, { borderColor: statusColor }]}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusText, { color: statusColor }]}>
            {student.status || 'Active'}
          </Text>
        </View>
      </View>

      {/* Info Fields Grid */}
      <View style={styles.infoSection}>
        <View style={styles.infoRow}>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>ADMISSION NO</Text>
            <Text style={styles.infoValue}>{student.admissionNumber || 'N/A'}</Text>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>WING</Text>
            <Text style={styles.infoValue}>
              {student.wing
                ? student.wing.replace('_', ' ').toUpperCase()
                : 'N/A'}
            </Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>CLASS / SECTION</Text>
            <Text style={styles.infoValue}>{className || 'Not Assigned'}</Text>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>ACADEMIC YEAR</Text>
            <Text style={styles.infoValue}>2026-2027</Text>
          </View>
        </View>
      </View>

      {/* Barcode & Footer Section */}
      <View style={styles.footerSection}>
        <View style={styles.barcodeContainer}>
          {/* Mock Barcode representation using varying width lines */}
          <View style={styles.barcodeLines}>
            <View style={[styles.barcodeBar, { width: 3 }]} />
            <View style={[styles.barcodeBar, { width: 1, marginLeft: 2 }]} />
            <View style={[styles.barcodeBar, { width: 4, marginLeft: 1 }]} />
            <View style={[styles.barcodeBar, { width: 2, marginLeft: 3 }]} />
            <View style={[styles.barcodeBar, { width: 1, marginLeft: 1 }]} />
            <View style={[styles.barcodeBar, { width: 3, marginLeft: 2 }]} />
            <View style={[styles.barcodeBar, { width: 2, marginLeft: 1 }]} />
            <View style={[styles.barcodeBar, { width: 4, marginLeft: 2 }]} />
            <View style={[styles.barcodeBar, { width: 1, marginLeft: 1 }]} />
            <View style={[styles.barcodeBar, { width: 3, marginLeft: 2 }]} />
            <View style={[styles.barcodeBar, { width: 2, marginLeft: 2 }]} />
            <View style={[styles.barcodeBar, { width: 1, marginLeft: 1 }]} />
            <View style={[styles.barcodeBar, { width: 4, marginLeft: 3 }]} />
            <View style={[styles.barcodeBar, { width: 2, marginLeft: 1 }]} />
          </View>
          <Text style={styles.barcodeNumber}>{student.admissionNumber || 'N/A'}</Text>
        </View>
        <Text style={styles.footerDeclaration}>
          If found, please return to school administrative desk.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
    width: '100%',
    maxWidth: 340,
    alignSelf: 'center',
    marginVertical: 16,
  },
  header: {
    backgroundColor: AppTheme.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  logoContainer: {
    backgroundColor: '#ffffff',
    width: 42,
    height: 42,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  logoText: {
    color: AppTheme.primary,
    fontWeight: '800',
    fontSize: 11,
  },
  headerTextContainer: {
    flex: 1,
  },
  schoolName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  schoolBranch: {
    color: '#93c5fd',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  ribbon: {
    height: 6,
    backgroundColor: AppTheme.accent,
  },
  profileSection: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e2e8f0',
    borderWidth: 3,
    borderColor: AppTheme.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    marginBottom: 12,
  },
  avatarText: {
    color: AppTheme.primary,
    fontSize: 28,
    fontWeight: '700',
  },
  studentName: {
    color: AppTheme.text,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  infoSection: {
    backgroundColor: '#f8fafc',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoCol: {
    flex: 1,
  },
  infoLabel: {
    color: AppTheme.textMuted,
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  infoValue: {
    color: AppTheme.text,
    fontSize: 12,
    fontWeight: '600',
  },
  footerSection: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  barcodeContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  barcodeLines: {
    flexDirection: 'row',
    height: 32,
    alignItems: 'stretch',
    marginBottom: 4,
  },
  barcodeBar: {
    backgroundColor: '#000000',
  },
  barcodeNumber: {
    fontSize: 8,
    color: AppTheme.textMuted,
    fontWeight: '600',
    letterSpacing: 2,
  },
  footerDeclaration: {
    fontSize: 8,
    color: AppTheme.textMuted,
    textAlign: 'center',
    lineHeight: 12,
  },
});

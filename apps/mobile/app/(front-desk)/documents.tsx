import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { Badge } from '@/components/ui/Badge';
import { AppTheme, formatDate } from '@/constants/Theme';
import { useActor } from '@/hooks/useActor';
import { listDocumentRequests, listTCRequests } from '@/services/api';
import type { DocumentRequest, TransferCertificateRequest } from '@/types';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView } from 'react-native';

export default function FrontDeskDocumentsScreen() {
  const actor = useActor();
  const [docRequests, setDocRequests] = useState<DocumentRequest[]>([]);
  const [tcRequests, setTcRequests] = useState<TransferCertificateRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Tab mode
  const [tabMode, setTabMode] = useState<'docs' | 'tc'>('docs');

  const loadData = async () => {
    try {
      const [docs, tcs] = await Promise.all([
        listDocumentRequests(actor),
        listTCRequests(actor),
      ]);
      setDocRequests(docs);
      setTcRequests(tcs);
    } catch (e) {
      console.warn('Failed to load document requests', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [actor]);

  const getDocStatusColor = (status: DocumentRequest['status']) => {
    switch (status) {
      case 'Requested':
        return '#3b82f6';
      case 'Processing':
        return '#eab308';
      case 'Issued':
        return AppTheme.success;
      case 'Rejected':
      default:
        return AppTheme.danger;
    }
  };

  const getTcStatusColor = (status: TransferCertificateRequest['status']) => {
    switch (status) {
      case 'Submitted':
        return '#3b82f6';
      case 'Approved':
        return AppTheme.success;
      case 'Rejected':
      default:
        return AppTheme.danger;
    }
  };

  return (
    <Screen title="Documents Ledger" subtitle="View and track branch certificate requests and TC records — VIEW ONLY" loading={loading} scroll>
      <View style={styles.tabHeader}>
        <Pressable
          style={[styles.tabBtn, tabMode === 'docs' ? styles.tabBtnActive : null]}
          onPress={() => setTabMode('docs')}>
          <Text style={[styles.tabBtnText, tabMode === 'docs' ? styles.tabBtnTextActive : null]}>
            Document Requests ({docRequests.length})
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tabBtn, tabMode === 'tc' ? styles.tabBtnActive : null]}
          onPress={() => setTabMode('tc')}>
          <Text style={[styles.tabBtnText, tabMode === 'tc' ? styles.tabBtnTextActive : null]}>
            Transfer Certificates ({tcRequests.length})
          </Text>
        </Pressable>
      </View>

      {tabMode === 'docs' ? (
        <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
          {docRequests.map((req) => (
            <Card key={req.id} style={styles.itemCard}>
              <View style={styles.rowHeader}>
                <View>
                  <Text style={styles.studentName}>{req.studentName}</Text>
                  <Text style={styles.docType}>Request: <Text style={styles.boldText}>{req.documentType}</Text></Text>
                </View>
                <Badge label={req.status} color={getDocStatusColor(req.status)} />
              </View>
              <Text style={styles.dateMeta}>Requested: {formatDate(req.requestedAt)}</Text>
            </Card>
          ))}
          {docRequests.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>No document requests registered.</Text>
            </Card>
          ) : null}
        </ScrollView>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
          {tcRequests.map((req) => (
            <Card key={req.id} style={styles.itemCard}>
              <View style={styles.rowHeader}>
                <View>
                  <Text style={styles.studentName}>{req.studentName}</Text>
                  <Text style={styles.reasonText}>Reason: {req.reason}</Text>
                </View>
                <Badge label={req.status} color={getTcStatusColor(req.status)} />
              </View>
              <Text style={styles.dateMeta}>Requested: {formatDate(req.requestedAt)}</Text>
            </Card>
          ))}
          {tcRequests.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>No Transfer Certificate requests registered.</Text>
            </Card>
          ) : null}
        </ScrollView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  tabHeader: {
    flexDirection: 'row',
    backgroundColor: AppTheme.border,
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
    gap: 4,
    alignSelf: 'flex-start',
  },
  tabBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    backgroundColor: 'transparent',
  },
  tabBtnActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: AppTheme.textMuted,
  },
  tabBtnTextActive: {
    color: AppTheme.primary,
  },
  scroll: {
    maxHeight: 520,
  },
  itemCard: {
    padding: 16,
    marginBottom: 12,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  studentName: {
    fontSize: 15,
    fontWeight: '700',
    color: AppTheme.text,
  },
  docType: {
    fontSize: 13,
    color: AppTheme.textMuted,
    marginTop: 4,
  },
  reasonText: {
    fontSize: 13,
    color: AppTheme.textMuted,
    marginTop: 4,
    lineHeight: 18,
  },
  boldText: {
    fontWeight: '700',
    color: AppTheme.primary,
  },
  dateMeta: {
    fontSize: 11,
    color: AppTheme.textMuted,
    marginTop: 6,
  },
  emptyCard: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: AppTheme.textMuted,
  },
});

import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { AppTheme, formatCurrency } from '@/constants/Theme';
import { useActor } from '@/hooks/useActor';
import { getAccountantAnalytics } from '@/services/api';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';

export default function AccountantAnalyticsScreen() {
  const actor = useActor();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const stats = await getAccountantAnalytics(actor);
        setData(stats);
      } catch (e) {
        console.warn('Failed to load financial analytics', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [actor]);

  return (
    <Screen title="Financial Intelligence" subtitle="Fee collection analysis & payment trends" loading={loading} scroll>
      {data ? (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.metricsGrid}>
            <Card style={styles.metricCard}>
              <Text style={styles.metricLabel}>Total Target Collections</Text>
              <Text style={styles.metricVal}>{formatCurrency(data.totalTarget)}</Text>
            </Card>
            <Card style={[styles.metricCard, styles.accentLeftBorder]}>
              <Text style={styles.metricLabel}>Total Fees Collected</Text>
              <Text style={[styles.metricVal, styles.greenText]}>{formatCurrency(data.totalCollected)}</Text>
            </Card>
            <Card style={[styles.metricCard, styles.warnLeftBorder]}>
              <Text style={styles.metricLabel}>Total Outstanding Dues</Text>
              <Text style={[styles.metricVal, styles.redText]}>{formatCurrency(data.totalOutstanding)}</Text>
            </Card>
          </View>

          <Text style={styles.sectionTitle}>Collections by Payment Method</Text>
          <View style={styles.distGrid}>
            {data.paymentMethodDistribution.map((item: any) => {
              const pct = data.totalCollected > 0 ? Math.round((item.amount / data.totalCollected) * 100) : 0;
              return (
                <Card key={item.method} style={styles.distCard}>
                  <View style={styles.distHeader}>
                    <Text style={styles.distLabel}>{item.method}</Text>
                    <Text style={styles.distPct}>{pct}%</Text>
                  </View>
                  <Text style={styles.distVal}>{formatCurrency(item.amount)}</Text>
                  <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFg, { width: `${pct}%` }]} />
                  </View>
                </Card>
              );
            })}
          </View>

          <Text style={styles.sectionTitle}>Wing-wise Outstanding Summary</Text>
          <View style={styles.summaryContainer}>
            {['primary', 'secondary', 'higher_secondary'].map((wing) => {
              // Direct mockStore filter for wing outstanding
              const wingClasses = mockStore.classes.filter((c) => c.wing === wing).map((c) => c.id);
              const wingFees = mockStore.fees.filter((f) => wingClasses.includes(f.classId));
              const collected = wingFees.reduce((s, f) => s + f.paidAmount, 0);
              const outstanding = wingFees.reduce((s, f) => s + f.dueAmount, 0);
              const total = collected + outstanding;
              const rate = total > 0 ? Math.round((collected / total) * 100) : 0;
              
              const wingName = wing === 'primary' ? 'Primary Wing' : wing === 'secondary' ? 'Secondary Wing' : 'Higher Secondary Wing';

              return (
                <Card key={wing} style={styles.wingCard}>
                  <Text style={styles.wingTitle}>{wingName}</Text>
                  <View style={styles.wingMetrics}>
                    <View style={styles.wingMetricCol}>
                      <Text style={styles.wingMetricLabel}>Collected</Text>
                      <Text style={styles.wingMetricVal}>{formatCurrency(collected)}</Text>
                    </View>
                    <View style={styles.wingMetricCol}>
                      <Text style={styles.wingMetricLabel}>Outstanding</Text>
                      <Text style={[styles.wingMetricVal, styles.redText]}>{formatCurrency(outstanding)}</Text>
                    </View>
                    <View style={styles.wingMetricCol}>
                      <Text style={styles.wingMetricLabel}>Collection Rate</Text>
                      <Text style={styles.wingMetricValBold}>{rate}%</Text>
                    </View>
                  </View>
                </Card>
              );
            })}
          </View>
        </ScrollView>
      ) : null}
    </Screen>
  );
}

// Access mockStore directly
import { mockStore } from '@/data/mock/store';

const styles = StyleSheet.create({
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    minWidth: 220,
    padding: 16,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: AppTheme.textMuted,
    textTransform: 'uppercase',
  },
  metricVal: {
    fontSize: 20,
    fontWeight: '800',
    color: AppTheme.text,
    marginTop: 8,
  },
  accentLeftBorder: {
    borderLeftWidth: 4,
    borderLeftColor: AppTheme.accent,
  },
  warnLeftBorder: {
    borderLeftWidth: 4,
    borderLeftColor: AppTheme.warning,
  },
  greenText: {
    color: AppTheme.success,
  },
  redText: {
    color: AppTheme.danger,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: AppTheme.text,
    marginTop: 16,
    marginBottom: 12,
  },
  distGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  distCard: {
    flex: 1,
    minWidth: 160,
    padding: 14,
  },
  distHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  distLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: AppTheme.text,
  },
  distPct: {
    fontSize: 12,
    fontWeight: '800',
    color: AppTheme.accent,
  },
  distVal: {
    fontSize: 16,
    fontWeight: '700',
    color: AppTheme.text,
    marginTop: 6,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: AppTheme.border,
    borderRadius: 3,
    marginTop: 10,
    overflow: 'hidden',
  },
  progressBarFg: {
    height: '100%',
    backgroundColor: AppTheme.accent,
  },
  summaryContainer: {
    gap: 12,
    marginBottom: 24,
  },
  wingCard: {
    padding: 16,
  },
  wingTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: AppTheme.primary,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.border,
    paddingBottom: 8,
  },
  wingMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  wingMetricCol: {
    flex: 1,
    alignItems: 'center',
  },
  wingMetricLabel: {
    fontSize: 11,
    color: AppTheme.textMuted,
    textTransform: 'uppercase',
  },
  wingMetricVal: {
    fontSize: 13,
    fontWeight: '600',
    color: AppTheme.text,
    marginTop: 4,
  },
  wingMetricValBold: {
    fontSize: 14,
    fontWeight: '800',
    color: AppTheme.primary,
    marginTop: 3,
  },
});

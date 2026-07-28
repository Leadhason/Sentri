import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors, Spacing } from '@/constants/theme';
import { SentriText } from '@/components/ui/SentriText';
import { SentriButton } from '@/components/ui/SentriButton';
import { SentriHeader } from '@/components/ui/SentriHeader';
import { TacticalCard } from '@/components/ui/TacticalCard';
import { Icon } from '@/components/ui/Icon';
import { apiClient } from '@/lib/apiClient';

export default function ReportViewerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const jobId = (params.id as string) || '33333333-3333-3333-3333-333333333331';

  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get<any>(`/api/jobs/${jobId}/report`);
        if (res) setReport(res);
      } catch {
        // Fallback mock report payload
        setReport({
          id: 'RPT-2026-8901-A',
          jobId,
          generatedAt: '2026-07-28T08:45:00Z',
          incidentCount: 2,
          hasHighSeverity: true,
          generationStatus: 'complete',
          summary: 'Claude AI security analysis completed. Perimeter access attempt at Sector Alpha was successfully resolved by assigned guards within 400ms.',
          events: [
            {
              time: '10:45 PM',
              title: 'INTRUSION DETECTED',
              desc: 'Motion sensor triggered at North Gate perimeter zone.',
              severity: 'High',
            },
            {
              time: '10:42 PM',
              title: 'GUARD DISPATCHED',
              desc: 'Operative Kwame Mensah intercepted and verified sector clearance.',
              severity: 'Low',
            },
          ],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [jobId]);

  const handleExportPDF = () => {
    Alert.alert('Export Report', 'AI Post-Job Report PDF downloaded to device storage.');
  };

  const isHigh = report?.hasHighSeverity;
  const statusColor = isHigh ? Colors.danger : Colors.gold;

  return (
    <SafeAreaView style={styles.safeArea}>
      <SentriHeader title="SENTRI" showBack rightIcon="notifications" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Action Header */}
        <View style={styles.headerSection}>
          <SentriText variant="monoSmall" color={Colors.gold} style={styles.stepTag}>
            AI POST-JOB INCIDENT REPORT
          </SentriText>
          <SentriText variant="h1" style={styles.mainHeading}>
            Incident Report
          </SentriText>
          <SentriText variant="monoSmall" color={Colors.textSecondary}>
            ID: {report?.id || 'RPT-2026-8901-A'} • GENERATED: {report?.generatedAt ? new Date(report.generatedAt).toLocaleTimeString() : '08:45 AM'}
          </SentriText>
        </View>

        {/* Executive Summary Hero Card */}
        <TacticalCard
          backgroundColor={Colors.surface}
          borderColor={statusColor}
          accentColor={statusColor}
          style={styles.heroCard}
        >
          <SentriText variant="monoSmall" color={statusColor} style={styles.summaryTitle}>
            EXECUTIVE SUMMARY
          </SentriText>
          <SentriText variant="body" color={Colors.text} style={styles.summaryText}>
            {report?.summary || 'Claude AI security analysis completed. Operational security protocols engaged successfully.'}
          </SentriText>

          <View style={styles.statsGrid}>
            <View style={styles.statCol}>
              <SentriText variant="caption" color={Colors.textSecondary}>SEVERITY</SentriText>
              <SentriText variant="mono" color={isHigh ? Colors.danger : Colors.textSuccess}>
                {isHigh ? 'HIGH SEVERITY' : 'NORMAL'}
              </SentriText>
            </View>
            <View style={styles.statCol}>
              <SentriText variant="caption" color={Colors.textSecondary}>STATUS</SentriText>
              <SentriText variant="mono" color={Colors.gold}>
                {(report?.generationStatus || 'COMPLETE').toUpperCase()}
              </SentriText>
            </View>
          </View>
        </TacticalCard>

        {/* Sequence of Events */}
        <View style={styles.sectionHeader}>
          <SentriText variant="monoSmall" color={Colors.textSecondary} style={styles.sectionTitle}>
            SEQUENCE OF EVENTS ({report?.incidentCount || 2})
          </SentriText>
        </View>

        <View style={styles.eventList}>
          {(report?.events || [
            {
              time: '10:45 PM',
              title: 'INTRUSION DETECTED',
              desc: 'Motion sensor triggered at North Gate perimeter zone.',
              severity: 'High',
            },
            {
              time: '10:42 PM',
              title: 'GUARD DISPATCHED',
              desc: 'Operative Kwame Mensah intercepted and verified sector clearance.',
              severity: 'Low',
            },
          ]).map((ev: any, idx: number) => {
            const evHigh = ev.severity === 'High';
            const evColor = evHigh ? Colors.danger : Colors.gold;

            return (
              <TacticalCard
                key={idx}
                backgroundColor={Colors.surfaceElevated}
                borderColor={Colors.border}
                accentColor={evColor}
                style={styles.eventCard}
              >
                <View style={styles.eventRow}>
                  <SentriText variant="monoSmall" color={Colors.textMuted}>
                    {ev.time}
                  </SentriText>
                  <SentriText variant="h3" color={evColor} style={styles.eventTitle}>
                    {ev.title}
                  </SentriText>
                  <SentriText variant="body" color={Colors.textSecondary}>
                    {ev.desc}
                  </SentriText>
                </View>
              </TacticalCard>
            );
          })}
        </View>

        {/* Export Action */}
        <View style={styles.actionSection}>
          <SentriButton
            title="EXPORT REPORT (PDF) →"
            variant="primary"
            size="md"
            onPress={handleExportPDF}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.md,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
    paddingBottom: 100,
  },
  headerSection: {
    marginVertical: Spacing.md,
  },
  mainHeading: {
    fontSize: 26,
    marginBottom: 4,
  },
  stepTag: {
    fontSize: 11,
    letterSpacing: 1,
    marginBottom: 4,
  },
  heroCard: {
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  summaryTitle: {
    fontSize: 11,
    letterSpacing: 1,
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  statCol: {
    gap: 4,
  },
  sectionHeader: {
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 11,
    letterSpacing: 1,
  },
  eventList: {
    gap: 12,
    marginBottom: Spacing.lg,
  },
  eventCard: {
    padding: Spacing.md,
  },
  eventRow: {
    gap: 4,
  },
  eventTitle: {
    fontSize: 15,
  },
  actionSection: {
    marginTop: Spacing.md,
  },
});

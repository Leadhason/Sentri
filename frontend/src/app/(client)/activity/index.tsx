import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing } from '@/constants/theme';
import { SentriText } from '@/components/ui/SentriText';
import { SentriHeader } from '@/components/ui/SentriHeader';
import { DispatchTicket } from '@/components/ui/DispatchTicket';
import { Icon } from '@/components/ui/Icon';

const ACTIVE_JOBS = [
  {
    id: '44444444-4444-4444-4444-444444444441',
    title: 'Labadi Beach Event Guarding',
    subtitle: '4 Guards Assigned • Live Geofence Monitoring',
    location: 'Labadi Beach Resort, Accra',
    timeRange: '18:00 - 02:00 (8 Hours)',
    statusTag: 'ON DUTY',
    statusColor: Colors.gold,
    priceTag: 'GHS 1,200',
    route: '/(client)/home/active/44444444-4444-4444-4444-444444444441',
  },
  {
    id: '44444444-4444-4444-4444-444444444442',
    title: 'East Legon Estate Access Guard',
    subtitle: '2 Guards Assigned • Geofence Monitoring Active',
    location: 'East Legon, Accra',
    timeRange: '20:00 - 06:00 (10 Hours)',
    statusTag: 'ACTIVE',
    statusColor: Colors.textSuccess,
    priceTag: 'GHS 850',
    route: '/(client)/home/active/44444444-4444-4444-4444-444444444442',
  },
  {
    id: 'job_act_3',
    title: 'Cantonments Diplomatic Escort',
    subtitle: '4 Guards Assigned • Active Security Detail',
    location: 'Diplomatic Enclave, Cantonments',
    timeRange: '09:00 - 21:00 (12 Hours)',
    statusTag: 'ACTIVE',
    statusColor: Colors.textSuccess,
    priceTag: 'GHS 1,800',
    route: '/(client)/home/active/job_act_3',
  },
];

const PENDING_JOBS = [
  {
    id: '33333333-3333-3333-3333-333333333332',
    title: 'Airport Area VIP Escort',
    subtitle: '1 Guard Required • Awaiting Operative Acceptance',
    location: 'Airport Residential Area, Accra',
    timeRange: '08:00 - 16:00 (8 Hours)',
    statusTag: 'PENDING',
    statusColor: Colors.gold,
    priceTag: 'GHS 600',
    route: '/(client)/home/assessment/confirm',
  },
  {
    id: 'job_pend_2',
    title: 'Osu Concert VIP Venue Security',
    subtitle: '6 Guards Required • Escrow Verification Pending',
    location: 'Oxford Street, Osu, Accra',
    timeRange: '17:00 - 03:00 (10 Hours)',
    statusTag: 'PENDING',
    statusColor: Colors.gold,
    priceTag: 'GHS 2,400',
    route: '/(client)/home/assessment/confirm',
  },
  {
    id: 'job_pend_3',
    title: 'Tema Industrial Complex Night Detail',
    subtitle: '3 Guards Required • Guard Matching in Progress',
    location: 'Free Zones Enclave, Tema',
    timeRange: '19:00 - 07:00 (12 Hours)',
    statusTag: 'PENDING',
    statusColor: Colors.gold,
    priceTag: 'GHS 1,150',
    route: '/(client)/home/assessment/confirm',
  },
];

const COMPLETED_JOBS = [
  {
    id: 'job_comp_1',
    title: 'Spintex Commercial Hub Guarding',
    subtitle: '2 Guards Assigned • Shift Completed & Paid',
    location: 'Spintex Road, Accra',
    timeRange: '08:00 - 20:00 (12 Hours)',
    statusTag: 'COMPLETED',
    statusColor: Colors.textMuted,
    priceTag: 'GHS 950',
    route: '/shared/report/job_comp_1',
  },
  {
    id: 'job_comp_2',
    title: 'Ridge Executive Residence Protection',
    subtitle: '3 Guards Assigned • Full AI Report Generated',
    location: 'Ridge Enclave, Accra',
    timeRange: '18:00 - 06:00 (12 Hours)',
    statusTag: 'COMPLETED',
    statusColor: Colors.textMuted,
    priceTag: 'GHS 1,400',
    route: '/shared/report/job_comp_2',
  },
  {
    id: 'job_comp_3',
    title: 'Roman Ridge Escort Detail',
    subtitle: '2 Guards Assigned • Zero Incidents Flagged',
    location: 'Roman Ridge, Accra',
    timeRange: '10:00 - 18:00 (8 Hours)',
    statusTag: 'COMPLETED',
    statusColor: Colors.textMuted,
    priceTag: 'GHS 750',
    route: '/shared/report/job_comp_3',
  },
];

export default function ClientJobsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'active' | 'pending' | 'completed'>('active');

  const currentJobs =
    activeTab === 'active'
      ? ACTIVE_JOBS
      : activeTab === 'pending'
      ? PENDING_JOBS
      : COMPLETED_JOBS;

  return (
    <SafeAreaView style={styles.safeArea}>
      <SentriHeader title="SENTRI" showBack={false} rightIcon="notifications" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Title */}
        <View style={styles.headerSection}>
          <SentriText variant="h1" style={styles.mainHeading}>
            My Jobs
          </SentriText>
        </View>

        {/* 3 Top Segmented Filter Tabs: ACTIVE, PENDING, COMPLETED */}
        <View style={styles.segmentedContainer}>
          <TouchableOpacity
            style={[styles.segmentBtn, activeTab === 'active' && styles.segmentBtnActive]}
            onPress={() => setActiveTab('active')}
            activeOpacity={0.8}
          >
            <Icon
              name="shield-checkmark"
              size={14}
              color={activeTab === 'active' ? Colors.gold : Colors.textMuted}
            />
            <SentriText
              variant="monoSmall"
              color={activeTab === 'active' ? Colors.gold : Colors.textMuted}
              style={styles.segmentText}
            >
              ACTIVE
            </SentriText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segmentBtn, activeTab === 'pending' && styles.segmentBtnActive]}
            onPress={() => setActiveTab('pending')}
            activeOpacity={0.8}
          >
            <Icon
              name="time"
              size={14}
              color={activeTab === 'pending' ? Colors.gold : Colors.textMuted}
            />
            <SentriText
              variant="monoSmall"
              color={activeTab === 'pending' ? Colors.gold : Colors.textMuted}
              style={styles.segmentText}
            >
              PENDING
            </SentriText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segmentBtn, activeTab === 'completed' && styles.segmentBtnActive]}
            onPress={() => setActiveTab('completed')}
            activeOpacity={0.8}
          >
            <Icon
              name="checkmark-circle"
              size={14}
              color={activeTab === 'completed' ? Colors.gold : Colors.textMuted}
            />
            <SentriText
              variant="monoSmall"
              color={activeTab === 'completed' ? Colors.gold : Colors.textMuted}
              style={styles.segmentText}
            >
              COMPLETED
            </SentriText>
          </TouchableOpacity>
        </View>

        {/* Jobs List */}
        <View style={styles.jobsList}>
          {currentJobs.map((job) => (
            <DispatchTicket
              key={job.id}
              title={job.title}
              subtitle={job.subtitle}
              location={job.location}
              timeRange={job.timeRange}
              statusTag={job.statusTag}
              statusColor={job.statusColor}
              priceTag={job.priceTag}
              onPress={() => router.push(job.route as any)}
            />
          ))}
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
  stepTag: {
    fontSize: 11,
    letterSpacing: 1,
    marginBottom: 4,
  },
  mainHeading: {
    fontSize: 26,
  },
  segmentedContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 4,
    marginBottom: Spacing.lg,
    gap: 4,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
    borderRadius: 6,
  },
  segmentBtnActive: {
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.gold,
  },
  segmentText: {
    fontWeight: '700',
    fontSize: 10,
    letterSpacing: 0.3,
  },
  jobsList: {
    gap: Spacing.sm,
  },
});

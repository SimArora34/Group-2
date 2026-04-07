import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppIcon from '../../components/AppIcon';
import { Colors } from '../../constants/Colors';
import mockData from '../../data/mockData.json';

type Member = { name: string; initials: string; color: string };
type FrequencyUnit = 'day' | 'week' | 'month';

type FrequencyConfig = {
  interval: number;
  label: string;
  unit: FrequencyUnit;
};

type Participant = {
  color: string;
  id: string;
  initials: string;
  isCreator?: boolean;
  isOpen?: boolean;
  isYou?: boolean;
  name: string;
  order: number;
};

type PublicClub = {
  id: string;
  name: string;
  type: string;
  savings_goal: number;
  contribution_amount: number;
  contribution_frequency: string;
  duration_months: number;
  cycle_start_date: string;
  max_members: number;
  current_members: number;
  members: Member[];
};

const MS_IN_DAY = 24 * 60 * 60 * 1000;

const toOrdinal = (value: number): string => {
  if (value % 100 >= 11 && value % 100 <= 13) return `${value}th`;
  if (value % 10 === 1) return `${value}st`;
  if (value % 10 === 2) return `${value}nd`;
  if (value % 10 === 3) return `${value}rd`;
  return `${value}th`;
};

const formatLongDate = (date: Date): string =>
  date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

const formatLongMonthDate = (date: Date): string =>
  date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

const formatMonthDay = (date: Date): string =>
  date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
  });

const startOfDay = (date: Date): Date => {
  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);
  return normalizedDate;
};

const daysDiff = (from: Date, to: Date): number =>
  Math.ceil((startOfDay(to).getTime() - startOfDay(from).getTime()) / MS_IN_DAY);

const parseContributionFrequency = (frequency: string): FrequencyConfig => {
  const normalized = frequency.toLowerCase();
  const parsedInterval = normalized.match(/\d+/)?.[0];
  const interval = parsedInterval ? Number(parsedInterval) : 1;

  if (normalized.includes('month')) {
    return {
      interval,
      label: interval === 1 ? 'Monthly' : `Every ${interval} Months`,
      unit: 'month',
    };
  }

  if (normalized.includes('day')) {
    return {
      interval,
      label: interval === 1 ? 'Daily' : `Every ${interval} Days`,
      unit: 'day',
    };
  }

  return {
    interval,
    label: interval === 1 ? 'Weekly' : `Every ${interval} Weeks`,
    unit: 'week',
  };
};

const addFrequency = (date: Date, frequency: FrequencyConfig): Date => {
  const nextDate = new Date(date);

  if (frequency.unit === 'day') {
    nextDate.setDate(nextDate.getDate() + frequency.interval);
    return nextDate;
  }

  if (frequency.unit === 'week') {
    nextDate.setDate(nextDate.getDate() + frequency.interval * 7);
    return nextDate;
  }

  nextDate.setMonth(nextDate.getMonth() + frequency.interval);
  return nextDate;
};

const getNextContributionDate = (
  cycleStartDate: Date,
  frequency: FrequencyConfig,
  currentDate: Date,
): Date => {
  let nextDate = startOfDay(cycleStartDate);
  const today = startOfDay(currentDate);

  while (nextDate <= today) {
    nextDate = addFrequency(nextDate, frequency);
  }

  return nextDate;
};

const getTimelineDates = (cycleStartDate: Date, count: number): Date[] => {
  const firstMonthDate = new Date(cycleStartDate);
  firstMonthDate.setDate(1);

  return Array.from({ length: count }).map((_, index) => {
    const monthDate = new Date(firstMonthDate);
    monthDate.setMonth(firstMonthDate.getMonth() + index);
    return monthDate;
  });
};

export default function ClubOverviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const club: PublicClub | undefined = useMemo(
    () => ((mockData as any).publicClubs ?? []).find((c: PublicClub) => c.id === id),
    [id],
  );

  if (!club) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.center}>
          <Text style={styles.errorText}>Club not found.</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backLink}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const today = new Date();
  const cycleStartDate = new Date(club.cycle_start_date);
  const cycleDaysLeft = Math.max(0, daysDiff(today, cycleStartDate));
  const parsedFrequency = parseContributionFrequency(club.contribution_frequency);
  const nextContributionDate = getNextContributionDate(cycleStartDate, parsedFrequency, today);
  const nextContributionDays = Math.max(0, daysDiff(today, nextContributionDate));
  const topRowSlots = Math.min(4, club.max_members);
  const youIndex = Math.min(2, topRowSlots - 1);

  const topParticipants: Participant[] = (() => {
    const participants: Participant[] = [];
    const availableMembers = club.members.slice(0, topRowSlots - 1);
    let memberCursor = 0;

    for (let index = 0; index < topRowSlots; index += 1) {
      if (index === youIndex) {
        participants.push({
          color: '#2FA8D8',
          id: 'current-user',
          initials: 'YO',
          isCreator: true,
          isYou: true,
          name: 'You',
          order: index + 1,
        });
        continue;
      }

      const member = availableMembers[memberCursor];
      if (member) {
        participants.push({
          color: member.color,
          id: `member-${member.name}-${index}`,
          initials: member.initials,
          name: member.name,
          order: index + 1,
        });
        memberCursor += 1;
        continue;
      }

      participants.push({
        color: Colors.border,
        id: `open-${index}`,
        initials: '+',
        isOpen: true,
        name: 'Open',
        order: index + 1,
      });
    }

    return participants;
  })();

  const timelineCount = 6;
  const timelineDates = getTimelineDates(cycleStartDate, timelineCount);
  const timelineParticipants: Participant[] = (() => {
    const filled = topParticipants
      .filter(participant => !participant.isOpen)
      .slice(0, timelineCount);

    while (filled.length < timelineCount) {
      filled.push({
        color: '#D9D9D9',
        id: `timeline-open-${filled.length}`,
        initials: '+',
        isOpen: true,
        name: 'Open',
        order: filled.length + 1,
      });
    }

    return filled;
  })();

  const payoutDate = new Date(cycleStartDate);
  payoutDate.setDate(1);
  payoutDate.setMonth(payoutDate.getMonth() + 1);

  const openParticipantProfile = (participant: Participant) => {
    if (participant.isOpen) return;

    router.push({
      pathname: '/(clubs)/member-profile',
      params: {
        clubId: club.id,
        color: participant.color,
        contribution: String(club.contribution_amount),
        frequency: parsedFrequency.label,
        initials: participant.initials,
        name: participant.name,
        payout: formatLongMonthDate(payoutDate),
        position: String(participant.order),
        role: participant.isYou ? 'You' : participant.isCreator ? 'Creator' : 'Member',
      },
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <AppIcon name="arrow-back" size={24} color={Colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Group Details</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerBtn}>
            <AppIcon name="chat-bubble-outline" size={22} color={Colors.textDark} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn}>
            <AppIcon name="notifications-none" size={22} color={Colors.textDark} />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.clubName}>{club.name}</Text>
        <View style={styles.typeBadge}>
          <Text style={styles.typeText}>{club.type === 'public' ? 'Public' : 'Private'}</Text>
        </View>

        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>Group Not Yet Started</Text>
          <Text style={styles.statusLabel}>Cycle Start at:</Text>
          <View style={styles.statusDatePill}>
            <Text style={styles.statusDateText}>
              {formatLongDate(cycleStartDate)} ({cycleDaysLeft} {cycleDaysLeft === 1 ? 'day' : 'days'} left)
            </Text>
          </View>
        </View>

        <View style={styles.participantsRow}>
          {topParticipants.map(participant => (
            <TouchableOpacity
              key={participant.id}
              style={styles.participantCard}
              activeOpacity={participant.isOpen ? 1 : 0.8}
              disabled={participant.isOpen}
              onPress={() => openParticipantProfile(participant)}
            >
              <Text style={styles.creatorLabel}>{participant.isCreator ? 'Creator' : ''}</Text>
              <View
                style={[
                  styles.participantAvatar,
                  { backgroundColor: participant.isOpen ? Colors.surface : participant.color },
                  participant.isYou && styles.participantAvatarYou,
                  participant.isOpen && styles.participantAvatarOpen,
                ]}
              >
                <Text style={[styles.avatarInitials, participant.isOpen && styles.avatarInitialsOpen]}>
                  {participant.initials}
                </Text>
              </View>
              <View style={styles.participantNamePill}>
                <Text style={styles.participantName}>{participant.name}</Text>
              </View>
              <Text style={styles.participantOrder}>{toOrdinal(participant.order)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.sliderTrack}>
          <View style={styles.sliderThumb} />
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() =>
            router.push({
              params: { id: club.id },
              pathname: '/(clubs)/club-members',
            })
          }
        >
          <Text style={styles.viewParticipants}>View Participants</Text>
        </TouchableOpacity>

        <View style={styles.settingsCard}>
          <View style={styles.settingsHeader}>
            <Text style={styles.settingsTitle}>Cycle Settings</Text>
            <TouchableOpacity style={styles.collapseBtn} activeOpacity={0.85}>
              <AppIcon name="keyboard-arrow-up" size={18} color={Colors.white} />
            </TouchableOpacity>
          </View>

          <View style={styles.settingsGrid}>
            <View style={styles.settingCell}>
              <Text style={styles.settingLabel}>Contribution Amount</Text>
              <View style={styles.settingValuePill}>
                <Text style={styles.settingValue}>${club.contribution_amount.toLocaleString()} CAD</Text>
              </View>
            </View>
            <View style={styles.settingCell}>
              <Text style={styles.settingLabel}>Your Payout Date</Text>
              <View style={styles.settingValuePill}>
                <Text style={styles.settingValue}>{formatLongMonthDate(payoutDate)}</Text>
              </View>
            </View>
            <View style={styles.settingCell}>
              <Text style={styles.settingLabel}>Contribution Frequency</Text>
              <View style={styles.settingValuePill}>
                <Text style={styles.settingValue}>{parsedFrequency.label}</Text>
              </View>
            </View>
            <View style={styles.settingCell}>
              <Text style={styles.settingLabel}>Next Contribution Date</Text>
              <View style={styles.settingValuePill}>
                <Text style={styles.settingValue}>
                  {formatMonthDay(nextContributionDate)} ({nextContributionDays} days)
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.timelineSection}>
          <View style={styles.timelineCircle}>
            <View style={styles.timelineCenter}>
              <Text style={styles.timelineCenterLabel}>Payout Amount</Text>
              <Text style={styles.timelineCenterValue}>${club.savings_goal.toLocaleString()} CAD</Text>
              <Text style={[styles.timelineCenterLabel, styles.timelineCenterSpacing]}>Duration</Text>
              <Text style={styles.timelineCenterValue}>{club.duration_months} Months</Text>
            </View>

            {timelineParticipants.map((participant, index) => {
              const angle = (Math.PI * 2 * index) / timelineParticipants.length - Math.PI / 2;
              const radius = 118;
              const nodeSize = 42;
              const center = 140;
              const left = center + radius * Math.cos(angle) - nodeSize / 2;
              const top = center + radius * Math.sin(angle) - nodeSize / 2;

              return (
                <TouchableOpacity
                  key={`${participant.id}-timeline-${index}`}
                  style={[styles.timelineNodeWrap, { left, top, width: nodeSize }]}
                  activeOpacity={participant.isOpen ? 1 : 0.8}
                  disabled={participant.isOpen}
                  onPress={() => openParticipantProfile(participant)}
                >
                  <View
                    style={[
                      styles.timelineNode,
                      { backgroundColor: participant.isOpen ? '#D9D9D9' : participant.color },
                      participant.isYou && styles.timelineNodeYou,
                    ]}
                  >
                    <Text style={styles.timelineNodeText}>{participant.initials}</Text>
                  </View>
                  <Text style={styles.timelineDateText}>{formatMonthDay(timelineDates[index])}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View style={styles.actionsWrap}>
        <TouchableOpacity
          style={styles.leaveBtn}
          activeOpacity={0.85}
          onPress={() =>
            router.push({
              params: { id: club.id },
              pathname: '/(clubs)/member-agreement',
            })
          }
        >
          <Text style={styles.leaveBtnText}>Leave the group</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.fab} activeOpacity={0.9}>
          <AppIcon name="add" size={30} color={Colors.white} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F2' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  errorText: { fontSize: 16, color: Colors.textMid },
  backLink: { fontSize: 14, color: Colors.primary, fontWeight: '600' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#DADADA',
    backgroundColor: Colors.white,
  },
  headerBtn: { width: 34, alignItems: 'center', justifyContent: 'center' },
  headerRight: { flexDirection: 'row' },
  notificationDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F74D52',
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: Colors.textDark, flex: 1, textAlign: 'center' },
  scroll: { paddingHorizontal: 16, paddingBottom: 120, paddingTop: 16 },
  clubName: { fontSize: 22, fontWeight: '500', color: Colors.textDark, textAlign: 'center' },
  typeBadge: {
    alignSelf: 'center',
    marginTop: 6,
    backgroundColor: '#E9F8FA',
    borderWidth: 1,
    borderColor: '#65C3CF',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 3,
  },
  typeText: { color: '#4A9DA8', fontSize: 13, fontWeight: '500' },
  statusCard: {
    marginTop: 18,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D2D2D2',
    padding: 14,
    shadowColor: Colors.shadow,
    shadowOpacity: 0.14,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textDark,
    textAlign: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 14,
    color: Colors.textMid,
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  statusDatePill: {
    backgroundColor: '#DBDBDB',
    borderRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  statusDateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A4A4A',
    textAlign: 'center',
  },
  participantsRow: {
    marginTop: 22,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  participantCard: {
    width: '24%',
    alignItems: 'center',
  },
  creatorLabel: {
    minHeight: 16,
    fontSize: 12,
    color: Colors.textMid,
    fontWeight: '500',
    marginBottom: 4,
  },
  participantAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  participantAvatarYou: {
    borderWidth: 3,
    borderColor: '#2FA8D8',
  },
  participantAvatarOpen: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#BBBBBB',
  },
  avatarInitials: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.white,
  },
  avatarInitialsOpen: {
    color: Colors.textMid,
  },
  participantNamePill: {
    marginTop: 5,
    borderWidth: 1,
    borderColor: '#979797',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 2,
    minWidth: 74,
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
  },
  participantName: {
    fontSize: 11,
    color: Colors.textMid,
    fontWeight: '500',
  },
  participantOrder: {
    marginTop: 3,
    fontSize: 12,
    color: Colors.textDark,
    fontWeight: '500',
  },
  sliderTrack: {
    marginTop: 18,
    height: 8,
    borderRadius: 999,
    backgroundColor: '#D4D4D4',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  sliderThumb: {
    width: 74,
    height: 4,
    borderRadius: 999,
    backgroundColor: '#A2A2A2',
  },
  viewParticipants: {
    marginTop: 8,
    color: Colors.accent,
    fontSize: 16,
    fontWeight: '600',
    textDecorationLine: 'underline',
    textDecorationColor: Colors.accent,
  },
  settingsCard: {
    marginTop: 18,
    backgroundColor: '#F8F8F8',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 12,
  },
  settingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  settingsTitle: {
    fontSize: 17,
    color: Colors.textDark,
    fontWeight: '700',
  },
  collapseBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FF7878',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 8,
  },
  settingCell: {
    width: '49%',
    borderWidth: 1.2,
    borderColor: '#59BDCE',
    borderRadius: 9,
    padding: 8,
    backgroundColor: '#F3F7F7',
  },
  settingLabel: {
    fontSize: 13,
    color: Colors.textMid,
    fontWeight: '500',
  },
  settingValuePill: {
    marginTop: 6,
    backgroundColor: '#DEDEDE',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    paddingHorizontal: 6,
  },
  settingValue: {
    fontSize: 15,
    color: '#333333',
    fontWeight: '600',
  },
  timelineSection: {
    marginTop: 18,
    alignItems: 'center',
  },
  timelineCircle: {
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 1.6,
    borderStyle: 'dashed',
    borderColor: '#C9C9C9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  timelineCenter: {
    alignItems: 'center',
  },
  timelineCenterLabel: {
    fontSize: 12,
    color: Colors.textMid,
    fontWeight: '500',
  },
  timelineCenterSpacing: {
    marginTop: 10,
  },
  timelineCenterValue: {
    fontSize: 26,
    color: Colors.primary,
    fontWeight: '700',
  },
  timelineNodeWrap: {
    position: 'absolute',
    alignItems: 'center',
  },
  timelineNode: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineNodeYou: {
    borderWidth: 2,
    borderColor: '#2FA8D8',
  },
  timelineNodeText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  timelineDateText: {
    marginTop: 3,
    fontSize: 11,
    color: Colors.textDark,
    fontWeight: '500',
  },
  actionsWrap: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 20,
  },
  leaveBtn: {
    backgroundColor: '#C43D2A',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  leaveBtnText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  fab: {
    position: 'absolute',
    right: 6,
    bottom: -6,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#2AA4B8',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.shadow,
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
});

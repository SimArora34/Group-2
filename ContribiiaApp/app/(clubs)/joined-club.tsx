import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo } from 'react';
import {
  Alert,
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
type PublicClub = {
  id: string;
  name: string;
  savings_goal: number;
  contribution_amount: number;
  contribution_frequency: string;
  duration_months: number;
  cycle_start_date: string;
  max_members: number;
  current_members: number;
  members: Member[];
};

function MemberAvatar({
  initials,
  color,
  position,
  name,
}: {
  initials: string;
  color: string;
  position: number;
  name: string;
}) {
  return (
    <View style={styles.avatarSlot}>
      <View style={[styles.avatar, { backgroundColor: color }]}>
        <Text style={styles.avatarText}>{initials}</Text>
        <View style={styles.positionBadge}>
          <Text style={styles.positionText}>{position}</Text>
        </View>
      </View>
      <Text style={styles.avatarName}>{name}</Text>
    </View>
  );
}

function OpenSlot() {
  return (
    <View style={styles.avatarSlot}>
      <View style={[styles.avatar, styles.avatarOpen]}>
        <AppIcon name="person-outline" size={22} color={Colors.textLight} />
      </View>
      <Text style={styles.openText}>Open</Text>
    </View>
  );
}

export default function JoinedClubScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const club: PublicClub | undefined = useMemo(
    () => ((mockData as any).publicClubs ?? []).find((c: PublicClub) => c.id === id),
    [id],
  );

  if (!club) return null;

  const openSlots = club.max_members - club.current_members - 1; // -1 for current user
  const formattedDate = new Date(club.cycle_start_date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <AppIcon name="arrow-back" size={22} color={Colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{club.name}</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => Alert.alert('Coming Soon', 'Notifications will be available in a future update.')}>
            <AppIcon name="notifications-none" size={22} color={Colors.textDark} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn} onPress={() => router.push('/settings' as any)}>
            <AppIcon name="settings" size={22} color={Colors.textDark} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Status banner */}
        <View style={styles.statusBanner}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Waiting for members to join</Text>
        </View>

        {/* Members row */}
        <View style={styles.membersRow}>
          {/* Current user always first */}
          <View style={styles.avatarSlot}>
            <View style={[styles.avatar, { backgroundColor: Colors.primary }]}>
              <AppIcon name="person" size={22} color={Colors.white} />
              <View style={styles.positionBadge}>
                <Text style={styles.positionText}>{club.current_members + 1}</Text>
              </View>
            </View>
            <Text style={styles.avatarName}>You</Text>
          </View>
          {club.members.map((m, i) => (
            <MemberAvatar
              key={i}
              initials={m.initials}
              color={m.color}
              position={i + 1}
              name={m.name}
            />
          ))}
          {Array.from({ length: Math.max(0, openSlots) }).map((_, i) => (
            <OpenSlot key={i} />
          ))}
        </View>

        {/* Action buttons */}
        <TouchableOpacity
          style={styles.btnOutline}
          activeOpacity={0.85}
          onPress={() =>
            router.push({
              pathname: '/(clubs)/cash-advance-report',
              params: { id: club.id },
            })
          }
        >
          <Text style={styles.btnOutlineText}>Request Cash Advance</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnFilled}
          activeOpacity={0.85}
          onPress={() =>
            router.push({
              pathname: '/(clubs)/club-members',
              params: { id: club.id },
            })
          }
        >
          <Text style={styles.btnFilledText}>View Club Members</Text>
        </TouchableOpacity>

        {/* Club Settings */}
        <View style={styles.settingsCard}>
          <View style={styles.settingsHeader}>
            <Text style={styles.settingsTitle}>Club Settings</Text>
            <View style={styles.inactiveDot} />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Contribution</Text>
            <Text style={styles.settingValue}>
              ${club.contribution_amount}, {club.contribution_frequency}
            </Text>
          </View>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Duration</Text>
            <Text style={styles.settingValue}>{club.duration_months} months</Text>
          </View>
          <View style={[styles.settingRow, styles.settingRowLast]}>
            <Text style={styles.settingLabel}>Cycle Start Date</Text>
            <Text style={styles.settingValue}>{formattedDate}</Text>
          </View>
        </View>

        {/* Demo section — contribution event screens */}
        <Text style={styles.demoHeading}>Demo: Contribution Events</Text>
        <View style={styles.demoRow}>
          <TouchableOpacity
            style={styles.demoBtn}
            onPress={() =>
              router.push({
                pathname: '/(clubs)/contribution-success',
                params: { id: club.id },
              })
            }
          >
            <AppIcon name="checkmark-circle" size={20} color={Colors.success} />
            <Text style={styles.demoBtnText}>Contribution{'\n'}Deducted</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.demoBtn}
            onPress={() =>
              router.push({
                pathname: '/(clubs)/recipient',
                params: { id: club.id },
              })
            }
          >
            <AppIcon name="card-outline" size={20} color={Colors.primary} />
            <Text style={styles.demoBtnText}>You're the{'\n'}Recipient</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerBtn: { width: 32, alignItems: 'center' },
  headerRight: { flexDirection: 'row', gap: 2 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700', color: Colors.textDark },
  scroll: { padding: 20, gap: 16, paddingBottom: 40 },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF8E1',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#F59E0B',
  },
  statusText: { fontSize: 13, color: '#92400E', fontWeight: '600' },
  membersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingVertical: 8,
  },
  avatarSlot: { alignItems: 'center', gap: 4, width: 56 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 14, fontWeight: '700', color: Colors.white },
  avatarOpen: {
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  positionBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  positionText: { fontSize: 9, fontWeight: '800', color: Colors.primary },
  avatarName: { fontSize: 10, color: Colors.textDark, fontWeight: '600', textAlign: 'center' },
  openText: { fontSize: 10, color: Colors.textLight, textAlign: 'center' },
  btnOutline: {
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnOutlineText: { fontSize: 15, fontWeight: '700', color: Colors.primary },
  btnFilled: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnFilledText: { fontSize: 15, fontWeight: '700', color: Colors.white },
  settingsCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  settingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  settingsTitle: { fontSize: 15, fontWeight: '700', color: Colors.textDark },
  inactiveDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.error,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  settingRowLast: { borderBottomWidth: 0 },
  settingLabel: { fontSize: 14, color: Colors.textMid, flex: 1 },
  settingValue: { fontSize: 14, fontWeight: '600', color: Colors.textDark, flexShrink: 1, textAlign: 'right' },
  demoHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 4,
  },
  demoRow: { flexDirection: 'row', gap: 12 },
  demoBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  demoBtnText: { fontSize: 13, fontWeight: '600', color: Colors.textDark, lineHeight: 18 },
});

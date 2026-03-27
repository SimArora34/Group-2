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

  const openSlots = club.max_members - club.current_members;

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
        <Text style={styles.headerTitle}>Club Overview</Text>
        <TouchableOpacity style={styles.headerBtn}>
          <AppIcon name="notifications-none" size={22} color={Colors.textDark} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Club name + type badge */}
        <View style={styles.titleRow}>
          <Text style={styles.clubName}>{club.name}</Text>
          <View style={[styles.typeBadge, club.type === 'public' ? styles.typeBadgePublic : styles.typeBadgePrivate]}>
            <Text style={[styles.typeText, club.type === 'public' ? styles.typeTextPublic : styles.typeTextPrivate]}>
              {club.type === 'public' ? 'Public' : 'Private'}
            </Text>
          </View>
        </View>

        {/* Members + open slots */}
        <View style={styles.membersSection}>
          {club.members.map((m, i) => (
            <View key={i} style={styles.memberSlot}>
              <View style={[styles.avatar, { backgroundColor: m.color }]}>
                <Text style={styles.avatarText}>{m.initials}</Text>
              </View>
              <Text style={styles.memberName}>{m.name}</Text>
            </View>
          ))}
          {Array.from({ length: Math.min(openSlots, 4) }).map((_, i) => (
            <View key={`open-${i}`} style={styles.memberSlot}>
              <View style={[styles.avatar, styles.avatarOpen]}>
                <AppIcon name="person-add" size={18} color={Colors.textLight} />
              </View>
              <Text style={styles.openText}>Open</Text>
            </View>
          ))}
        </View>

        {/* Club Details card */}
        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>Club Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Savings Goal</Text>
            <Text style={styles.detailValue}>${club.savings_goal.toLocaleString()}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Contribution</Text>
            <Text style={styles.detailValue}>
              ${club.contribution_amount}, {club.contribution_frequency}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Duration</Text>
            <Text style={styles.detailValue}>{club.duration_months} months</Text>
          </View>
          <View style={[styles.detailRow, styles.detailRowLast]}>
            <Text style={styles.detailLabel}>Cycle Start Date</Text>
            <Text style={styles.detailValue}>{formattedDate}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.joinBtn}
          activeOpacity={0.85}
          onPress={() =>
            router.push({
              pathname: '/(clubs)/member-agreement',
              params: { id: club.id },
            })
          }
        >
          <Text style={styles.joinBtnText}>Join Club</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  errorText: { fontSize: 16, color: Colors.textMid },
  backLink: { fontSize: 14, color: Colors.primary, fontWeight: '600' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerBtn: { width: 36, alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.textDark },
  scroll: { padding: 20, gap: 20 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  clubName: { fontSize: 22, fontWeight: '800', color: Colors.textDark, flex: 1 },
  typeBadge: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  typeBadgePublic: { backgroundColor: Colors.primaryLight },
  typeBadgePrivate: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  typeText: { fontSize: 13, fontWeight: '700' },
  typeTextPublic: { color: Colors.primary },
  typeTextPrivate: { color: Colors.textMid },
  membersSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    paddingVertical: 8,
  },
  memberSlot: { alignItems: 'center', gap: 6 },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 16, fontWeight: '700', color: Colors.white },
  avatarOpen: {
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  memberName: { fontSize: 12, color: Colors.textDark, fontWeight: '600' },
  openText: { fontSize: 12, color: Colors.textLight },
  detailsCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  detailRowLast: { borderBottomWidth: 0 },
  detailLabel: { fontSize: 14, color: Colors.textMid },
  detailValue: { fontSize: 14, fontWeight: '600', color: Colors.textDark, textAlign: 'right', flex: 1, marginLeft: 12 },
  actions: { padding: 20, paddingTop: 12 },
  joinBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  joinBtnText: { fontSize: 16, fontWeight: '700', color: Colors.white },
});

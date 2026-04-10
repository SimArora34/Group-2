import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
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
import { supabase } from '../../src/lib/supabaseClient';
import { makeContribution } from '../../src/services/clubEventService';

type Circle = {
  id: string;
  name: string;
  savings_goal: number | null;
  contribution_amount: number;
  contribution_frequency: string | null;
  duration_months: number | null;
  cycle_start_date: string | null;
  total_positions: number | null;
  total_members: number;
  visibility: string;
};

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

const AVATAR_COLORS = [
  '#5B82C0','#E07B54','#6AAB8E','#C06B8D',
  '#8E6AC0','#C0A05B','#5BA8C0','#C05B5B',
];

export default function JoinedClubScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [circle, setCircle] = useState<Circle | null>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [contributing, setContributing] = useState(false);

  const loadData = useCallback(async () => {
    if (!id) return;
    setLoading(true);

    const [{ data: { user } }, circleRes, membersRes] = await Promise.all([
      supabase.auth.getUser(),
      supabase.from('circles').select('*').eq('id', id).single(),
      supabase
        .from('circle_members')
        .select('user_id, order_position, profiles(full_name)')
        .eq('circle_id', id),
    ]);

    setCurrentUserId(user?.id ?? null);
    if (circleRes.data) setCircle(circleRes.data as Circle);
    if (membersRes.data) setMembers(membersRes.data);
    setLoading(false);
  }, [id]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleContribute = async () => {
    if (!circle || !id) return;
    Alert.alert(
      'Make Contribution',
      `Contribute $${Number(circle.contribution_amount).toLocaleString()} CAD to ${circle.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setContributing(true);
            const res = await makeContribution(id, circle.contribution_amount);
            setContributing(false);
            if (!res.success) {
              Alert.alert('Error', res.error || 'Failed to record contribution.');
              return;
            }
            router.push({
              pathname: '/(clubs)/contribution-success',
              params: {
                id,
                clubName: circle.name,
                amount: String(circle.contribution_amount),
                frequency: circle.contribution_frequency ?? '',
              },
            });
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <ActivityIndicator style={{ flex: 1 }} color={Colors.primary} />
      </SafeAreaView>
    );
  }

  if (!circle) return null;

  const openSlots = Math.max(0, (circle.total_positions ?? 0) - members.length);
  const formattedDate = circle.cycle_start_date
    ? new Date(circle.cycle_start_date).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
      })
    : '—';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <AppIcon name="arrow-back" size={22} color={Colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{circle.name}</Text>
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
          <Text style={styles.statusText}>
            {members.length < (circle.total_positions ?? 0)
              ? 'Waiting for members to join'
              : 'Club is active'}
          </Text>
        </View>

        {/* Members row */}
        <View style={styles.membersRow}>
          {members.map((m, i) => {
            const isYou = m.user_id === currentUserId;
            const name: string = isYou ? 'You' : (m.profiles?.full_name ?? 'Member');
            const initials = name
              .split(' ')
              .map((w: string) => w[0])
              .join('')
              .toUpperCase()
              .slice(0, 2);
            const color = isYou ? Colors.primary : AVATAR_COLORS[i % AVATAR_COLORS.length];
            return (
              <View key={m.user_id} style={styles.avatarSlot}>
                <View style={[styles.avatar, { backgroundColor: color }]}>
                  <Text style={styles.avatarText}>{initials}</Text>
                  <View style={styles.positionBadge}>
                    <Text style={styles.positionText}>{m.order_position ?? i + 1}</Text>
                  </View>
                </View>
                <Text style={styles.avatarName}>{name}</Text>
              </View>
            );
          })}
          {Array.from({ length: openSlots }).map((_, i) => (
            <OpenSlot key={i} />
          ))}
        </View>

        {/* Make Contribution */}
        <TouchableOpacity
          style={styles.btnFilled}
          activeOpacity={0.85}
          onPress={handleContribute}
          disabled={contributing}
        >
          {contributing
            ? <ActivityIndicator color={Colors.white} />
            : <Text style={styles.btnFilledText}>Make Contribution</Text>
          }
        </TouchableOpacity>

        {/* Action buttons */}
        <TouchableOpacity
          style={styles.btnOutline}
          activeOpacity={0.85}
          onPress={() =>
            router.push({ pathname: '/(clubs)/cash-advance-report', params: { id } })
          }
        >
          <Text style={styles.btnOutlineText}>Request Cash Advance</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnOutline}
          activeOpacity={0.85}
          onPress={() =>
            router.push({ pathname: '/(clubs)/club-members', params: { id } })
          }
        >
          <Text style={styles.btnOutlineText}>View Club Members</Text>
        </TouchableOpacity>

        {/* Club Settings */}
        <View style={styles.settingsCard}>
          <View style={styles.settingsHeader}>
            <Text style={styles.settingsTitle}>Club Settings</Text>
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Contribution</Text>
            <Text style={styles.settingValue}>
              ${Number(circle.contribution_amount).toLocaleString()}
              {circle.contribution_frequency ? `, ${circle.contribution_frequency}` : ''}
            </Text>
          </View>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Duration</Text>
            <Text style={styles.settingValue}>
              {circle.duration_months ? `${circle.duration_months} months` : '—'}
            </Text>
          </View>
          <View style={[styles.settingRow, styles.settingRowLast]}>
            <Text style={styles.settingLabel}>Cycle Start Date</Text>
            <Text style={styles.settingValue}>{formattedDate}</Text>
          </View>
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
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  settingRowLast: { borderBottomWidth: 0 },
  settingLabel: { fontSize: 14, color: Colors.textMid, flexShrink: 0 },
  settingValue: { fontSize: 14, fontWeight: '600', color: Colors.textDark, flex: 1, textAlign: 'right' },
});

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

type PublicClub = {
  id: string;
  name: string;
  contribution_amount: number;
  contribution_frequency: string;
};

const formatCurrency = (value: number): string => `$${value.toLocaleString()} CAD`;

export default function MemberProfileScreen() {
  const params = useLocalSearchParams<{
    clubId?: string;
    color?: string;
    contribution?: string;
    frequency?: string;
    initials?: string;
    name?: string;
    payout?: string;
    position?: string;
    role?: string;
  }>();

  const club = useMemo(
    () =>
      ((mockData as any).publicClubs ?? []).find(
        (c: PublicClub) => c.id === params.clubId,
      ) as PublicClub | undefined,
    [params.clubId],
  );

  const name = params.name || 'Member';
  const initials =
    params.initials ||
    name
      .split(' ')
      .map(part => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  const role = params.role || 'Member';
  const color = params.color || Colors.primary;
  const position = params.position || '-';
  const contribution = params.contribution
    ? Number(params.contribution)
    : club?.contribution_amount ?? 0;
  const frequency = params.frequency || club?.contribution_frequency || 'N/A';
  const payout = params.payout || 'N/A';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <AppIcon name="arrow-back" size={22} color={Colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Member Profile</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => Alert.alert('Coming Soon', 'Chat messaging will be available in a future update.')}>
            <AppIcon name="chat-bubble-outline" size={21} color={Colors.textDark} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn} onPress={() => Alert.alert('Coming Soon', 'Notifications will be available in a future update.')}>
            <AppIcon name="notifications-none" size={21} color={Colors.textDark} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.profileTop}>
          <View style={[styles.avatar, { backgroundColor: color }]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.name}>{name}</Text>
          <View style={styles.rolePill}>
            <Text style={styles.roleText}>{role}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Group</Text>
            <Text style={styles.value}>{club?.name || 'Group'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Position</Text>
            <Text style={styles.value}>{position}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Contribution</Text>
            <Text style={styles.value}>{formatCurrency(contribution)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Frequency</Text>
            <Text style={styles.value}>{frequency}</Text>
          </View>
          <View style={[styles.row, styles.rowLast]}>
            <Text style={styles.label}>Payout Date</Text>
            <Text style={styles.value}>{payout}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.primaryBtn}
          activeOpacity={0.85}
          onPress={() =>
            router.push({
              pathname: '/(clubs)/club-members',
              params: { id: params.clubId },
            })
          }
        >
          <Text style={styles.primaryBtnText}>View Group Members</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F4F4',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: Colors.white,
  },
  headerBtn: {
    width: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRight: {
    flexDirection: 'row',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textDark,
  },
  scroll: {
    padding: 18,
    paddingBottom: 30,
  },
  profileTop: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: Colors.white,
    fontWeight: '800',
    fontSize: 28,
  },
  name: {
    marginTop: 10,
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textDark,
    textAlign: 'center',
  },
  rolePill: {
    marginTop: 6,
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: '#8AC5C2',
    borderRadius: 999,
    paddingVertical: 3,
    paddingHorizontal: 12,
  },
  roleText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '700',
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  row: {
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  label: {
    fontSize: 14,
    color: Colors.textMid,
    flexShrink: 0,
  },
  value: {
    flex: 1,
    textAlign: 'right',
    fontSize: 14,
    color: Colors.textDark,
    fontWeight: '600',
  },
  primaryBtn: {
    marginTop: 16,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});

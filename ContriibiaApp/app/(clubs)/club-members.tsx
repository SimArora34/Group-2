import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo } from 'react';
import {
  FlatList,
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
  max_members: number;
  members: Member[];
};

export default function ClubMembersScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const club: PublicClub | undefined = useMemo(
    () => ((mockData as any).publicClubs ?? []).find((c: PublicClub) => c.id === id),
    [id],
  );

  if (!club) return null;

  const openSlots = club.max_members - club.members.length - 1; // -1 for you

  const allSlots = [
    { type: 'you' as const, name: 'You', initials: 'YO', color: Colors.primary, position: club.members.length + 1 },
    ...club.members.map((m, i) => ({ type: 'member' as const, ...m, position: i + 1 })),
    ...Array.from({ length: Math.max(0, openSlots) }, (_, i) => ({
      type: 'open' as const,
      name: 'Open',
      initials: '',
      color: '',
      position: club.members.length + 2 + i,
    })),
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <AppIcon name="arrow-back" size={22} color={Colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Group Members</Text>
        <View style={styles.headerBtn} />
      </View>

      <FlatList
        data={allSlots}
        keyExtractor={(_, i) => String(i)}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.positionCircle}>
              <Text style={styles.positionText}>{item.position}</Text>
            </View>
            {item.type === 'open' ? (
              <View style={[styles.avatar, styles.avatarOpen]}>
                <AppIcon name="person-outline" size={22} color={Colors.textLight} />
              </View>
            ) : (
              <View style={[styles.avatar, { backgroundColor: item.color }]}>
                {item.type === 'you' ? (
                  <AppIcon name="person" size={22} color={Colors.white} />
                ) : (
                  <Text style={styles.avatarText}>{item.initials}</Text>
                )}
              </View>
            )}
            <View style={styles.nameBlock}>
              <Text style={styles.memberName}>
                {item.name}
                {item.type === 'you' && (
                  <Text style={styles.youLabel}> (You)</Text>
                )}
              </Text>
              <Text style={styles.memberStatus}>
                {item.type === 'open' ? 'Slot available' : 'Member'}
              </Text>
            </View>
            {item.type !== 'open' && (
              <View style={styles.activeBadge}>
                <Text style={styles.activeBadgeText}>Active</Text>
              </View>
            )}
          </View>
        )}
      />
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
  headerBtn: { width: 36, alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.textDark },
  list: { padding: 20 },
  separator: { height: 1, backgroundColor: Colors.borderLight },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
  },
  positionCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  positionText: { fontSize: 11, fontWeight: '700', color: Colors.primary },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarOpen: {
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  avatarText: { fontSize: 15, fontWeight: '700', color: Colors.white },
  nameBlock: { flex: 1 },
  memberName: { fontSize: 15, fontWeight: '600', color: Colors.textDark },
  youLabel: { fontWeight: '400', color: Colors.primary },
  memberStatus: { fontSize: 12, color: Colors.textLight, marginTop: 2 },
  activeBadge: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  activeBadgeText: { fontSize: 12, fontWeight: '600', color: Colors.success },
});

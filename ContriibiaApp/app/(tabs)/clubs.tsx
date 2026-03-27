import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppIcon from '../../components/AppIcon';
import { Colors } from '../../constants/Colors';
import mockData from '../../data/mockData.json';

type SortOption = 'Most Recent' | 'Savings Goal' | 'Contribution' | 'Duration';
const SORT_OPTIONS: SortOption[] = ['Most Recent', 'Savings Goal', 'Contribution', 'Duration'];

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
  created_at: string;
  members: { name: string; initials: string; color: string }[];
};

function MemberDot({ initials, color }: { initials: string; color: string }) {
  return (
    <View style={[styles.memberDot, { backgroundColor: color }]}>
      <Text style={styles.memberDotText}>{initials[0]}</Text>
    </View>
  );
}

function PublicClubCard({ club, onPress }: { club: PublicClub; onPress: () => void }) {
  const formattedDate = new Date(club.cycle_start_date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <TouchableOpacity activeOpacity={0.85} style={styles.card} onPress={onPress}>
      <View style={styles.cardHeader}>
        <Text style={styles.clubName}>{club.name}</Text>
        <View style={styles.pendingBadge}>
          <Text style={styles.pendingText}>Join Club</Text>
        </View>
      </View>

      <View style={styles.statGrid}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Savings Goal</Text>
          <Text style={styles.statValue}>${club.savings_goal.toLocaleString()}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Contribution</Text>
          <Text style={styles.statValue}>${club.contribution_amount}, {club.contribution_frequency}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Duration</Text>
          <Text style={styles.statValue}>{club.duration_months} months</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Cycle Start Date</Text>
          <Text style={styles.statValue}>{formattedDate}</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.memberAvatarRow}>
          {club.members.slice(0, 5).map((m, i) => (
            <MemberDot key={i} initials={m.initials} color={m.color} />
          ))}
        </View>
        <Text style={styles.memberCount}>
          {club.current_members} of {club.max_members} members
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function ClubsScreen() {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortOption>('Most Recent');
  const [sortOpen, setSortOpen] = useState(false);

  const allClubs: PublicClub[] = (mockData as any).publicClubs ?? [];

  const filtered = useMemo(() => {
    let clubs = [...allClubs];
    if (search.trim()) {
      clubs = clubs.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()),
      );
    }
    if (sort === 'Savings Goal') clubs.sort((a, b) => b.savings_goal - a.savings_goal);
    else if (sort === 'Contribution') clubs.sort((a, b) => b.contribution_amount - a.contribution_amount);
    else if (sort === 'Duration') clubs.sort((a, b) => b.duration_months - a.duration_months);
    else clubs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return clubs;
  }, [allClubs, search, sort]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <AppIcon name="arrow-back" size={22} color={Colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Join a Public Club</Text>
        <TouchableOpacity style={styles.headerBtn}>
          <AppIcon name="notifications-none" size={22} color={Colors.textDark} />
        </TouchableOpacity>
      </View>

      {/* Search + Filter */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <AppIcon name="search" size={18} color={Colors.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Find community by name..."
            placeholderTextColor={Colors.textPlaceholder}
            value={search}
            onChangeText={setSearch}
          />
          {!!search && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <AppIcon name="close" size={16} color={Colors.textLight} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.filterBtn}>
          <AppIcon name="tune" size={18} color={Colors.textDark} />
          <Text style={styles.filterText}>Filter</Text>
        </TouchableOpacity>
      </View>

      {/* Count + Sort */}
      <View style={styles.metaRow}>
        <Text style={styles.countText}>{filtered.length} clubs</Text>
        <TouchableOpacity style={styles.sortBtn} onPress={() => setSortOpen(v => !v)}>
          <Text style={styles.sortText}>Sort By: {sort} ▾</Text>
        </TouchableOpacity>
      </View>

      {/* Sort dropdown */}
      {sortOpen && (
        <View style={styles.sortDropdown}>
          {SORT_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt}
              style={styles.sortOption}
              onPress={() => { setSort(opt); setSortOpen(false); }}
            >
              <Text style={[styles.sortOptionText, sort === opt && styles.sortOptionActive]}>
                {opt}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => (
          <PublicClubCard
            club={item}
            onPress={() =>
              router.push({
                pathname: '/(clubs)/club-overview',
                params: { id: item.id },
              })
            }
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <AppIcon name="groups" size={48} color={Colors.textLight} />
            <Text style={styles.emptyText}>No clubs found</Text>
          </View>
        }
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
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.textDark,
    padding: 0,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    backgroundColor: Colors.surface,
  },
  filterText: { fontSize: 13, color: Colors.textDark, fontWeight: '500' },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  countText: { fontSize: 13, color: Colors.textMid, fontWeight: '600' },
  sortBtn: { padding: 4 },
  sortText: { fontSize: 13, color: Colors.primary, fontWeight: '600' },
  sortDropdown: {
    position: 'absolute',
    top: 152,
    right: 16,
    zIndex: 10,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  sortOption: { paddingHorizontal: 20, paddingVertical: 12 },
  sortOptionText: { fontSize: 14, color: Colors.textMid },
  sortOptionActive: { color: Colors.primary, fontWeight: '700' },
  list: { padding: 16, paddingTop: 4 },
  separator: { height: 12 },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clubName: { fontSize: 16, fontWeight: '700', color: Colors.textDark, flex: 1 },
  pendingBadge: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  pendingText: { fontSize: 12, fontWeight: '600', color: Colors.primary },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  stat: { width: '47%' },
  statLabel: { fontSize: 11, color: Colors.textLight, marginBottom: 2 },
  statValue: { fontSize: 13, fontWeight: '600', color: Colors.textDark },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  memberAvatarRow: { flexDirection: 'row', gap: -4 },
  memberDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.white,
    marginLeft: -4,
  },
  memberDotText: { fontSize: 9, fontWeight: '700', color: Colors.white },
  memberCount: { fontSize: 12, color: Colors.textLight },
  empty: { alignItems: 'center', justifyContent: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15, color: Colors.textMid },
});

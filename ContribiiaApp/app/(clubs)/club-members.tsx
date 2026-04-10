import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import { supabase } from '../../src/lib/supabaseClient';

const AVATAR_COLORS = [
  '#5B82C0','#E07B54','#6AAB8E','#C06B8D',
  '#8E6AC0','#C0A05B','#5BA8C0','#C05B5B',
];

type SlotItem =
  | { type: 'you'; id: string; name: string; initials: string; color: string; username: string; isCreator: boolean }
  | { type: 'member'; id: string; name: string; initials: string; color: string; username: string; isCreator: boolean }
  | { type: 'open'; id: string };

export default function ClubMembersScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [circleName, setCircleName] = useState('');
  const [isOwner, setIsOwner] = useState(false);
  const [slots, setSlots] = useState<SlotItem[]>([]);
  const [removeTarget, setRemoveTarget] = useState<SlotItem | null>(null);
  const [removing, setRemoving] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Fetch circle info
      const { data: circleData, error: circleErr } = await supabase
        .from('circles')
        .select('id, name, owner_id, total_positions')
        .eq('id', id)
        .single();
      if (circleErr || !circleData) return;

      setCircleName(circleData.name);
      setIsOwner(circleData.owner_id === user?.id);

      // Fetch members separately to avoid nested-join 400 errors
      const { data: cmRows } = await supabase
        .from('circle_members')
        .select('*')
        .eq('circle_id', id);

      let memberRows = cmRows ?? [];

      // Ensure the circle owner has a circle_members row — re-insert if missing
      if (circleData.owner_id && !memberRows.some((m: any) => m.user_id === circleData.owner_id)) {
        await supabase.from('circle_members').insert({
          circle_id: id,
          user_id: circleData.owner_id,
        });
        const { data: refreshed } = await supabase
          .from('circle_members')
          .select('*')
          .eq('circle_id', id);
        if (refreshed) memberRows = refreshed;
      }

      const userIds = memberRows.map((m: any) => m.user_id).filter(Boolean);

      // Fetch profiles
      let profileMap = new Map<string, any>();
      if (userIds.length > 0) {
        const { data: profileRows } = await supabase
          .from('profiles')
          .select('id, full_name, username')
          .in('id', userIds);
        profileMap = new Map(
          (profileRows ?? []).map((p: any) => [p.id, p])
        );
      }

      const members = memberRows.sort(
        (a: any, b: any) => (a.order_position ?? 0) - (b.order_position ?? 0)
      );
      const filled: SlotItem[] = members.map((m: any, i: number) => {
        const prof = profileMap.get(m.user_id);
        const fullName: string = prof?.full_name ?? `Member ${i + 1}`;
        const initials = fullName.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);
        const isYou = m.user_id === user?.id;
        return {
          type: isYou ? 'you' : 'member',
          id: m.id,
          name: isYou ? `${fullName} (You)` : fullName,
          initials,
          color: isYou ? Colors.primary : AVATAR_COLORS[i % AVATAR_COLORS.length],
          username: prof?.username ?? '',
          isCreator: m.user_id === circleData.owner_id,
        } as SlotItem;
      });
      const total = circleData.total_positions ?? filled.length;
      const openSlots: SlotItem[] = Array.from(
        { length: Math.max(0, total - filled.length) },
        (_, i) => ({ type: 'open', id: `open-${i}` })
      );
      setSlots([...filled, ...openSlots]);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const handleRemove = async () => {
    if (!removeTarget || removeTarget.type === 'open' || removeTarget.type === 'you') return;
    setRemoving(true);
    const { error } = await supabase
      .from('circle_members')
      .delete()
      .eq('id', removeTarget.id);
    setRemoving(false);
    setRemoveTarget(null);
    if (error) { Alert.alert('Error', error.message); return; }
    load();
  };

  const filtered = search.trim()
    ? slots.filter(s => s.type !== 'open' && s.name.toLowerCase().includes(search.toLowerCase()))
    : slots;

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top','bottom']}>
        <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top','bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <AppIcon name="arrow-back" size={22} color={Colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Group Members</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => Alert.alert('Coming Soon', 'Chat messaging will be available in a future update.')}>
            <AppIcon name="chat-bubble-outline" size={22} color={Colors.textDark} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn} onPress={() => Alert.alert('Coming Soon', 'Notifications will be available in a future update.')}>
            <AppIcon name="notifications-none" size={22} color={Colors.textDark} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchWrap}>
        <AppIcon name="search" size={18} color={Colors.textLight} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search member's name or user id"
          placeholderTextColor={Colors.textLight}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {isOwner && (
        <TouchableOpacity style={styles.addMember} activeOpacity={0.8} onPress={() => Alert.alert('Coming Soon', 'Member invitations are coming in a future update.')}>
          <Text style={styles.addMemberText}>Add new member</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => {
          if (item.type === 'open') {
            return (
              <View style={styles.row}>
                <View style={[styles.avatar, styles.avatarOpen]}>
                  <AppIcon name="person-outline" size={22} color={Colors.textLight} />
                </View>
                <View style={styles.nameBlock}>
                  <Text style={styles.memberName}>Open</Text>
                  <Text style={styles.memberUsername}>Slot available</Text>
                </View>
              </View>
            );
          }
          return (
            <View style={styles.row}>
              <View style={[styles.avatar, { backgroundColor: item.color }]}>
                <Text style={styles.avatarText}>{item.initials}</Text>
              </View>
              <View style={styles.nameBlock}>
                <Text style={styles.memberName}>{item.name}</Text>
                {item.username ? <Text style={styles.memberUsername}>{item.username}</Text> : null}
              </View>
              {item.isCreator ? (
                <Text style={styles.creatorBadge}>Creator</Text>
              ) : item.type === 'member' && isOwner ? (
                <TouchableOpacity
                  style={styles.removeBtn}
                  activeOpacity={0.85}
                  onPress={() => setRemoveTarget(item)}
                >
                  <Text style={styles.removeBtnText}>Remove</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          );
        }}
      />

      {/* Remove confirmation modal */}
      {removeTarget && removeTarget.type === 'member' && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <TouchableOpacity style={styles.modalClose} onPress={() => setRemoveTarget(null)}>
              <AppIcon name="close" size={20} color={Colors.textDark} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Remove member</Text>
            <Text style={styles.modalBody}>
              Are you sure you want to remove {removeTarget.name} from {circleName}?
            </Text>
            <TouchableOpacity
              style={[styles.confirmBtn, removing && { opacity: 0.6 }]}
              activeOpacity={0.85}
              onPress={handleRemove}
              disabled={removing}
            >
              {removing
                ? <ActivityIndicator color={Colors.white} />
                : <Text style={styles.confirmBtnText}>Confirm</Text>}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerBtn: { width: 36, alignItems: 'center', justifyContent: 'center' },
  headerRight: { flexDirection: 'row' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.textDark, flex: 1, textAlign: 'center' },
  searchWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, margin: 16, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#F4F4F6', borderRadius: 10 },
  searchInput: { flex: 1, fontSize: 14, color: Colors.textDark },
  addMember: { paddingHorizontal: 16, paddingBottom: 8 },
  addMemberText: { color: Colors.primary, fontWeight: '700', fontSize: 14, textDecorationLine: 'underline' },
  list: { paddingHorizontal: 16, paddingBottom: 40 },
  separator: { height: 1, backgroundColor: '#F0F0F4' },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 12 },
  avatar: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  avatarOpen: { backgroundColor: '#F4F4F6', borderWidth: 1.5, borderColor: Colors.border, borderStyle: 'dashed' },
  avatarText: { fontSize: 15, fontWeight: '700', color: Colors.white },
  nameBlock: { flex: 1 },
  memberName: { fontSize: 15, fontWeight: '600', color: Colors.textDark },
  memberUsername: { fontSize: 13, color: Colors.textMid, marginTop: 2 },
  creatorBadge: { fontSize: 13, fontWeight: '600', color: Colors.primary },
  removeBtn: { backgroundColor: '#C43D2A', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 7 },
  removeBtnText: { color: Colors.white, fontWeight: '700', fontSize: 13 },
  modalOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center', zIndex: 20 },
  modalSheet: { backgroundColor: Colors.white, borderRadius: 16, padding: 24, width: '82%', gap: 12 },
  modalClose: { alignSelf: 'flex-end' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: Colors.textDark },
  modalBody: { fontSize: 14, color: Colors.textMid, lineHeight: 20 },
  confirmBtn: { backgroundColor: Colors.primary, borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  confirmBtnText: { color: Colors.white, fontWeight: '700', fontSize: 16 },
});
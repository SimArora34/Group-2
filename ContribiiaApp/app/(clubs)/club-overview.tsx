import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
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
import { supabase } from '../../src/lib/supabaseClient';
import { leaveCircle } from '../../src/services/circleService';

type FrequencyUnit = 'day' | 'week' | 'month';
type FrequencyConfig = { interval: number; label: string; unit: FrequencyUnit };
type Participant = {
  color: string; id: string; initials: string;
  isCreator?: boolean; isOpen?: boolean; isYou?: boolean;
  name: string; order: number;
};

const AVATAR_COLORS = [
  '#5B82C0','#E07B54','#6AAB8E','#C06B8D',
  '#8E6AC0','#C0A05B','#5BA8C0','#C05B5B',
];
const MS_IN_DAY = 24 * 60 * 60 * 1000;

const toOrdinal = (v: number) => {
  if (v % 100 >= 11 && v % 100 <= 13) return `${v}th`;
  if (v % 10 === 1) return `${v}st`;
  if (v % 10 === 2) return `${v}nd`;
  if (v % 10 === 3) return `${v}rd`;
  return `${v}th`;
};
const fmtLong = (d: Date) => d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
const fmtLongMonth = (d: Date) => d.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
const fmtMonthDay = (d: Date) => d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
const startOfDay = (d: Date) => { const n = new Date(d); n.setHours(0,0,0,0); return n; };
const daysDiff = (from: Date, to: Date) =>
  Math.ceil((startOfDay(to).getTime() - startOfDay(from).getTime()) / MS_IN_DAY);

const parseFreq = (freq: string): FrequencyConfig => {
  const n = freq.toLowerCase();
  const interval = Number(n.match(/\d+/)?.[0] ?? 1);
  if (n.includes('month')) return { interval, label: interval === 1 ? 'Monthly' : `Every ${interval} Months`, unit: 'month' };
  if (n.includes('day'))   return { interval, label: interval === 1 ? 'Daily'   : `Every ${interval} Days`,   unit: 'day'   };
  return { interval, label: interval === 1 ? 'Weekly' : `Every ${interval} Weeks`, unit: 'week' };
};
const addFreq = (d: Date, f: FrequencyConfig): Date => {
  const n = new Date(d);
  if (f.unit === 'day')   { n.setDate(n.getDate() + f.interval); return n; }
  if (f.unit === 'week')  { n.setDate(n.getDate() + f.interval * 7); return n; }
  n.setMonth(n.getMonth() + f.interval); return n;
};
const nextContrib = (start: Date, freq: FrequencyConfig, now: Date): Date => {
  let d = startOfDay(start); const today = startOfDay(now);
  while (d <= today) d = addFreq(d, freq);
  return d;
};
const timelineDates = (start: Date, count: number, f: FrequencyConfig): Date[] => {
  const dates: Date[] = [];
  let d = new Date(start);
  for (let i = 0; i < count; i++) {
    dates.push(new Date(d));
    d = addFreq(d, f);
  }
  return dates;
};

export default function ClubOverviewScreen({
  circle,
  onBack,
  onOpenMembers,
  onRequestCashAdvance,
  onMakeContribution,
}: {
  circle: any;
  onBack: () => void;
  onOpenMembers: () => void;
  onRequestCashAdvance: () => void;
  onMakeContribution?: () => void;
}) {
  const [leaving, setLeaving] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  // liveMembers is always fetched directly from circle_members + profiles
  // to avoid unreliable PostgREST nested-join resolution.
  const [liveMembers, setLiveMembers] = useState<any[]>(
    circle?.circle_members ?? []
  );
  const today = useMemo(() => new Date(), []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id ?? null));
  }, []);

  // Always load members directly — never rely on a nested join passed by the parent.
  useEffect(() => {
    if (!circle?.id) return;
    let cancelled = false;

    async function loadMembers() {
      // Step 1: get all circle_members rows for this circle
      const { data: cmRows, error: cmErr } = await supabase
        .from('circle_members')
        .select('*')
        .eq('circle_id', circle.id);

      if (cmErr) console.warn('[club-overview] circle_members error:', cmErr.message);
      if (cancelled) return;

      let rows = cmRows ?? [];

      // Step 2: ensure the circle owner has a circle_members row — if missing, re-insert it
      if (circle.owner_id && !rows.some((m: any) => m.user_id === circle.owner_id)) {
        const { error: fixErr } = await supabase.from('circle_members').insert({
          circle_id: circle.id,
          user_id: circle.owner_id,
        });
        if (!fixErr && !cancelled) {
          // Re-fetch after fix
          const { data: refreshed } = await supabase
            .from('circle_members')
            .select('*')
            .eq('circle_id', circle.id);
          if (refreshed) rows = refreshed;
        }
      }

      if (cancelled || rows.length === 0) return;

      // Step 3: fetch profile names for each member
      const userIds = rows.map((m: any) => m.user_id).filter(Boolean);
      const { data: profileRows } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);

      if (cancelled) return;

      const profileMap = new Map(
        (profileRows ?? []).map((p: any) => [p.id, p])
      );
      const enriched = rows.map((m: any) => ({
        ...m,
        profiles: profileMap.get(m.user_id) ?? null,
      }));
      setLiveMembers(enriched);
    }

    loadMembers();
    return () => { cancelled = true; };
  }, [circle?.id]);
  const cycleStart = useMemo(() => circle?.cycle_start_date ? new Date(circle.cycle_start_date) : null, [circle]);
  const hasCycleDate = cycleStart !== null;
  const cycleStarted = hasCycleDate && cycleStart <= today;
  const daysLeft = useMemo(() => hasCycleDate ? Math.max(0, daysDiff(today, cycleStart)) : 0, [today, cycleStart, hasCycleDate]);
  const freq = useMemo(() => parseFreq(circle?.contribution_frequency ?? 'monthly'), [circle]);
  const effectiveCycleStart = cycleStart ?? today;
  const nextDate = useMemo(() => nextContrib(effectiveCycleStart, freq, today), [effectiveCycleStart, freq, today]);
  const nextDays = useMemo(() => Math.max(0, daysDiff(today, nextDate)), [today, nextDate]);
  const payoutDate = useMemo(() => {
    // Compute payout based on the current user's order_position
    const myMember = liveMembers.find((m: any) => m.user_id === currentUserId);
    const position = myMember?.order_position ?? 1;
    let d = new Date(effectiveCycleStart);
    for (let i = 0; i < position; i++) d = addFreq(d, freq);
    return d;
  }, [effectiveCycleStart, freq, currentUserId, liveMembers]);

  const members: { name: string; initials: string; color: string; userId: string }[] = useMemo(() => {
    return liveMembers.map((m: any, i: number) => {
      const name: string = m.profiles?.full_name || `Member ${i + 1}`;
      const initials = name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);
      return { name, initials, color: AVATAR_COLORS[i % AVATAR_COLORS.length], userId: m.user_id };
    });
  }, [liveMembers]);

  const topParticipants = useMemo((): Participant[] => {
    const slots = Math.max(
      liveMembers.length,
      Math.min(4, circle?.total_positions || circle?.max_members || 4)
    );
    return Array.from({ length: slots }, (_, i) => {
      const m = members[i];
      if (!m) return { color: Colors.border, id: `open-${i}`, initials: '+', isOpen: true, name: 'Open', order: i + 1 };
      const isYou = currentUserId !== null && m.userId === currentUserId;
      const isCreator = m.userId === circle?.owner_id;
      return { color: m.color, id: m.userId, initials: m.initials, isCreator, isYou, name: m.name, order: i + 1 };
    });
  }, [circle, members, currentUserId]);

  const timelineSlots = circle?.total_positions || circle?.duration_months || topParticipants.length || 4;
  const tDates = useMemo(() => timelineDates(effectiveCycleStart, timelineSlots, freq), [effectiveCycleStart, timelineSlots, freq]);
  const tParticipants = useMemo((): Participant[] => {
    const filled = topParticipants.filter(p => !p.isOpen).slice(0, timelineSlots);
    while (filled.length < timelineSlots) filled.push({ color:'#D9D9D9', id:`topen-${filled.length}`, initials:'+', isOpen:true, name:'Open', order:filled.length+1 });
    return filled;
  }, [topParticipants, timelineSlots]);

  const handleLeave = () => {
    const isOwner = currentUserId !== null && currentUserId === circle?.owner_id;
    Alert.alert(
      'Leave Group',
      isOwner
        ? 'As the creator, leaving will transfer ownership to the next member, or delete the group if you are the only member.'
        : 'Are you sure you want to leave this group?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            setLeaving(true);
            const result = await leaveCircle(circle.id);
            setLeaving(false);
            if (!result.success) {
              Alert.alert('Error', result.error ?? 'Failed to leave group');
            } else {
              onBack();
            }
          },
        },
      ]
    );
  };

  const openProfile = (p: Participant) => {
    if (p.isOpen || !circle) return;
    router.push({ pathname:'/(clubs)/member-profile' as any, params:{
      clubId: circle.id, color:p.color,
      contribution: String(circle.contribution_amount ?? 0),
      frequency: freq.label, initials:p.initials, name:p.name,
      payout: fmtLongMonth(payoutDate), position: String(p.order),
      role: p.isYou ? 'You' : p.isCreator ? 'Creator' : 'Member',
    }});
  };

  return (
    <SafeAreaView style={styles.container} edges={['top','bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.headerBtn}>
          <AppIcon name="arrow-back" size={24} color={Colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Group Details</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => Alert.alert('Coming Soon', 'Chat messaging will be available in a future update.')}>
            <AppIcon name="chat-bubble-outline" size={22} color={Colors.textDark} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn} onPress={() => Alert.alert('Coming Soon', 'Notifications will be available in a future update.')}>
            <AppIcon name="notifications-none" size={22} color={Colors.textDark} />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.clubName}>{circle?.name}</Text>
        <View style={styles.typeBadge}>
          <Text style={styles.typeText}>{circle?.visibility === 'public' ? 'Public' : 'Private'}</Text>
        </View>

        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>
            {!hasCycleDate
              ? 'Cycle Date Not Set'
              : liveMembers.length <= 1
                ? 'Waiting for Members'
                : cycleStarted
                  ? 'Group Active'
                  : 'Group Not Yet Started'}
          </Text>
          {hasCycleDate ? (
            <>
              <Text style={styles.statusLabel}>{cycleStarted ? 'Cycle started:' : 'Cycle Start at:'}</Text>
              <View style={styles.statusDatePill}>
                <Text style={styles.statusDateText}>
                  {fmtLong(cycleStart!)}{!cycleStarted ? ` (${daysLeft} ${daysLeft === 1 ? 'day' : 'days'} left)` : ''}
                </Text>
              </View>
            </>
          ) : (
            <Text style={styles.statusLabel}>The group creator has not set a cycle start date yet.</Text>
          )}
        </View>

        <View style={styles.membersSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={styles.participantsContent}>
            <View style={styles.connectorLine} />
            {topParticipants.map(p => (
              <TouchableOpacity key={p.id} style={styles.participantCard}
                activeOpacity={p.isOpen ? 1 : 0.8} disabled={p.isOpen} onPress={() => openProfile(p)}>
                <Text style={styles.creatorLabel}>{p.isCreator ? 'Creator' : p.isYou ? 'You' : ''}</Text>
                <View style={[styles.participantAvatar,
                  { backgroundColor: p.isOpen ? Colors.surface : p.color },
                  p.isYou && styles.participantAvatarYou,
                  p.isOpen && styles.participantAvatarOpen,
                ]}>
                  <Text style={[styles.avatarInitials, p.isOpen && styles.avatarInitialsOpen]}>{p.initials}</Text>
                </View>
                <View style={styles.participantNamePill}><Text style={styles.participantName}>{p.name}</Text></View>
                <Text style={styles.participantOrder}>{toOrdinal(p.order)}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <TouchableOpacity activeOpacity={0.8} onPress={onOpenMembers}>
          <Text style={styles.viewParticipants}>View Participants</Text>
        </TouchableOpacity>

        <View style={styles.settingsCard}>
          <View style={styles.settingsHeader}>
            <Text style={styles.settingsTitle}>Cycle Settings</Text>
            <TouchableOpacity style={styles.collapseBtn} activeOpacity={0.85}
              onPress={() => router.push({ pathname: '/(clubs)/edit-club' as any, params: { id: circle?.id } })}>
              <AppIcon name="keyboard-arrow-up" size={18} color={Colors.white} />
            </TouchableOpacity>
          </View>
          <View style={styles.settingsGrid}>
            <View style={styles.settingCell}>
              <Text style={styles.settingLabel}>Contribution Amount</Text>
              <View style={styles.settingValuePill}><Text style={styles.settingValue}>${Number(circle?.contribution_amount ?? 0).toLocaleString()} CAD</Text></View>
            </View>
            <View style={styles.settingCell}>
              <Text style={styles.settingLabel}>Your Payout Date</Text>
              <View style={styles.settingValuePill}><Text style={styles.settingValue}>{fmtLongMonth(payoutDate)}</Text></View>
            </View>
            <View style={styles.settingCell}>
              <Text style={styles.settingLabel}>Contribution Frequency</Text>
              <View style={styles.settingValuePill}><Text style={styles.settingValue}>{freq.label}</Text></View>
            </View>
            <View style={styles.settingCell}>
              <Text style={styles.settingLabel}>Next Contribution Date</Text>
              <View style={styles.settingValuePill}><Text style={styles.settingValue}>{fmtMonthDay(nextDate)} ({nextDays} days)</Text></View>
            </View>
          </View>
        </View>

        <View style={styles.timelineSection}>
          <View style={styles.timelineCircle}>
            <View style={styles.timelineCenter}>
              <Text style={styles.timelineCenterLabel}>Payout Amount</Text>
              <Text style={styles.timelineCenterValue}>${Number(circle?.savings_goal ?? 0).toLocaleString()} CAD</Text>
              <Text style={[styles.timelineCenterLabel,{marginTop:10}]}>Duration</Text>
              <Text style={styles.timelineCenterValue}>{circle?.duration_months ?? 0} Months</Text>
            </View>
            {tParticipants.map((p, i) => {
              const angle = (Math.PI * 2 * i) / tParticipants.length - Math.PI / 2;
              const r = 118, nodeSize = 42, center = 140;
              return (
                <TouchableOpacity key={`${p.id}-tl-${i}`}
                  style={[styles.timelineNodeWrap, { left: center + r * Math.cos(angle) - nodeSize/2, top: center + r * Math.sin(angle) - nodeSize/2, width: nodeSize }]}
                  activeOpacity={p.isOpen ? 1 : 0.8} disabled={p.isOpen} onPress={() => openProfile(p)}>
                  <View style={[styles.timelineNode, { backgroundColor: p.isOpen ? '#D9D9D9' : p.color }, p.isYou && styles.timelineNodeYou]}>
                    <Text style={styles.timelineNodeText}>{p.initials}</Text>
                  </View>
                  <Text style={styles.timelineDateText}>{fmtMonthDay(tDates[i])}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Make Contribution button */}
        {!!onMakeContribution && (
          <TouchableOpacity style={styles.contributeBtn} activeOpacity={0.85} onPress={onMakeContribution}>
            <Text style={styles.contributeBtnText}>Make Contribution</Text>
          </TouchableOpacity>
        )}

        {/* Leave button at bottom of scrollable content */}
        <TouchableOpacity style={[styles.leaveBtn, leaving && { opacity: 0.6 }]} activeOpacity={0.85}
          onPress={handleLeave} disabled={leaving}>
          <Text style={styles.leaveBtnText}>{leaving ? 'Leaving...' : 'Leave the group'}</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Floating cash advance FAB */}
      <TouchableOpacity style={styles.fab} activeOpacity={0.9} onPress={onRequestCashAdvance}>
        <AppIcon name="add" size={30} color={Colors.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor:'#FFFFFF' },
  header: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:14, paddingVertical:10, borderBottomWidth:1, borderBottomColor:'#DADADA', backgroundColor:Colors.white },
  headerBtn: { width:34, alignItems:'center', justifyContent:'center' },
  headerRight: { flexDirection:'row' },
  notificationDot: { position:'absolute', top:6, right:6, width:8, height:8, borderRadius:4, backgroundColor:'#F74D52' },
  headerTitle: { fontSize:20, fontWeight:'700', color:Colors.textDark, flex:1, textAlign:'center' },
  scroll: { paddingHorizontal:16, paddingBottom:80, paddingTop:16 },
  clubName: { fontSize:36, fontWeight:'700', color:Colors.textDark, textAlign:'center', marginTop:8 },
  typeBadge: { alignSelf:'center', marginTop:6, backgroundColor:'#E9F8FA', borderWidth:1, borderColor:'#65C3CF', borderRadius:999, paddingHorizontal:14, paddingVertical:3 },
  typeText: { color:'#4A9DA8', fontSize:13, fontWeight:'500' },
  statusCard: { marginTop:18, backgroundColor:Colors.surface, borderRadius:14, borderWidth:1, borderColor:'#D2D2D2', padding:14, shadowColor:Colors.shadow, shadowOpacity:0.14, shadowRadius:4, shadowOffset:{width:0,height:2}, elevation:2 },
  statusTitle: { fontSize:16, fontWeight:'700', color:Colors.textDark, textAlign:'center', marginBottom:8 },
  statusLabel: { fontSize:14, color:Colors.textMid, marginBottom:4, paddingHorizontal:4 },
  statusDatePill: { backgroundColor:'#DBDBDB', borderRadius:4, paddingVertical:6, paddingHorizontal:8 },
  statusDateText: { fontSize:14, fontWeight:'600', color:'#4A4A4A', textAlign:'center' },
  membersSection: { marginTop:22, marginHorizontal:-16 },
  participantsContent: { flexDirection:'row', paddingHorizontal:24, position:'relative' },
  connectorLine: { position:'absolute', left:68, right:68, top:52, height:1.5, backgroundColor:'#C8C8C8' },
  participantCard: { width:88, alignItems:'center' },
  creatorLabel: { minHeight:16, fontSize:12, color:Colors.textMid, fontWeight:'500', marginBottom:4 },
  participantAvatar: { width:64, height:64, borderRadius:32, alignItems:'center', justifyContent:'center' },
  participantAvatarYou: { borderWidth:3, borderColor:'#2FA8D8' },
  participantAvatarOpen: { borderWidth:1, borderStyle:'dashed', borderColor:'#BBBBBB' },
  avatarInitials: { fontSize:17, fontWeight:'700', color:Colors.white },
  avatarInitialsOpen: { color:Colors.textMid },
  participantNamePill: { marginTop:5, borderWidth:1, borderColor:'#979797', borderRadius:12, paddingHorizontal:10, paddingVertical:2, minWidth:74, alignItems:'center', backgroundColor:'#F8F8F8' },
  participantName: { fontSize:11, color:Colors.textMid, fontWeight:'500' },
  participantOrder: { marginTop:3, fontSize:12, color:Colors.textDark, fontWeight:'500' },
  viewParticipants: { marginTop:14, color:Colors.primary, fontSize:14, fontWeight:'700', textDecorationLine:'underline' },
  settingsCard: { marginTop:20, backgroundColor:Colors.white, borderRadius:14, borderWidth:1, borderColor:'#D8D8D8', padding:14 },
  settingsHeader: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom:10 },
  settingsTitle: { fontSize:17, color:Colors.textDark, fontWeight:'700' },
  collapseBtn: { width:30, height:30, borderRadius:15, backgroundColor:'#FF7878', alignItems:'center', justifyContent:'center' },
  settingsGrid: { flexDirection:'row', flexWrap:'wrap', justifyContent:'space-between', rowGap:8 },
  settingCell: { width:'49%', borderWidth:1.2, borderColor:'#59BDCE', borderRadius:9, padding:8, backgroundColor:'#F3F7F7' },
  settingLabel: { fontSize:13, color:Colors.textMid, fontWeight:'500' },
  settingValuePill: { marginTop:6, backgroundColor:'#DEDEDE', borderRadius:5, alignItems:'center', justifyContent:'center', paddingVertical:7, paddingHorizontal:6 },
  settingValue: { fontSize:15, color:'#333333', fontWeight:'600' },
  timelineSection: { marginTop:18, alignItems:'center' },
  timelineCircle: { width:280, height:280, borderRadius:140, borderWidth:1.6, borderStyle:'dashed', borderColor:'#C9C9C9', alignItems:'center', justifyContent:'center', marginBottom:20, position:'relative' },
  timelineCenter: { alignItems:'center' },
  timelineCenterLabel: { fontSize:12, color:Colors.textMid, fontWeight:'500' },
  timelineCenterValue: { fontSize:26, color:Colors.primary, fontWeight:'700' },
  timelineNodeWrap: { position:'absolute', alignItems:'center' },
  timelineNode: { width:42, height:42, borderRadius:21, alignItems:'center', justifyContent:'center' },
  timelineNodeYou: { borderWidth:2, borderColor:'#2FA8D8' },
  timelineNodeText: { color:Colors.white, fontSize:11, fontWeight:'700' },
  timelineDateText: { marginTop:3, fontSize:11, color:Colors.textDark, fontWeight:'500' },
  actionsWrap: { position:'absolute', left:14, right:14, bottom:20 },
  contributeBtn: { marginTop:16, backgroundColor: Colors.primary, borderRadius:12, alignItems:'center', justifyContent:'center', paddingVertical:14 },
  contributeBtnText: { fontSize:15, fontWeight:'700', color:'#FFFFFF' },
  leaveBtn: { marginTop:12, backgroundColor:'#C43D2A', borderRadius:12, alignItems:'center', justifyContent:'center', paddingVertical:14 },
  leaveBtnText: { color:Colors.white, fontSize:18, fontWeight:'700' },
  fab: { position:'absolute', right:20, bottom:20, width:64, height:64, borderRadius:32, backgroundColor:'#2AA4B8', alignItems:'center', justifyContent:'center', shadowColor:Colors.shadow, shadowOpacity:0.2, shadowRadius:5, shadowOffset:{width:0,height:2}, elevation:4 },
});
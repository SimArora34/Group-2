import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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

const AVATAR_COLORS = [
  '#5B82C0','#E07B54','#6AAB8E','#C06B8D',
  '#8E6AC0','#C0A05B','#5BA8C0','#C05B5B',
];

export default function CashAdvanceReportScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [club, setClub] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const [circleRes, cmRes] = await Promise.all([
        supabase.from('circles').select('*').eq('id', id).single(),
        supabase.from('circle_members').select('*').eq('circle_id', id),
      ]);
      if (circleRes.data) setClub(circleRes.data);
      const rows = cmRes.data ?? [];
      if (rows.length > 0) {
        const userIds = rows.map((m: any) => m.user_id).filter(Boolean);
        const { data: profileRows } = await supabase.from('profiles').select('id, full_name').in('id', userIds);
        const profileMap = new Map((profileRows ?? []).map((p: any) => [p.id, p]));
        setMembers(rows.map((m: any) => ({
          ...m,
          name: profileMap.get(m.user_id)?.full_name ?? 'Member',
          initials: (profileMap.get(m.user_id)?.full_name ?? 'M').split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2),
          color: AVATAR_COLORS[(m.order_position ?? 0) % AVATAR_COLORS.length],
        })));
      }
      setLoading(false);
    })();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <ActivityIndicator style={{ flex: 1 }} color={Colors.primary} />
      </SafeAreaView>
    );
  }

  if (!club) return null;

  const totalPool = club.contribution_amount * (club.total_positions ?? members.length);
  // Advance = 80% of their round payout, repayable over remaining months
  const advanceAmount = Math.round(totalPool * 0.8);
  const repaymentAmount = Math.round((advanceAmount * 1.05) / (club.duration_months ?? 1));

  const today = new Date();
  const fmt = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const repaymentDates = Array.from({ length: 3 }, (_, i) => {
    const d = new Date(today);
    d.setMonth(d.getMonth() + i + 1);
    return fmt(d);
  });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <AppIcon name="arrow-back" size={22} color={Colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{club.name}</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.pageTitle}>Cash Advance Report</Text>
        <Text style={styles.pageSubtitle}>
          A cash advance allows you to receive funds before your scheduled
          payout round, subject to a small fee.
        </Text>

        {/* Advance summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Advance Amount</Text>
            <Text style={styles.summaryValue}>${advanceAmount.toLocaleString()} CAD</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Fee (5%)</Text>
            <Text style={[styles.summaryValue, { color: Colors.accent }]}>
              +${Math.round(advanceAmount * 0.05).toLocaleString()} CAD
            </Text>
          </View>
          <View style={[styles.summaryRow, styles.summaryRowTotal]}>
            <Text style={styles.summaryLabelBold}>Total Repayable</Text>
            <Text style={styles.summaryValueBold}>
              ${Math.round(advanceAmount * 1.05).toLocaleString()} CAD
            </Text>
          </View>
        </View>

        {/* Club details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Club Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Club Name</Text>
            <Text style={styles.detailValue}>{club.name}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Contribution</Text>
            <Text style={styles.detailValue}>
              ${club.contribution_amount}, {club.contribution_frequency}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Total Pool</Text>
            <Text style={styles.detailValue}>${totalPool.toLocaleString()} CAD</Text>
          </View>
          <View style={[styles.detailRow, styles.detailRowLast]}>
            <Text style={styles.detailLabel}>Request Date</Text>
            <Text style={styles.detailValue}>{fmt(today)}</Text>
          </View>
        </View>

        {/* Repayment schedule */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Repayment Schedule</Text>
          {repaymentDates.map((date, i) => (
            <View key={i} style={[styles.detailRow, i === repaymentDates.length - 1 && styles.detailRowLast]}>
              <Text style={styles.detailLabel}>Payment {i + 1}{i === repaymentDates.length - 1 ? ' (final)' : ''}</Text>
              <View style={styles.repayRight}>
                <Text style={styles.detailValue}>${repaymentAmount.toLocaleString()} CAD</Text>
                <Text style={styles.repayDate}>{date}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Members */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Club Members</Text>
          {members.map((m, i) => (
            <View key={m.user_id ?? i} style={[styles.memberRow, i === members.length - 1 && styles.detailRowLast]}>
              <View style={[styles.memberDot, { backgroundColor: m.color }]}>
                <Text style={styles.memberDotText}>{m.initials[0]}</Text>
              </View>
              <Text style={styles.memberName}>{m.name}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.btn}
          activeOpacity={0.85}
          onPress={() =>
            router.replace({ pathname: '/(clubs)/joined-club', params: { id } })
          }
        >
          <Text style={styles.btnText}>Confirm Cash Advance</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.btnCancel}
          activeOpacity={0.85}
          onPress={() => router.back()}
        >
          <Text style={styles.btnCancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
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
  scroll: { padding: 20, gap: 16, paddingBottom: 16 },
  pageTitle: { fontSize: 22, fontWeight: '800', color: Colors.textDark },
  pageSubtitle: { fontSize: 13, color: Colors.textMid, lineHeight: 20 },
  summaryCard: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.primary + '33',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  summaryRowTotal: {
    borderTopWidth: 1,
    borderTopColor: Colors.primary + '44',
    marginTop: 4,
    paddingTop: 12,
  },
  summaryLabel: { fontSize: 14, color: Colors.textMid },
  summaryValue: { fontSize: 14, fontWeight: '600', color: Colors.textDark },
  summaryLabelBold: { fontSize: 15, fontWeight: '700', color: Colors.textDark },
  summaryValueBold: { fontSize: 15, fontWeight: '800', color: Colors.primary },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 10,
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
  detailValue: { fontSize: 14, fontWeight: '600', color: Colors.textDark },
  repayRight: { alignItems: 'flex-end', gap: 2 },
  repayDate: { fontSize: 11, color: Colors.textLight },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  memberDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberDotText: { fontSize: 12, fontWeight: '700', color: Colors.white },
  memberName: { fontSize: 14, color: Colors.textDark, fontWeight: '500' },
  actions: { padding: 20, paddingTop: 12, gap: 10 },
  btn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  btnText: { fontSize: 16, fontWeight: '700', color: Colors.white },
  btnCancel: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  btnCancelText: { fontSize: 16, fontWeight: '600', color: Colors.textMid },
});

import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo } from 'react';
import {
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
  max_members: number;
  duration_months: number;
};

export default function RecipientScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const club: PublicClub | undefined = useMemo(
    () => ((mockData as any).publicClubs ?? []).find((c: PublicClub) => c.id === id),
    [id],
  );

  if (!club) return null;

  const totalPayout = club.contribution_amount * club.max_members;
  const today = new Date();
  const fmt = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.replace({ pathname: '/(clubs)/joined-club', params: { id } })}
          style={styles.headerBtn}
        >
          <AppIcon name="close" size={22} color={Colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{club.name}</Text>
        <View style={styles.headerBtn} />
      </View>

      <View style={styles.body}>
        {/* Trophy icon */}
        <View style={styles.iconCircle}>
          <AppIcon name="card-outline" size={52} color={Colors.white} />
        </View>

        <Text style={styles.title}>You're the{'\n'}Recipient!</Text>
        <Text style={styles.subtitle}>
          Congratulations! This round's full contribution pool has been
          deposited into your Contribiia wallet.
        </Text>

        {/* Payout amount */}
        <View style={styles.payoutBox}>
          <Text style={styles.payoutLabel}>Total Payout</Text>
          <Text style={styles.payoutAmount}>${totalPayout.toLocaleString()} CAD</Text>
        </View>

        {/* Details */}
        <View style={styles.card}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Club</Text>
            <Text style={styles.detailValue}>{club.name}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payout Date</Text>
            <Text style={styles.detailValue}>{fmt(today)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Contributions Collected</Text>
            <Text style={styles.detailValue}>{club.max_members} members</Text>
          </View>
          <View style={[styles.detailRow, styles.detailRowLast]}>
            <Text style={styles.detailLabel}>Amount per Member</Text>
            <Text style={styles.detailValue}>${club.contribution_amount.toLocaleString()} CAD</Text>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.btn}
          activeOpacity={0.85}
          onPress={() => router.replace({ pathname: '/(clubs)/joined-club', params: { id } })}
        >
          <Text style={styles.btnText}>View Club Details</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.btnOutline}
          activeOpacity={0.85}
          onPress={() =>
            router.push({
              pathname: '/(clubs)/cash-advance-report',
              params: { id },
            })
          }
        >
          <Text style={styles.btnOutlineText}>View Cash Advance</Text>
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
  body: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 28,
    gap: 14,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textDark,
    textAlign: 'center',
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textMid,
    textAlign: 'center',
    lineHeight: 22,
  },
  payoutBox: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    width: '100%',
  },
  payoutLabel: { fontSize: 12, color: Colors.primary, fontWeight: '600', marginBottom: 4 },
  payoutAmount: { fontSize: 28, fontWeight: '800', color: Colors.primary },
  card: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  detailRowLast: { borderBottomWidth: 0 },
  detailLabel: { fontSize: 14, color: Colors.textMid },
  detailValue: { fontSize: 14, fontWeight: '600', color: Colors.textDark },
  actions: { padding: 24, gap: 10 },
  btn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  btnText: { fontSize: 16, fontWeight: '700', color: Colors.white },
  btnOutline: {
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnOutlineText: { fontSize: 16, fontWeight: '700', color: Colors.primary },
});

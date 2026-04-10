import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppIcon from '../../components/AppIcon';
import { Colors } from '../../constants/Colors';

export default function ContributionSuccessScreen() {
  const { id, clubName, amount, frequency } = useLocalSearchParams<{
    id: string;
    clubName: string;
    amount: string;
    frequency?: string;
  }>();

  const today = new Date();
  const nextDue = new Date(today);
  nextDue.setDate(nextDue.getDate() + 14);

  const fmt = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const displayAmount = amount ? Number(amount).toLocaleString() : '—';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.replace({ pathname: '/(clubs)/joined-club', params: { id } })}
          style={styles.headerBtn}
        >
          <AppIcon name="close" size={22} color={Colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{clubName ?? 'Club'}</Text>
        <View style={styles.headerBtn} />
      </View>

      <View style={styles.body}>
        {/* Success icon */}
        <View style={styles.iconWrap}>
          <View style={styles.iconCircle}>
            <AppIcon name="checkmark-circle" size={56} color={Colors.white} />
          </View>
        </View>

        <Text style={styles.title}>Contribution{'\n'}Successful!</Text>
        <Text style={styles.subtitle}>
          Your contribution has been deducted from your Contribiia wallet.
        </Text>

        {/* Details card */}
        <View style={styles.card}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Club</Text>
            <Text style={styles.detailValue}>{clubName ?? '—'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Amount Deducted</Text>
            <Text style={[styles.detailValue, styles.amountText]}>
              ${displayAmount} CAD
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailValue}>{fmt(today)}</Text>
          </View>
          <View style={[styles.detailRow, styles.detailRowLast]}>
            <Text style={styles.detailLabel}>Next Due Date</Text>
            <Text style={styles.detailValue}>{fmt(nextDue)}</Text>
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
    paddingTop: 32,
    gap: 16,
  },
  iconWrap: { marginBottom: 4 },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
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
  card: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 8,
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
  amountText: { color: Colors.primary },
  actions: { padding: 24 },
  btn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  btnText: { fontSize: 16, fontWeight: '700', color: Colors.white },
});

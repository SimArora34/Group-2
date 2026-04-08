import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
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
import { joinCircle } from '../../src/services/circleService';

type PublicClub = {
  id: string;
  name: string;
  contribution_amount: number;
  contribution_frequency: string;
  duration_months: number;
};

export default function MemberAgreementScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [agreed, setAgreed] = useState(false);
  const [joining, setJoining] = useState(false);

  const club: PublicClub | undefined = useMemo(
    () => ((mockData as any).publicClubs ?? []).find((c: PublicClub) => c.id === id),
    [id],
  );

  if (!club) return null;

  const handleJoin = async () => {
    if (!agreed || joining) return;
    setJoining(true);
    await joinCircle(club.id, 'current-user');
    setJoining(false);
    router.replace({ pathname: '/(clubs)/joined-club', params: { id: club.id } });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <AppIcon name="arrow-back" size={22} color={Colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{club.name}</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.sectionTitle}>Member Agreement</Text>

        <View style={styles.agreementBox}>
          <Text style={styles.agreementText}>
            By joining this club, I commit to contributing{' '}
            <Text style={styles.bold}>
              ${club.contribution_amount} {club.contribution_frequency}
            </Text>{' '}
            to the{' '}
            <Text style={styles.bold}>{club.name}</Text>{' '}
            savings club, starting once all members have joined, for a{' '}
            <Text style={styles.bold}>
              duration of {club.duration_months} months
            </Text>
            .
          </Text>

          <Text style={[styles.agreementText, styles.spacing]}>
            I acknowledge that this is a{' '}
            <Text style={styles.bold}>binding commitment</Text>.
          </Text>

          <Text style={[styles.agreementText, styles.spacing]}>
            Failure to meet my payment obligations may result in the suspension
            of my Contribiia account and the reporting of non-payment to credit
            agencies, which can negatively impact my credit score.
          </Text>
        </View>

        {/* Checkbox */}
        <TouchableOpacity
          style={styles.checkRow}
          activeOpacity={0.8}
          onPress={() => setAgreed(v => !v)}
        >
          <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
            {agreed && <AppIcon name="checkmark" size={14} color={Colors.white} />}
          </View>
          <Text style={styles.checkLabel}>
            I acknowledge and agree to these terms.
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.joinBtn, !agreed && styles.joinBtnDisabled]}
          activeOpacity={0.85}
          disabled={!agreed || joining}
          onPress={handleJoin}
        >
          <Text style={[styles.joinBtnText, !agreed && styles.joinBtnTextDisabled]}>
            {joining ? 'Joining...' : 'Join Club'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
          <Text style={styles.cancelText}>Cancel</Text>
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
  scroll: { padding: 20, gap: 20 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textDark,
  },
  agreementBox: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  agreementText: {
    fontSize: 14,
    color: Colors.textMid,
    lineHeight: 22,
  },
  bold: { fontWeight: '700', color: Colors.textDark },
  spacing: { marginTop: 12 },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingTop: 4,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    flexShrink: 0,
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkLabel: {
    flex: 1,
    fontSize: 14,
    color: Colors.textDark,
    lineHeight: 21,
  },
  actions: { padding: 20, paddingTop: 8, gap: 10 },
  joinBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  joinBtnDisabled: {
    backgroundColor: Colors.disabled,
  },
  joinBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
  joinBtnTextDisabled: {
    color: Colors.disabledText,
  },
  cancelBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelText: { fontSize: 16, fontWeight: '600', color: Colors.textMid },
});

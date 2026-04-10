import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
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
import { updateCircle } from '../../src/services/circleService';

const FREQ_OPTIONS = ['weekly', 'bi-weekly', 'monthly'];
const CYCLE_DURATIONS = ['3 Months', '6 Months', '9 Months', '12 Months', '18 Months', '24 Months'];

function durationToMonths(label: string): number {
  const num = parseInt(label, 10);
  return isNaN(num) ? 12 : num;
}

function monthsToLabel(m: number | null | undefined): string {
  if (!m) return '12 Months';
  return `${m} Months`;
}

export default function EditClubScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [circleName, setCircleName] = useState('');

  // Editable fields
  const [contributionAmount, setContributionAmount] = useState('');
  const [memberLimit, setMemberLimit] = useState('');
  const [frequency, setFrequency] = useState('monthly');
  const [cycleDuration, setCycleDuration] = useState('12 Months');

  // Dropdown visibility
  const [showFrequency, setShowFrequency] = useState(false);
  const [showCycleDuration, setShowCycleDuration] = useState(false);

  // Success modal
  const [showSuccess, setShowSuccess] = useState(false);
  const [changedValues, setChangedValues] = useState<{ label: string; from: string; to: string }[]>([]);

  // Store original values for diff
  const original = useRef<{
    contributionAmount: string;
    memberLimit: string;
    frequency: string;
    cycleDuration: string;
  } | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('circles')
        .select('name, contribution_amount, total_positions, contribution_frequency, duration_months')
        .eq('id', id)
        .single();
      setLoading(false);
      if (error || !data) return;
      const ca = String(data.contribution_amount ?? '');
      const ml = String(data.total_positions ?? '');
      const freq = data.contribution_frequency ?? 'monthly';
      const cd = monthsToLabel(data.duration_months);
      setCircleName(data.name ?? '');
      setContributionAmount(ca);
      setMemberLimit(ml);
      setFrequency(freq);
      setCycleDuration(cd);
      original.current = { contributionAmount: ca, memberLimit: ml, frequency: freq, cycleDuration: cd };
    })();
  }, [id]);

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    const updates: any = {};
    const diff: { label: string; from: string; to: string }[] = [];

    const ca = parseFloat(contributionAmount);
    if (!isNaN(ca) && contributionAmount !== original.current?.contributionAmount) {
      updates.contribution_amount = ca;
      diff.push({ label: 'Contribution Amount', from: `$${original.current?.contributionAmount}`, to: `$${ca}` });
    }
    const ml = parseInt(memberLimit, 10);
    if (!isNaN(ml) && memberLimit !== original.current?.memberLimit) {
      updates.total_positions = ml;
      diff.push({ label: 'Member Limit', from: original.current?.memberLimit ?? '', to: String(ml) });
    }
    if (frequency !== original.current?.frequency) {
      updates.contribution_frequency = frequency;
      diff.push({ label: 'Frequency', from: original.current?.frequency ?? '', to: frequency });
    }
    if (cycleDuration !== original.current?.cycleDuration) {
      updates.duration_months = durationToMonths(cycleDuration);
      diff.push({ label: 'Cycle Duration', from: original.current?.cycleDuration ?? '', to: cycleDuration });
    }

    if (Object.keys(updates).length === 0) {
      setSaving(false);
      Alert.alert('No Changes', 'Nothing was changed.');
      return;
    }

    const result = await updateCircle(id, updates);
    setSaving(false);
    if (!result.success) {
      Alert.alert('Error', result.error ?? 'Could not save changes.');
      return;
    }
    // Update originals
    original.current = { contributionAmount, memberLimit, frequency, cycleDuration };
    setChangedValues(diff);
    setShowSuccess(true);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
            <AppIcon name="arrow-back" size={22} color={Colors.textDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>Edit {circleName}</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerBtn} onPress={() => Alert.alert('Coming Soon', 'Chat messaging will be available in a future update.')}>
              <AppIcon name="chat-bubble-outline" size={22} color={Colors.textDark} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerBtn} onPress={() => Alert.alert('Coming Soon', 'Notifications will be available in a future update.')}>
              <AppIcon name="notifications-none" size={22} color={Colors.textDark} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Contribution Amount */}
          <Text style={styles.sectionLabel}>Choosing your contribution amount:</Text>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              value={contributionAmount}
              onChangeText={setContributionAmount}
              keyboardType="decimal-pad"
              placeholder="$ 200"
              placeholderTextColor={Colors.textLight}
            />
          </View>

          {/* Member Limit */}
          <Text style={styles.sectionLabel}>Choosing your club size:</Text>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              value={memberLimit}
              onChangeText={setMemberLimit}
              keyboardType="number-pad"
              placeholder="e.g. 10"
              placeholderTextColor={Colors.textLight}
            />
          </View>

          {/* Contribution Frequency */}
          <Text style={styles.sectionLabel}>Choosing contribution frequency:</Text>
          <View style={styles.freqRow}>
            <Text style={styles.freqLabel}>Contribute</Text>
            <TouchableOpacity style={styles.dropdown} onPress={() => setShowFrequency(true)} activeOpacity={0.8}>
              <Text style={styles.dropdownText}>{frequency.charAt(0).toUpperCase() + frequency.slice(1)}</Text>
              <AppIcon name="keyboard-arrow-down" size={18} color={Colors.textDark} />
            </TouchableOpacity>
          </View>

          {/* Cycle Duration */}
          <View style={styles.inputRow}>
            <Text style={styles.inputRowLabel}>Cycle Duration</Text>
            <TouchableOpacity style={styles.dropdown} onPress={() => setShowCycleDuration(true)} activeOpacity={0.8}>
              <Text style={styles.dropdownText}>{cycleDuration}</Text>
              <AppIcon name="keyboard-arrow-down" size={18} color={Colors.textDark} />
            </TouchableOpacity>
          </View>

          {/* Edit Participants */}
          <TouchableOpacity
            style={styles.editParticipants}
            activeOpacity={0.8}
            onPress={() => router.push({ pathname: '/(clubs)/club-members' as any, params: { id } })}
          >
            <AppIcon name="edit" size={16} color={Colors.primary} />
            <Text style={styles.editParticipantsText}>Edit Participants</Text>
          </TouchableOpacity>

          {/* Buttons */}
          <TouchableOpacity
            style={[styles.confirmBtn, saving && { opacity: 0.6 }]}
            activeOpacity={0.85}
            onPress={handleSave}
            disabled={saving}
          >
            {saving
              ? <ActivityIndicator color={Colors.white} />
              : <Text style={styles.confirmBtnText}>Send Out Confirmation</Text>}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.discardBtn}
            activeOpacity={0.85}
            onPress={() => router.back()}
          >
            <Text style={styles.discardBtnText}>Discard Changes</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Frequency Picker Modal */}
      <Modal visible={showFrequency} transparent animationType="fade" onRequestClose={() => setShowFrequency(false)}>
        <TouchableOpacity style={styles.pickerOverlay} activeOpacity={1} onPress={() => setShowFrequency(false)}>
          <View style={styles.pickerSheet}>
            {FREQ_OPTIONS.map(f => (
              <TouchableOpacity
                key={f}
                style={[styles.pickerItem, frequency === f && styles.pickerItemActive]}
                onPress={() => { setFrequency(f); setShowFrequency(false); }}
              >
                <Text style={[styles.pickerItemText, frequency === f && styles.pickerItemTextActive]}>{f.charAt(0).toUpperCase() + f.slice(1)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Cycle Duration Picker Modal */}
      <Modal visible={showCycleDuration} transparent animationType="fade" onRequestClose={() => setShowCycleDuration(false)}>
        <TouchableOpacity style={styles.pickerOverlay} activeOpacity={1} onPress={() => setShowCycleDuration(false)}>
          <View style={styles.pickerSheet}>
            {CYCLE_DURATIONS.map(d => (
              <TouchableOpacity
                key={d}
                style={[styles.pickerItem, cycleDuration === d && styles.pickerItemActive]}
                onPress={() => { setCycleDuration(d); setShowCycleDuration(false); }}
              >
                <Text style={[styles.pickerItemText, cycleDuration === d && styles.pickerItemTextActive]}>{d}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Settings Changed Success Modal */}
      <Modal visible={showSuccess} transparent animationType="fade" onRequestClose={() => setShowSuccess(false)}>
        <View style={styles.successOverlay}>
          <View style={styles.successSheet}>
            <TouchableOpacity style={styles.modalClose} onPress={() => { setShowSuccess(false); router.back(); }}>
              <AppIcon name="close" size={20} color={Colors.textDark} />
            </TouchableOpacity>
            <Text style={styles.successTitle}>Club Settings Changed!</Text>
            <Text style={styles.successBody}>
              The club settings for <Text style={{ fontWeight: '700' }}>{circleName}</Text> have been updated.
            </Text>
            {changedValues.map((c, i) => (
              <View key={i} style={styles.diffRow}>
                <Text style={styles.diffLabel}>{c.label}:</Text>
                <Text style={styles.diffOld}>{c.from}</Text>
                <AppIcon name="arrow-forward" size={14} color={Colors.textMid} />
                <Text style={styles.diffNew}>{c.to}</Text>
              </View>
            ))}
            <TouchableOpacity
              style={styles.confirmBtn}
              activeOpacity={0.85}
              onPress={() => { setShowSuccess(false); router.back(); }}
            >
              <Text style={styles.confirmBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  scroll: { padding: 20, gap: 6 },
  sectionLabel: { fontSize: 13, color: Colors.textMid, marginBottom: 6, marginTop: 14 },
  inputWrap: { borderWidth: 1.5, borderColor: Colors.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 2 },
  input: { fontSize: 16, color: Colors.textDark, paddingVertical: 12 },
  freqRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  freqLabel: { fontSize: 14, color: Colors.textDark },
  dropdown: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1.5, borderColor: Colors.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, minWidth: 110 },
  dropdownText: { fontSize: 15, color: Colors.textDark, flex: 1 },
  inputRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 },
  inputRowLabel: { fontSize: 14, color: Colors.textDark, fontWeight: '500' },
  editParticipants: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 20 },
  editParticipantsText: { color: Colors.primary, fontWeight: '700', fontSize: 14, textDecorationLine: 'underline' },
  confirmBtn: { backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 28 },
  confirmBtnText: { color: Colors.white, fontWeight: '700', fontSize: 16 },
  discardBtn: { borderWidth: 1.5, borderColor: Colors.primary, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 12 },
  discardBtnText: { color: Colors.primary, fontWeight: '700', fontSize: 16 },
  // Pickers
  pickerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center' },
  pickerSheet: { backgroundColor: Colors.white, borderRadius: 14, overflow: 'hidden', width: 200 },
  pickerItem: { paddingVertical: 14, paddingHorizontal: 20 },
  pickerItemActive: { backgroundColor: Colors.primaryLight },
  pickerItemText: { fontSize: 15, color: Colors.textDark },
  pickerItemTextActive: { color: Colors.primary, fontWeight: '700' },
  // Success modal
  successOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
  successSheet: { backgroundColor: Colors.white, borderRadius: 16, padding: 24, width: '86%', gap: 10 },
  modalClose: { alignSelf: 'flex-end' },
  successTitle: { fontSize: 20, fontWeight: '700', color: Colors.textDark },
  successBody: { fontSize: 14, color: Colors.textMid, lineHeight: 20 },
  diffRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: 2 },
  diffLabel: { fontSize: 13, color: Colors.textMid, fontWeight: '600' },
  diffOld: { fontSize: 13, color: '#C43D2A', textDecorationLine: 'line-through' },
  diffNew: { fontSize: 13, color: Colors.primary, fontWeight: '700' },
  // Shared (for textLight)
} as const);

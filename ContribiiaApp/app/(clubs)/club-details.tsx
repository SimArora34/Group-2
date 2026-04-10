import React, { useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Colors } from "../../constants/Colors";

type Frequency = "weekly" | "bi-weekly" | "monthly";

export default function ClubDetailsScreen() {
  const router = useRouter();
  const { clubName, visibility } = useLocalSearchParams<{
    clubName: string;
    visibility: string;
  }>();

  const [amount, setAmount] = useState("");
  const [duration, setDuration] = useState("");
  const [frequency, setFrequency] = useState<Frequency>("monthly");
  const [savingsGoal, setSavingsGoal] = useState("");
  const [totalPositions, setTotalPositions] = useState("");
  const [cycleStartDate, setCycleStartDate] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerYear, setPickerYear] = useState(new Date().getFullYear());
  const [pickerMonth, setPickerMonth] = useState(new Date().getMonth());
  const [pickerDay, setPickerDay] = useState(new Date().getDate());

  const handleReview = () => {
    if (!amount || Number(amount) <= 0) {
      Alert.alert("Required", "Please enter a valid contribution amount.");
      return;
    }

    router.push({
      pathname: "/(clubs)/club-confirmation",
      params: {
        clubName,
        visibility,
        amount,
        duration,
        frequency,
        savingsGoal,
        totalPositions,
        cycleStartDate,
      },
    } as any);
  };

  const frequencies: Frequency[] = ["weekly", "bi-weekly", "monthly"];

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Club Details</Text>

        <Text style={styles.label}>Contribution Amount</Text>
        <TextInput
          style={styles.input}
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          placeholder="e.g. 100"
          placeholderTextColor={Colors.textPlaceholder}
        />

        <Text style={styles.label}>Cycle Duration (months)</Text>
        <TextInput
          style={styles.input}
          value={duration}
          onChangeText={setDuration}
          keyboardType="numeric"
          placeholder="e.g. 12"
          placeholderTextColor={Colors.textPlaceholder}
        />

        <Text style={styles.label}>Savings Goal (optional)</Text>
        <TextInput
          style={styles.input}
          value={savingsGoal}
          onChangeText={setSavingsGoal}
          keyboardType="numeric"
          placeholder="e.g. 5000"
          placeholderTextColor={Colors.textPlaceholder}
        />

        <Text style={styles.label}>Total Positions (optional)</Text>
        <TextInput
          style={styles.input}
          value={totalPositions}
          onChangeText={setTotalPositions}
          keyboardType="numeric"
          placeholder="e.g. 10"
          placeholderTextColor={Colors.textPlaceholder}
        />

        <Text style={styles.label}>Cycle Start Date (optional)</Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowDatePicker(true)}
          activeOpacity={0.8}
        >
          <Text style={{ fontSize: 15, color: cycleStartDate ? Colors.textDark : Colors.textPlaceholder }}>
            {cycleStartDate || "Select a date"}
          </Text>
        </TouchableOpacity>

        <Text style={styles.label}>Frequency</Text>
        <View style={styles.frequencyRow}>
          {frequencies.map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.freqBtn, frequency === f && styles.freqBtnActive]}
              onPress={() => setFrequency(f)}
            >
              <Text
                style={[styles.freqText, frequency === f && styles.freqTextActive]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.7}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={handleReview}>
          <Text style={styles.buttonText}>Review</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
          <Text style={styles.cancelText}>Back</Text>
        </TouchableOpacity>
      </View>

      {/* Date Picker Modal */}
      <Modal visible={showDatePicker} transparent animationType="fade" onRequestClose={() => setShowDatePicker(false)}>
        <TouchableOpacity style={styles.dateOverlay} activeOpacity={1} onPress={() => setShowDatePicker(false)}>
          <View style={styles.dateSheet} onStartShouldSetResponder={() => true}>
            <Text style={styles.dateSheetTitle}>Select Cycle Start Date</Text>
            <View style={styles.datePickerRow}>
              {/* Month */}
              <View style={styles.dateCol}>
                <Text style={styles.dateColLabel}>Month</Text>
                <ScrollView style={styles.dateScroll} showsVerticalScrollIndicator={false}>
                  {Array.from({ length: 12 }, (_, i) => (
                    <TouchableOpacity
                      key={i}
                      style={[styles.dateOption, pickerMonth === i && styles.dateOptionActive]}
                      onPress={() => setPickerMonth(i)}
                    >
                      <Text style={[styles.dateOptionText, pickerMonth === i && styles.dateOptionTextActive]}>
                        {new Date(2000, i).toLocaleString('en-US', { month: 'short' })}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              {/* Day */}
              <View style={styles.dateCol}>
                <Text style={styles.dateColLabel}>Day</Text>
                <ScrollView style={styles.dateScroll} showsVerticalScrollIndicator={false}>
                  {Array.from({ length: new Date(pickerYear, pickerMonth + 1, 0).getDate() }, (_, i) => (
                    <TouchableOpacity
                      key={i}
                      style={[styles.dateOption, pickerDay === i + 1 && styles.dateOptionActive]}
                      onPress={() => setPickerDay(i + 1)}
                    >
                      <Text style={[styles.dateOptionText, pickerDay === i + 1 && styles.dateOptionTextActive]}>
                        {i + 1}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              {/* Year */}
              <View style={styles.dateCol}>
                <Text style={styles.dateColLabel}>Year</Text>
                <ScrollView style={styles.dateScroll} showsVerticalScrollIndicator={false}>
                  {Array.from({ length: 5 }, (_, i) => {
                    const y = new Date().getFullYear() + i;
                    return (
                      <TouchableOpacity
                        key={y}
                        style={[styles.dateOption, pickerYear === y && styles.dateOptionActive]}
                        onPress={() => setPickerYear(y)}
                      >
                        <Text style={[styles.dateOptionText, pickerYear === y && styles.dateOptionTextActive]}>
                          {y}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </View>
            <TouchableOpacity
              style={styles.dateConfirmBtn}
              onPress={() => {
                const mm = String(pickerMonth + 1).padStart(2, '0');
                const dd = String(pickerDay).padStart(2, '0');
                setCycleStartDate(`${pickerYear}-${mm}-${dd}`);
                setShowDatePicker(false);
              }}
            >
              <Text style={styles.dateConfirmText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 24, paddingBottom: 8 },
  title: { fontSize: 22, fontWeight: "800", color: Colors.textDark, marginBottom: 24 },
  label: { fontSize: 14, fontWeight: "600", color: Colors.textDark, marginBottom: 6, marginTop: 14 },
  input: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 13,
    fontSize: 15,
    color: Colors.textDark,
    backgroundColor: Colors.white,
  },
  frequencyRow: { flexDirection: "row", gap: 10, marginTop: 8 },
  freqBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  freqBtnActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  freqText: { fontSize: 13, color: Colors.textMid, fontWeight: "600" },
  freqTextActive: { color: Colors.primary },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
  button: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: { color: Colors.white, fontWeight: "700", fontSize: 16 },
  cancelBtn: { padding: 16, alignItems: "center" },
  cancelText: { color: Colors.textMid, fontSize: 15 },
  dateOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  dateSheet: { width: '85%', backgroundColor: Colors.white, borderRadius: 16, padding: 20, maxHeight: 420 },
  dateSheetTitle: { fontSize: 17, fontWeight: '700', color: Colors.textDark, textAlign: 'center', marginBottom: 14 },
  datePickerRow: { flexDirection: 'row', gap: 10 },
  dateCol: { flex: 1, alignItems: 'center' },
  dateColLabel: { fontSize: 12, fontWeight: '600', color: Colors.textMid, marginBottom: 6 },
  dateScroll: { maxHeight: 200 },
  dateOption: { paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8, alignItems: 'center', marginBottom: 2 },
  dateOptionActive: { backgroundColor: Colors.primaryLight },
  dateOptionText: { fontSize: 14, color: Colors.textMid, fontWeight: '500' },
  dateOptionTextActive: { color: Colors.primary, fontWeight: '700' },
  dateConfirmBtn: { marginTop: 16, backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  dateConfirmText: { color: Colors.white, fontWeight: '700', fontSize: 15 },
});


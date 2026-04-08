import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
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
    <View style={styles.container}>
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

      <Text style={styles.label}>Frequency</Text>
      <View style={styles.frequencyRow}>
        {frequencies.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.freqBtn, frequency === f && styles.freqBtnActive]}
            onPress={() => setFrequency(f)}
          >
            <Text style={[styles.freqText, frequency === f && styles.freqTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.button} onPress={handleReview}>
        <Text style={styles.buttonText}>Review</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
        <Text style={styles.cancelText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: Colors.background },
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
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  freqBtnActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  freqText: { fontSize: 13, color: Colors.textMid, fontWeight: "600" },
  freqTextActive: { color: Colors.primary },
  button: {
    backgroundColor: Colors.primary,
    padding: 16,
    marginTop: 32,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: { color: Colors.white, fontWeight: "700", fontSize: 16 },
  cancelBtn: { padding: 16, alignItems: "center", marginTop: 8 },
  cancelText: { color: Colors.textMid, fontSize: 15 },
});


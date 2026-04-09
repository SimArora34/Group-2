import React, { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView } from "react-native";
import ScreenHeader from "../../components/ScreenHeader";
import { createCircle } from "../../src/services/circleService";
import { Colors } from "../../constants/Colors";

export default function ClubConfirmationScreen() {
  const router = useRouter();
  const {
    clubName,
    visibility,
    amount,
    duration,
    frequency,
    savingsGoal,
    totalPositions,
    cycleStartDate,
  } = useLocalSearchParams<{
    clubName: string;
    visibility: string;
    amount: string;
    duration?: string;
    frequency?: string;
    savingsGoal?: string;
    totalPositions?: string;
    cycleStartDate?: string;
  }>();

  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    try {
      setCreating(true);

      const res = await createCircle({
        name: String(clubName),
        contribution_amount: Number(amount),
        visibility: visibility as "public" | "private",
        savings_goal: savingsGoal ? Number(savingsGoal) : undefined,
        duration_months: duration ? Number(duration) : undefined,
        cycle_start_date: cycleStartDate ? String(cycleStartDate) : undefined,
        total_positions: totalPositions ? Number(totalPositions) : undefined,
        contribution_frequency: frequency ? String(frequency) : undefined,
      });

      if (!res.success) {
        Alert.alert("Error", res.error || "Failed to create club.");
        return;
      }

      Alert.alert("Success", "Club created successfully!", [
        { text: "OK", onPress: () => router.replace("/(clubs)/clubs" as any) },
      ]);
    } finally {
      setCreating(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <ScreenHeader title="Review Club" />
      <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Review Club</Text>

      <View style={styles.row}>
        <Text style={styles.label}>Name</Text>
        <Text style={styles.value}>{clubName}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Type</Text>
        <Text style={styles.value}>{visibility}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Amount</Text>
        <Text style={styles.value}>${amount} CAD</Text>
      </View>
      {!!duration && (
        <View style={styles.row}>
          <Text style={styles.label}>Duration</Text>
          <Text style={styles.value}>{duration} months</Text>
        </View>
      )}
      {!!frequency && (
        <View style={styles.row}>
          <Text style={styles.label}>Frequency</Text>
          <Text style={styles.value}>{frequency}</Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.button, creating && styles.buttonDisabled]}
        onPress={handleCreate}
        disabled={creating}
      >
        <Text style={styles.buttonText}>
          {creating ? "Creating..." : "Create Club"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
        <Text style={styles.cancelText}>Back</Text>
      </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  container: { padding: 24 },
  title: { fontSize: 22, fontWeight: "800", color: Colors.textDark, marginBottom: 24 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  label: { fontSize: 14, color: Colors.textMid, flex: 1 },
  value: { fontSize: 14, fontWeight: "600", color: Colors.textDark, flexShrink: 1, textAlign: 'right' },
  button: {
    backgroundColor: Colors.primary,
    padding: 16,
    marginTop: 32,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: Colors.white, fontWeight: "700", fontSize: 16 },
  cancelBtn: { padding: 16, alignItems: "center", marginTop: 8 },
  cancelText: { color: Colors.textMid, fontSize: 15 },
});


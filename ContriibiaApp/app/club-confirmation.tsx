import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { createCircle } from "../src/services/circleService";

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
  } = useLocalSearchParams();

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
        contribution_frequency: frequency ? String(frequency) : undefined,
        total_positions: totalPositions ? Number(totalPositions) : undefined,
        cycle_start_date: cycleStartDate ? String(cycleStartDate) : undefined,
      });

      if (!res.success) {
        Alert.alert("Error", res.error || "Failed to create club");
        return;
      }

      Alert.alert("Success", "Club created successfully!", [
        {
          text: "OK",
          onPress: () =>
            router.replace({
              pathname: "/(tabs)/clubs",
              params: { refresh: Date.now().toString() },
            }),
        },
      ]);
    } catch (error) {
      Alert.alert("Error", "Something went wrong while creating the club.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Review Club</Text>

      <Text style={styles.row}>Name: {clubName}</Text>
      <Text style={styles.row}>Type: {visibility}</Text>
      <Text style={styles.row}>Amount: {amount}</Text>
      <Text style={styles.row}>Duration: {duration || "—"}</Text>
      <Text style={styles.row}>Frequency: {frequency || "—"}</Text>
      <Text style={styles.row}>Savings Goal: {savingsGoal || "—"}</Text>
      <Text style={styles.row}>Total Positions: {totalPositions || "—"}</Text>
      <Text style={styles.row}>Cycle Start Date: {cycleStartDate || "—"}</Text>

      <TouchableOpacity
        style={[styles.button, creating && styles.buttonDisabled]}
        onPress={handleCreate}
        disabled={creating}
      >
        <Text style={styles.buttonText}>
          {creating ? "Creating..." : "Create Club"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 22, marginBottom: 20, fontWeight: "700" },
  row: { fontSize: 16, marginBottom: 8, color: "#333" },
  button: {
    backgroundColor: "teal",
    padding: 15,
    marginTop: 20,
    borderRadius: 10,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: "white", textAlign: "center", fontWeight: "700" },
});
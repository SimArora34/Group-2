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

export default function ClubDetailsScreen() {
  const router = useRouter();
  const { clubName, visibility } = useLocalSearchParams();

  const [amount, setAmount] = useState("");
  const [duration, setDuration] = useState("");
  const [frequency, setFrequency] = useState("monthly");
  const [savingsGoal, setSavingsGoal] = useState("");
  const [totalPositions, setTotalPositions] = useState("");
  const [cycleStartDate, setCycleStartDate] = useState("");

  const handleReview = () => {
    if (!amount || Number(amount) <= 0) {
      Alert.alert("Required", "Please enter a valid contribution amount.");
      return;
    }

    router.push({
      pathname: "/club-confirmation",
      params: {
        clubName: String(clubName),
        visibility: String(visibility),
        amount,
        duration,
        frequency,
        savingsGoal,
        totalPositions,
        cycleStartDate,
      },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Club Details</Text>

      <Text>Contribution Amount</Text>
      <TextInput
        style={styles.input}
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        placeholder="e.g. 200"
      />

      <Text>Savings Goal</Text>
      <TextInput
        style={styles.input}
        value={savingsGoal}
        onChangeText={setSavingsGoal}
        keyboardType="numeric"
        placeholder="e.g. 5000"
      />

      <Text>Cycle Duration (months)</Text>
      <TextInput
        style={styles.input}
        value={duration}
        onChangeText={setDuration}
        keyboardType="numeric"
        placeholder="e.g. 6"
      />

      <Text>Total Positions / Members</Text>
      <TextInput
        style={styles.input}
        value={totalPositions}
        onChangeText={setTotalPositions}
        keyboardType="numeric"
        placeholder="e.g. 5"
      />

      <Text>Cycle Start Date</Text>
      <TextInput
        style={styles.input}
        value={cycleStartDate}
        onChangeText={setCycleStartDate}
        placeholder="YYYY-MM-DD"
      />

      <Text style={{ marginTop: 10 }}>Frequency</Text>

      <TouchableOpacity onPress={() => setFrequency("weekly")}>
        <Text style={frequency === "weekly" ? styles.selected : styles.option}>
          Weekly
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setFrequency("monthly")}>
        <Text style={frequency === "monthly" ? styles.selected : styles.option}>
          Monthly
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleReview}>
        <Text style={styles.buttonText}>Review</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 22, marginBottom: 20, fontWeight: "700" },
  input: {
    borderWidth: 1,
    padding: 10,
    marginVertical: 10,
    borderRadius: 8,
    borderColor: "#ddd",
  },
  option: { padding: 10, fontSize: 16 },
  selected: { padding: 10, color: "teal", fontWeight: "bold", fontSize: 16 },
  button: {
    backgroundColor: "teal",
    padding: 15,
    marginTop: 20,
    borderRadius: 10,
  },
  buttonText: { color: "white", textAlign: "center", fontWeight: "700" },
});
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";

export default function ClubDetailsScreen() {
  const router = useRouter();
  const { clubName, visibility } = useLocalSearchParams();

  const [amount, setAmount] = useState("");
  const [duration, setDuration] = useState("");
  const [frequency, setFrequency] = useState("monthly");

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Club Details</Text>

      <Text>Contribution Amount</Text>
      <TextInput
        style={styles.input}
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />

      <Text>Cycle Duration</Text>
      <TextInput
        style={styles.input}
        value={duration}
        onChangeText={setDuration}
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

      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          router.push({
            pathname: "/club-confirmation",
            params: { clubName, visibility, amount, duration, frequency },
          })
        }
      >
        <Text style={styles.buttonText}>Review</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, marginBottom: 20 },
  input: {
    borderWidth: 1,
    padding: 10,
    marginVertical: 10,
    borderRadius: 8,
  },
  option: { padding: 10 },
  selected: { padding: 10, color: "teal", fontWeight: "bold" },
  button: {
    backgroundColor: "teal",
    padding: 15,
    marginTop: 20,
    borderRadius: 10,
  },
  buttonText: { color: "white", textAlign: "center" },
});
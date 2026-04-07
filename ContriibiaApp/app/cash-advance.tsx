import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { withdraw } from "../src/services/walletService";

export default function CashAdvance() {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleRequest = async () => {
    const numericAmount = Number(amount);

    if (!amount || Number.isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert("Invalid Amount", "Enter a valid amount greater than 0.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await withdraw(numericAmount);

      if (!res.success) {
        Alert.alert("Error", res.error || "Failed to process cash advance.");
        return;
      }

      Alert.alert("Success", "Cash advance processed successfully.", [
        { text: "OK", onPress: () => router.back() },
      ]);
      setAmount("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Request Cash Advance</Text>

      <Text style={styles.label}>Amount</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter amount"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />

      <TouchableOpacity
        style={[styles.button, submitting && styles.buttonDisabled]}
        onPress={handleRequest}
        disabled={submitting}
      >
        <Text style={styles.buttonText}>
          {submitting ? "Processing..." : "Request"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 20 },
  label: { fontSize: 14, marginBottom: 8, color: "#444" },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "teal",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
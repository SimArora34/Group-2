import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import { withdraw } from "../src/services/walletService";

export default function CashAdvance() {
  const [amount, setAmount] = useState("");

  const handleRequest = async () => {
    const numericAmount = parseFloat(amount);

    if (!amount || numericAmount <= 0) {
      Alert.alert("Invalid Amount", "Enter valid amount");
      return;
    }

    const res = await withdraw(numericAmount);

    if (!res.success) {
      Alert.alert("Error", res.error || "Failed");
      return;
    }

    Alert.alert("Success", "Cash advance processed!");
    setAmount("");
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Request Cash Advance</Text>

      <TextInput
        placeholder="Enter amount"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />

      <Button title="Request" onPress={handleRequest} />
    </View>
  );
}
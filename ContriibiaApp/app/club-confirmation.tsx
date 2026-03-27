import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { createCircle } from "../src/services/circleService";

export default function ClubConfirmationScreen() {
  const router = useRouter();
  const { clubName, visibility, amount } = useLocalSearchParams();

  const handleCreate = async () => {
    const res = await createCircle({
      name: String(clubName),
      contribution_amount: Number(amount),
      visibility: visibility as "public" | "private",
    });

    if (!res.success) {
      Alert.alert("Error", res.error || "Failed to create club");
      return;
    }

    Alert.alert("Success", "Club created successfully!");
    router.replace("/(tabs)/clubs");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Review Club</Text>

      <Text>Name: {clubName}</Text>
      <Text>Type: {visibility}</Text>
      <Text>Amount: {amount}</Text>

      <TouchableOpacity style={styles.button} onPress={handleCreate}>
        <Text style={styles.buttonText}>Create Club</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, marginBottom: 20 },
  button: {
    backgroundColor: "teal",
    padding: 15,
    marginTop: 20,
    borderRadius: 10,
  },
  buttonText: { color: "white", textAlign: "center" },
});
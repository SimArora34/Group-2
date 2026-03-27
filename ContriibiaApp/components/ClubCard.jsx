import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../constants/Colors";

const ClubCard = ({ name, amount, status, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
      <View style={styles.row}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.status}>{status}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.amountLabel}>Contribution Amount</Text>
        <Text style={styles.amount}>{amount}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default ClubCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  name: {
    fontWeight: "600",
    fontSize: 14,
    color: Colors.primary,
  },
  status: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2E9B5F",
  },
  amountLabel: {
    fontSize: 12,
    color: "#888",
  },
  amount: {
    fontSize: 13,
    fontWeight: "500",
    color: "#222",
  },
});

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

type ClubCardProps = {
  name: string;
  amount: string;
  status: string;
  onPress: () => void;
};

export default function ClubCard({
  name,
  amount,
  status,
  onPress,
}: ClubCardProps) {
  const isActive = status.toLowerCase() === "active";

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {/* Top Row */}
      <View style={styles.row}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>

        <Text style={[styles.status, isActive ? styles.active : styles.public]}>
          {status}
        </Text>
      </View>

      {/* Contribution */}
      <Text style={styles.label}>Contribution Amount</Text>

      <Text style={styles.amount}>{amount} CAD</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,

    borderWidth: 1,
    borderColor: "#EAEAEA",

    // shadow (ios + android)
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  name: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
    flex: 1,
    marginRight: 10,
  },

  status: {
    fontSize: 12,
    fontWeight: "700",
  },

  active: {
    color: "#22A06B", // green
  },

  public: {
    color: "#007AFF", // blue
  },

  label: {
    marginTop: 10,
    fontSize: 13,
    color: "#777",
  },

  amount: {
    marginTop: 4,
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
});
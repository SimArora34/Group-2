import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function ClubConfirmationScreen({ route, navigation }) {
  const { clubName, visibility, amount, duration, frequency } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Review Club</Text>

      <Text>Name: {clubName}</Text>
      <Text>Type: {visibility}</Text>
      <Text>Amount: {amount}</Text>
      <Text>Duration: {duration}</Text>
      <Text>Frequency: {frequency}</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          if (visibility === "private") {
            navigation.navigate("Invite");
          } else {
            alert("Club Created Successfully!");
            navigation.navigate("CreateClub");
          }
        }}
      >
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
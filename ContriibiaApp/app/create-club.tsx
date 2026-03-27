import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function CreateClubScreen() {
  const router = useRouter();

  const [clubName, setClubName] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("public");

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create New Club</Text>

      <Text>Club Name</Text>
      <TextInput
        style={styles.input}
        value={clubName}
        onChangeText={setClubName}
        placeholder="Enter club name"
      />

      <Text style={{ marginTop: 10 }}>Visibility</Text>

      <TouchableOpacity onPress={() => setVisibility("public")}>
        <Text style={visibility === "public" ? styles.selected : styles.option}>
          Public
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setVisibility("private")}>
        <Text style={visibility === "private" ? styles.selected : styles.option}>
          Private
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          router.push({
            pathname: "/club-details",
            params: { clubName, visibility },
          })
        }
      >
        <Text style={styles.buttonText}>Continue</Text>
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
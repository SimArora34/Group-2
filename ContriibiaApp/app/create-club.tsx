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

export default function CreateClubScreen() {
  const router = useRouter();

  const [clubName, setClubName] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("public");

  const handleContinue = () => {
    if (!clubName.trim()) {
      Alert.alert("Required", "Please enter a club name.");
      return;
    }

    router.push({
      pathname: "/club-details",
      params: {
        clubName: clubName.trim(),
        visibility,
      },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create New Club</Text>

      <Text style={styles.label}>Club Name</Text>
      <TextInput
        style={styles.input}
        value={clubName}
        onChangeText={setClubName}
        placeholder="Enter club name"
      />

      <Text style={styles.label}>Visibility</Text>

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

      <TouchableOpacity style={styles.button} onPress={handleContinue}>
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 22, marginBottom: 20, fontWeight: "700" },
  label: { fontSize: 14, color: "#444", marginTop: 10 },
  input: {
    borderWidth: 1,
    padding: 10,
    marginVertical: 10,
    borderRadius: 8,
    borderColor: "#ddd",
  },
  option: { paddingVertical: 10, fontSize: 16 },
  selected: {
    paddingVertical: 10,
    color: "teal",
    fontWeight: "bold",
    fontSize: 16,
  },
  button: {
    backgroundColor: "teal",
    padding: 15,
    marginTop: 20,
    borderRadius: 10,
  },
  buttonText: { color: "white", textAlign: "center", fontWeight: "700" },
});
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
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenHeader from "../../components/ScreenHeader";
import { Colors } from "../../constants/Colors";

type Visibility = "public" | "private";

export default function CreateClubScreen() {
  const router = useRouter();

  const [clubName, setClubName] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("public");

  const handleContinue = () => {
    if (!clubName.trim()) {
      Alert.alert("Required", "Please enter a club name.");
      return;
    }

    router.push({
      pathname: "/(clubs)/club-details",
      params: {
        clubName: clubName.trim(),
        visibility,
      },
    } as any);
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScreenHeader title="Create New Club" showIcons={false} />

      <View style={styles.content}>
        <Text style={styles.label}>Club Name</Text>
        <TextInput
          style={styles.input}
          value={clubName}
          onChangeText={setClubName}
          placeholder="Enter club name"
          placeholderTextColor={Colors.textPlaceholder}
        />

        <Text style={styles.label}>Visibility</Text>
        <View style={styles.visibilityRow}>
          {(["public", "private"] as Visibility[]).map((v) => (
            <TouchableOpacity
              key={v}
              style={[styles.visBtn, visibility === v && styles.visBtnActive]}
              onPress={() => setVisibility(v)}
            >
              <Text style={[styles.visText, visibility === v && styles.visTextActive]}>
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.button} onPress={handleContinue}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, padding: 24 },
  label: { fontSize: 14, fontWeight: "600", color: Colors.textDark, marginBottom: 6, marginTop: 14 },
  input: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 13,
    fontSize: 15,
    color: Colors.textDark,
    backgroundColor: Colors.white,
  },
  visibilityRow: { flexDirection: "row", gap: 12, marginTop: 4 },
  visBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  visBtnActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  visText: { fontSize: 14, color: Colors.textMid, fontWeight: "600" },
  visTextActive: { color: Colors.primary },
  button: {
    backgroundColor: Colors.primary,
    padding: 16,
    marginTop: 32,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: { color: Colors.white, fontWeight: "700", fontSize: 16 },
  cancelBtn: { padding: 16, alignItems: "center", marginTop: 8 },
  cancelText: { color: Colors.textMid, fontSize: 15 },
});


import { router } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../../components/Button";
import Input from "../../components/Input";
import ScreenHeader from "../../components/ScreenHeader";
import { SelectModal } from "../../components/SelectModal";
import { Colors } from "../../constants/Colors";
import mockData from "../../data/mockData.json";
import { saveAddress } from "../../src/services/profileService";

export default function AddressScreen() {
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [postal, setPostal] = useState("");
  const [provinceOpen, setProvinceOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!line1 || !city || !province || !postal) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    setLoading(true);
    const res = await saveAddress({
      address_line1: line1,
      ...(line2 ? { address_line2: line2 } : {}),
      city,
      province,
      postal_code: postal,
    });
    setLoading(false);

    if (!res.success) {
      Alert.alert(
        "Error",
        res.error || "Failed to save address. Please try again.",
      );
      return;
    }

    router.push("/(verification)/document-select");
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScreenHeader title="Identity Verification" />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.sectionTitle}>Address</Text>

        <Input
          label="Address Line 1"
          placeholder="Text example"
          value={line1}
          onChangeText={setLine1}
          required
        />
        <Input
          label="Address Line 2 (optional)"
          placeholder="Text example"
          value={line2}
          onChangeText={setLine2}
        />
        <Input
          label="City"
          placeholder="Text example"
          value={city}
          onChangeText={setCity}
          required
        />

        <TouchableOpacity activeOpacity={1} style={styles.field}>
          <Text style={styles.fieldLabel}>
            Province <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setProvinceOpen(true)}
          >
            <Text
              style={
                province ? styles.dropdownValue : styles.dropdownPlaceholder
              }
            >
              {province || "Select province"}
            </Text>
            <Text style={styles.dropdownArrow}>▾</Text>
          </TouchableOpacity>
        </TouchableOpacity>

        <Input
          label="Postal code"
          placeholder="Text example"
          value={postal}
          onChangeText={setPostal}
          autoCapitalize="characters"
          required
        />
      </ScrollView>

      <TouchableOpacity activeOpacity={1} style={styles.actions}>
        <Button label="Continue" onPress={handleContinue} loading={loading} />
        <Button
          label="Save and exit"
          variant="ghost"
          onPress={() => router.replace("/(tabs)")}
        />
      </TouchableOpacity>

      <SelectModal
        visible={provinceOpen}
        title="Province / Territory"
        options={mockData.provinces}
        value={province}
        onSelect={setProvince}
        onClose={() => setProvinceOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  scroll: { padding: 24, flexGrow: 1 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textDark,
    marginBottom: 20,
  },
  field: { marginBottom: 14 },
  fieldLabel: {
    fontSize: 14,
    color: Colors.textDark,
    marginBottom: 6,
    fontWeight: "500",
  },
  required: { color: Colors.error },
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 6,
    paddingHorizontal: 12,
    height: 48,
    backgroundColor: Colors.white,
  },
  dropdownValue: {
    flex: 1,
    fontSize: 15,
    color: Colors.textDark,
  },
  dropdownPlaceholder: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPlaceholder,
  },
  dropdownArrow: {
    color: Colors.textLight,
    fontSize: 12,
  },
  actions: { padding: 24, gap: 8 },
});

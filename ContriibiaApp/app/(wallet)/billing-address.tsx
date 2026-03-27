import { router } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../constants/Colors";
import { saveAddress } from "../../src/services/profileService";

type AddressMode = "select" | "manual";

export default function BillingAddressScreen() {
  const [mode, setMode] = useState<AddressMode>("select");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (mode === "manual") {
      if (!street || !city || !province || !postalCode) {
        Alert.alert("Error", "Please fill in all address fields");
        return;
      }
      setLoading(true);
      const res = await saveAddress({
        address_line1: street,
        city,
        province,
        postal_code: postalCode,
      });
      setLoading(false);
      if (!res.success) {
        Alert.alert(
          "Error",
          res.error || "Failed to save address. Please try again.",
        );
        return;
      }
    }
    router.back();
  };

  const handleContinue = async () => {
    if (existingBusinessCard) {
      router.replace("/(tabs)/wallet" as any);
      return;
    }

    if (mode === "manual") {
      if (!street.trim() || !city.trim() || !province.trim() || !postalCode.trim()) {
        Alert.alert("Missing details", "Please complete all billing address fields.");
        return;
      }
    }

    try {
      setSaving(true);

      const res = await addCard({
        holder_name: fullName,
        last4: "0000",
        expiry: "12/30",
        type: "business",
        bank_name: "Contribiia Business",
        billing_address_1: mode === "manual" ? street.trim() : "Personal Address",
        billing_address_2: mode === "manual" ? `Postal Code: ${postalCode.trim()}` : undefined,
        billing_city: mode === "manual" ? city.trim() : "Calgary",
        billing_province: mode === "manual" ? province.trim() : "AB",
        billing_country: "Canada",
      });

      if (!res.success) {
        Alert.alert("Setup failed", res.error || "Unable to set up business wallet.");
        return;
      }

      Alert.alert("Success", "Business wallet setup completed.");
      router.replace("/(tabs)/wallet" as any);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loaderWrap}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loaderText}>Loading billing setup...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.title}>
            Select an address to use as Billing Address
          </Text>

          {mode === "select" ? (
            <View style={styles.optionGroup}>
              <TouchableOpacity style={styles.optionBtn} onPress={handleContinue}>
                <Text style={styles.optionBtnText}>Use Personal Address</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.optionBtn, styles.optionBtnOutline]}
                onPress={() => setMode("manual")}
              >
                <Text style={styles.optionBtnOutlineText}>
                  Add another Address
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.formGroup}>
              {[
                {
                  label: "Street Address",
                  value: street,
                  setter: setStreet,
                  placeholder: "123 Main St",
                },
                {
                  label: "City",
                  value: city,
                  setter: setCity,
                  placeholder: "Calgary",
                },
                {
                  label: "Province",
                  value: province,
                  setter: setProvince,
                  placeholder: "AB",
                },
                {
                  label: "Postal Code",
                  value: postalCode,
                  setter: setPostalCode,
                  placeholder: "T2P 1J9",
                },
              ].map(({ label, value, setter, placeholder }) => (
                <View key={label} style={styles.field}>
                  <Text style={styles.label}>{label}</Text>
                  <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={setter}
                    placeholder={placeholder}
                    placeholderTextColor={Colors.textPlaceholder}
                  />
                </View>
              ))}

              <TouchableOpacity
                style={styles.backLink}
                onPress={() => setMode("select")}
              >
                <Text style={styles.backLinkText}>← Back to options</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            style={[styles.continueBtn, loading && { opacity: 0.6 }]}
            onPress={handleContinue}
            disabled={loading}
          >
            <Text style={styles.continueBtnText}>
              {loading ? "Saving..." : "Continue"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loaderWrap: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  loaderText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textMid,
  },
  scroll: { padding: 24, gap: 20 },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textDark,
    lineHeight: 26,
  },
  optionGroup: { gap: 12 },
  optionBtn: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  optionBtnText: {
    color: Colors.primary,
    fontWeight: "600",
    fontSize: 15,
  },
  optionBtnOutline: { borderColor: Colors.border },
  optionBtnOutlineText: {
    color: Colors.textMid,
    fontWeight: "600",
    fontSize: 15,
  },
  formGroup: { gap: 14 },
  field: { gap: 6 },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textDark,
  },
  input: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 15,
    color: Colors.textDark,
    backgroundColor: Colors.white,
  },
  backLink: { paddingVertical: 4 },
  backLinkText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: "500",
  },
  continueBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  continueBtnText: {
    color: Colors.white,
    fontWeight: "700",
    fontSize: 16,
  },
});
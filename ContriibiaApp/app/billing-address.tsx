import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../constants/Colors";
import {
    saveBusinessBillingAddress,
    savePersonalBillingAddress,
} from "../src/services/profileService";

type AddressMode = "select" | "manual";

export default function BillingAddressScreen() {
  const [mode, setMode] = useState<AddressMode>("select");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [fullName, setFullName] = useState("Business User");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [existingBusinessCard, setExistingBusinessCard] = useState(false);

  useEffect(() => {
    loadBillingSetup();
  }, []);

  const loadBillingSetup = async () => {
    try {
      setLoading(true);

  // Track what changed for success message
  const [changedField, setChangedField] = useState("");
  const [saving, setSaving] = useState(false);

      if (profileRes.success && profileRes.data) {
        setFullName(
          profileRes.data.full_name ||
            profileRes.data.username ||
            "Business User"
        );
      }

  const handleSavePersonal = async () => {
    setSaving(true);
    const res = await savePersonalBillingAddress({
      personal_addr1: pAddr1,
      ...(pAddr2.trim() ? { personal_addr2: pAddr2 } : {}),
      personal_city: pCity,
      personal_province: pProvince,
      personal_postal: pPostal,
    });
    setSaving(false);
    if (!res.success) {
      Alert.alert(
        "Error",
        res.error || "Failed to save address. Please try again.",
      );
      return;
    }
    setChangedField(
      pPostal.trim()
        ? `Your Postal code has been changed to ${pPostal.trim()}`
        : "Your personal address has been updated.",
    );
    setScreen("success-personal");
  };

  const handleSaveBusiness = async () => {
    setSaving(true);
    const res = await saveBusinessBillingAddress({
      business_addr1: bAddr1,
      ...(bAddr2.trim() ? { business_addr2: bAddr2 } : {}),
      business_city: bCity,
      business_province: bProvince,
      business_postal: bPostal,
    });
    setSaving(false);
    if (!res.success) {
      Alert.alert(
        "Error",
        res.error || "Failed to save address. Please try again.",
      );
      return;
    }
    setChangedField(
      bAddr1.trim()
        ? `Your Address Line 1 has been changed to ${bAddr1.trim()}`
        : "Your business address has been updated.",
    );
    setScreen("success-business");
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loaderWrap}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loaderText}>Loading billing setup...</Text>
      </SafeAreaView>
    );
  }

  // ── SUCCESS BUSINESS ─────────────────────────────────────────
  if (screen === "success-business") {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <Header
          title="Edit Billing Address"
          onBack={() => setScreen("manage")}
        />
        <View style={styles.successBanner}>
          <Text style={styles.successBannerText}>
            Business Address updated!
          </Text>
        </View>
        <View style={styles.successBody}>
          <View style={styles.successCheck}>
            <MaterialIcons name="check" size={40} color={Colors.white} />
          </View>
          <Text style={styles.successTitle}>Congratulations!</Text>
          <Text style={styles.successDesc}>{changedField}</Text>
          <TouchableOpacity
            style={styles.successBtn}
            onPress={() => router.back()}
          >
            <Text style={styles.successBtnText}>Go back to Settings</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── EDIT PERSONAL ADDRESS ─────────────────────────────────────
  if (screen === "edit-personal") {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <Header
          title="Edit Billing Address"
          onBack={() => setScreen("manage")}
        />
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.addressTypeTitle}>Personal Address</Text>

          <InputField
            label="Address Line 1"
            value={pAddr1}
            onChange={setPAddr1}
            placeholder="123 Mohawk Road"
          />
          <InputField
            label="Address Line 2"
            value={pAddr2}
            onChange={setPAddr2}
            placeholder="456 Hamilton Avenue"
            optional
          />
          <InputField
            label="City"
            value={pCity}
            onChange={setPCity}
            placeholder="Hamilton"
          />

          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>
              Province <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.pickerBtn}
              onPress={() => setPProvinceOpen(true)}
            >
              <Text
                style={pProvince ? styles.pickerText : styles.pickerPlaceholder}
              >
                {pProvince || "Select province"}
              </Text>
              <MaterialIcons
                name="keyboard-arrow-down"
                size={20}
                color={Colors.textMid}
              />
            </TouchableOpacity>
          </View>

          <InputField
            label="Postal code"
            value={pPostal}
            onChange={setPPostal}
            placeholder="A3B 2Z3"
          />

          <TouchableOpacity
            style={[
              styles.saveBtn,
              (!personalComplete || saving) && styles.saveBtnDisabled,
            ]}
            onPress={handleSavePersonal}
            disabled={!personalComplete || saving}
          >
            <Text style={styles.saveBtnText}>
              {saving ? "Saving..." : "Save changes"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => setScreen("manage")}
          >
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </ScrollView>

        <SelectModal
          visible={pProvinceOpen}
          title="Province"
          options={PROVINCES}
          value={pProvince}
          onSelect={setPProvince}
          onClose={() => setPProvinceOpen(false)}
        />
      </SafeAreaView>
    );
  }

  // ── EDIT BUSINESS ADDRESS ─────────────────────────────────────
  if (screen === "edit-business") {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <Header
          title="Edit Billing Address"
          onBack={() => setScreen("manage")}
        />
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.addressTypeTitle}>Business Address</Text>

          <InputField
            label="Address Line 1"
            value={bAddr1}
            onChange={setBAddr1}
            placeholder="123 Mohawk Road"
          />
          <InputField
            label="Address Line 2"
            value={bAddr2}
            onChange={setBAddr2}
            placeholder="456 Hamilton Avenue"
            optional
          />
          <InputField
            label="City"
            value={bCity}
            onChange={setBCity}
            placeholder="Hamilton"
          />

          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>
              Province <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.pickerBtn}
              onPress={() => setBProvinceOpen(true)}
            >
              <Text
                style={bProvince ? styles.pickerText : styles.pickerPlaceholder}
              >
                {bProvince || "Select province"}
              </Text>
              <MaterialIcons
                name="keyboard-arrow-down"
                size={20}
                color={Colors.textMid}
              />
            </TouchableOpacity>
          </View>

          <InputField
            label="Postal code"
            value={bPostal}
            onChange={setBPostal}
            placeholder="A3B 2Z3"
          />

          <TouchableOpacity
            style={[
              styles.saveBtn,
              (!businessComplete || saving) && styles.saveBtnDisabled,
            ]}
            onPress={handleSaveBusiness}
            disabled={!businessComplete || saving}
          >
            <Text style={styles.saveBtnText}>
              {saving ? "Saving..." : "Save changes"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => setScreen("manage")}
          >
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </ScrollView>

        <SelectModal
          visible={bProvinceOpen}
          title="Province"
          options={PROVINCES}
          value={bProvince}
          onSelect={setBProvince}
          onClose={() => setBProvinceOpen(false)}
        />
      </SafeAreaView>
    );
  }

  // ── MANAGE BILLING ADDRESS ────────────────────────────────────
  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
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
            style={[styles.continueBtn, saving && { opacity: 0.7 }]}
            onPress={handleContinue}
            disabled={saving}
          >
            <Text style={styles.continueBtnText}>
              {saving ? "Saving..." : "Continue"}
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
    backgroundColor: Colors.white,
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
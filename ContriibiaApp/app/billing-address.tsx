import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SelectModal } from "../components/SelectModal";
import { Colors } from "../constants/Colors";

type Screen =
  | "manage"
  | "edit-personal"
  | "edit-business"
  | "success-personal"
  | "success-business";

const PROVINCES = [
  "AB",
  "BC",
  "MB",
  "NB",
  "NL",
  "NS",
  "NT",
  "NU",
  "ON",
  "PE",
  "QC",
  "SK",
  "YT",
];

function InputField({
  label,
  value,
  onChange,
  placeholder,
  optional,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  optional?: boolean;
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>
        {label}{" "}
        {optional ? (
          <Text style={styles.optional}>(optional)</Text>
        ) : (
          <Text style={styles.required}>*</Text>
        )}
      </Text>
      <View style={styles.inputWrap}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder ?? ""}
          placeholderTextColor={Colors.textPlaceholder}
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={() => onChange("")}>
            <MaterialIcons name="close" size={18} color={Colors.textLight} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

export default function BillingAddressScreen() {
  const [screen, setScreen] = useState<Screen>("manage");

  // Personal address form
  const [pAddr1, setPAddr1] = useState("");
  const [pAddr2, setPAddr2] = useState("");
  const [pCity, setPCity] = useState("");
  const [pProvince, setPProvince] = useState("");
  const [pPostal, setPPostal] = useState("");
  const [pProvinceOpen, setPProvinceOpen] = useState(false);

  // Business address form
  const [bAddr1, setBAddr1] = useState("");
  const [bAddr2, setBAddr2] = useState("");
  const [bCity, setBCity] = useState("");
  const [bProvince, setBProvince] = useState("");
  const [bPostal, setBPostal] = useState("");
  const [bProvinceOpen, setBProvinceOpen] = useState(false);

  // Track what changed for success message
  const [changedField, setChangedField] = useState("");

  const personalComplete =
    pAddr1.trim() && pCity.trim() && pProvince && pPostal.trim();
  const businessComplete =
    bAddr1.trim() && bCity.trim() && bProvince && bPostal.trim();

  const handleSavePersonal = () => {
    setChangedField(
      pPostal.trim()
        ? `Your Postal code has been changed to ${pPostal.trim()}`
        : "Your personal address has been updated.",
    );
    setScreen("success-personal");
  };

  const handleSaveBusiness = () => {
    setChangedField(
      bAddr1.trim()
        ? `Your Address Line 1 has been changed to ${bAddr1.trim()}`
        : "Your business address has been updated.",
    );
    setScreen("success-business");
  };

  function Header({ title, onBack }: { title: string; onBack: () => void }) {
    return (
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={styles.headerIcons}>
          <MaterialIcons
            name="chat-bubble-outline"
            size={22}
            color={Colors.textDark}
          />
          <MaterialIcons
            name="notifications-none"
            size={22}
            color={Colors.textDark}
          />
        </View>
      </View>
    );
  }

  // ── SUCCESS PERSONAL ─────────────────────────────────────────
  if (screen === "success-personal") {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <Header
          title="Edit Billing Address"
          onBack={() => setScreen("manage")}
        />
        <View style={styles.successBanner}>
          <Text style={styles.successBannerText}>
            Personal Address updated!
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
              !personalComplete && styles.saveBtnDisabled,
            ]}
            onPress={handleSavePersonal}
            disabled={!personalComplete}
          >
            <Text style={styles.saveBtnText}>Save changes</Text>
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
              !businessComplete && styles.saveBtnDisabled,
            ]}
            onPress={handleSaveBusiness}
            disabled={!businessComplete}
          >
            <Text style={styles.saveBtnText}>Save changes</Text>
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
      <Header title="Edit Billing Address" onBack={() => router.back()} />
      <View style={styles.manageBody}>
        <Text style={styles.manageTitle}>Manage Billing Address</Text>
        <TouchableOpacity
          style={styles.manageBtn}
          onPress={() => setScreen("edit-personal")}
        >
          <Text style={styles.manageBtnText}>Edit Personal Address</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.manageBtn, styles.manageBtnOutline]}
          onPress={() => setScreen("edit-business")}
        >
          <Text style={[styles.manageBtnText, styles.manageBtnOutlineText]}>
            Edit Business Address
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: { fontSize: 17, fontWeight: "700", color: Colors.textDark },
  headerIcons: { flexDirection: "row", gap: 10 },
  scroll: { padding: 20, paddingBottom: 40, gap: 2 },

  addressTypeTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textDark,
    marginBottom: 12,
  },
  fieldWrap: { marginBottom: 14 },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textDark,
    marginBottom: 4,
  },
  required: { color: Colors.error },
  optional: { color: Colors.textLight, fontWeight: "400" },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.white,
  },
  input: { flex: 1, height: 46, fontSize: 15, color: Colors.textDark },

  pickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 46,
    backgroundColor: Colors.white,
  },
  pickerText: { fontSize: 15, color: Colors.textDark },
  pickerPlaceholder: { fontSize: 15, color: Colors.textPlaceholder },

  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  saveBtnDisabled: { backgroundColor: Colors.disabled },
  saveBtnText: { color: Colors.white, fontWeight: "700", fontSize: 15 },
  cancelBtn: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  cancelBtnText: { color: Colors.textDark, fontWeight: "600", fontSize: 15 },

  // Manage screen
  manageBody: { flex: 1, padding: 20, gap: 16 },
  manageTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.textDark,
    marginBottom: 8,
  },
  manageBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
  },
  manageBtnText: { color: Colors.white, fontWeight: "700", fontSize: 15 },
  manageBtnOutline: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  manageBtnOutlineText: { color: Colors.primary },

  // Success screen
  successBanner: {
    backgroundColor: Colors.primaryLight,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  successBannerText: {
    color: Colors.primaryDark,
    fontWeight: "600",
    fontSize: 14,
  },
  successBody: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 14,
  },
  successCheck: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.success,
    alignItems: "center",
    justifyContent: "center",
  },
  successTitle: { fontSize: 24, fontWeight: "800", color: Colors.textDark },
  successDesc: {
    fontSize: 14,
    color: Colors.textMid,
    textAlign: "center",
    lineHeight: 20,
  },
  successBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: "center",
    width: "100%",
    marginTop: 8,
  },
  successBtnText: { color: Colors.white, fontWeight: "700", fontSize: 15 },
});

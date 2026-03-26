import { router } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../../components/Button";
import Input from "../../components/Input";
import ScreenHeader from "../../components/ScreenHeader";
import { SelectModal } from "../../components/SelectModal";
import { Colors } from "../../constants/Colors";
import mockData from "../../data/mockData.json";
import { addBankAccount } from "../../src/services/bankAccountService";

const BANK_NAMES = mockData.banks.map((b) => b.name);
const ACCOUNT_TYPES = ["Chequing", "Savings", "TFSA", "RRSP"];
const ACCOUNT_TYPE_MAP: Record<string, "SAVINGS" | "CURRENT"> = {
  Chequing: "CURRENT",
  Savings: "SAVINGS",
  TFSA: "SAVINGS",
  RRSP: "SAVINGS",
};

export default function BankManualScreen() {
  const [bankName, setBankName] = useState("");
  const [accountType, setAccountType] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [confirmAccount, setConfirmAccount] = useState("");
  const [routing, setRouting] = useState("");
  const [loading, setLoading] = useState(false);
  const [bankOpen, setBankOpen] = useState(false);
  const [typeOpen, setTypeOpen] = useState(false);

  const handleLink = async () => {
    if (
      !bankName ||
      !accountType ||
      !accountNumber ||
      !confirmAccount ||
      !routing
    ) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (accountNumber !== confirmAccount) {
      Alert.alert("Error", "Account numbers do not match");
      return;
    }

    setLoading(true);
    const res = await addBankAccount({
      bank_name: bankName,
      account_number: accountNumber,
      account_type: ACCOUNT_TYPE_MAP[accountType] ?? "SAVINGS",
    });
    setLoading(false);

    if (!res.success) {
      Alert.alert(
        "Error",
        res.error || "Failed to link bank account. Please try again.",
      );
      return;
    }

    router.push({
      pathname: "/(verification)/bank-success",
      params: { bankName },
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScreenHeader title="Identity Verification" />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.heading}>Bank account details</Text>
        <Text style={styles.subheading}>
          Please enter the details of your bank account.
        </Text>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Name of bank</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setBankOpen(true)}
          >
            <Text
              style={
                bankName ? styles.dropdownValue : styles.dropdownPlaceholder
              }
            >
              {bankName || "Select bank name"}
            </Text>
            <Text style={styles.dropdownArrow}>▾</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Account type</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setTypeOpen(true)}
          >
            <Text
              style={
                accountType ? styles.dropdownValue : styles.dropdownPlaceholder
              }
            >
              {accountType || "Select account type"}
            </Text>
            <Text style={styles.dropdownArrow}>▾</Text>
          </TouchableOpacity>
        </View>

        <Input
          label="Account number"
          placeholder="00000000000"
          value={accountNumber}
          onChangeText={setAccountNumber}
          keyboardType="numeric"
        />
        <Input
          label="Confirm account number"
          placeholder="00000000000"
          value={confirmAccount}
          onChangeText={setConfirmAccount}
          keyboardType="numeric"
        />
        <Input
          label="Routing number"
          placeholder="111111111"
          value={routing}
          onChangeText={setRouting}
          keyboardType="numeric"
        />
      </ScrollView>

      <View style={styles.actions}>
        <Button
          label="Link bank account"
          onPress={handleLink}
          loading={loading}
        />
        <Button label="Back" variant="ghost" onPress={() => router.back()} />
      </View>

      <SelectModal
        visible={bankOpen}
        title="Select bank"
        options={BANK_NAMES}
        value={bankName}
        onSelect={setBankName}
        onClose={() => setBankOpen(false)}
      />
      <SelectModal
        visible={typeOpen}
        title="Account type"
        options={ACCOUNT_TYPES}
        value={accountType}
        onSelect={setAccountType}
        onClose={() => setTypeOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  scroll: { padding: 24, flexGrow: 1 },
  heading: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.textDark,
    marginBottom: 4,
  },
  subheading: { fontSize: 13, color: Colors.textMid, marginBottom: 20 },
  field: { marginBottom: 14 },
  fieldLabel: {
    fontSize: 14,
    color: Colors.textDark,
    marginBottom: 6,
    fontWeight: "500",
  },
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
  dropdownValue: { flex: 1, fontSize: 15, color: Colors.textDark },
  dropdownPlaceholder: { flex: 1, fontSize: 15, color: Colors.textPlaceholder },
  dropdownArrow: { color: Colors.textLight, fontSize: 12 },
  actions: { padding: 24, gap: 8 },
});

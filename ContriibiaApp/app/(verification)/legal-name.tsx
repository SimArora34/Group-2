import { router } from "expo-router";
import React, { useEffect, useState } from "react";
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
import {
  getCurrentProfile,
  saveVerificationInfo,
} from "../../src/services/profileService";

const YEARS = Array.from({ length: 100 }, (_, i) =>
  String(new Date().getFullYear() - i),
);
const YEAR_OPTIONS = YEARS;
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const DAYS = Array.from({ length: 31 }, (_, i) =>
  String(i + 1).padStart(2, "0"),
);
const GENDERS = ["Male", "Female"];

function DropdownButton({
  value,
  placeholder,
  onPress,
}: {
  value: string;
  placeholder: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.dropdown}>
      <Text style={value ? styles.dropdownValue : styles.dropdownPlaceholder}>
        {value || placeholder}
      </Text>
      <Text style={styles.dropdownArrow}>▾</Text>
    </TouchableOpacity>
  );
}

export default function LegalNameScreen() {
  const [legalName, setLegalName] = useState("");
  const [differentName, setDifferentName] = useState(false);
  const [actualName, setActualName] = useState("");
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [gender, setGender] = useState("");
  const [yearOpen, setYearOpen] = useState(false);
  const [monthOpen, setMonthOpen] = useState(false);
  const [dayOpen, setDayOpen] = useState(false);
  const [genderOpen, setGenderOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCurrentProfile().then((res) => {
      if (res.success && res.data?.full_name) {
        setLegalName(res.data.full_name);
      }
    });
  }, []);

  const handleContinue = async () => {
    if ((!differentName && !legalName) || (differentName && !actualName)) {
      Alert.alert("Error", "Please enter your legal name");
      return;
    }

    if (!year || !month || !day) {
      Alert.alert("Error", "Please enter your date of birth");
      return;
    }

    setLoading(true);
    const nameToSave = differentName ? actualName : legalName;
    const dob = `${year}-${month}-${day}`;

    const res = await saveVerificationInfo({
      legal_name: nameToSave,
      date_of_birth: dob,
      ...(gender ? { gender } : {}),
    });
    setLoading(false);

    if (!res.success) {
      Alert.alert("Error", res.error || "Failed to save. Please try again.");
      return;
    }

    router.push("/(verification)/address");
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScreenHeader title="Identity Verification" />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.sectionTitle}>Legal name</Text>
        <Text style={styles.sectionDesc}>
          In order to verify your identity, we require your legal name as it
          appears on your official documents.
        </Text>

        <Text style={styles.fieldLabel}>The name you entered is:</Text>
        <Input
          value={legalName}
          onChangeText={setLegalName}
          editable={differentName}
          containerStyle={styles.nameInput}
        />

        <TouchableOpacity
          style={styles.checkRow}
          onPress={() => setDifferentName((v) => !v)}
        >
          <View
            style={[styles.checkbox, differentName && styles.checkboxChecked]}
          >
            {differentName && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkLabel}>
            My legal name is different than above.
          </Text>
        </TouchableOpacity>

        {differentName && (
          <Input
            label="Legal name"
            placeholder="Enter your legal name"
            value={actualName}
            onChangeText={setActualName}
          />
        )}

        <Text style={styles.sectionTitle}>Date of birth</Text>

        <View style={styles.dobRow}>
          <View style={styles.dobField}>
            <Text style={styles.dobLabel}>Year</Text>
            <DropdownButton
              value={year}
              placeholder="YYYY"
              onPress={() => setYearOpen(true)}
            />
          </View>

          <View style={styles.dobField}>
            <Text style={styles.dobLabel}>Month</Text>
            <DropdownButton
              value={month}
              placeholder="MM"
              onPress={() => setMonthOpen(true)}
            />
          </View>

          <View style={styles.dobField}>
            <Text style={styles.dobLabel}>Day</Text>
            <DropdownButton
              value={day}
              placeholder="DD"
              onPress={() => setDayOpen(true)}
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Gender</Text>
        <DropdownButton
          value={gender}
          placeholder="Select gender"
          onPress={() => setGenderOpen(true)}
        />
      </ScrollView>

      <View style={styles.actions}>
        <Button label="Continue" onPress={handleContinue} loading={loading} />
        <Button
          label="Save and exit"
          variant="ghost"
          onPress={() => router.replace("/(tabs)")}
        />
      </View>

      <SelectModal
        visible={yearOpen}
        title="Year"
        options={YEAR_OPTIONS}
        value={year}
        onSelect={setYear}
        onClose={() => setYearOpen(false)}
      />
      <SelectModal
        visible={monthOpen}
        title="Month"
        options={MONTHS}
        value={month}
        onSelect={setMonth}
        onClose={() => setMonthOpen(false)}
      />
      <SelectModal
        visible={dayOpen}
        title="Day"
        options={DAYS}
        value={day}
        onSelect={setDay}
        onClose={() => setDayOpen(false)}
      />
      <SelectModal
        visible={genderOpen}
        title="Gender"
        options={GENDERS}
        value={gender}
        onSelect={setGender}
        onClose={() => setGenderOpen(false)}
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
    marginBottom: 8,
    marginTop: 4,
  },
  sectionDesc: {
    fontSize: 13,
    color: Colors.textMid,
    lineHeight: 20,
    marginBottom: 16,
  },
  fieldLabel: { fontSize: 13, color: Colors.textMid, marginBottom: 8 },
  nameInput: { marginBottom: 10 },
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkmark: { color: Colors.white, fontSize: 12, fontWeight: "700" },
  checkLabel: { flex: 1, fontSize: 14, color: Colors.textMid },
  dobRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  dobField: { flex: 1 },
  dobLabel: {
    fontSize: 12,
    color: Colors.textMid,
    marginBottom: 6,
    fontWeight: "500",
  },
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 12,
    backgroundColor: Colors.white,
  },
  dropdownValue: { flex: 1, fontSize: 14, color: Colors.textDark },
  dropdownPlaceholder: { flex: 1, fontSize: 14, color: Colors.textPlaceholder },
  dropdownArrow: { color: Colors.textLight, fontSize: 12 },
  actions: { padding: 24, gap: 8 },
});

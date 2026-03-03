import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, FlatList, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/Button';
import Input from '../../components/Input';
import ScreenHeader from '../../components/ScreenHeader';
import { Colors } from '../../constants/Colors';
import { useUser } from '../../context/UserContext';

const YEARS = Array.from({ length: 100 }, (_, i) => String(new Date().getFullYear() - i));
const MONTHS = [
  { label: '01 - January', value: '01' },
  { label: '02 - February', value: '02' },
  { label: '03 - March', value: '03' },
  { label: '04 - April', value: '04' },
  { label: '05 - May', value: '05' },
  { label: '06 - June', value: '06' },
  { label: '07 - July', value: '07' },
  { label: '08 - August', value: '08' },
  { label: '09 - September', value: '09' },
  { label: '10 - October', value: '10' },
  { label: '11 - November', value: '11' },
  { label: '12 - December', value: '12' },
];
const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));
const GENDERS = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];

function ComboDropdown({
  label,
  value,
  placeholder,
  items,
  onSelect,
  onChangeText,
  keyboardType,
}: {
  label: string;
  value: string;
  placeholder: string;
  items: string[];
  onSelect: (val: string) => void;
  onChangeText: (val: string) => void;
  keyboardType?: 'default' | 'numeric';
}) {
  const [open, setOpen] = useState(false);

  const filtered = value
    ? items.filter((i) => i.startsWith(value))
    : items;

  return (
    <View style={styles.comboContainer}>
      <Text style={styles.dobLabel}>{label}</Text>
      <View style={styles.comboInputRow}>
        <TextInput
          style={styles.comboInput}
          value={value}
          placeholder={placeholder}
          placeholderTextColor={Colors.textPlaceholder}
          keyboardType={keyboardType ?? 'default'}
          onChangeText={(text) => {
            onChangeText(text);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
        />
        <TouchableOpacity onPress={() => setOpen((v) => !v)} style={styles.comboArrowBtn}>
          <Text style={styles.dropdownArrow}>{open ? '▴' : '▾'}</Text>
        </TouchableOpacity>
      </View>
      {open && filtered.length > 0 && (
        <View style={styles.comboList}>
          <FlatList
            data={filtered.slice(0, 6)}
            keyExtractor={(item) => item}
            keyboardShouldPersistTaps="always"
            nestedScrollEnabled
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.comboItem}
                onPress={() => {
                  onSelect(item);
                  setOpen(false);
                }}
              >
                <Text style={styles.comboItemText}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
}

function MonthDropdown({
  value,
  onSelect,
}: {
  value: string;
  onSelect: (val: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);

  const filtered = query
    ? MONTHS.filter((m) => m.label.toLowerCase().includes(query.toLowerCase()) || m.value.startsWith(query))
    : MONTHS;

  const displayLabel = MONTHS.find((m) => m.value === value)?.label ?? value;

  return (
    <View style={styles.comboContainer}>
      <Text style={styles.dobLabel}>Month</Text>
      <View style={styles.comboInputRow}>
        <TextInput
          style={styles.comboInput}
          value={open ? query : displayLabel}
          placeholder="MM"
          placeholderTextColor={Colors.textPlaceholder}
          keyboardType="default"
          onChangeText={(text) => {
            setQuery(text);
            setOpen(true);
          }}
          onFocus={() => {
            setQuery('');
            setOpen(true);
          }}
        />
        <TouchableOpacity onPress={() => setOpen((v) => !v)} style={styles.comboArrowBtn}>
          <Text style={styles.dropdownArrow}>{open ? '▴' : '▾'}</Text>
        </TouchableOpacity>
      </View>
      {open && filtered.length > 0 && (
        <View style={styles.comboList}>
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.value}
            keyboardShouldPersistTaps="always"
            nestedScrollEnabled
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.comboItem}
                onPress={() => {
                  onSelect(item.value);
                  setQuery(item.label);
                  setOpen(false);
                }}
              >
                <Text style={styles.comboItemText}>{item.label}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
}

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
  const { user } = useUser();
  const [legalName, setLegalName] = useState(user.name || 'Jamie Taiwo');
  const [differentName, setDifferentName] = useState(false);
  const [actualName, setActualName] = useState('');
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [gender, setGender] = useState('');

  const handleContinue = () => {
    if ((!differentName && !legalName) || (differentName && !actualName)) {
      Alert.alert('Error', 'Please enter your legal name');
      return;
    }
    if (!year || !month || !day) {
      Alert.alert('Error', 'Please enter your date of birth');
      return;
    }
    router.push('/(verification)/address');
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScreenHeader title="Identity Verification" />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.sectionTitle}>Legal name</Text>
        <Text style={styles.sectionDesc}>
          In order to verify your identity, we require your legal name as it appears on your
          official documents.
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
          <View style={[styles.checkbox, differentName && styles.checkboxChecked]}>
            {differentName && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkLabel}>My legal name is different than above.</Text>
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
          <ComboDropdown
            label="Year"
            value={year}
            placeholder="YYYY"
            items={YEARS}
            onSelect={setYear}
            onChangeText={setYear}
            keyboardType="numeric"
          />
          <MonthDropdown value={month} onSelect={setMonth} />
          <ComboDropdown
            label="Day"
            value={day}
            placeholder="DD"
            items={DAYS}
            onSelect={setDay}
            onChangeText={setDay}
            keyboardType="numeric"
          />
        </View>

        <Text style={styles.sectionTitle}>Gender</Text>
        <DropdownButton
          value={gender}
          placeholder="Select gender"
          onPress={() =>
            Alert.alert(
              'Gender',
              '',
              GENDERS.map((g) => ({ text: g, onPress: () => setGender(g) }))
            )
          }
        />
      </ScrollView>
      <View style={styles.actions}>
        <Button label="Continue" onPress={handleContinue} />
        <Button label="Save and exit" variant="ghost" onPress={() => router.replace('/(tabs)')} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  scroll: { padding: 24, flexGrow: 1 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.textDark, marginBottom: 8, marginTop: 4 },
  sectionDesc: { fontSize: 13, color: Colors.textMid, lineHeight: 20, marginBottom: 16 },
  fieldLabel: { fontSize: 13, color: Colors.textMid, marginBottom: 8 },
  nameInput: { marginBottom: 10 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  checkbox: {
    width: 20, height: 20, borderWidth: 1.5, borderColor: Colors.border,
    borderRadius: 3, alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  checkboxChecked: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  checkmark: { color: Colors.white, fontSize: 12, fontWeight: '700' },
  checkLabel: { flex: 1, fontSize: 14, color: Colors.textMid },
  dobRow: { flexDirection: 'row', gap: 10, marginBottom: 20, alignItems: 'flex-start' },
  dobField: { flex: 1 },
  dobLabel: { fontSize: 12, color: Colors.textMid, marginBottom: 6, fontWeight: '500' },
  comboContainer: { flex: 1, position: 'relative', zIndex: 10 },
  comboInputRow: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: Colors.border,
    borderRadius: 6, backgroundColor: Colors.white, overflow: 'hidden',
  },
  comboInput: {
    flex: 1, fontSize: 14, color: Colors.textDark,
    paddingHorizontal: 10, paddingVertical: 12,
  },
  comboArrowBtn: { paddingHorizontal: 10, paddingVertical: 12 },
  comboList: {
    position: 'absolute', top: '100%', left: 0, right: 0,
    backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border,
    borderRadius: 6, zIndex: 999, maxHeight: 180,
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 4,
  },
  comboItem: { paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border },
  comboItemText: { fontSize: 13, color: Colors.textDark },
  dropdown: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: Colors.border,
    borderRadius: 6, paddingHorizontal: 10, paddingVertical: 12, backgroundColor: Colors.white,
  },
  dropdownValue: { flex: 1, fontSize: 14, color: Colors.textDark },
  dropdownPlaceholder: { flex: 1, fontSize: 14, color: Colors.textPlaceholder },
  dropdownArrow: { color: Colors.textLight, fontSize: 12 },
  actions: { padding: 24, gap: 8 },
});

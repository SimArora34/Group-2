import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/Button';
import Input from '../../components/Input';
import ScreenHeader from '../../components/ScreenHeader';
import { Colors } from '../../constants/Colors';
import mockData from '../../data/mockData.json';

function ProvinceDropdown({ value, onSelect }: { value: string; onSelect: (v: string) => void }) {
  return (
    <TouchableOpacity
      style={styles.dropdown}
      onPress={() =>
        Alert.alert(
          'Province / Territory',
          '',
          mockData.provinces.map((p) => ({ text: p, onPress: () => onSelect(p) }))
        )
      }
    >
      <Text style={value ? styles.dropdownValue : styles.dropdownPlaceholder}>
        {value || 'Text example'}
      </Text>
      <Text style={styles.dropdownArrow}>▾</Text>
    </TouchableOpacity>
  );
}

export default function AddressScreen() {
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [postal, setPostal] = useState('');

  const handleContinue = () => {
    if (!line1 || !city || !province || !postal) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    router.push('/(verification)/document-select');
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScreenHeader title="Identity Verification" />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
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

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>
            Province <Text style={styles.required}>*</Text>
          </Text>
          <ProvinceDropdown value={province} onSelect={setProvince} />
        </View>

        <Input
          label="Postal code"
          placeholder="Text example"
          value={postal}
          onChangeText={setPostal}
          autoCapitalize="characters"
          required
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
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.textDark, marginBottom: 20 },
  field: { marginBottom: 14 },
  fieldLabel: { fontSize: 14, color: Colors.textDark, marginBottom: 6, fontWeight: '500' },
  required: { color: Colors.error },
  dropdown: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: Colors.border,
    borderRadius: 6, paddingHorizontal: 12, height: 48, backgroundColor: Colors.white,
  },
  dropdownValue: { flex: 1, fontSize: 15, color: Colors.textDark },
  dropdownPlaceholder: { flex: 1, fontSize: 15, color: Colors.textPlaceholder },
  dropdownArrow: { color: Colors.textLight, fontSize: 12 },
  actions: { padding: 24, gap: 8 },
});

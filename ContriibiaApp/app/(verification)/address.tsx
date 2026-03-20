import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/Button';
import Input from '../../components/Input';
import ScreenHeader from '../../components/ScreenHeader';
import { Colors } from '../../constants/Colors';
import mockData from '../../data/mockData.json';

function ProvinceDropdown({ value, onSelect }: { value: string; onSelect: (v: string) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TouchableOpacity style={styles.dropdown} onPress={() => setOpen(true)}>
        <Text style={value ? styles.dropdownValue : styles.dropdownPlaceholder}>
          {value || 'Select a province / territory'}
        </Text>
        <Text style={styles.dropdownArrow}>{open ? '▴' : '▾'}</Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableWithoutFeedback onPress={() => setOpen(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalSheet}>
                <Text style={styles.modalTitle}>Province / Territory</Text>
                <FlatList
                  data={mockData.provinces}
                  keyExtractor={(item) => item}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[styles.modalItem, item === value && styles.modalItemSelected]}
                      onPress={() => {
                        onSelect(item);
                        setOpen(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.modalItemText,
                          item === value && styles.modalItemTextSelected,
                        ]}
                      >
                        {item}
                      </Text>
                      {item === value && <Text style={styles.modalItemCheck}>✓</Text>}
                    </TouchableOpacity>
                  )}
                  ItemSeparatorComponent={() => <View style={styles.separator} />}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}

export default function AddressScreen() {
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [postal, setPostal] = useState('');

  const POSTAL_REGEX = /^[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d$/;

  const handlePostalChange = (text: string) => {
    // Strip everything except alphanumeric
    const clean = text.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 6);
    // Auto-insert space after 3rd character
    const formatted = clean.length > 3 ? `${clean.slice(0, 3)} ${clean.slice(3)}` : clean;
    setPostal(formatted);
  };

  const handleContinue = () => {
    if (!line1 || !city || !province || !postal) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    if (!POSTAL_REGEX.test(postal)) {
      Alert.alert('Invalid Postal Code', 'Please enter a valid Canadian postal code (e.g. A1A 1A1).');
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
          placeholder="A1A 1A1"
          value={postal}
          onChangeText={handlePostalChange}
          autoCapitalize="characters"
          keyboardType="default"
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalSheet: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    width: '100%',
    maxHeight: 420,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textDark,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  modalItemSelected: { backgroundColor: Colors.primaryLight },
  modalItemText: { flex: 1, fontSize: 15, color: Colors.textDark },
  modalItemTextSelected: { color: Colors.primary, fontWeight: '600' },
  modalItemCheck: { color: Colors.primary, fontSize: 16, fontWeight: '700' },
  separator: { height: 1, backgroundColor: Colors.border, marginHorizontal: 16 },
});

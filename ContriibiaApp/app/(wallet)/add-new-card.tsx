import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { addCard, updateCard } from '../../src/services/cardService';

export default function AddNewCardScreen() {
  const { editId, editName, editExpiry } = useLocalSearchParams<{
    editId?: string;
    editName?: string;
    editExpiry?: string;
  }>();
  const isEditing = !!editId;

  const [cardNumber, setCardNumber] = useState('');
  const [nameOnCard, setNameOnCard] = useState(editName ?? '');
  const [expiry, setExpiry] = useState(editExpiry ?? '');
  const [cvv, setCvv] = useState('');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [country, setCountry] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const maskedLast4 = cardNumber.replace(/\s/g, '').slice(-4) || '----';

  const formatCardNumber = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  };

  const handleSave = async () => {
    if (!isEditing && (!cardNumber.trim() || !cvv.trim())) {
      setError('Please fill in all card details.');
      return;
    }
    if (!nameOnCard.trim() || !expiry.trim()) {
      setError('Please fill in all card details.');
      return;
    }
    if (!isEditing && (!address1.trim() || !city.trim() || !province.trim() || !country.trim())) {
      setError('Please fill in all billing address fields.');
      return;
    }
    setError('');
    setLoading(true);

    let res;
    if (isEditing) {
      res = await updateCard(editId!, { holder_name: nameOnCard.trim(), expiry: expiry.trim() });
    } else {
      const last4 = cardNumber.replace(/\s/g, '').slice(-4);
      res = await addCard({
        holder_name: nameOnCard.trim(),
        last4,
        expiry: expiry.trim(),
        type: 'personal',
        billing_address_1: address1.trim(),
        billing_address_2: address2.trim() || undefined,
        billing_city: city.trim(),
        billing_province: province.trim(),
        billing_country: country.trim(),
      });
    }

    setLoading(false);
    if (!res.success) {
      setError(res.error || 'Failed to save card.');
      return;
    }
    setSuccess(true);
  };

  if (success) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.successWrap}>
          <View style={styles.banner}>
            <Text style={styles.bannerText}>New Card Added!</Text>
          </View>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark" size={44} color={Colors.white} />
          </View>
          <Text style={styles.congratsTitle}>Congratulations!</Text>
          <Text style={styles.congratsDesc}>
            Your new bank card{' '}
            <Text style={styles.bold}>**** **** **** {maskedLast4}</Text>
            {' '}has been successfully added.
          </Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => router.replace('/(wallet)/view-my-cards' as any)}>
            <Text style={styles.primaryBtnText}>View My Cards</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.outlineBtn} onPress={() => router.replace('/(tabs)/wallet' as any)}>
            <Text style={styles.outlineBtnText}>Go Back to App Wallet</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          {!!error && <View style={styles.errorBanner}><Text style={styles.errorText}>{error}</Text></View>}

          <Text style={styles.sectionLabel}>Card Number</Text>
          <TextInput
            style={styles.input}
            value={cardNumber}
            onChangeText={(v) => setCardNumber(formatCardNumber(v))}
            placeholder="Card Number"
            placeholderTextColor={Colors.textPlaceholder}
            keyboardType="number-pad"
            maxLength={19}
          />

          <Text style={styles.sectionLabel}>Name on the Card</Text>
          <TextInput
            style={styles.input}
            value={nameOnCard}
            onChangeText={setNameOnCard}
            placeholder="First and Last Name"
            placeholderTextColor={Colors.textPlaceholder}
          />

          <View style={styles.row}>
            <View style={styles.halfField}>
              <Text style={styles.sectionLabel}>Expiry Date</Text>
              <TextInput
                style={styles.input}
                value={expiry}
                onChangeText={(v) => setExpiry(formatExpiry(v))}
                placeholder="MM/YY"
                placeholderTextColor={Colors.textPlaceholder}
                keyboardType="number-pad"
                maxLength={5}
              />
            </View>
            <View style={styles.halfField}>
              <Text style={styles.sectionLabel}>CVV</Text>
              <TextInput
                style={styles.input}
                value={cvv}
                onChangeText={setCvv}
                placeholder="3 digit CVV"
                placeholderTextColor={Colors.textPlaceholder}
                keyboardType="number-pad"
                maxLength={4}
                secureTextEntry
              />
            </View>
          </View>

          <Text style={styles.sectionHeader}>Billing Address</Text>

          <Text style={styles.sectionLabel}>Address Line 1 <Text style={styles.req}>(required)</Text></Text>
          <TextInput style={styles.input} value={address1} onChangeText={setAddress1} placeholder="Text example" placeholderTextColor={Colors.textPlaceholder} />

          <Text style={styles.sectionLabel}>Address Line 2</Text>
          <TextInput style={styles.input} value={address2} onChangeText={setAddress2} placeholder="Text example" placeholderTextColor={Colors.textPlaceholder} />

          <Text style={styles.sectionLabel}>City <Text style={styles.req}>(required)</Text></Text>
          <TextInput style={styles.input} value={city} onChangeText={setCity} placeholder="Text example" placeholderTextColor={Colors.textPlaceholder} />

          <Text style={styles.sectionLabel}>Province <Text style={styles.req}>(required)</Text></Text>
          <TextInput style={styles.input} value={province} onChangeText={setProvince} placeholder="Text example" placeholderTextColor={Colors.textPlaceholder} />

          <Text style={styles.sectionLabel}>Country <Text style={styles.req}>(required)</Text></Text>
          <TextInput style={styles.input} value={country} onChangeText={setCountry} placeholder="Text example" placeholderTextColor={Colors.textPlaceholder} />

          <TouchableOpacity
            style={[styles.saveBtn, loading && { opacity: 0.6 }]}
            onPress={handleSave}
            disabled={loading}
          >
            <Text style={styles.saveBtnText}>{loading ? 'Saving...' : 'Save Card'}</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 20, gap: 8 },
  errorBanner: { backgroundColor: '#FEE2E2', borderRadius: 8, padding: 12, marginBottom: 4 },
  errorText: { color: '#DC2626', fontSize: 13 },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: Colors.textDark, marginTop: 4 },
  sectionHeader: { fontSize: 16, fontWeight: '700', color: Colors.textDark, marginTop: 12, marginBottom: 4 },
  req: { color: Colors.textLight, fontWeight: '400' },
  input: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: Colors.textDark,
    backgroundColor: Colors.white,
  },
  row: { flexDirection: 'row', gap: 12 },
  halfField: { flex: 1, gap: 4 },
  saveBtn: { backgroundColor: Colors.primary, borderRadius: 10, paddingVertical: 16, alignItems: 'center', marginTop: 16 },
  saveBtnText: { color: Colors.white, fontWeight: '700', fontSize: 16 },
  // Success state
  successWrap: { flex: 1, padding: 20, alignItems: 'center', gap: 20 },
  banner: { backgroundColor: Colors.primary, width: '100%', borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  bannerText: { color: Colors.white, fontWeight: '700', fontSize: 16 },
  successIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  congratsTitle: { fontSize: 24, fontWeight: '800', color: Colors.textDark },
  congratsDesc: { fontSize: 14, color: Colors.textMid, textAlign: 'center', lineHeight: 22 },
  bold: { fontWeight: '700', color: Colors.textDark },
  primaryBtn: { backgroundColor: Colors.primary, borderRadius: 10, paddingVertical: 16, width: '100%', alignItems: 'center' },
  primaryBtnText: { color: Colors.white, fontWeight: '700', fontSize: 16 },
  outlineBtn: { borderWidth: 1.5, borderColor: Colors.primary, borderRadius: 10, paddingVertical: 14, width: '100%', alignItems: 'center' },
  outlineBtnText: { color: Colors.primary, fontWeight: '600', fontSize: 15 },
});

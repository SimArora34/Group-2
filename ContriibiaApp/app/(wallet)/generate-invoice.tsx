import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';

export default function GenerateInvoiceScreen() {
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!clientName.trim() || !clientEmail.trim() || !description.trim()) {
      Alert.alert('Missing Fields', 'Please fill in all fields.');
      return;
    }
    const parsed = parseFloat(amount);
    if (!parsed || parsed <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }

    setLoading(true);
    // TODO: call generateInvoice service when implemented
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    Alert.alert('Coming Soon', 'Invoice generation will be available once the business wallet is fully set up.');
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.iconWrap}>
            <Ionicons name="document-text" size={36} color={Colors.primary} />
          </View>
          <Text style={styles.title}>Generate Invoice</Text>
          <Text style={styles.subtitle}>Create and send invoices to your clients</Text>

          {[
            { label: 'Client Name', value: clientName, setter: setClientName, placeholder: 'John Smith', type: 'default' as const },
            { label: 'Client Email', value: clientEmail, setter: setClientEmail, placeholder: 'john@example.com', type: 'email-address' as const },
            { label: 'Description / Service', value: description, setter: setDescription, placeholder: 'Web design services', type: 'default' as const },
          ].map(({ label, value, setter, placeholder, type }) => (
            <View key={label} style={styles.field}>
              <Text style={styles.label}>{label}</Text>
              <TextInput
                style={styles.input}
                value={value}
                onChangeText={setter}
                placeholder={placeholder}
                placeholderTextColor={Colors.textPlaceholder}
                keyboardType={type}
                autoCapitalize={type === 'email-address' ? 'none' : 'words'}
              />
            </View>
          ))}

          <View style={styles.field}>
            <Text style={styles.label}>Amount ($)</Text>
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              placeholderTextColor={Colors.textPlaceholder}
              keyboardType="decimal-pad"
            />
          </View>

          <TouchableOpacity
            style={[styles.generateBtn, loading && styles.generateBtnDisabled]}
            onPress={handleGenerate}
            disabled={loading}
          >
            <Ionicons name="document-text-outline" size={18} color={Colors.white} />
            <Text style={styles.generateBtnText}>
              {loading ? 'Generating...' : 'Generate Invoice'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    padding: 24,
    gap: 16,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textDark,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textMid,
    textAlign: 'center',
    marginBottom: 8,
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textDark,
  },
  input: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.textDark,
  },
  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 8,
  },
  generateBtnDisabled: {
    opacity: 0.6,
  },
  generateBtnText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 16,
  },
});

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
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
import { getCurrentProfile } from '../../src/services/profileService';

type Step = 'form' | 'preview';

export default function GenerateInvoiceScreen() {
  const [step, setStep] = useState<Step>('form');
  const [senderName, setSenderName] = useState('');
  const [clientName, setClientName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [amount, setAmount] = useState('');
  const [taxPct, setTaxPct] = useState('13');
  const [error, setError] = useState('');

  useEffect(() => {
    getCurrentProfile().then((res) => {
      if (res.success && res.data?.full_name) setSenderName(res.data.full_name);
    });
  }, []);

  const parsedAmount = parseFloat(amount) || 0;
  const parsedTax = parseFloat(taxPct) || 0;
  const taxAmount = (parsedAmount * parsedTax) / 100;
  const total = parsedAmount + taxAmount;
  const invoiceNo = `INV-${new Date().getFullYear()}-01`;
  const today = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

  const handleGenerate = () => {
    if (!clientName.trim() || !companyName.trim() || !dueDate.trim()) {
      setError('Please fill in Client Name, Company Name, and Due Date.');
      return;
    }
    if (!parsedAmount || parsedAmount <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    setError('');
    setStep('preview');
  };

  if (step === 'preview') {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.previewTitle}>Invoice Preview</Text>
          <TouchableOpacity style={styles.downloadBtn}>
            <Ionicons name="download-outline" size={20} color={Colors.primary} />
          </TouchableOpacity>

          <View style={styles.invoiceDoc}>
            <View style={styles.invoiceHeader}>
              <Text style={styles.invoiceNo}>Invoice #{invoiceNo}</Text>
              <Text style={styles.invoiceDate}>Date: {today}</Text>
            </View>
            <View style={styles.invoiceParties}>
              <View style={styles.invoiceParty}>
                <Text style={styles.invoicePartyLabel}>To</Text>
                <Text style={styles.invoicePartyName}>{clientName}</Text>
                <Text style={styles.invoicePartyCompany}>{companyName}</Text>
              </View>
              <View style={styles.invoiceParty}>
                <Text style={styles.invoicePartyLabel}>From</Text>
                <Text style={styles.invoicePartyName}>{senderName || '—'}</Text>
                <Text style={styles.invoicePartyCompany}>Contribiia Wallet</Text>
              </View>
            </View>
            <View style={styles.invoiceDue}>
              <Text style={styles.invoiceDueText}>
                ${total.toFixed(2)} due on {dueDate}
              </Text>
            </View>
            <View style={styles.invoiceTable}>
              <View style={[styles.invoiceTableRow, styles.invoiceTableHead]}>
                <Text style={[styles.invoiceTableCell, styles.invoiceTableHeadText, { flex: 2 }]}>Service</Text>
                <Text style={[styles.invoiceTableCell, styles.invoiceTableHeadText]}>Qty</Text>
                <Text style={[styles.invoiceTableCell, styles.invoiceTableHeadText]}>Rate</Text>
                <Text style={[styles.invoiceTableCell, styles.invoiceTableHeadText]}>Total</Text>
              </View>
              <View style={styles.invoiceTableRow}>
                <Text style={[styles.invoiceTableCell, { flex: 2 }]}>Service</Text>
                <Text style={styles.invoiceTableCell}>1</Text>
                <Text style={styles.invoiceTableCell}>${parsedAmount.toFixed(2)}</Text>
                <Text style={styles.invoiceTableCell}>${parsedAmount.toFixed(2)}</Text>
              </View>
            </View>
            <View style={styles.invoiceSummary}>
              <View style={styles.invoiceSummaryRow}>
                <Text style={styles.invoiceSummaryKey}>Subtotal</Text>
                <Text style={styles.invoiceSummaryVal}>${parsedAmount.toFixed(2)}</Text>
              </View>
              <View style={styles.invoiceSummaryRow}>
                <Text style={styles.invoiceSummaryKey}>Tax ({taxPct}%)</Text>
                <Text style={styles.invoiceSummaryVal}>${taxAmount.toFixed(2)}</Text>
              </View>
              <View style={[styles.invoiceSummaryRow, styles.invoiceSummaryTotal]}>
                <Text style={styles.invoiceSummaryTotalKey}>Total</Text>
                <Text style={styles.invoiceSummaryTotalVal}>${total.toFixed(2)}</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.continueBtn} onPress={() => router.push('/(wallet)/invoice-send-user' as any)}>
            <Text style={styles.continueBtnText}>Continue</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backBtn} onPress={() => setStep('form')}>
            <Text style={styles.backBtnText}>Go back</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          {!!error && <View style={styles.errorBanner}><Text style={styles.errorText}>{error}</Text></View>}

          <Text style={styles.fieldLabel}>Client Name</Text>
          <TextInput style={styles.input} value={clientName} onChangeText={(v) => { setClientName(v); setError(''); }} placeholder="Receiver Name" placeholderTextColor={Colors.textPlaceholder} />

          <Text style={styles.fieldLabel}>Company Name</Text>
          <TextInput style={styles.input} value={companyName} onChangeText={(v) => { setCompanyName(v); setError(''); }} placeholder="Sender Name" placeholderTextColor={Colors.textPlaceholder} />

          <Text style={styles.fieldLabel}>Due Date</Text>
          <TextInput style={styles.input} value={dueDate} onChangeText={(v) => { setDueDate(v); setError(''); }} placeholder="MM/YY" placeholderTextColor={Colors.textPlaceholder} keyboardType="numbers-and-punctuation" />

          <View style={styles.amountRow}>
            <View style={styles.amountField}>
              <Text style={styles.fieldLabel}>Amount</Text>
              <TextInput
                style={styles.input}
                value={amount}
                onChangeText={(v) => { setAmount(v); setError(''); }}
                placeholder="$0.00"
                placeholderTextColor={Colors.textPlaceholder}
                keyboardType="decimal-pad"
              />
            </View>
            <View style={styles.taxField}>
              <Text style={styles.fieldLabel}>Tax %</Text>
              <View style={styles.taxInputWrap}>
                <TextInput
                  style={[styles.input, { paddingRight: 36 }]}
                  value={taxPct}
                  onChangeText={setTaxPct}
                  keyboardType="decimal-pad"
                  placeholderTextColor={Colors.textPlaceholder}
                />
                <TouchableOpacity style={styles.taxClear} onPress={() => setTaxPct('')}>
                  <Ionicons name="close-circle" size={18} color={Colors.textLight} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.generateBtn} onPress={handleGenerate}>
            <Text style={styles.generateBtnText}>Generate Invoice</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 20, gap: 10 },
  errorBanner: { backgroundColor: '#FEE2E2', borderRadius: 8, padding: 12 },
  errorText: { color: '#DC2626', fontSize: 13 },
  fieldLabel: { fontSize: 14, fontWeight: '600', color: Colors.textDark },
  input: {
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: 10,
    paddingHorizontal: 16, paddingVertical: 13, fontSize: 15, color: Colors.textDark,
  },
  amountRow: { flexDirection: 'row', gap: 12 },
  amountField: { flex: 1.5, gap: 6 },
  taxField: { flex: 1, gap: 6 },
  taxInputWrap: { position: 'relative' },
  taxClear: { position: 'absolute', right: 10, top: 14 },
  generateBtn: { backgroundColor: Colors.primary, borderRadius: 10, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  generateBtnText: { color: Colors.white, fontWeight: '700', fontSize: 16 },
  // Preview
  previewTitle: { fontSize: 20, fontWeight: '800', color: Colors.textDark, textAlign: 'center' },
  downloadBtn: { alignSelf: 'center', marginTop: -4 },
  invoiceDoc: {
    backgroundColor: Colors.white, borderRadius: 12, borderWidth: 1, borderColor: Colors.border,
    padding: 16, gap: 12,
  },
  invoiceHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  invoiceNo: { fontSize: 13, fontWeight: '700', color: Colors.textDark },
  invoiceDate: { fontSize: 12, color: Colors.textMid },
  invoiceParties: { flexDirection: 'row', gap: 16 },
  invoiceParty: { flex: 1, gap: 2 },
  invoicePartyLabel: { fontSize: 11, color: Colors.textLight, fontWeight: '600' },
  invoicePartyName: { fontSize: 13, fontWeight: '700', color: Colors.textDark },
  invoicePartyCompany: { fontSize: 12, color: Colors.textMid },
  invoiceDue: { backgroundColor: Colors.primaryLight, padding: 10, borderRadius: 8 },
  invoiceDueText: { fontSize: 13, fontWeight: '600', color: Colors.primary },
  invoiceTable: { borderWidth: 1, borderColor: Colors.border, borderRadius: 8, overflow: 'hidden' },
  invoiceTableRow: { flexDirection: 'row', paddingVertical: 8, paddingHorizontal: 8 },
  invoiceTableHead: { backgroundColor: Colors.surface },
  invoiceTableCell: { flex: 1, fontSize: 11, color: Colors.textDark, textAlign: 'center' },
  invoiceTableHeadText: { fontWeight: '700', color: Colors.textDark },
  invoiceSummary: { gap: 6 },
  invoiceSummaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  invoiceSummaryKey: { fontSize: 13, color: Colors.textMid },
  invoiceSummaryVal: { fontSize: 13, color: Colors.textDark },
  invoiceSummaryTotal: { borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 6, marginTop: 2 },
  invoiceSummaryTotalKey: { fontSize: 14, fontWeight: '700', color: Colors.textDark },
  invoiceSummaryTotalVal: { fontSize: 14, fontWeight: '700', color: Colors.primary },
  continueBtn: { backgroundColor: Colors.primary, borderRadius: 10, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  continueBtnText: { color: Colors.white, fontWeight: '700', fontSize: 16 },
  backBtn: { borderWidth: 1.5, borderColor: Colors.border, borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  backBtnText: { color: Colors.textMid, fontWeight: '600', fontSize: 15 },
});

import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/Button';
import ScreenHeader from '../../components/ScreenHeader';
import { Colors } from '../../constants/Colors';
import mockData from '../../data/mockData.json';

export default function DocumentSelectScreen() {
  const [selectedGovId, setSelectedGovId] = useState<string | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);

  const handleGovSelect = (id: string) => {
    setSelectedGovId(id);
  };

  const handleDocSelect = (id: string) => {
    setSelectedDoc(id);
  };

  const handleContinue = () => {
    if (!selectedGovId) {
      Alert.alert('Missing document', 'Please select a Government ID');
      return;
    }
    if (!selectedDoc) {
      Alert.alert('Missing document', 'Please select an Official Document');
      return;
    }
    router.push({
      pathname: '/(verification)/document-upload',
      params: { docType: selectedGovId, docLabel: mockData.governmentIds.find(d => d.id === selectedGovId)?.label || '' },
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScreenHeader title="Identity Verification" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.heading}>Document submission</Text>
        <Text style={styles.desc}>
          Choose the document type you would like to provide us. We are legally required to ask for
          two documents
        </Text>

        <Text style={styles.chooseLabel}>Choose:</Text>
        <Text style={styles.chooseItem}>
          1. <Text style={styles.bold}>One Government ID</Text> that include your name and address
        </Text>
        <Text style={styles.chooseItem}>
          2. <Text style={styles.bold}>One Other Official Document</Text> that include your name and
          date of birth
        </Text>

        <Text style={styles.sectionTitle}>Governmental or provincial ID</Text>
        {mockData.governmentIds.map((doc) => (
          <TouchableOpacity
            key={doc.id}
            style={[styles.docRow, selectedGovId === doc.id && styles.docRowSelected]}
            onPress={() => handleGovSelect(doc.id)}
          >
            <Text style={[styles.docLabel, selectedGovId === doc.id && styles.docLabelSelected]}>
              {doc.label}
            </Text>
            <Text style={[styles.docArrow, selectedGovId === doc.id && styles.docCheck]}>
              {selectedGovId === doc.id ? '✓' : '›'}
            </Text>
          </TouchableOpacity>
        ))}

        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Recent official documents</Text>
        {mockData.officialDocuments.map((doc) => (
          <TouchableOpacity
            key={doc.id}
            style={[styles.docRow, styles.docRowAccent, selectedDoc === doc.id && styles.docRowSelectedAccent]}
            onPress={() => handleDocSelect(doc.id)}
          >
            <Text style={[styles.docLabel, styles.docLabelAccent, selectedDoc === doc.id && styles.docLabelSelected]}>
              {doc.label}
            </Text>
            <Text style={[styles.docArrow, selectedDoc === doc.id && styles.docCheck]}>
              {selectedDoc === doc.id ? '✓' : '›'}
            </Text>
          </TouchableOpacity>
        ))}
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
  heading: { fontSize: 20, fontWeight: '700', color: Colors.textDark, marginBottom: 12 },
  desc: { fontSize: 13, color: Colors.textMid, lineHeight: 20, marginBottom: 16 },
  chooseLabel: { fontSize: 14, fontWeight: '600', color: Colors.textDark, marginBottom: 8 },
  chooseItem: { fontSize: 13, color: Colors.textMid, lineHeight: 20, marginBottom: 4 },
  bold: { fontWeight: '700', color: Colors.textDark },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.textDark, marginBottom: 10, marginTop: 8 },
  docRow: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: Colors.border,
    borderRadius: 6, paddingHorizontal: 14, paddingVertical: 14, marginBottom: 8, backgroundColor: Colors.white,
  },
  docRowSelected: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  docRowAccent: { borderColor: Colors.primary },
  docRowSelectedAccent: { backgroundColor: Colors.primaryLight },
  docLabel: { flex: 1, fontSize: 14, color: Colors.textDark },
  docLabelSelected: { fontWeight: '600', color: Colors.primary },
  docLabelAccent: { color: Colors.primary, fontWeight: '500' },
  docArrow: { fontSize: 18, color: Colors.primary },
  docCheck: { fontSize: 16, color: Colors.primary, fontWeight: '700' },
  actions: { padding: 24, gap: 8 },
});

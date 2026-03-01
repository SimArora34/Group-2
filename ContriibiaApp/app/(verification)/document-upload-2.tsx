import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/Button';
import ScreenHeader from '../../components/ScreenHeader';
import { Colors } from '../../constants/Colors';

type Phase = 'info' | 'camera' | 'preview';

export default function DocumentUpload2Screen() {
  const { firstDoc } = useLocalSearchParams<{ firstDoc: string }>();
  const [phase, setPhase] = useState<Phase>('info');

  if (phase === 'info') {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScreenHeader title="Identity Verification" />
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.heading}>Recent public utility bill</Text>
          <Text style={styles.subheading}>The bill must be:</Text>
          {['from within the last three months', 'contain your name', 'contain your address'].map((item) => (
            <Text key={item} style={styles.bullet}>
              • {item.includes('last three months')
                ? <><Text style={styles.bold}>from within the last three months</Text></>
                : item.includes('name')
                ? <>contain your <Text style={styles.bold}>name</Text></>
                : <>contain your <Text style={styles.bold}>address</Text></>}
            </Text>
          ))}

          <Text style={styles.subheading2}>Valid examples utility bills are:</Text>
          {['gas bill', 'electricity bill', 'telephone bill', 'mobile phone bill'].map((item) => (
            <Text key={item} style={styles.bullet}>• {item}</Text>
          ))}

          <Text style={styles.subheading2}>Tips:</Text>
          {['Lay your document so it lays flat', 'Make sure your picture shows the entire document'].map((tip) => (
            <Text key={tip} style={styles.bullet}>• {tip}</Text>
          ))}
        </ScrollView>
        <View style={styles.actions}>
          <Button label="Continue" onPress={() => setPhase('camera')} />
          <Button label="Save and exit" variant="ghost" onPress={() => router.replace('/(tabs)')} />
        </View>
      </SafeAreaView>
    );
  }

  if (phase === 'camera') {
    return (
      <View style={styles.cameraContainer}>
        <View style={styles.cameraBackground}>
          <Text style={styles.cameraHint}>Center your bill in the box.</Text>
          <View style={styles.scanBox}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
            <View style={styles.docPlaceholder}>
              <Text style={styles.docPlaceholderText}>📃</Text>
              <Text style={styles.docPlaceholderLabel}>[ Bill preview ]</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.captureBtn} onPress={() => setPhase('preview')} />
        </View>
      </View>
    );
  }

  // Preview phase
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScreenHeader title="Identity Verification" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.heading}>Recent public utility bill</Text>

        <View style={styles.docPreview}>
          <Text style={styles.docPreviewEmoji}>📃</Text>
          <Text style={styles.docPreviewText}>[ Utility Bill Image ]</Text>
        </View>

        <Text style={styles.uploadedMsg}>Your utility bill has been uploaded.</Text>
      </ScrollView>
      <View style={styles.actions}>
        <Button
          label="Continue"
          onPress={() => router.push('/(verification)/document-confirm')}
        />
        <Button label="Change document" variant="outline" onPress={() => setPhase('camera')} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  scroll: { padding: 24, flexGrow: 1 },
  heading: { fontSize: 20, fontWeight: '700', color: Colors.textDark, marginBottom: 16 },
  subheading: { fontSize: 14, color: Colors.textDark, fontWeight: '600', marginBottom: 8, marginTop: 4 },
  subheading2: { fontSize: 14, color: Colors.textDark, fontWeight: '600', marginBottom: 8, marginTop: 16 },
  bullet: { fontSize: 13, color: Colors.textMid, lineHeight: 22, marginLeft: 4 },
  bold: { fontWeight: '700', color: Colors.textDark },

  // Camera
  cameraContainer: { flex: 1, backgroundColor: '#1a1007' },
  cameraBackground: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 24 },
  cameraHint: { color: Colors.white, fontSize: 16, fontWeight: '600', textAlign: 'center', paddingHorizontal: 24 },
  scanBox: { width: 300, height: 220, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  corner: { position: 'absolute', width: 24, height: 24, borderColor: 'rgba(255,255,255,0.7)', borderStyle: 'dashed' },
  cornerTL: { top: 0, left: 0, borderTopWidth: 2, borderLeftWidth: 2 },
  cornerTR: { top: 0, right: 0, borderTopWidth: 2, borderRightWidth: 2 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: 2, borderLeftWidth: 2 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: 2, borderRightWidth: 2 },
  docPlaceholder: {
    width: 280, height: 200, borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)', borderStyle: 'dashed',
    borderRadius: 4, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  docPlaceholderText: { fontSize: 48, marginBottom: 8 },
  docPlaceholderLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 12 },
  captureBtn: {
    width: 68, height: 68, borderRadius: 34,
    backgroundColor: Colors.white, borderWidth: 4, borderColor: 'rgba(255,255,255,0.5)',
  },

  // Preview
  docPreview: {
    height: 200, backgroundColor: Colors.surface, borderRadius: 10,
    borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  docPreviewEmoji: { fontSize: 64, marginBottom: 8 },
  docPreviewText: { fontSize: 13, color: Colors.textLight, fontStyle: 'italic' },
  uploadedMsg: { fontSize: 15, fontWeight: '600', color: Colors.textDark },
  actions: { padding: 24, gap: 8 },
});

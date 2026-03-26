import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Clipboard, Share, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { getCurrentProfile } from '@/src/services/profileService';

export default function QrCodeScreen() {
  const [email, setEmail] = useState('');
  const shareLink = `https://contribiia.com/pay/${email.split('@')[0] || 'user'}`;

  useEffect(() => {
    getCurrentProfile().then((res) => {
      if (res.success && res.data?.email) setEmail(res.data.email);
    });
  }, []);

  const handleCopy = () => {
    Clipboard.setString(shareLink);
  };

  const handleShare = async () => {
    await Share.share({ message: `Pay me on Contribiia: ${shareLink}` });
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.body}>
        <Text style={styles.title}>Scan to pay</Text>

        {/* QR placeholder — install react-native-qrcode-svg for real QR generation */}
        <View style={styles.qrBox}>
          <Ionicons name="qr-code" size={140} color={Colors.textDark} />
        </View>

        <Text style={styles.shareLabel}>Share link:</Text>
        <View style={styles.linkRow}>
          <TextInput
            style={styles.linkInput}
            value={shareLink}
            editable={false}
            selectTextOnFocus
          />
          <TouchableOpacity style={styles.copyBtn} onPress={handleCopy}>
            <Text style={styles.copyBtnText}>Copy</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.shareBtn} onPress={handleShare} disabled={!email}>
          <Ionicons name="share-outline" size={18} color={Colors.white} />
          <Text style={styles.shareBtnText}>Share My Contribiia ID</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  body: { flex: 1, padding: 24, alignItems: 'center', gap: 20 },
  title: { fontSize: 24, fontWeight: '800', color: Colors.textDark },
  qrBox: {
    width: 220, height: 220, backgroundColor: Colors.white,
    borderRadius: 16, borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  shareLabel: { fontSize: 13, color: Colors.textMid, alignSelf: 'flex-start' },
  linkRow: { flexDirection: 'row', alignItems: 'center', width: '100%', gap: 8 },
  linkInput: {
    flex: 1, borderWidth: 1, borderColor: Colors.border, borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, color: Colors.textMid,
    backgroundColor: Colors.surface,
  },
  copyBtn: { backgroundColor: Colors.primary, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10 },
  copyBtnText: { color: Colors.white, fontWeight: '700', fontSize: 13 },
  shareBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.primary, borderRadius: 12,
    paddingVertical: 14, paddingHorizontal: 28, marginTop: 8,
  },
  shareBtnText: { color: Colors.white, fontWeight: '700', fontSize: 15 },
});

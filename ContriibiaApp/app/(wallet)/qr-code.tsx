import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { getCurrentProfile } from '@/src/services/profileService';

export default function QrCodeScreen() {
  const [email, setEmail] = useState('');

  useEffect(() => {
    getCurrentProfile().then((res) => {
      if (res.success && res.data?.email) {
        setEmail(res.data.email);
      }
    });
  }, []);

  const handleShare = async () => {
    await Share.share({
      message: `Pay me on Contribia: ${email}`,
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.body}>
        <Text style={styles.title}>Receive Money</Text>
        <Text style={styles.subtitle}>Share your Contribia ID to receive payments</Text>

        {/* QR placeholder – replace with a real QR library when available */}
        <View style={styles.qrBox}>
          <View style={styles.qrPlaceholder}>
            <Ionicons name="qr-code" size={120} color={Colors.primary} />
          </View>
          <Text style={styles.qrNote}>QR code generation coming soon</Text>
        </View>

        <View style={styles.emailBadge}>
          <Ionicons name="mail-outline" size={16} color={Colors.primary} />
          <Text style={styles.emailText}>{email || 'Loading...'}</Text>
        </View>

        <TouchableOpacity style={styles.shareBtn} onPress={handleShare} disabled={!email}>
          <Ionicons name="share-outline" size={18} color={Colors.white} />
          <Text style={styles.shareBtnText}>Share My Contribia ID</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  body: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    gap: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textDark,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textMid,
    textAlign: 'center',
  },
  qrBox: {
    alignItems: 'center',
    gap: 12,
    marginVertical: 12,
  },
  qrPlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrNote: {
    fontSize: 12,
    color: Colors.textLight,
  },
  emailBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  emailText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 28,
    marginTop: 8,
  },
  shareBtnText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 15,
  },
});

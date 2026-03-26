import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';

// Placeholder user list — replace with real Supabase query when contacts/circles are implemented
const MOCK_USERS = [
  { id: '1', name: 'Anna Francis', email: 'anna_fr2004@gmail.com', username: '@annafran04' },
  { id: '2', name: 'Hitarth Patel', email: 'anna_fr2004@gmail.com', username: '@annafran04' },
  { id: '3', name: 'Aish Patel', email: 'anna_fr2004@gmail.com', username: '@annafran04' },
  { id: '4', name: 'Lina', email: 'anna_fr2004@gmail.com', username: '@annafran04' },
];

export default function InvoiceSendUserScreen() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const filtered = MOCK_USERS.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleSend = async () => {
    if (!selected) return;
    setLoading(true);
    // TODO: call sendInvoice(selected, invoiceData) when backend is ready
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setSent(true);
  };

  if (sent) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.successWrap}>
          <View style={styles.banner}><Text style={styles.bannerText}>Invoice Sent</Text></View>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark" size={44} color={Colors.white} />
          </View>
          <Text style={styles.congratsTitle}>Congratulations!</Text>
          <Text style={styles.congratsDesc}>
            Invoice has been Sent.{'\n'}The amount will be displayed in your Transaction History under Business Wallet as{' '}
            <Text style={styles.owesYou}>"Owes you"</Text>
          </Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => router.replace('/(wallet)/more' as any)}>
            <Text style={styles.primaryBtnText}>View My Card</Text>
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
      <View style={styles.inner}>
        <Text style={styles.fieldLabel}>Send to a user</Text>
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Enter username or email address"
          placeholderTextColor={Colors.textPlaceholder}
          autoCapitalize="none"
        />

        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.userRow, selected === item.id && styles.userRowSelected]}
              onPress={() => setSelected(item.id)}
            >
              <View style={styles.avatar}>
                <Ionicons name="person" size={20} color={Colors.primary} />
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{item.name}</Text>
                <Text style={styles.userEmail}>{item.email}</Text>
                <Text style={styles.userHandle}>{item.username}</Text>
              </View>
              <Ionicons name="arrow-forward" size={18} color={Colors.primary} />
            </TouchableOpacity>
          )}
          style={styles.list}
        />

        <TouchableOpacity
          style={[styles.sendBtn, (!selected || loading) && { opacity: 0.5 }]}
          onPress={handleSend}
          disabled={!selected || loading}
        >
          <Text style={styles.sendBtnText}>{loading ? 'Sending...' : 'Send to the user'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  inner: { flex: 1, padding: 20, gap: 12 },
  fieldLabel: { fontSize: 14, fontWeight: '600', color: Colors.textDark },
  searchInput: {
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: 10,
    paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, color: Colors.textDark,
  },
  list: { flex: 1 },
  userRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  userRowSelected: { backgroundColor: Colors.primaryLight, borderRadius: 10, paddingHorizontal: 8 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  userInfo: { flex: 1, gap: 1 },
  userName: { fontSize: 14, fontWeight: '600', color: Colors.textDark },
  userEmail: { fontSize: 12, color: Colors.textMid },
  userHandle: { fontSize: 12, color: Colors.textLight },
  sendBtn: { backgroundColor: Colors.primary, borderRadius: 10, paddingVertical: 16, alignItems: 'center' },
  sendBtnText: { color: Colors.white, fontWeight: '700', fontSize: 16 },
  // Success
  successWrap: { flex: 1, padding: 20, alignItems: 'center', gap: 20 },
  banner: { backgroundColor: Colors.primary, width: '100%', borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  bannerText: { color: Colors.white, fontWeight: '700', fontSize: 16 },
  successIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  congratsTitle: { fontSize: 24, fontWeight: '800', color: Colors.textDark },
  congratsDesc: { fontSize: 14, color: Colors.textMid, textAlign: 'center', lineHeight: 22 },
  owesYou: { color: Colors.primary, fontWeight: '700' },
  primaryBtn: { backgroundColor: Colors.primary, borderRadius: 10, paddingVertical: 16, width: '100%', alignItems: 'center' },
  primaryBtnText: { color: Colors.white, fontWeight: '700', fontSize: 16 },
  outlineBtn: { borderWidth: 1.5, borderColor: Colors.primary, borderRadius: 10, paddingVertical: 14, width: '100%', alignItems: 'center' },
  outlineBtnText: { color: Colors.primary, fontWeight: '600', fontSize: 15 },
});

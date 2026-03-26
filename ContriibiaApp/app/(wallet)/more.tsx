import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';

type WalletTab = 'personal' | 'business';

function Section({ title }: { title: string }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

function MenuItem({ label, onPress, icon }: { label: string; onPress: () => void; icon?: string }) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Text style={styles.menuItemText}>{label}</Text>
      <Ionicons name={(icon as any) ?? 'arrow-forward'} size={18} color={Colors.primary} />
    </TouchableOpacity>
  );
}

export default function MoreScreen() {
  const { tab } = useLocalSearchParams<{ tab?: WalletTab }>();
  const isBusiness = tab === 'business';

  const comingSoon = () => Alert.alert('Coming Soon', 'This feature will be available in a future update.');

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>

        <Section title={isBusiness ? 'Business Card' : 'Personal Card'} />
        <View style={styles.group}>
          <MenuItem label="Freeze Contribiia Cards" onPress={() => router.push('/(wallet)/freeze-card' as any)} />
          <MenuItem label="Setup Tap to Pay (NFC)" onPress={() => router.push('/(wallet)/tap-to-pay' as any)} />
        </View>

        <Section title={isBusiness ? 'External Cards and Account\nfor Business Wallet' : 'External Cards and Account\nFor Personal Wallet'} />
        <View style={styles.group}>
          <MenuItem label="Manage Cards" onPress={() => router.push('/(wallet)/view-my-cards' as any)} />
          <MenuItem label="Manage Bank Accounts" onPress={() => router.push('/(wallet)/manage-accounts' as any)} />
        </View>

        <Section title="Transaction History" />
        <View style={styles.group}>
          <MenuItem
            label="Download Transaction History"
            onPress={comingSoon}
            icon="download-outline"
          />
        </View>

        <Section title="Security" />
        <View style={styles.group}>
          <MenuItem label="Biometric Authentication" onPress={() => router.push('/(wallet)/biometrics' as any)} />
          <MenuItem label="Setup Auto Load" onPress={() => router.push('/(wallet)/setup-auto-load' as any)} />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 20, gap: 8 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.textDark, marginTop: 12, marginBottom: 4 },
  group: {
    backgroundColor: Colors.white, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 15,
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  menuItemText: { fontSize: 14, color: Colors.textDark, fontWeight: '500' },
});

import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.body}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>JT</Text>
        </View>
        <Text style={styles.name}>Jamie Taiwo</Text>
        <Text style={styles.email}>saver@contribiia.com</Text>

        <View style={styles.menu}>
          {['Account Settings', 'Bank Accounts', 'Notifications', 'Security', 'Help & Support'].map(
            (item) => (
              <TouchableOpacity key={item} style={styles.menuItem}>
                <Text style={styles.menuLabel}>{item}</Text>
                <Text style={styles.menuArrow}>›</Text>
              </TouchableOpacity>
            )
          )}
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => router.replace('/(auth)')}
        >
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  body: { flex: 1, padding: 24, alignItems: 'center' },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', marginTop: 16,
  },
  avatarText: { color: Colors.white, fontSize: 28, fontWeight: '800' },
  name: { fontSize: 22, fontWeight: '700', color: Colors.textDark, marginTop: 12 },
  email: { fontSize: 14, color: Colors.textMid, marginTop: 4, marginBottom: 28 },
  menu: { width: '100%', gap: 2 },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 16, paddingHorizontal: 4,
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  menuLabel: { flex: 1, fontSize: 15, color: Colors.textDark },
  menuArrow: { fontSize: 20, color: Colors.textLight },
  logoutButton: {
    marginTop: 36, paddingVertical: 12, paddingHorizontal: 32,
    borderWidth: 1, borderColor: Colors.error, borderRadius: 8,
  },
  logoutText: { color: Colors.error, fontSize: 15, fontWeight: '600' },
});

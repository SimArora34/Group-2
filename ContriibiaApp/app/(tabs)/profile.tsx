import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { signOut } from '@/src/services/authService';
import { getCurrentProfile } from '@/src/services/profileService';
import { getWallet } from '@/src/services/walletService';
import { supabase } from '@/src/lib/supabaseClient';

export default function ProfileScreen() {
  const [fullName, setFullName] = useState('User');
  const [email, setEmail] = useState('');
  const [balance, setBalance] = useState<number>(0);
  const [createdAt, setCreatedAt] = useState('');
  const [loading, setLoading] = useState(false);

  const loadProfileData = async () => {
    const profileRes = await getCurrentProfile();
    const walletRes = await getWallet();

    if (profileRes.success && profileRes.data) {
      setFullName(profileRes.data.full_name || 'User');
      setEmail(profileRes.data.email || '');
      setCreatedAt(profileRes.data.created_at || '');
    } else {
      const { data } = await supabase.auth.getUser();
      const userEmail = data.user?.email ?? '';
      setEmail(userEmail);
      setFullName(userEmail ? userEmail.split('@')[0] : 'User');
    }

    if (walletRes.success && walletRes.data) {
      setBalance(Number(walletRes.data.balance));
    }
  };

  useEffect(() => {
    loadProfileData();
  }, []);

  const handleLogout = async () => {
    setLoading(true);

    const result = await signOut();

    setLoading(false);

    if (!result.success) {
      Alert.alert('Logout Failed', result.error || 'Something went wrong');
      return;
    }

    router.replace('/(auth)');
  };

  const initials = fullName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.screenTitle}>Profile</Text>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials || 'U'}</Text>
          </View>

          <Text style={styles.name}>{fullName}</Text>
          <Text style={styles.email}>{email || 'No email available'}</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Account Details</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Full Name</Text>
            <Text style={styles.infoValue}>{fullName}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{email || 'N/A'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Wallet Balance</Text>
            <Text style={styles.infoValue}>${balance.toFixed(2)}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Account Created</Text>
            <Text style={styles.infoValue}>
              {createdAt ? new Date(createdAt).toLocaleDateString() : 'N/A'}
            </Text>
          </View>
        </View>

        <View style={styles.menuCard}>
          <Text style={styles.cardTitle}>Settings</Text>

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
          onPress={handleLogout}
          disabled={loading}
        >
          <Text style={styles.logoutText}>
            {loading ? 'Logging out...' : 'Log Out'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scroll: {
    padding: 20,
    gap: 16,
  },
  screenTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.textDark,
  },
  profileCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    color: Colors.white,
    fontSize: 30,
    fontWeight: '800',
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 4,
    textAlign: 'center',
  },
  email: {
    fontSize: 14,
    color: Colors.textMid,
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  menuCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textDark,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
    gap: 16,
  },
  infoLabel: {
    fontSize: 15,
    color: Colors.textMid,
    flex: 1,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textDark,
    flex: 1,
    textAlign: 'right',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    color: Colors.textDark,
  },
  menuArrow: {
    fontSize: 20,
    color: Colors.textLight,
  },
  logoutButton: {
    marginTop: 8,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.error,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  logoutText: {
    color: Colors.error,
    fontSize: 15,
    fontWeight: '700',
  },
});
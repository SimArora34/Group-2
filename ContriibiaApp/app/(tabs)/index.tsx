import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Logo from '../../components/Logo';
import { Colors } from '../../constants/Colors';

const QUICK_ACTIONS = [
  { icon: '➕', label: 'Join Club' },
  { icon: '💸', label: 'Send' },
  { icon: '📥', label: 'Receive' },
  { icon: '📊', label: 'History' },
];

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <Logo size="small" />
          <View style={styles.headerIcons}>
            <Text style={styles.headerIcon}>🔔</Text>
            <Text style={styles.headerIcon}>👤</Text>
          </View>
        </View>

        {/* Balance card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Total Savings</Text>
          <Text style={styles.balanceAmount}>$0.00</Text>
          <Text style={styles.balanceSub}>No active savings clubs yet</Text>
        </View>

        {/* Quick actions */}
        <View style={styles.quickActions}>
          {QUICK_ACTIONS.map((action) => (
            <TouchableOpacity key={action.label} style={styles.quickAction}>
              <View style={styles.quickActionIcon}>
                <Text style={styles.quickActionEmoji}>{action.icon}</Text>
              </View>
              <Text style={styles.quickActionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Placeholder savings clubs */}
        <Text style={styles.sectionTitle}>Your Savings Clubs</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>💰</Text>
          <Text style={styles.emptyTitle}>No clubs yet</Text>
          <Text style={styles.emptyDesc}>Join or create a savings club to get started.</Text>
          <TouchableOpacity style={styles.emptyButton}>
            <Text style={styles.emptyButtonText}>Join a Club</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 20, gap: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerIcons: { flexDirection: 'row', gap: 12 },
  headerIcon: { fontSize: 22 },
  balanceCard: {
    backgroundColor: Colors.primary, borderRadius: 16, padding: 24,
    alignItems: 'center', gap: 4,
  },
  balanceLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  balanceAmount: { color: Colors.white, fontSize: 40, fontWeight: '800', letterSpacing: -1 },
  balanceSub: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 4 },
  quickActions: { flexDirection: 'row', justifyContent: 'space-between' },
  quickAction: { alignItems: 'center', gap: 6, flex: 1 },
  quickActionIcon: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.primary,
  },
  quickActionEmoji: { fontSize: 22 },
  quickActionLabel: { fontSize: 12, color: Colors.textMid, fontWeight: '500' },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: Colors.textDark },
  emptyState: {
    alignItems: 'center', padding: 32,
    backgroundColor: Colors.surface, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.border, gap: 8,
  },
  emptyEmoji: { fontSize: 48, marginBottom: 8 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: Colors.textDark },
  emptyDesc: { fontSize: 14, color: Colors.textMid, textAlign: 'center' },
  emptyButton: {
    marginTop: 8, backgroundColor: Colors.primary,
    paddingVertical: 10, paddingHorizontal: 24, borderRadius: 8,
  },
  emptyButtonText: { color: Colors.white, fontWeight: '600', fontSize: 14 },
});

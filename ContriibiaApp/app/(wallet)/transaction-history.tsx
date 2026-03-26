import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { getTransactions } from '@/src/services/walletService';

type TxType = 'deposit' | 'withdraw' | 'transaction' | 'payout_contributed' | 'payout_received' | 'cash_advance';

type Tx = {
  id: string;
  amount: number;
  type: TxType;
  created_at: string;
  from?: string;
  to?: string;
  status?: 'sorted' | 'owes_you' | 'you_owe';
};

const TX_CONFIG: Record<TxType, { label: string; color: string; icon: string }> = {
  transaction:        { label: 'Transaction',       color: '#3B82F6', icon: 'swap-horizontal' },
  withdraw:           { label: 'Withdraw',           color: '#F97316', icon: 'arrow-up' },
  deposit:            { label: 'Deposit',            color: '#16A34A', icon: 'arrow-down' },
  payout_contributed: { label: 'Payout Contributed', color: Colors.primary, icon: 'people' },
  payout_received:    { label: 'Payout Received',    color: '#16A34A', icon: 'gift' },
  cash_advance:       { label: 'Cash Advance',       color: '#8B5CF6', icon: 'card' },
};

const ALL_TYPES: TxType[] = ['transaction', 'deposit', 'withdraw', 'payout_contributed', 'payout_received', 'cash_advance'];
const SORT_OPTIONS = ['Most Recent', 'Oldest', 'Highest Amount', 'Lowest Amount'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function TxItem({ item }: { item: Tx }) {
  const cfg = TX_CONFIG[item.type] ?? TX_CONFIG.transaction;
  const date = new Date(item.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  return (
    <View style={styles.txCard}>
      <View style={styles.txLeft}>
        <Text style={[styles.txType, { color: cfg.color }]}>{cfg.label}</Text>
        {item.from && <Text style={styles.txMeta}>From: {item.from}</Text>}
        {item.to && <Text style={styles.txMeta}>To: {item.to}</Text>}
      </View>
      <View style={styles.txRight}>
        <Text style={styles.txAmount}>${Number(item.amount).toFixed(2)} CAD</Text>
        <Text style={styles.txDate}>{date}</Text>
      </View>
    </View>
  );
}

export default function TransactionHistoryScreen() {
  const [allTx, setAllTx] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterVisible, setFilterVisible] = useState(false);
  const [sortBy, setSortBy] = useState('Most Recent');
  const [showSortMenu, setShowSortMenu] = useState(false);

  // Filter state
  const [selectedTypes, setSelectedTypes] = useState<TxType[]>([]);
  const [selectedMonth, setSelectedMonth] = useState('');

  // Pending filter (inside modal before Apply)
  const [pendingTypes, setPendingTypes] = useState<TxType[]>([]);
  const [pendingMonth, setPendingMonth] = useState('');

  useEffect(() => {
    getTransactions().then((res) => {
      if (res.success && res.data) {
        const enriched = (res.data as Tx[]).map((tx) => ({
          ...tx,
          from: tx.type === 'deposit' ? 'VISA **** 9408' : 'App Wallet',
          to: tx.type === 'withdraw' ? 'AC No: 1240984\nBank: ScotiaBank' : 'App Wallet',
        }));
        setAllTx(enriched);
      }
      setLoading(false);
    });
  }, []);

  const openFilter = () => {
    setPendingTypes(selectedTypes);
    setPendingMonth(selectedMonth);
    setFilterVisible(true);
  };

  const applyFilter = () => {
    setSelectedTypes(pendingTypes);
    setSelectedMonth(pendingMonth);
    setFilterVisible(false);
  };

  const clearFilter = () => {
    setPendingTypes([]);
    setPendingMonth('');
    setSelectedTypes([]);
    setSelectedMonth('');
    setFilterVisible(false);
  };

  const toggleType = (t: TxType) =>
    setPendingTypes((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);

  const filtered = allTx
    .filter((tx) => selectedTypes.length === 0 || selectedTypes.includes(tx.type))
    .filter((tx) => {
      if (!selectedMonth) return true;
      const monthIdx = MONTHS.indexOf(selectedMonth);
      return new Date(tx.created_at).getMonth() === monthIdx;
    })
    .sort((a, b) => {
      if (sortBy === 'Most Recent') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === 'Oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (sortBy === 'Highest Amount') return b.amount - a.amount;
      if (sortBy === 'Lowest Amount') return a.amount - b.amount;
      return 0;
    });

  const hasFilter = selectedTypes.length > 0 || !!selectedMonth;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.toolbar}>
        <TouchableOpacity style={[styles.filterBtn, hasFilter && styles.filterBtnActive]} onPress={openFilter}>
          <Text style={[styles.filterBtnText, hasFilter && styles.filterBtnTextActive]}>Filter</Text>
          <Ionicons name="filter" size={14} color={hasFilter ? Colors.white : Colors.textDark} />
        </TouchableOpacity>
        <View>
          <TouchableOpacity style={styles.sortBtn} onPress={() => setShowSortMenu((v) => !v)}>
            <Text style={styles.sortText}>Sort By: <Text style={styles.sortVal}>{sortBy}</Text></Text>
            <Ionicons name="chevron-down" size={14} color={Colors.textDark} />
          </TouchableOpacity>
          {showSortMenu && (
            <View style={styles.sortMenu}>
              {SORT_OPTIONS.map((opt) => (
                <TouchableOpacity key={opt} style={styles.sortMenuItem} onPress={() => { setSortBy(opt); setShowSortMenu(false); }}>
                  <Text style={[styles.sortMenuText, sortBy === opt && styles.sortMenuActive]}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <TxItem item={item} />}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="receipt-outline" size={48} color={Colors.textLight} />
              <Text style={styles.emptyTitle}>No transactions</Text>
              <Text style={styles.emptyDesc}>No transactions match the current filter.</Text>
            </View>
          }
        />
      )}

      {/* Filter Modal */}
      <Modal visible={filterVisible} transparent animationType="slide" onRequestClose={() => setFilterVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter</Text>
              <TouchableOpacity onPress={() => setFilterVisible(false)}>
                <Ionicons name="close" size={22} color={Colors.textDark} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.filterLabel}>Type:</Text>
              <View style={styles.chipRow}>
                {ALL_TYPES.map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.chip, pendingTypes.includes(t) && styles.chipActive]}
                    onPress={() => toggleType(t)}
                  >
                    <Text style={[styles.chipText, pendingTypes.includes(t) && styles.chipTextActive]}>
                      {TX_CONFIG[t].label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.filterLabel}>By Month:</Text>
              <View style={styles.chipRow}>
                {MONTHS.map((m) => (
                  <TouchableOpacity
                    key={m}
                    style={[styles.chip, pendingMonth === m && styles.chipActive]}
                    onPress={() => setPendingMonth(pendingMonth === m ? '' : m)}
                  >
                    <Text style={[styles.chipText, pendingMonth === m && styles.chipTextActive]}>{m}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <TouchableOpacity style={styles.applyBtn} onPress={applyFilter}>
              <Text style={styles.applyBtnText}>Apply Filter</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.clearBtn} onPress={clearFilter}>
              <Text style={styles.clearBtnText}>Clear Filter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  toolbar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  filterBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1, borderColor: Colors.border, borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 7,
  },
  filterBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterBtnText: { fontSize: 13, fontWeight: '600', color: Colors.textDark },
  filterBtnTextActive: { color: Colors.white },
  sortBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sortText: { fontSize: 13, color: Colors.textMid },
  sortVal: { fontWeight: '700', color: Colors.textDark },
  sortMenu: {
    position: 'absolute', right: 0, top: 28, backgroundColor: Colors.white,
    borderRadius: 10, borderWidth: 1, borderColor: Colors.border,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, elevation: 4, zIndex: 10, minWidth: 160,
  },
  sortMenuItem: { paddingHorizontal: 16, paddingVertical: 12 },
  sortMenuText: { fontSize: 14, color: Colors.textDark },
  sortMenuActive: { fontWeight: '700', color: Colors.primary },
  loader: { flex: 1 },
  list: { padding: 16, gap: 10 },
  txCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    backgroundColor: Colors.white, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, padding: 14,
  },
  txLeft: { flex: 1, gap: 3 },
  txType: { fontSize: 14, fontWeight: '700' },
  txMeta: { fontSize: 12, color: Colors.textMid },
  txRight: { alignItems: 'flex-end', gap: 4 },
  txAmount: { fontSize: 14, fontWeight: '700', color: Colors.textDark },
  txDate: { fontSize: 12, color: Colors.textLight },
  empty: { alignItems: 'center', paddingTop: 80, gap: 10 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.textDark },
  emptyDesc: { fontSize: 14, color: Colors.textMid, textAlign: 'center' },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: Colors.textDark },
  filterLabel: { fontSize: 14, fontWeight: '600', color: Colors.textDark, marginBottom: 10, marginTop: 14 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1, borderColor: Colors.border, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7 },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: 13, color: Colors.textDark },
  chipTextActive: { color: Colors.white, fontWeight: '600' },
  applyBtn: { backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginTop: 20 },
  applyBtnText: { color: Colors.white, fontWeight: '700', fontSize: 16 },
  clearBtn: { borderWidth: 1.5, borderColor: Colors.primary, borderRadius: 12, paddingVertical: 13, alignItems: 'center', marginTop: 10 },
  clearBtnText: { color: Colors.primary, fontWeight: '600', fontSize: 15 },
});

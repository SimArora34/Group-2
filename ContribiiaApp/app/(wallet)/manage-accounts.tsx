import { useFocusEffect, router } from "expo-router";
import React, { useCallback, useState } from "react";
import AppIcon from "../../components/AppIcon";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../constants/Colors";
import { deleteBankAccount, getBankAccounts } from "../../src/services/bankAccountService";
import { BankAccount } from "../../src/types";

export default function ManageAccountsScreen() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      getBankAccounts().then((res) => {
        if (res.success && res.data) setAccounts(res.data);
      });
    }, []),
  );

  const confirmDelete = async () => {
    if (deleteTargetId) {
      await deleteBankAccount(deleteTargetId);
      setAccounts((prev) => prev.filter((a) => a.id !== deleteTargetId));
    }
    setDeleteTargetId(null);
  };

  const handleLinkNewAccount = () => {
    Alert.alert(
      "Coming Soon",
      "Link a New Account will be connected once the bank account add flow is finalized.",
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity style={styles.linkRow} onPress={handleLinkNewAccount}>
          <Text style={styles.linkRowText}>Link a New Account</Text>
          <View style={styles.addIcon}>
            <AppIcon name="add" size={20} color={Colors.primary} />
          </View>
        </TouchableOpacity>

        {accounts.map((account) => (
          <View key={account.id} style={styles.accountRow}>
            <View style={styles.accountInfo}>
              <Text style={styles.accountAcNo}>AC No: {account.account_number}</Text>
              <Text style={styles.accountBank}>Bank: {account.bank_name}</Text>
            </View>

            <View style={styles.accountRight}>
              <View
                style={[
                  styles.typeBadge,
                  account.account_type === "SAVINGS"
                    ? styles.typeSavings
                    : styles.typeCurrent,
                ]}
              >
                <Text
                  style={[
                    styles.typeBadgeText,
                    account.account_type === "SAVINGS"
                      ? styles.typeSavingsText
                      : styles.typeCurrentText,
                  ]}
                >
                  {account.account_type}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => setDeleteTargetId(account.id)}
              >
                <AppIcon name="trash-outline" size={20} color={Colors.error} />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {accounts.length === 0 && (
          <View style={styles.emptyWrap}>
            <AppIcon name="business-outline" size={48} color={Colors.textLight} />
            <Text style={styles.emptyText}>No bank accounts linked</Text>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={!!deleteTargetId}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteTargetId(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setDeleteTargetId(null)}
            >
              <AppIcon name="close" size={20} color={Colors.textMid} />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Confirm Delete</Text>

            <Text style={styles.modalNote}>
              <Text style={styles.bold}>Note:</Text> Once deleted, this account will not be
              saved in the app.
            </Text>
            <Text style={styles.modalDesc}>
              In case you want this account back, you will have to link this account again
            </Text>

            <TouchableOpacity style={styles.deleteConfirmBtn} onPress={confirmDelete}>
              <Text style={styles.deleteConfirmBtnText}>Delete Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 20, gap: 12 },
  linkRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
    marginBottom: 4,
  },
  linkRowText: { fontSize: 16, fontWeight: "700", color: Colors.textDark },
  addIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  accountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  accountInfo: { gap: 4 },
  accountAcNo: { fontSize: 13, color: Colors.textLight },
  accountBank: { fontSize: 15, fontWeight: "600", color: Colors.textDark },
  accountRight: { flexDirection: "row", alignItems: "center", gap: 12 },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeSavings: { backgroundColor: Colors.primaryLight },
  typeCurrent: { backgroundColor: "#E8F5E9" },
  typeBadgeText: { fontSize: 11, fontWeight: "700" },
  typeSavingsText: { color: Colors.primary },
  typeCurrentText: { color: Colors.success },
  deleteBtn: { padding: 4 },
  emptyWrap: { alignItems: "center", paddingTop: 40, gap: 12 },
  emptyText: { fontSize: 14, color: Colors.textLight },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    padding: 24,
  },
  modalBox: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 20,
    gap: 14,
  },
  modalClose: { alignSelf: "flex-end" },
  modalTitle: { fontSize: 18, fontWeight: "800", color: Colors.textDark },
  modalNote: { fontSize: 14, color: Colors.textMid, lineHeight: 22 },
  modalDesc: { fontSize: 14, color: Colors.textMid, lineHeight: 22 },
  deleteConfirmBtn: {
    backgroundColor: Colors.error,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  deleteConfirmBtnText: {
    color: Colors.white,
    fontWeight: "700",
    fontSize: 15,
  },
  bold: { fontWeight: "700", color: Colors.textDark },
});
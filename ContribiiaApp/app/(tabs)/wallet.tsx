import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppIcon from "../../components/AppIcon";
import { Colors } from "../../constants/Colors";
import { getDefaultCard } from "@/src/services/cardService";
import { getCurrentProfile } from "@/src/services/profileService";
import { getTransactions, getWallet } from "@/src/services/walletService";

type Tx = {
  id: string;
  amount: number;
  type: "deposit" | "withdraw";
  created_at: string;
};

type WalletTab = "personal" | "business";

const QUICK_ACTIONS_PERSONAL = [
  { id: "send", icon: "paper-plane-outline" as const, label: "Send Money" },
  { id: "qr", icon: "qr-code-outline" as const, label: "Generate QR Code" },
  { id: "history", icon: "swap-horizontal-outline" as const, label: "Transaction History" },
  { id: "more", icon: "ellipsis-horizontal-outline" as const, label: "More" },
];

const QUICK_ACTIONS_BUSINESS = [
  { id: "send", icon: "paper-plane-outline" as const, label: "Send Money" },
  { id: "invoice", icon: "document-text-outline" as const, label: "Generate Invoice" },
  { id: "qr", icon: "qr-code-outline" as const, label: "QR Code" },
  { id: "history", icon: "swap-horizontal-outline" as const, label: "Transaction History" },
];

export default function WalletScreen() {
  const [activeTab, setActiveTab] = useState<WalletTab>("personal");
  const [businessSetup, setBusinessSetup] = useState(false);
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<Tx[]>([]);
  const [fullName, setFullName] = useState("User");
  const [cardLastFour, setCardLastFour] = useState<string | null>(null);
  const [cardExpiry, setCardExpiry] = useState<string | null>(null);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadWallet = async () => {
    try {
      if (!refreshing) setLoading(true);

      const [
        profileRes,
        walletRes,
        txRes,
        personalCardRes,
        businessCardRes,
      ] = await Promise.all([
        getCurrentProfile(),
        getWallet(),
        getTransactions(),
        getDefaultCard("personal"),
        getDefaultCard("business"),
      ]);

      if (profileRes.success && profileRes.data) {
        setFullName(profileRes.data.full_name || profileRes.data.username || "User");
      }

      if (walletRes.success && walletRes.data) {
        setBalance(Number(walletRes.data.balance));
      } else {
        setBalance(0);
      }

      if (txRes.success && txRes.data) {
        setTransactions(txRes.data as Tx[]);
      } else {
        setTransactions([]);
      }

      if (personalCardRes.success && personalCardRes.data) {
        setCardLastFour(personalCardRes.data.last4);
        setCardExpiry(personalCardRes.data.expiry);
      } else {
        setCardLastFour(null);
        setCardExpiry(null);
      }

      setBusinessSetup(!!businessCardRes.data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadWallet();
    }, []),
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadWallet();
  };

  const handleQuickAction = (id: string) => {
    switch (id) {
      case "send":
        router.push("/(wallet)/send-money" as any);
        break;
      case "qr":
        router.push("/(wallet)/qr-code" as any);
        break;
      case "history":
        router.push("/(wallet)/transaction-history" as any);
        break;
      case "invoice":
        router.push("/(wallet)/generate-invoice" as any);
        break;
      case "more":
        router.push({
          pathname: "/(wallet)/more",
          params: { tab: activeTab },
        } as any);
        break;
    }
  };

  const nameDisplay = fullName.toUpperCase();
  const actions =
    activeTab === "personal" ? QUICK_ACTIONS_PERSONAL : QUICK_ACTIONS_BUSINESS;

  if (loading) {
    return (
      <SafeAreaView style={styles.loaderContainer} edges={["top"]}>
        <View style={styles.loaderRow}>
          <ActivityIndicator size="small" color={Colors.primary} />
          <Text style={styles.loaderText}>Loading wallet...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <AppIcon name="chevron-back" size={24} color={Colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>App Wallet</Text>
        <View style={styles.backBtn} />
      </View>

      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "personal" && styles.tabActive]}
          onPress={() => setActiveTab("personal")}
        >
          <Text style={[styles.tabText, activeTab === "personal" && styles.tabTextActive]}>
            Personal
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "business" && styles.tabActive]}
          onPress={() => setActiveTab("business")}
        >
          <Text style={[styles.tabText, activeTab === "business" && styles.tabTextActive]}>
            Business
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {activeTab === "business" && !businessSetup ? (
          <View style={styles.setupCard}>
            <Text style={styles.setupTitle}>Setup Business Wallet</Text>
            <Text style={styles.setupDesc}>
              Setting up Business card opens more features to the App Wallet
            </Text>

            {[
              "Another Card for Business Transaction",
              "Generate Invoice",
              "Send Invoices within the app",
              "Business Transactions with history of pending and settled transaction",
            ].map((feature) => (
              <View key={feature} style={styles.featureRow}>
                <Text style={styles.featureDot}>•</Text>
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}

            <TouchableOpacity
              style={styles.setupButton}
              onPress={() => router.push("/(wallet)/billing-address" as any)}
            >
              <Text style={styles.setupButtonText}>Start Business Wallet</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={[styles.card, activeTab === "business" && styles.cardBusiness]}>
              <View style={styles.cardTop}>
                <View style={styles.cardLogoWrap}>
                  <Image
                    source={require('../../assets/images/logo_B.png')}
                    style={styles.cardLogo}
                    resizeMode="contain"
                  />
                  {activeTab === "business" && (
                    <View style={styles.businessBadge}>
                      <Text style={styles.businessBadgeText}>B</Text>
                    </View>
                  )}
                </View>

                <AppIcon
                  name="lock-closed"
                  size={16}
                  color="rgba(255,255,255,0.7)"
                />
              </View>

              <Text style={styles.cardNumber}>•••• •••• •••• {cardLastFour ?? "••••"}</Text>

              <View style={styles.cardMeta}>
                <View>
                  <Text style={styles.cardLabel}>
                    {activeTab === "business" ? "BUSINESS ACCOUNT" : nameDisplay}
                  </Text>
                  <Text style={styles.cardExpiry}>EXPIRES: {cardExpiry ?? "MM/YY"}</Text>
                </View>

                <View style={styles.cvvChip}>
                  <Text style={styles.cvvText}>CVV</Text>
                </View>
              </View>

              <View style={styles.cardBalanceRow}>
                <View>
                  <Text style={styles.cardBalanceLabel}>Current Balance</Text>
                  <Text style={styles.cardBalance}>
                    {balanceVisible
                      ? `$${balance.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}`
                      : "••••••"}
                  </Text>
                </View>

                <TouchableOpacity onPress={() => setBalanceVisible((v) => !v)}>
                  <AppIcon
                    name={balanceVisible ? "eye-off-outline" : "eye-outline"}
                    size={22}
                    color="rgba(255,255,255,0.8)"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.actionBtnPrimary]}
                onPress={() => router.push("/(wallet)/add-money" as any)}
              >
                <Text style={styles.actionBtnPrimaryText}>Add money</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, styles.actionBtnOutline]}
                onPress={() => router.push("/(wallet)/withdraw-money" as any)}
              >
                <Text style={styles.actionBtnOutlineText}>Withdraw</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.grid}>
              {actions.map((action) => (
                <TouchableOpacity
                  key={action.id}
                  style={styles.gridItem}
                  onPress={() => handleQuickAction(action.id)}
                >
                  <View style={styles.gridIconWrap}>
                    <AppIcon name={action.icon} size={26} color={Colors.primary} />
                  </View>
                  <Text style={styles.gridLabel}>{action.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {transactions.length > 0 && (
              <View style={styles.recentSection}>
                <Text style={styles.recentTitle}>Recent Transactions</Text>

                {transactions.slice(0, 3).map((tx) => (
                  <View key={tx.id} style={styles.txCard}>
                    <View>
                      <Text style={styles.txType}>{tx.type}</Text>
                      <Text style={styles.txDate}>
                        {new Date(tx.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                    <Text style={styles.txAmount}>${Number(tx.amount).toFixed(2)}</Text>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loaderContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  loaderRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  loaderText: { fontSize: 14, color: Colors.textMid },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: Colors.textDark },
  tabRow: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 4,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center" },
  tabActive: {
    backgroundColor: Colors.white,
    borderRadius: 9,
    margin: 2,
  },
  tabText: { fontSize: 14, fontWeight: "500", color: Colors.textLight },
  tabTextActive: { color: Colors.textDark, fontWeight: "700" },
  scroll: { padding: 20, gap: 20, paddingBottom: 40 },
  card: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    padding: 22,
    aspectRatio: 1.586,
    justifyContent: 'space-between',
  },
  cardBusiness: { backgroundColor: Colors.primaryDark },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardLogoWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  businessBadge: {
    backgroundColor: "rgba(255,255,255,0.25)",
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  businessBadgeText: { color: Colors.white, fontSize: 12, fontWeight: "800" },
  cardLogo: {
    width: 80,
    height: 28,
  },
  cardNumber: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 2,
  },
  cardMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  cardLabel: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  cardExpiry: { color: "rgba(255,255,255,0.6)", fontSize: 11, marginTop: 2 },
  cvvChip: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  cvvText: { color: Colors.white, fontSize: 12, fontWeight: "600" },
  cardBalanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.2)",
    paddingTop: 12,
  },
  cardBalanceLabel: { color: "rgba(255,255,255,0.7)", fontSize: 12, marginBottom: 2 },
  cardBalance: { color: Colors.white, fontSize: 28, fontWeight: "800", letterSpacing: -0.5 },
  actionRow: { flexDirection: "row", gap: 12 },
  actionBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  actionBtnPrimary: { backgroundColor: Colors.primary },
  actionBtnOutline: {
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  actionBtnPrimaryText: { color: Colors.white, fontWeight: "700", fontSize: 15 },
  actionBtnOutlineText: { color: Colors.primary, fontWeight: "700", fontSize: 15 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  gridItem: {
    width: "47%",
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 18,
    alignItems: "flex-start",
    gap: 10,
  },
  gridIconWrap: {
    backgroundColor: Colors.primaryLight,
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  gridLabel: { fontSize: 13, fontWeight: "600", color: Colors.textDark },
  setupCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 24,
    gap: 12,
  },
  setupTitle: { fontSize: 20, fontWeight: "800", color: Colors.textDark },
  setupDesc: { fontSize: 14, color: Colors.textMid, lineHeight: 20 },
  featureRow: { flexDirection: "row", gap: 8, alignItems: "flex-start" },
  featureDot: { color: Colors.primary, fontSize: 16, lineHeight: 20 },
  featureText: { flex: 1, fontSize: 14, color: Colors.textMid, lineHeight: 20 },
  setupButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  setupButtonText: { color: Colors.white, fontWeight: "700", fontSize: 15 },
  recentSection: { gap: 10 },
  recentTitle: { fontSize: 18, fontWeight: "700", color: Colors.textDark },
  txCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  txType: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.textDark,
    textTransform: "capitalize",
  },
  txDate: { fontSize: 13, color: Colors.textMid, marginTop: 4 },
  txAmount: { fontSize: 15, fontWeight: "700", color: Colors.textDark },
});
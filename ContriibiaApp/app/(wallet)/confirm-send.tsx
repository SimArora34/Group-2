import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import AppIcon from "../../components/AppIcon";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../constants/Colors";
import { getWallet, lookupUserByEmail, sendMoney } from "@/src/services/walletService";

function generateTxId() {
  const n = () => Math.floor(Math.random() * 9000 + 1000);
  return `H${n()} ${n()} ${n()}`;
}

type RecipientInfo = { full_name: string | null; email: string | null };

export default function ConfirmSendScreen() {
  const { amount, recipient } = useLocalSearchParams<{
    amount: string;
    recipient: string;
  }>();

  const [recipientInfo, setRecipientInfo] = useState<RecipientInfo | null>(null);
  const [lookupError, setLookupError] = useState("");
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [sendError, setSendError] = useState("");
  const [txId, setTxId] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    getWallet().then((res) => {
      if (res.success && res.data) setBalance(Number(res.data.balance));
    });

    lookupUserByEmail(recipient ?? "").then((res) => {
      if (res.success && res.data) {
        setRecipientInfo(res.data);
        setLookupError("");
      } else {
        setRecipientInfo(null);
        setLookupError("User not found. Make sure the email is registered on Contribiia.");
      }
    });
  }, [recipient]);

  const handleSend = async () => {
    setSendError("");
    setLoading(true);

    const res = await sendMoney(recipient ?? "", parseFloat(amount ?? "0"));

    setLoading(false);

    if (!res.success) {
      setSendError(res.error || "Transfer failed. Please try again.");
      return;
    }

    setTxId(generateTxId());
    setSent(true);
  };

  if (sent) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.banner}>
            <Text style={styles.bannerText}>Amount Sent!</Text>
          </View>

          <View style={styles.successIcon}>
            <AppIcon name="checkmark" size={44} color={Colors.white} />
          </View>

          <Text style={styles.successTitle}>Successful!</Text>

          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailKey}>Transaction number:</Text>
              <View style={styles.txRow}>
                <Text style={styles.detailVal}>{txId}</Text>
                <TouchableOpacity onPress={() => Clipboard.setStringAsync(txId)}>
                  <AppIcon name="copy-outline" size={16} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailKey}>Amount :</Text>
              <Text style={styles.detailVal}>${amount}</Text>
            </View>

            <View style={styles.divider} />

            <Text style={styles.detailKeySmall}>To</Text>
            <View style={styles.recipientRow}>
              <View style={styles.avatar}>
                <AppIcon name="person" size={20} color={Colors.primary} />
              </View>
              <View>
                <Text style={styles.detailKey}>{recipientInfo?.full_name || "User"}</Text>
                <Text style={styles.detailSubVal}>{recipientInfo?.email}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <Text style={styles.detailKeySmall}>From</Text>
            <Text style={styles.detailKey}>Personal Wallet</Text>
            <Text style={styles.detailSubVal}>App Wallet</Text>
          </View>

          <TouchableOpacity
            style={styles.goBtn}
            onPress={() => router.replace("/(tabs)/wallet" as any)}
          >
            <Text style={styles.goBtnText}>Go to Wallet</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.balanceRow}>
          <Text style={styles.balanceLabel}>Current Balance:</Text>
          <Text style={styles.balanceVal}>
            {balance !== null
              ? `$${balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
              : "..."}
          </Text>
        </View>

        <Text style={styles.fieldLabel}>Enter Amount</Text>
        <View style={styles.amountBox}>
          <Text style={styles.amountText}>${amount}</Text>
          <AppIcon name="checkmark-circle" size={22} color={Colors.primary} />
        </View>

        <View style={styles.txPreview}>
          <Text style={styles.txLabel}>Transaction:</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.changeLink}>
            <Text style={styles.changeLinkText}>Change Receiver</Text>
          </TouchableOpacity>
        </View>

        {lookupError ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{lookupError}</Text>
          </View>
        ) : recipientInfo ? (
          <View style={styles.txFlow}>
            <Text style={styles.txYou}>You</Text>
            <AppIcon name="arrow-forward" size={20} color={Colors.textMid} />
            <View>
              <Text style={styles.txName}>{recipientInfo.full_name || "User"}</Text>
              <Text style={styles.txEmail}>{recipientInfo.email}</Text>
            </View>
          </View>
        ) : (
          <ActivityIndicator color={Colors.primary} />
        )}

        {!!sendError && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{sendError}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.sendBtn, (loading || !!lookupError || !recipientInfo) && { opacity: 0.5 }]}
          onPress={handleSend}
          disabled={loading || !!lookupError || !recipientInfo}
        >
          <Text style={styles.sendBtnText}>{loading ? "Sending..." : "Send"}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 20, gap: 14 },
  balanceRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  balanceLabel: { fontSize: 15, fontWeight: "600", color: Colors.textDark },
  balanceVal: { fontSize: 15, fontWeight: "700", color: Colors.textDark },
  fieldLabel: { fontSize: 14, fontWeight: "600", color: Colors.textDark },
  amountBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  amountText: { fontSize: 16, fontWeight: "700", color: Colors.textDark },
  txPreview: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  txLabel: { fontSize: 14, fontWeight: "600", color: Colors.textDark },
  changeLinkText: { fontSize: 14, color: Colors.accent, fontWeight: "600" },
  txFlow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
  },
  txYou: { fontSize: 14, fontWeight: "600", color: Colors.textDark },
  txName: { fontSize: 14, fontWeight: "600", color: Colors.textDark },
  txEmail: { fontSize: 12, color: Colors.textLight },
  errorBanner: { backgroundColor: "#FEE2E2", borderRadius: 8, padding: 12 },
  errorText: { color: "#DC2626", fontSize: 13 },
  sendBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: "center",
  },
  sendBtnText: { color: Colors.white, fontWeight: "700", fontSize: 16 },
  banner: {
    backgroundColor: Colors.primary,
    width: "100%",
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  bannerText: { color: Colors.white, fontWeight: "700", fontSize: 16 },
  successIcon: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
    alignSelf: "center",
  },
  successTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.textDark,
    textAlign: "center",
  },
  detailsCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 18,
    width: "100%",
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailKey: { fontSize: 14, fontWeight: "600", color: Colors.textDark },
  detailKeySmall: { fontSize: 12, color: Colors.textLight },
  detailVal: { fontSize: 14, color: Colors.textDark },
  detailSubVal: { fontSize: 13, color: Colors.textMid },
  txRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 4,
  },
  recipientRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  goBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    width: "100%",
    alignItems: "center",
  },
  goBtnText: { color: Colors.white, fontWeight: "700", fontSize: 16 },
});
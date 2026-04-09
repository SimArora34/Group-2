import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import AppIcon from "../../components/AppIcon";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../constants/Colors";
import { getWallet, lookupUserByEmail } from "@/src/services/walletService";

export default function SendMoneyScreen() {
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [balance, setBalance] = useState<number | null>(null);
  const [amountError, setAmountError] = useState("");
  const [recipientError, setRecipientError] = useState("");
  const [recipientName, setRecipientName] = useState<string | null>(null);
  const [loadingRecipient, setLoadingRecipient] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getWallet().then((res) => {
      if (res.success && res.data) {
        setBalance(Number(res.data.balance));
      }
    });
  }, []);

  const handleClearAmount = () => {
    setAmount("");
    setAmountError("");
  };

  const validateAndLookupRecipient = async () => {
    const cleanRecipient = recipient.trim().toLowerCase();

    if (!cleanRecipient) {
      setRecipientName(null);
      setRecipientError("Please enter a recipient email address.");
      return null;
    }

    if (!cleanRecipient.includes("@")) {
      setRecipientName(null);
      setRecipientError("Please enter a valid receiver email address.");
      return null;
    }

    setLoadingRecipient(true);
    setRecipientError("");

    const res = await lookupUserByEmail(cleanRecipient);

    setLoadingRecipient(false);

    if (!res.success || !res.data) {
      setRecipientName(null);
      setRecipientError("Please enter a valid existing receiver email.");
      return null;
    }

    const foundName = res.data.full_name || res.data.email || "Receiver found";
    setRecipientName(foundName);
    setRecipientError("");

    return {
      email: res.data.email || cleanRecipient,
      name: foundName,
    };
  };

  const handleContinue = async () => {
    let valid = true;
    const parsedAmount = parseFloat(amount);

    if (!amount || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setAmountError("Please enter a valid amount.");
      valid = false;
    } else if (balance !== null && parsedAmount > balance) {
      setAmountError("Amount exceeds current wallet balance.");
      valid = false;
    } else {
      setAmountError("");
    }

    if (!valid) return;

    setSubmitting(true);
    const receiver = await validateAndLookupRecipient();
    setSubmitting(false);

    if (!receiver) return;

    router.push({
      pathname: "/(wallet)/confirm-send",
      params: {
        amount: parsedAmount.toFixed(2),
        recipient: receiver.email,
        recipientName: receiver.name,
      },
    } as any);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()}>
              <AppIcon name="chevron-back" size={28} color={Colors.textDark} />
            </TouchableOpacity>
            <Text style={styles.title}>Send Money</Text>
            <View style={{ width: 28 }} />
          </View>

          <View style={styles.balanceRow}>
            <Text style={styles.balanceLabel}>Current Balance:</Text>
            <Text style={styles.balanceVal}>
              {balance !== null
                ? `$${balance.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`
                : "..."}
            </Text>
          </View>

          <Text style={styles.fieldLabel}>Enter Amount</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, styles.inputFlex, !!amountError && styles.inputError]}
              value={amount}
              onChangeText={(v) => {
                setAmount(v);
                setAmountError("");
              }}
              placeholder="0.00"
              placeholderTextColor={Colors.textPlaceholder}
              keyboardType="decimal-pad"
            />
            {!!amount && (
              <TouchableOpacity style={styles.clearBtn} onPress={handleClearAmount}>
                <AppIcon name="close-circle" size={22} color={Colors.primary} />
              </TouchableOpacity>
            )}
          </View>
          {!!amountError && <Text style={styles.errorText}>{amountError}</Text>}

          <Text style={styles.fieldLabel}>Receiver:</Text>
          <TextInput
            style={[styles.input, !!recipientError && styles.inputError]}
            value={recipient}
            onChangeText={(v) => {
              setRecipient(v);
              setRecipientError("");
              setRecipientName(null);
            }}
            placeholder="Enter receiver email address"
            placeholderTextColor={Colors.textPlaceholder}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          {loadingRecipient && (
            <View style={styles.lookupRow}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={styles.lookupText}>Checking receiver...</Text>
            </View>
          )}

          {!!recipientName && !loadingRecipient && (
            <View style={styles.receiverFoundBox}>
              <Text style={styles.receiverFoundLabel}>Receiver found</Text>
              <Text style={styles.receiverFoundName}>{recipientName}</Text>
            </View>
          )}

          {!!recipientError && <Text style={styles.errorText}>{recipientError}</Text>}

          <TouchableOpacity
            style={[styles.continueBtn, submitting && styles.continueBtnDisabled]}
            onPress={handleContinue}
            disabled={submitting}
          >
            <Text style={styles.continueBtnText}>
              {submitting ? "Checking..." : "Continue"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 20, gap: 14 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.textDark,
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.textDark,
  },
  balanceVal: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.textDark,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textDark,
    marginTop: 8,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  inputFlex: {
    flex: 1,
  },
  clearBtn: {
    position: "absolute",
    right: 12,
  },
  input: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 15,
    fontSize: 16,
    color: Colors.textDark,
    width: "100%",
    backgroundColor: Colors.white,
  },
  inputError: {
    borderColor: Colors.error,
  },
  errorText: {
    fontSize: 12,
    color: Colors.error,
    marginTop: -6,
  },
  lookupRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: -2,
  },
  lookupText: {
    fontSize: 13,
    color: Colors.textMid,
  },
  receiverFoundBox: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 12,
    marginTop: -2,
  },
  receiverFoundLabel: {
    fontSize: 12,
    color: Colors.textMid,
    marginBottom: 4,
  },
  receiverFoundName: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textDark,
  },
  continueBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 10,
  },
  continueBtnDisabled: {
    opacity: 0.7,
  },
  continueBtnText: {
    color: Colors.white,
    fontWeight: "700",
    fontSize: 16,
  },
});
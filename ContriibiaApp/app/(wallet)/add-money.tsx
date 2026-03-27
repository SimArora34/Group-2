import { router } from "expo-router";
import React, { useState } from "react";
import AppIcon from "../../components/AppIcon";
import {
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
import { deposit } from "@/src/services/walletService";

const FEE = 0;

function generateTxId() {
  const n = () => Math.floor(Math.random() * 9000 + 1000);
  return `H${n()} ${n()} ${n()}`;
}

export default function AddMoneyScreen() {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCardOptions, setShowCardOptions] = useState(false);
  const [showBankOptions, setShowBankOptions] = useState(false);
  const [selectedPayMethod, setSelectedPayMethod] = useState<
    "card-visa" | "card-mastercard" | "bank-chequing" | "bank-savings" | null
  >(null);

  const parsed = parseFloat(amount) || 0;
  const total = parsed + FEE;

  const handleAddMoney = async () => {
    if (!parsed || parsed <= 0) {
      setError("Please enter a valid amount greater than $0.");
      return;
    }

    if (!selectedPayMethod) {
      setError("Please choose a payment method.");
      return;
    }

    setError("");
    setLoading(true);

    const res = await deposit(parsed);

    setLoading(false);

    if (!res.success) {
      setError(res.error || "Deposit failed. Please try again.");
      return;
    }

    router.replace({
      pathname: "/(wallet)/confirmation",
      params: {
        type: "deposit",
        amount: parsed.toFixed(2),
        txId: generateTxId(),
      },
    } as any);
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
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
            <Text style={styles.title}>Add money</Text>
            <View style={{ width: 28 }} />
          </View>

          <Text style={styles.label}>Enter Amount</Text>
          <TextInput
            style={[styles.amountInput, !!error && styles.amountInputError]}
            value={amount}
            onChangeText={(v) => {
              setAmount(v);
              setError("");
            }}
            placeholder="0.00"
            placeholderTextColor={Colors.textPlaceholder}
            keyboardType="decimal-pad"
            autoFocus
          />
          {!!error && <Text style={styles.errorText}>{error}</Text>}

          {parsed > 0 && (
            <View style={styles.summaryBox}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryKey}>Amount:</Text>
                <Text style={styles.summaryVal}>${parsed.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryKey}>Fees:</Text>
                <Text style={styles.summaryVal}>${FEE.toFixed(2)}</Text>
              </View>
              <View style={[styles.summaryRow, styles.summaryTotal]}>
                <Text style={styles.summaryTotalKey}>Total Amount:</Text>
                <Text style={styles.summaryTotalVal}>${total.toFixed(2)}</Text>
              </View>
            </View>
          )}

          <Text style={styles.sectionLabel}>Pay By</Text>

          <TouchableOpacity
            style={styles.payOption}
            onPress={() => {
              setShowCardOptions((prev) => !prev);
              setShowBankOptions(false);
            }}
          >
            <Text style={styles.payOptionText}>Credit / Debit Card</Text>
            <AppIcon
              name={showCardOptions ? "chevron-up" : "chevron-down"}
              size={18}
              color={Colors.white}
            />
          </TouchableOpacity>

          {showCardOptions && (
            <View style={styles.optionBox}>
              <TouchableOpacity
                style={[
                  styles.optionItem,
                  selectedPayMethod === "card-visa" && styles.optionItemSelected,
                ]}
                onPress={() => {
                  setSelectedPayMethod("card-visa");
                  setError("");
                }}
              >
                <Text style={styles.optionText}>Visa ending in 1234</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.optionItem,
                  selectedPayMethod === "card-mastercard" &&
                    styles.optionItemSelected,
                ]}
                onPress={() => {
                  setSelectedPayMethod("card-mastercard");
                  setError("");
                }}
              >
                <Text style={styles.optionText}>Mastercard ending in 5678</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            style={styles.payOption}
            onPress={() => {
              setShowBankOptions((prev) => !prev);
              setShowCardOptions(false);
            }}
          >
            <Text style={styles.payOptionText}>Bank Account Details</Text>
            <AppIcon
              name={showBankOptions ? "chevron-up" : "chevron-down"}
              size={18}
              color={Colors.white}
            />
          </TouchableOpacity>

          {showBankOptions && (
            <View style={styles.optionBox}>
              <TouchableOpacity
                style={[
                  styles.optionItem,
                  selectedPayMethod === "bank-chequing" &&
                    styles.optionItemSelected,
                ]}
                onPress={() => {
                  setSelectedPayMethod("bank-chequing");
                  setError("");
                }}
              >
                <Text style={styles.optionText}>Chequing Account</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.optionItem,
                  selectedPayMethod === "bank-savings" &&
                    styles.optionItemSelected,
                ]}
                onPress={() => {
                  setSelectedPayMethod("bank-savings");
                  setError("");
                }}
              >
                <Text style={styles.optionText}>Savings Account</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            style={styles.autoLoadBtn}
            onPress={() => router.push("/(wallet)/setup-auto-load" as any)}
          >
            <Text style={styles.autoLoadBtnText}>Setup Auto Load</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.addMoneyBtn, loading && { opacity: 0.6 }]}
            onPress={handleAddMoney}
            disabled={loading}
          >
            <Text style={styles.addMoneyBtnText}>
              {loading ? "Processing..." : "Add Money"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    padding: 20,
    gap: 14,
  },
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
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textDark,
  },
  amountInput: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 20,
    fontWeight: "700",
    color: Colors.textDark,
    backgroundColor: Colors.white,
  },
  amountInputError: {
    borderColor: Colors.error,
  },
  errorText: {
    fontSize: 12,
    color: Colors.error,
    marginTop: -6,
  },
  summaryBox: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    gap: 8,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryKey: {
    fontSize: 14,
    color: Colors.textMid,
  },
  summaryVal: {
    fontSize: 14,
    color: Colors.textDark,
  },
  summaryTotal: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 8,
    marginTop: 4,
  },
  summaryTotalKey: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.textDark,
  },
  summaryTotalVal: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.textDark,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textDark,
    marginTop: 4,
  },
  payOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  payOptionText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: "600",
  },
  optionBox: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 8,
    gap: 8,
  },
  optionItem: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
  },
  optionItemSelected: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  optionText: {
    fontSize: 14,
    color: Colors.textDark,
    fontWeight: "500",
  },
  autoLoadBtn: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
    backgroundColor: Colors.white,
  },
  autoLoadBtnText: {
    color: Colors.primary,
    fontWeight: "600",
    fontSize: 15,
  },
  addMoneyBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  addMoneyBtnText: {
    color: Colors.white,
    fontWeight: "700",
    fontSize: 16,
  },
});
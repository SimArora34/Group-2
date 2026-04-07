import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import AppIcon from "../../components/AppIcon";
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../constants/Colors";
import { supabase } from "../../src/lib/supabaseClient";
import { Profile } from "../../src/types";

export default function InvoiceSendUserScreen() {
  const { clientName, companyName, dueDate, amount, total } = useLocalSearchParams<{
    clientName?: string;
    companyName?: string;
    dueDate?: string;
    amount?: string;
    total?: string;
  }>();

  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<Profile[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setCurrentUserId(data.user.id);
    });
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setUsers([]);
      return;
    }

    const term = `%${search.trim()}%`;

    supabase
      .from("profiles")
      .select("*")
      .or(`full_name.ilike.${term},email.ilike.${term},username.ilike.${term}`)
      .neq("id", currentUserId ?? "")
      .limit(20)
      .then(({ data }) => setUsers((data ?? []) as Profile[]));
  }, [search, currentUserId]);

  const handleSend = async () => {
    if (!selected) return;

    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setSent(true);
  };

  if (sent) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <View style={styles.successWrap}>
          <View style={styles.banner}>
            <Text style={styles.bannerText}>Invoice Sent</Text>
          </View>

          <View style={styles.successIcon}>
            <AppIcon name="checkmark" size={44} color={Colors.white} />
          </View>

          <Text style={styles.congratsTitle}>Congratulations!</Text>
          <Text style={styles.congratsDesc}>
            Invoice has been sent.
            {"\n"}
            The amount will be displayed in your Transaction History under Business Wallet as{" "}
            <Text style={styles.owesYou}>"Owes you"</Text>
          </Text>

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => router.replace("/(wallet)/more" as any)}
          >
            <Text style={styles.primaryBtnText}>View My Card</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.outlineBtn}
            onPress={() => router.replace("/(tabs)/wallet" as any)}
          >
            <Text style={styles.outlineBtnText}>Go Back to App Wallet</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.inner}>
        <Text style={styles.fieldLabel}>Send to a user</Text>
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Enter username or email address"
          placeholderTextColor={Colors.textPlaceholder}
          autoCapitalize="none"
        />

        <View style={styles.invoiceSummary}>
          <Text style={styles.summaryTitle}>Invoice Summary</Text>
          <Text style={styles.summaryText}>Client: {clientName || "—"}</Text>
          <Text style={styles.summaryText}>Company: {companyName || "—"}</Text>
          <Text style={styles.summaryText}>Due Date: {dueDate || "—"}</Text>
          <Text style={styles.summaryText}>Amount: ${amount || "0.00"}</Text>
          <Text style={styles.summaryText}>Total: ${total || amount || "0.00"}</Text>
        </View>

        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.userRow, selected === item.id && styles.userRowSelected]}
              onPress={() => setSelected(item.id)}
            >
              <View style={styles.avatar}>
                <AppIcon name="person" size={20} color={Colors.primary} />
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{item.full_name ?? "—"}</Text>
                <Text style={styles.userEmail}>{item.email ?? ""}</Text>
                {item.username && <Text style={styles.userHandle}>@{item.username}</Text>}
              </View>
              <AppIcon name="arrow-forward" size={18} color={Colors.primary} />
            </TouchableOpacity>
          )}
          style={styles.list}
        />

        <TouchableOpacity
          style={[styles.sendBtn, (!selected || loading) && { opacity: 0.5 }]}
          onPress={handleSend}
          disabled={!selected || loading}
        >
          <Text style={styles.sendBtnText}>{loading ? "Sending..." : "Send to the user"}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  inner: { flex: 1, padding: 20, gap: 12 },
  fieldLabel: { fontSize: 14, fontWeight: "600", color: Colors.textDark },
  searchInput: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: Colors.textDark,
    backgroundColor: Colors.white,
  },
  invoiceSummary: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    gap: 4,
  },
  summaryTitle: { fontSize: 14, fontWeight: "700", color: Colors.textDark, marginBottom: 4 },
  summaryText: { fontSize: 13, color: Colors.textMid },
  list: { flex: 1 },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  userRowSelected: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 10,
    paddingHorizontal: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  userInfo: { flex: 1, gap: 1 },
  userName: { fontSize: 14, fontWeight: "600", color: Colors.textDark },
  userEmail: { fontSize: 12, color: Colors.textMid },
  userHandle: { fontSize: 12, color: Colors.textLight },
  sendBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: "center",
  },
  sendBtnText: { color: Colors.white, fontWeight: "700", fontSize: 16 },
  successWrap: { flex: 1, padding: 20, alignItems: "center", justifyContent: "center", gap: 18 },
  banner: {
    backgroundColor: Colors.primary,
    width: "100%",
    borderRadius: 10,
    paddingVertical: 14,
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
  },
  congratsTitle: { fontSize: 28, fontWeight: "800", color: Colors.textDark },
  congratsDesc: {
    fontSize: 15,
    color: Colors.textMid,
    textAlign: "center",
    lineHeight: 22,
  },
  owesYou: { fontWeight: "700", color: Colors.textDark },
  primaryBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    width: "100%",
    alignItems: "center",
  },
  primaryBtnText: { color: Colors.white, fontWeight: "700", fontSize: 16 },
  outlineBtn: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    width: "100%",
    alignItems: "center",
  },
  outlineBtnText: { color: Colors.primary, fontWeight: "700", fontSize: 16 },
});
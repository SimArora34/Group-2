import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../constants/Colors";
import { signOut } from "../src/services/authService";

type Screen = "main" | "payment-methods" | "contact";

function SettingsRow({
  label,
  onPress,
  icon,
  danger,
  right,
}: {
  label: string;
  onPress?: () => void;
  icon?: React.ReactNode;
  danger?: boolean;
  right?: React.ReactNode;
}) {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      activeOpacity={onPress ? 0.6 : 1}
    >
      {icon ? <View style={styles.rowIcon}>{icon}</View> : null}
      <Text style={[styles.rowLabel, danger && styles.rowLabelDanger]}>
        {label}
      </Text>
      <View style={styles.rowRight}>
        {right ??
          (onPress ? (
            <MaterialIcons
              name="chevron-right"
              size={22}
              color={Colors.textLight}
            />
          ) : null)}
      </View>
    </TouchableOpacity>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

export default function SettingsScreen() {
  const [subScreen, setSubScreen] = useState<Screen>("main");
  const [notificationsOn, setNotificationsOn] = useState(true);

  const handleLogout = async () => {
    Alert.alert("Log out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log out",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/(auth)");
        },
      },
    ]);
  };

  // ── PAYMENT METHODS SUB-SCREEN ────────────────────────────────
  if (subScreen === "payment-methods") {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setSubScreen("main")}>
            <MaterialIcons
              name="arrow-back"
              size={24}
              color={Colors.textDark}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={styles.headerIcons}>
            <MaterialIcons
              name="chat-bubble-outline"
              size={22}
              color={Colors.textDark}
            />
            <MaterialIcons
              name="notifications-none"
              size={22}
              color={Colors.textDark}
            />
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.paymentDesc}>
            The payment method you choose will be used to automatically make
            your contributions for all your clubs, and to receive your payout
            when it's your turn.
          </Text>

          <SectionHeader title="Pay By External Methods" />
          <View style={styles.card}>
            <SettingsRow
              label="Credit / Debit Card"
              right={<View style={styles.redDot} />}
            />
            <View style={styles.divider} />
            <SettingsRow
              label="Bank Account Details"
              right={<View style={styles.redDot} />}
            />
          </View>

          <SectionHeader title="Pay By App Wallet" />
          <View style={styles.card}>
            <SettingsRow
              label="App Wallets"
              right={<View style={styles.redDot} />}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── CONTACT INFORMATION SUB-SCREEN ───────────────────────────
  if (subScreen === "contact") {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setSubScreen("main")}>
            <MaterialIcons
              name="arrow-back"
              size={24}
              color={Colors.textDark}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={styles.headerIcons}>
            <MaterialIcons
              name="chat-bubble-outline"
              size={22}
              color={Colors.textDark}
            />
            <MaterialIcons
              name="notifications-none"
              size={22}
              color={Colors.textDark}
            />
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.contactTitle}>Contact Information</Text>

          <View style={styles.card}>
            <View style={styles.contactRow}>
              <MaterialIcons name="phone" size={20} color={Colors.primary} />
              <Text style={styles.contactText}>123-456-7890</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.contactRow}>
              <MaterialIcons name="email" size={20} color={Colors.primary} />
              <Text style={styles.contactText}>abcdef@email.com</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── MAIN SETTINGS SCREEN ─────────────────────────────────────
  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerIcons}>
          <MaterialIcons
            name="chat-bubble-outline"
            size={22}
            color={Colors.textDark}
          />
          <MaterialIcons
            name="notifications-none"
            size={22}
            color={Colors.textDark}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Notifications */}
        <SectionHeader title="Notifications" />
        <View style={styles.card}>
          <SettingsRow
            label="Manage app notifications"
            right={
              <Switch
                value={notificationsOn}
                onValueChange={setNotificationsOn}
                trackColor={{ false: Colors.border, true: Colors.primary }}
                thumbColor={Colors.white}
              />
            }
          />
        </View>

        {/* Payment information */}
        <SectionHeader title="Payment information" />
        <View style={styles.card}>
          <SettingsRow
            label="Manage Billing Address"
            onPress={() => router.push("/billing-address")}
          />
          <View style={styles.divider} />
          <SettingsRow
            label="Club Payment Methods"
            onPress={() => setSubScreen("payment-methods")}
          />
        </View>

        {/* Privacy and security */}
        <SectionHeader title="Privacy and security" />
        <View style={styles.card}>
          <SettingsRow
            label="Change password"
            onPress={() => router.push("/(auth)/set-password")}
          />
        </View>

        {/* Help */}
        <SectionHeader title="Help" />
        <View style={styles.card}>
          <SettingsRow label="Learn More" onPress={() => {}} />
          <View style={styles.divider} />
          <SettingsRow
            label="Contact us"
            onPress={() => setSubScreen("contact")}
          />
        </View>

        {/* Switch Accounts */}
        <SectionHeader title="Switch Accounts" />
        <View style={styles.card}>
          <SettingsRow
            label="Add an account"
            onPress={() => {}}
            icon={
              <MaterialIcons
                name="add-circle-outline"
                size={18}
                color={Colors.primary}
              />
            }
            right={
              <MaterialIcons
                name="add-circle-outline"
                size={20}
                color={Colors.primary}
              />
            }
          />
          <View style={styles.divider} />
          {["Account A", "Account B", "Account C"].map((acct, i) => (
            <View key={acct}>
              {i > 0 && <View style={styles.divider} />}
              <SettingsRow label={acct} onPress={() => {}} />
            </View>
          ))}
        </View>

        {/* Log out */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialIcons name="logout" size={18} color={Colors.error} />
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>

        {/* Legal */}
        <Text style={styles.legal}>
          Contriibia is authorized by FINTRAC to carry out money services
          business operations. By using this service, you confirm your agreement
          of our terms and conditions.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: { fontSize: 17, fontWeight: "700", color: Colors.textDark },
  headerIcons: { flexDirection: "row", gap: 10 },

  scroll: { padding: 20, gap: 8, paddingBottom: 40 },

  sectionHeader: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.textDark,
    marginTop: 12,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowIcon: { marginRight: 10 },
  rowLabel: { flex: 1, fontSize: 15, color: Colors.textDark },
  rowLabelDanger: { color: Colors.error },
  rowRight: { alignItems: "flex-end" },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginHorizontal: 16,
  },

  redDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.error,
  },

  paymentDesc: {
    fontSize: 13,
    color: Colors.textMid,
    lineHeight: 19,
    marginBottom: 8,
  },

  contactTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textDark,
    marginBottom: 8,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  contactText: { fontSize: 15, color: Colors.textDark },

  logoutButton: {
    marginTop: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.error,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  logoutText: { color: Colors.error, fontSize: 15, fontWeight: "700" },

  legal: {
    fontSize: 11,
    color: Colors.textLight,
    lineHeight: 17,
    textAlign: "center",
    marginTop: 8,
  },
});

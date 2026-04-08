import { router } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppIcon from "../../components/AppIcon";
import { Colors } from "../../constants/Colors";

type ItemProps = {
  label: string;
  screen?: string;
  icon?: string;
  download?: boolean;
};

function SectionTitle({ title }: { title: string }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

function MenuItem({ label, screen, icon = "arrow-forward", download = false }: ItemProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={styles.item}
      onPress={() => {
        if (screen) {
          router.push(`/(wallet)/${screen}` as any);
        }
      }}
    >
      <Text style={styles.itemText}>{label}</Text>

      <AppIcon
        name={download ? "download" : icon}
        size={22}
        color={Colors.primary}
      />
    </TouchableOpacity>
  );
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

export default function MoreScreen() {
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <AppIcon name="arrow-back" size={24} color={Colors.textDark} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>More</Text>
        </View>

        <SectionTitle title="Personal Card" />
        <SectionCard>
          <MenuItem label="Freeze Contriibia Cards" screen="freeze-card" />
          <View style={styles.divider} />
          <MenuItem label="Setup Tap to Pay (NFC)" screen="tap-to-pay" />
        </SectionCard>

        <SectionTitle title="External Cards and Account
For Personal Wallet" />
        <SectionCard>
          <MenuItem label="Manage Cards" screen="view-my-cards" />
          <View style={styles.divider} />
          <MenuItem label="Manage Bank Accounts" screen="manage-accounts" />
        </SectionCard>

        <SectionTitle title="Transaction History" />
        <SectionCard>
          <MenuItem
            label="Download Transaction History"
            screen="transaction-history"
            download
          />
        </SectionCard>

        <SectionTitle title="Security" />
        <SectionCard>
          <MenuItem
            label="Biometric Authentication"
            screen="biometric-authentication"
          />
          <View style={styles.divider} />
          <MenuItem label="Setup Auto Load" screen="setup-auto-load" />
        </SectionCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 28,
    marginTop: 6,
  },

  backButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textDark,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.textDark,
    marginBottom: 12,
    marginTop: 12,
    lineHeight: 22,
  },

  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E6E6E6",
    overflow: "hidden",
    marginBottom: 22,
  },

  item: {
    minHeight: 68,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.white,
  },

  itemText: {
    fontSize: 15,
    color: Colors.textDark,
    fontWeight: "500",
    flex: 1,
    marginRight: 12,
  },

  divider: {
    height: 1,
    backgroundColor: "#ECECEC",
    marginLeft: 20,
  },
});
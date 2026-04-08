import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
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
import { getUserCircles } from "../../src/services/circleService";
import { getCurrentProfile } from "../../src/services/profileService";
import { Circle } from "../../src/types";

function DashboardClubCard({ club }: { club: Circle }) {
  return (
    <View style={styles.clubCard}>
      <View style={styles.clubCardTop}>
        <View style={styles.clubInfoWrap}>
          <Text style={styles.clubCardTitle} numberOfLines={1}>
            {club.name}
          </Text>
          <Text style={styles.clubContributionLabel}>Contribution Amount</Text>
        </View>

        <View style={styles.clubRightWrap}>
          <Text style={styles.clubStatus}>Active</Text>
          <Text style={styles.clubContributionValue}>
            ${Number(club.contribution_amount || 0).toFixed(0)} CAD
          </Text>
        </View>
      </View>
    </View>
  );
}

function SectionHeader({
  title,
  expanded,
  onToggle,
}: {
  title: string;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.sectionHeader}
      onPress={onToggle}
      activeOpacity={0.85}
    >
      <Text style={styles.sectionHeaderText}>{title}</Text>

      <View style={styles.sectionHeaderIcon}>
        <AppIcon
          name={expanded ? "keyboard-arrow-up" : "keyboard-arrow-down"}
          size={18}
          color="#EA6E6E"
        />
      </View>
    </TouchableOpacity>
  );
}

export default function DashboardScreen() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [firstName, setFirstName] = useState("Jamie");

  const [privateExpanded, setPrivateExpanded] = useState(true);
  const [publicExpanded, setPublicExpanded] = useState(true);
  const [clubMenuVisible, setClubMenuVisible] = useState(false);
  const [myClubs, setMyClubs] = useState<Circle[]>([]);

  const loadDashboard = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);

      const [profileRes, myClubsRes] = await Promise.all([
        getCurrentProfile(),
        getUserCircles(),
      ]);

      if (profileRes.success && profileRes.data) {
        const rawName =
          profileRes.data.full_name || profileRes.data.username || "Jamie";
        const first = rawName.trim().split(" ")[0] || "Jamie";
        setFirstName(first);
      }

      if (myClubsRes.success && myClubsRes.data) {
        setMyClubs(myClubsRes.data);
      } else {
        setMyClubs([]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, [loadDashboard])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboard(false);
  };

  const privateClubs = useMemo(
    () => myClubs.filter((club) => club.visibility === "private"),
    [myClubs]
  );

  const publicClubs = useMemo(
    () => myClubs.filter((club) => club.visibility === "public"),
    [myClubs]
  );

  const hasClubs = myClubs.length > 0;

  if (loading) {
    return (
      <SafeAreaView style={styles.loaderPage} edges={["top", "bottom"]}>
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loaderText}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.topIconBtn}
            onPress={() => router.replace("/(tabs)" as any)}
            activeOpacity={0.85}
          >
            <AppIcon name="arrow-back" size={24} color={Colors.textDark} />
          </TouchableOpacity>

          <Text style={styles.pageTitle}>Dashboard</Text>

          <View style={styles.topRightIcons}>
            <TouchableOpacity style={styles.topIconBtn} activeOpacity={0.85}>
              <AppIcon
                name="chat-bubble-outline"
                size={21}
                color={Colors.textDark}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.topIconBtn} activeOpacity={0.85}>
              <AppIcon
                name="notifications-none"
                size={24}
                color={Colors.textDark}
              />
              <View style={styles.notifyDot} />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.welcomeText}>
          {hasClubs ? `Welcome back, ${firstName}` : `Welcome, ${firstName}`}
        </Text>

        {!hasClubs && (
          <View style={styles.emptyStateCard}>
            <Text style={styles.emptyLead}>Boost your savings!</Text>
            <Text style={styles.emptyCopy}>
              Use the + button to create or explore savings clubs.
            </Text>
          </View>
        )}

        <SectionHeader
          title="Private Clubs"
          expanded={privateExpanded}
          onToggle={() => setPrivateExpanded((prev) => !prev)}
        />

        {privateExpanded && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionBody}>
              {privateClubs.length > 0 ? (
                privateClubs.map((club) => (
                  <DashboardClubCard key={club.id} club={club} />
                ))
              ) : (
                <View style={styles.emptyBox}>
                  <Text style={styles.emptyText}>
                    No private savings clubs yet.
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        <SectionHeader
          title="Public Clubs"
          expanded={publicExpanded}
          onToggle={() => setPublicExpanded((prev) => !prev)}
        />

        {publicExpanded && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionBody}>
              {publicClubs.length > 0 ? (
                publicClubs.map((club) => (
                  <DashboardClubCard key={club.id} club={club} />
                ))
              ) : (
                <View style={styles.emptyBox}>
                  <Text style={styles.emptyText}>No public savings clubs yet.</Text>
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => setClubMenuVisible(true)}
        activeOpacity={0.85}
      >
        <AppIcon name="add" size={28} color={Colors.white} />
      </TouchableOpacity>

      <Modal
        visible={clubMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setClubMenuVisible(false)}
      >
        <Pressable
          style={styles.menuOverlay}
          onPress={() => setClubMenuVisible(false)}
        >
          <View style={styles.menuSheet}>
            <Text style={styles.menuTitle}>Savings Clubs</Text>

            <TouchableOpacity
              style={styles.menuOption}
              activeOpacity={0.85}
              onPress={() => {
                setClubMenuVisible(false);
                router.push("/(clubs)/create-club");
              }}
            >
              <View style={styles.menuIconWrap}>
                <AppIcon
                  name="add-circle-outline"
                  size={22}
                  color={Colors.primary}
                />
              </View>
              <View style={styles.menuOptionText}>
                <Text style={styles.menuOptionTitle}>Create a new savings club</Text>
                <Text style={styles.menuOptionDesc}>Start your own savings club</Text>
              </View>
              <AppIcon name="chevron-right" size={20} color={Colors.textLight} />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.menuOption}
              activeOpacity={0.85}
              onPress={() => {
                setClubMenuVisible(false);
                router.push("/(clubs)/clubs?view=explore");
              }}
            >
              <View style={styles.menuIconWrap}>
                <AppIcon name="search" size={22} color={Colors.primary} />
              </View>
              <View style={styles.menuOptionText}>
                <Text style={styles.menuOptionTitle}>Explore savings clubs</Text>
                <Text style={styles.menuOptionDesc}>
                  Browse and join public savings clubs
                </Text>
              </View>
              <AppIcon name="chevron-right" size={20} color={Colors.textLight} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuCancel}
              onPress={() => setClubMenuVisible(false)}
            >
              <Text style={styles.menuCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8F9",
  },
  scroll: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 120,
    gap: 14,
  },
  loaderPage: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loaderWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 24,
  },
  loaderText: {
    marginTop: 12,
    fontSize: 15,
    color: Colors.textMid,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    paddingHorizontal: 6,
    marginBottom: 14,
  },
  topRightIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  topIconBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.textDark,
  },
  welcomeText: {
    fontSize: 37,
    fontWeight: "800",
    color: Colors.textDark,
    lineHeight: 42,
    marginBottom: 8,
  },
  emptyStateCard: {
    paddingHorizontal: 2,
    paddingTop: 2,
    paddingBottom: 4,
  },
  emptyLead: {
    fontSize: 17,
    fontWeight: "800",
    color: Colors.textDark,
    marginBottom: 6,
  },
  emptyCopy: {
    fontSize: 14,
    color: Colors.textMid,
    lineHeight: 20,
    marginBottom: 4,
  },
  sectionHeader: {
    backgroundColor: "#F9FBFC",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
    borderWidth: 1,
    borderColor: "#D7E5E5",
  },
  sectionHeaderText: {
    color: Colors.textDark,
    fontSize: 18,
    fontWeight: "700",
  },
  sectionHeaderIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#FFE5E5",
    alignItems: "center",
    justifyContent: "center",
  },
  sectionCard: {
    backgroundColor: "#F9FBFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D7E5E5",
    marginBottom: 4,
    overflow: "hidden",
  },
  sectionBody: {
    gap: 8,
    padding: 10,
  },
  clubCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 9,
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  clubCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
  },
  clubInfoWrap: {
    flex: 1,
  },
  clubRightWrap: {
    alignItems: "flex-end",
    minWidth: 90,
  },
  clubCardTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    color: Colors.primary,
    marginBottom: 4,
  },
  clubStatus: {
    fontSize: 10,
    fontWeight: "700",
    color: "#22A06B",
    marginBottom: 6,
  },
  clubContributionLabel: {
    fontSize: 10,
    color: Colors.textMid,
  },
  clubContributionValue: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.textDark,
    textAlign: "right",
  },
  emptyBox: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textMid,
  },
  floatingButton: {
    position: "absolute",
    right: 14,
    bottom: 18,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#2F9CAC",
    alignItems: "center",
    justifyContent: "center",
    elevation: 10,
  },
  notifyDot: {
    position: "absolute",
    top: 8,
    right: 6,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#EF4444",
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  menuSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 36,
    gap: 4,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.textDark,
    marginBottom: 12,
  },
  menuOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    gap: 14,
  },
  menuIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.primaryLight ?? "#EEF4FF",
    alignItems: "center",
    justifyContent: "center",
  },
  menuOptionText: {
    flex: 1,
  },
  menuOptionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.textDark,
  },
  menuOptionDesc: {
    fontSize: 13,
    color: Colors.textMid,
    marginTop: 2,
  },
  menuDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 4,
  },
  menuCancel: {
    marginTop: 8,
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  menuCancelText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.textMid,
  },
});

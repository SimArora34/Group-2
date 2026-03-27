import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
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
import { getCurrentProfile } from "../../src/services/profileService";
import {
  getPublicCircles,
  getUserCircles,
} from "../../src/services/circleService";
import { Circle } from "../../src/types";

type DashboardClubCardProps = {
  club: Circle;
  joined?: boolean;
};

function DashboardActionButton({
  label,
  outline = false,
  onPress,
}: {
  label: string;
  outline?: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.actionButton, outline && styles.actionButtonOutline]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Text
        style={[
          styles.actionButtonText,
          outline && styles.actionButtonOutlineText,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function DashboardClubCard({
  club,
  joined = false,
}: DashboardClubCardProps) {
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
          <Text
            style={[
              styles.clubStatus,
              joined ? styles.clubStatusJoined : styles.clubStatusPublic,
            ]}
          >
            {joined ? "Active" : club.visibility === "private" ? "Private" : "Public"}
          </Text>

          <Text style={styles.clubContributionValue}>
            ${Number(club.contribution_amount || 0).toFixed(0)} CAD
          </Text>
        </View>
      </View>

      <View style={styles.clubMetaRow}>
        <Text style={styles.clubMetaText}>
          Members: {club.total_members ?? 0}
        </Text>
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
          size={20}
          color={Colors.white}
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

  const [myClubs, setMyClubs] = useState<Circle[]>([]);
  const [publicClubs, setPublicClubs] = useState<Circle[]>([]);

  const loadDashboard = async () => {
    try {
      if (!refreshing) setLoading(true);

      const [profileRes, myClubsRes, publicClubsRes] = await Promise.all([
        getCurrentProfile(),
        getUserCircles(),
        getPublicCircles(),
      ]);

      if (profileRes.success && profileRes.data) {
        const rawName =
          profileRes.data.full_name ||
          profileRes.data.username ||
          "Jamie";

        const first = rawName.trim().split(" ")[0] || "Jamie";
        setFirstName(first);
      }

      if (myClubsRes.success && myClubsRes.data) {
        setMyClubs(myClubsRes.data);
      } else {
        setMyClubs([]);
      }

      if (publicClubsRes.success && publicClubsRes.data) {
        setPublicClubs(publicClubsRes.data);
      } else {
        setPublicClubs([]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, [])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboard();
  };

  const myPrivateClubs = useMemo(() => {
    return myClubs.filter((club) => club.visibility === "private");
  }, [myClubs]);

  const myClubIds = useMemo(
    () => new Set(myClubs.map((club) => club.id)),
    [myClubs]
  );

  const availablePublicClubs = useMemo(() => {
    return publicClubs.filter((club) => !myClubIds.has(club.id));
  }, [publicClubs, myClubIds]);

  const hasClubs = myClubs.length > 0 || availablePublicClubs.length > 0;

  if (loading) {
    return (
      <SafeAreaView style={styles.loaderWrap}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loaderText}>Loading dashboard...</Text>
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
              <AppIcon name="person" size={24} color={Colors.textDark} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.topIconBtn} activeOpacity={0.85}>
              <AppIcon name="notifications" size={22} color={Colors.textDark} />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.welcomeText}>
          {hasClubs ? `Welcome back,\n${firstName}` : `Welcome,\n${firstName}`}
        </Text>

        {!hasClubs && (
          <View style={styles.emptyStateCard}>
            <Text style={styles.emptyLead}>Boost your savings!</Text>
            <Text style={styles.emptyCopy}>
              Create or join a savings club to start saving together.
            </Text>

            <View style={styles.actionsWrap}>
              <DashboardActionButton
                label="Create a new savings club"
                onPress={() => router.push("/create-club" as any)}
              />

              <DashboardActionButton
                label="Explore public savings clubs"
                outline
                onPress={() => router.push("/(tabs)/clubs" as any)}
              />
            </View>
          </View>
        )}

        {!!myPrivateClubs.length && (
          <>
            <SectionHeader
              title="Private Clubs"
              expanded={privateExpanded}
              onToggle={() => setPrivateExpanded((prev) => !prev)}
            />

            {privateExpanded && (
              <View style={styles.sectionCard}>
                <View style={styles.sectionBody}>
                  {myPrivateClubs.map((club) => (
                    <DashboardClubCard key={club.id} club={club} joined />
                  ))}
                </View>
              </View>
            )}
          </>
        )}

        <SectionHeader
          title="Public Clubs"
          expanded={publicExpanded}
          onToggle={() => setPublicExpanded((prev) => !prev)}
        />

        {publicExpanded && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionBody}>
              {availablePublicClubs.length > 0 ? (
                availablePublicClubs.map((club) => (
                  <DashboardClubCard key={club.id} club={club} />
                ))
              ) : (
                <View style={styles.emptyBox}>
                  <Text style={styles.emptyText}>
                    No public clubs available right now.
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {hasClubs && (
          <View style={styles.actionsWrap}>
            <DashboardActionButton
              label="Create a new savings club"
              onPress={() => router.push("/create-club" as any)}
            />

            <DashboardActionButton
              label="Explore public savings clubs"
              outline
              onPress={() => router.push("/(tabs)/clubs" as any)}
            />
          </View>
        )}

        <TouchableOpacity
          style={styles.floatingButton}
          onPress={() => router.push("/(tabs)/clubs" as any)}
          activeOpacity={0.85}
        >
          <AppIcon name="add" size={28} color={Colors.white} />
        </TouchableOpacity>
      </ScrollView>
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
    paddingBottom: 120,
    gap: 16,
  },

  loaderWrap: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
  },

  loaderText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textMid,
  },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  topRightIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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
    fontSize: 30,
    fontWeight: "800",
    color: Colors.textDark,
    lineHeight: 36,
    marginBottom: 4,
  },

  emptyStateCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 18,
    marginTop: 8,
  },

  emptyLead: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.textDark,
    marginBottom: 8,
  },

  emptyCopy: {
    fontSize: 14,
    color: Colors.textMid,
    lineHeight: 21,
    marginBottom: 16,
  },

  sectionHeader: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },

  sectionHeaderText: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: "700",
  },

  sectionHeaderIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F47F7F",
    alignItems: "center",
    justifyContent: "center",
  },

  sectionCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },

  sectionBody: {
    gap: 12,
  },

  clubCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#EAEAEA",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
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
    fontSize: 16,
    fontWeight: "800",
    color: Colors.textDark,
    marginBottom: 8,
  },

  clubStatus: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "capitalize",
    marginBottom: 8,
  },

  clubStatusJoined: {
    color: "#22A06B",
  },

  clubStatusPublic: {
    color: Colors.primary,
  },

  clubContributionLabel: {
    fontSize: 13,
    color: Colors.textMid,
    marginBottom: 4,
  },

  clubContributionValue: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textMid,
    textAlign: "right",
  },

  clubMetaRow: {
    marginTop: 10,
  },

  clubMetaText: {
    fontSize: 13,
    color: Colors.textMid,
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

  actionsWrap: {
    gap: 14,
    marginTop: 10,
  },

  actionButton: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: "center",
    justifyContent: "center",
  },

  actionButtonOutline: {
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },

  actionButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "700",
  },

  actionButtonOutlineText: {
    color: Colors.primary,
  },

  floatingButton: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    elevation: 10,
  },
});
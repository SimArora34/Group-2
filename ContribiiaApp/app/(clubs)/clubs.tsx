import {
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
  useRouter,
} from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import {
  ClubOverviewModal,
  MemberAgreementModal,
} from "../../components/JoinClubFlow";
import ClubOverviewScreen from "./club-overview";
import { Colors } from "../../constants/Colors";
import { supabase } from "../../src/lib/supabaseClient";
import { getCurrentProfile } from "../../src/services/profileService";

type ExtendedCircle = {
  id: string;
  name: string;
  owner_id: string;
  contribution_amount: number;
  visibility: "public" | "private";
  total_members: number;
  created_at: string;
  savings_goal?: number | null;
  duration_months?: number | null;
  cycle_start_date?: string | null;
  contribution_frequency?: string | null;
  total_positions?: number | null;
  circle_members?: {
    id?: string;
    circle_id?: string;
    user_id?: string;
    joined_at?: string | null;
    order_position?: number | null;
    profiles?: { full_name?: string | null } | null;
  }[];
};

function DashboardClubCard({
  club,
  onPress,
}: {
  club: ExtendedCircle;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.clubCard}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.clubCardLeft}>
        <Text style={styles.clubCardName} numberOfLines={1}>
          {club.name}
        </Text>
        <Text style={styles.clubCardLabel}>Contribution Amount</Text>
      </View>
      <View style={styles.clubCardRight}>
        <Text style={styles.clubCardStatus}>Active</Text>
        <Text style={styles.clubCardAmount}>
          ${Number(club.contribution_amount || 0).toFixed(0)} CAD
        </Text>
      </View>
    </TouchableOpacity>
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

export default function ClubsScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const params = useLocalSearchParams();
  const viewParam = Array.isArray(params.view) ? params.view[0] : params.view;
  const modeParam = Array.isArray(params.mode) ? params.mode[0] : params.mode;
  const isExploreMode = viewParam === "explore" || modeParam === "explore";

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("Jamie");
  const [menuVisible, setMenuVisible] = useState(false);

  const [privateExpanded, setPrivateExpanded] = useState(true);
  const [publicExpanded, setPublicExpanded] = useState(true);

  const [myClubs, setMyClubs] = useState<ExtendedCircle[]>([]);
  const [publicClubs, setPublicClubs] = useState<ExtendedCircle[]>([]);

  const [selectedCircle, setSelectedCircle] = useState<ExtendedCircle | null>(null);
  const [showOverview, setShowOverview] = useState(false);
  const [showAgreement, setShowAgreement] = useState(false);
  const [showActiveClub, setShowActiveClub] = useState(false);
  const [showExplore, setShowExplore] = useState(false);
  const [agreeJoining, setAgreeJoining] = useState(false);

  useEffect(() => {
    if (isExploreMode) setShowExplore(true);
  }, [isExploreMode]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('tabPress' as any, () => {
      setShowExplore(false);
      setShowActiveClub(false);
      setMenuVisible(false);
    });
    return unsubscribe;
  }, [navigation]);

  const loadClubs = useCallback(async () => {
    try {
      if (!refreshing) setLoading(true);

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        Alert.alert("Error", "User not authenticated");
        setMyClubs([]);
        setPublicClubs([]);
        return;
      }

      const profileRes = await getCurrentProfile();
      if (profileRes.success && profileRes.data) {
        const rawName =
          profileRes.data.full_name || profileRes.data.username || "Jamie";
        setFirstName(rawName.trim().split(" ")[0] || "Jamie");
      }

      const { data: memberships, error: membershipsError } = await supabase
        .from("circle_members")
        .select("circle_id")
        .eq("user_id", user.id);

      if (membershipsError) {
        Alert.alert("Membership Error", membershipsError.message);
        setMyClubs([]);
      } else {
        const circleIds = (memberships ?? []).map((m) => m.circle_id);
        if (circleIds.length === 0) {
          setMyClubs([]);
        } else {
          const { data: joinedCircles, error: joinedError } = await supabase
            .from("circles")
            .select("*")
            .in("id", circleIds)
            .order("created_at", { ascending: false });

          if (joinedError) {
            Alert.alert("Joined Clubs Error", joinedError.message);
            setMyClubs([]);
          } else {
            setMyClubs((joinedCircles ?? []) as ExtendedCircle[]);
          }
        }
      }

      const { data: allPublic, error: publicError } = await supabase
        .from("circles")
        .select("*")
        .eq("visibility", "public")
        .order("created_at", { ascending: false });

      if (publicError) {
        Alert.alert("Public Clubs Error", publicError.message);
        setPublicClubs([]);
      } else {
        setPublicClubs((allPublic ?? []) as ExtendedCircle[]);
      }
    } catch {
      Alert.alert("Error", "Failed to load clubs");
      setMyClubs([]);
      setPublicClubs([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshing]);

  useFocusEffect(
    useCallback(() => {
      loadClubs();
    }, [loadClubs])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadClubs();
  };

  const handleJoin = async (circleId: string) => {
    const circle =
      publicClubs.find((c) => c.id === circleId) ||
      myClubs.find((c) => c.id === circleId) ||
      null;
    setSelectedCircle(circle);
    setShowAgreement(true);
  };

  const handleConfirmAgreementJoin = async () => {
    if (!selectedCircle) return;
    try {
      setAgreeJoining(true);
      setJoiningId(selectedCircle.id);

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        Alert.alert("Error", "User not authenticated");
        return;
      }

      const { error } = await supabase.from("circle_members").insert({
        circle_id: selectedCircle.id,
        user_id: user.id,
      });

      if (
        error &&
        !error.message.toLowerCase().includes("duplicate") &&
        !error.message.toLowerCase().includes("unique")
      ) {
        Alert.alert("Unable to join club", error.message);
        return;
      }

      setShowAgreement(false);
      Alert.alert("Success", "You joined the club successfully.");
      await loadClubs();
    } finally {
      setAgreeJoining(false);
      setJoiningId(null);
    }
  };

  const myClubIds = useMemo(
    () => new Set(myClubs.map((club) => club.id)),
    [myClubs]
  );

  const myPrivateClubs = useMemo(
    () => myClubs.filter((club) => club.visibility === "private"),
    [myClubs]
  );

  const myPublicClubs = useMemo(
    () => myClubs.filter((club) => club.visibility === "public"),
    [myClubs]
  );

  const availablePublicClubs = useMemo(
    () => publicClubs.filter((club) => !myClubIds.has(club.id)),
    [publicClubs, myClubIds]
  );

  const hasClubs = myClubs.length > 0;

  if (showExplore) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        {/* Explore header */}
        <View style={styles.exploreHeader}>
          <TouchableOpacity onPress={() => setShowExplore(false)} style={styles.exploreBackBtn}>
            <AppIcon name="arrow-back" size={24} color={Colors.textDark} />
          </TouchableOpacity>
          <Text style={styles.exploreTitle}>Join a Public Club</Text>
          <View style={{ width: 36 }} />
        </View>

        <Text style={styles.exploreSubtitle}>
          Find community by joining one of our public savings clubs awaiting new members.
        </Text>

        <View style={styles.exploreToolbar}>
          <TouchableOpacity style={styles.filterBtn} activeOpacity={0.8} onPress={() => Alert.alert('Coming Soon', 'Filtering options are coming in a future update.')}>
            <AppIcon name="filter-list" size={16} color={Colors.textDark} />
            <Text style={styles.filterBtnText}>Filter</Text>
          </TouchableOpacity>
          <Text style={styles.clubCount}>{availablePublicClubs.length} clubs</Text>
          <Text style={styles.sortLabel}>Sort By: <Text style={styles.sortValue}>Most Recent</Text></Text>
        </View>

        <ScrollView contentContainerStyle={styles.exploreScroll} showsVerticalScrollIndicator={false}>
          {availablePublicClubs.length === 0 ? (
            <Text style={styles.emptyText}>No public clubs available right now.</Text>
          ) : (
            availablePublicClubs.map((club) => (
              <TouchableOpacity
                key={club.id}
                style={styles.exploreCard}
                activeOpacity={0.85}
                onPress={() => { setSelectedCircle(club); setShowOverview(true); }}
              >
                <View style={styles.exploreCardHeader}>
                  <Text style={styles.exploreCardName}>{club.name}</Text>
                  <Text style={styles.exploreCardMembers}>
                    {club.total_members ?? 0} members joined
                  </Text>
                </View>
                <View style={styles.exploreCardDetails}>
                  <View style={styles.exploreDetailRow}>
                    <Text style={styles.exploreDetailLabel}>Savings Goal</Text>
                    <Text style={styles.exploreDetailValue}>
                      {club.savings_goal ? `$${Number(club.savings_goal).toLocaleString()}` : '—'}
                    </Text>
                  </View>
                  <View style={styles.exploreDetailRow}>
                    <Text style={styles.exploreDetailLabel}>Contribution</Text>
                    <Text style={styles.exploreDetailValue}>
                      ${Number(club.contribution_amount ?? 0).toLocaleString()}{club.contribution_frequency ? `, every ${club.contribution_frequency}` : ''}
                    </Text>
                  </View>
                  <View style={styles.exploreDetailRow}>
                    <Text style={styles.exploreDetailLabel}>Duration</Text>
                    <Text style={styles.exploreDetailValue}>
                      {club.duration_months ? `${club.duration_months} months` : '—'}
                    </Text>
                  </View>
                  <View style={[styles.exploreDetailRow, { borderBottomWidth: 0 }]}>
                    <Text style={styles.exploreDetailLabel}>Cycle Start Date</Text>
                    <Text style={styles.exploreDetailValue}>
                      {club.cycle_start_date
                        ? new Date(club.cycle_start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : '—'}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>

        <ClubOverviewModal
          visible={showOverview}
          circle={selectedCircle}
          alreadyMember={selectedCircle ? myClubIds.has(selectedCircle.id) : false}
          onClose={() => setShowOverview(false)}
          onJoinPress={() => { setShowOverview(false); setShowAgreement(true); }}
        />
        <MemberAgreementModal
          visible={showAgreement}
          circle={selectedCircle}
          joining={agreeJoining}
          onConfirm={handleConfirmAgreementJoin}
          onCancel={() => setShowAgreement(false)}
        />
      </SafeAreaView>
    );
  }

  if (showActiveClub && selectedCircle) {
    return (
      <ClubOverviewScreen
        circle={selectedCircle}
        onBack={() => { setShowActiveClub(false); loadClubs(); }}
        onOpenMembers={() => router.push({ pathname: '/(clubs)/club-members' as any, params: { id: selectedCircle.id } })}
        onRequestCashAdvance={() => router.push('/(clubs)/cash-advance' as any)}
      />
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.loaderWrap}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loaderText}>Loading clubs...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.topBar}>
          <Text style={styles.pageTitle}>Dashboard</Text>
          <View style={styles.topRightIcons}>
            <TouchableOpacity style={styles.topIconBtn} activeOpacity={0.85} onPress={() => Alert.alert('Coming Soon', 'Chat messaging will be available in a future update.')}>
              <AppIcon name="chat-bubble-outline" size={21} color={Colors.textDark} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.topIconBtn} activeOpacity={0.85} onPress={() => Alert.alert('Coming Soon', 'Notifications will be available in a future update.')}>
              <AppIcon name="notifications-none" size={24} color={Colors.textDark} />
              <View style={styles.notifyDot} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Welcome */}
        <Text style={styles.welcomeText}>
          {hasClubs ? `Welcome back, ${firstName}` : `Welcome, ${firstName}`}
        </Text>

        {/* Empty state */}
        {!hasClubs && (
          <View style={styles.emptyStateCard}>
            <Text style={styles.emptyLead}>Boost your savings!</Text>
            <Text style={styles.emptyCopy}>
              Create or join a savings club to start saving together.
            </Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => router.push("/(clubs)/create-club")}
              activeOpacity={0.85}
            >
              <Text style={styles.emptyBtnText}>Create a new savings club</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.emptyBtnOutline}
              onPress={() => setShowExplore(true)}
              activeOpacity={0.85}
            >
              <Text style={styles.emptyBtnOutlineText}>Explore public savings clubs</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* My clubs sections */}
        {hasClubs && (
          <>
            <SectionHeader
              title="Private Clubs"
              expanded={privateExpanded}
              onToggle={() => setPrivateExpanded((prev) => !prev)}
            />
            {privateExpanded && (
              <View style={styles.sectionCard}>
                {myPrivateClubs.length > 0 ? (
                  myPrivateClubs.map((club) => (
                    <DashboardClubCard
                      key={club.id}
                      club={club}
                      onPress={async () => {
                        const { data } = await supabase.from('circles').select('*, circle_members(id, user_id, order_position, joined_at, profiles(full_name))').eq('id', club.id).single();
                        setSelectedCircle((data ?? club) as ExtendedCircle);
                        setShowActiveClub(true);
                      }}
                    />
                  ))
                ) : (
                  <Text style={styles.emptyText}>No private savings clubs yet.</Text>
                )}
              </View>
            )}

            <SectionHeader
              title="Public Clubs"
              expanded={publicExpanded}
              onToggle={() => setPublicExpanded((prev) => !prev)}
            />
            {publicExpanded && (
              <View style={styles.sectionCard}>
                {myPublicClubs.length > 0 ? (
                  myPublicClubs.map((club) => (
                    <DashboardClubCard
                      key={`joined-${club.id}`}
                      club={club}
                      onPress={async () => {
                        const { data } = await supabase.from('circles').select('*, circle_members(id, user_id, order_position, joined_at, profiles(full_name))').eq('id', club.id).single();
                        setSelectedCircle((data ?? club) as ExtendedCircle);
                        setShowActiveClub(true);
                      }}
                    />
                  ))
                ) : (
                  <Text style={styles.emptyText}>No public savings clubs yet.</Text>
                )}
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* FAB menu */}
      {menuVisible && (
        <View style={styles.menuFloating}>
          <TouchableOpacity
            style={styles.menuFloatBtn}
            activeOpacity={0.85}
            onPress={() => {
              setMenuVisible(false);
              router.push("/(clubs)/create-club");
            }}
          >
            <Text style={styles.menuFloatBtnText}>Create a new savings club</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuFloatBtn}
            activeOpacity={0.85}
            onPress={() => {
              setMenuVisible(false);
              setShowExplore(true);
            }}
          >
            <Text style={styles.menuFloatBtnText}>Explore public savings clubs</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setMenuVisible((v) => !v)}
        activeOpacity={0.85}
      >
        <AppIcon name={menuVisible ? "close" : "add"} size={28} color={Colors.white} />
      </TouchableOpacity>

      <ClubOverviewModal
        visible={showOverview}
        circle={selectedCircle}
        alreadyMember={selectedCircle ? myClubIds.has(selectedCircle.id) : false}
        onClose={() => setShowOverview(false)}
        onJoinPress={() => {
          setShowOverview(false);
          setShowAgreement(true);
        }}
      />

      <MemberAgreementModal
        visible={showAgreement}
        circle={selectedCircle}
        joining={agreeJoining}
        onConfirm={handleConfirmAgreementJoin}
        onCancel={() => setShowAgreement(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F8F9" },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 120,
    gap: 14,
  },
  loaderWrap: {
    flex: 1,
    backgroundColor: "#F7F8F9",
    justifyContent: "center",
    alignItems: "center",
  },
  loaderText: { marginTop: 12, fontSize: 14, color: Colors.textMid },

  /* Header */
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight ?? "#E8EAF0",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.textDark,
    paddingLeft: 6,
  },
  topRightIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  topIconBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
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

  /* Welcome */
  welcomeText: {
    fontSize: 36,
    fontWeight: "800",
    color: Colors.textDark,
    lineHeight: 42,
  },

  /* Empty state */
  emptyStateCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.borderLight ?? "#E8EAF0",
  },
  emptyLead: {
    fontSize: 17,
    fontWeight: "800",
    color: Colors.textDark,
  },
  emptyCopy: {
    fontSize: 14,
    color: Colors.textMid,
    lineHeight: 20,
    marginBottom: 4,
  },
  emptyBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  emptyBtnText: {
    color: Colors.white,
    fontWeight: "700",
    fontSize: 15,
  },
  emptyBtnOutline: {
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    paddingVertical: 13,
    alignItems: "center",
  },
  emptyBtnOutlineText: {
    color: Colors.primary,
    fontWeight: "700",
    fontSize: 15,
  },

  /* Section header */
  sectionHeader: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.borderLight ?? "#E8EAF0",
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textDark,
  },
  sectionHeaderIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#FDE8E8",
    alignItems: "center",
    justifyContent: "center",
  },

  /* Section card */
  sectionCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 12,
    gap: 2,
    borderWidth: 1,
    borderColor: Colors.borderLight ?? "#E8EAF0",
    marginTop: -8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textMid,
    padding: 8,
  },

  /* Club card */
  clubCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F4",
  },
  clubCardLeft: { flex: 1 },
  clubCardName: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.primary,
    marginBottom: 2,
  },
  clubCardLabel: {
    fontSize: 12,
    color: Colors.textMid,
  },
  clubCardRight: { alignItems: "flex-end" },
  clubCardStatus: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.primary,
    marginBottom: 2,
  },
  clubCardAmount: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textDark,
  },

  /* FAB */
  fab: {
    position: "absolute",
    bottom: 90,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
  },

  /* FAB floating menu */
  menuFloating: {
    position: "absolute",
    bottom: 160,
    left: 16,
    right: 16,
    gap: 10,
  },
  menuFloatBtn: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: Colors.white,
  },
  menuFloatBtnText: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: "600",
  },

  /* FAB menu (old – kept for reference) */
  menuOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
    zIndex: 10,
  },
  menuSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
    gap: 4,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.textDark,
    marginBottom: 12,
  },
  menuOption: {
    paddingVertical: 16,
  },
  menuOptionText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.textDark,
  },
  menuDivider: {
    height: 1,
    backgroundColor: Colors.borderLight ?? "#E8EAF0",
  },

  /* Explore screen */
  exploreHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 14, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#EBEBEB', backgroundColor: Colors.white,
  },
  exploreBackBtn: { width: 36, alignItems: 'center', justifyContent: 'center' },
  exploreTitle: { fontSize: 18, fontWeight: '700', color: Colors.textDark },
  exploreSubtitle: {
    fontSize: 13, color: Colors.textMid, textAlign: 'center',
    paddingHorizontal: 20, paddingVertical: 12, lineHeight: 19,
  },
  exploreToolbar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 10,
  },
  filterBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderWidth: 1, borderColor: '#DADADA', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 5, backgroundColor: Colors.white,
  },
  filterBtnText: { fontSize: 13, color: Colors.textDark, fontWeight: '500' },
  clubCount: { fontSize: 13, color: Colors.textMid },
  sortLabel: { fontSize: 12, color: Colors.textMid },
  sortValue: { fontWeight: '700', color: Colors.textDark },
  exploreScroll: { paddingHorizontal: 16, paddingBottom: 40, gap: 12 },
  exploreCard: {
    backgroundColor: Colors.white, borderRadius: 14,
    borderWidth: 1, borderColor: '#E4E4E4',
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
    overflow: 'hidden',
  },
  exploreCardHeader: {
    paddingHorizontal: 14, paddingTop: 13, paddingBottom: 8,
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  exploreCardName: { fontSize: 16, fontWeight: '700', color: Colors.textDark, marginBottom: 2 },
  exploreCardMembers: { fontSize: 12, color: Colors.primary, fontWeight: '600' },
  exploreCardDetails: { paddingHorizontal: 14, paddingVertical: 4 },
  exploreDetailRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F4F4F4',
  },
  exploreDetailLabel: { fontSize: 13, color: Colors.textMid, flex: 1 },
  exploreDetailValue: { fontSize: 13, fontWeight: '600', color: Colors.textDark, flexShrink: 1, textAlign: 'right' },
});

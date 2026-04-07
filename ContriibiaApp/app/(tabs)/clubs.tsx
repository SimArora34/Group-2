import {
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppIcon from "../../components/AppIcon";
import ClubCard from "../../components/ClubCard";
import {
  ActiveClubOverviewScreen,
  ClubOverviewModal,
  GroupMembersScreen,
  MemberAgreementModal,
} from "../../components/JoinClubFlow";
import { Colors } from "../../constants/Colors";
import { supabase } from "../../src/lib/supabaseClient";

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
  circle_members?: Array<{
    id?: string;
    circle_id?: string;
    user_id?: string;
    joined_at?: string | null;
  }>;
};

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

export default function ClubsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [joiningId, setJoiningId] = useState<string | null>(null);

  const [privateExpanded, setPrivateExpanded] = useState(true);
  const [publicExpanded, setPublicExpanded] = useState(true);

  const [myClubs, setMyClubs] = useState<ExtendedCircle[]>([]);
  const [publicClubs, setPublicClubs] = useState<ExtendedCircle[]>([]);

  const [selectedCircle, setSelectedCircle] = useState<ExtendedCircle | null>(
    null
  );
  const [showOverview, setShowOverview] = useState(false);
  const [showAgreement, setShowAgreement] = useState(false);
  const [showActiveClub, setShowActiveClub] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [agreeJoining, setAgreeJoining] = useState(false);

  const loadClubs = async () => {
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
    } catch (error) {
      Alert.alert("Error", "Failed to load clubs");
      setMyClubs([]);
      setPublicClubs([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadClubs();
    }, [params.refresh])
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

      if (error) {
        if (
          !error.message.toLowerCase().includes("duplicate") &&
          !error.message.toLowerCase().includes("unique")
        ) {
          Alert.alert("Unable to join club", error.message);
          return;
        }
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

  const availablePublicClubs = useMemo(() => {
    return publicClubs.filter((club) => !myClubIds.has(club.id));
  }, [publicClubs, myClubIds]);

  if (loading) {
    return (
      <SafeAreaView style={styles.loaderWrap}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loaderText}>Loading clubs...</Text>
      </SafeAreaView>
    );
  }

  if (showActiveClub && selectedCircle) {
    return (
      <ActiveClubOverviewScreen
        circle={selectedCircle}
        onBack={() => setShowActiveClub(false)}
        onOpenMembers={() => {
          setShowActiveClub(false);
          setShowMembers(true);
        }}
        onRequestCashAdvance={() => router.push("/cash-advance" as any)}
        onShowRecipient={() => {}}
        onShowContributionSuccess={() => {}}
      />
    );
  }

  if (showMembers && selectedCircle) {
    return (
      <GroupMembersScreen
        circle={selectedCircle}
        onBack={() => {
          setShowMembers(false);
          setShowActiveClub(true);
        }}
      />
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
            onPress={() => router.back()}
            activeOpacity={0.85}
          >
            <AppIcon name="arrow-back" size={24} color={Colors.textDark} />
          </TouchableOpacity>

          <Text style={styles.pageTitle}>Clubs</Text>

          <TouchableOpacity
            style={styles.createTopButton}
            onPress={() => router.push("/create-club" as any)}
            activeOpacity={0.85}
          >
            <Text style={styles.createTopButtonText}>Create</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.welcomeText}>Savings Clubs</Text>

        <SectionHeader
          title="Private Clubs"
          expanded={privateExpanded}
          onToggle={() => setPrivateExpanded((prev) => !prev)}
        />

        {privateExpanded && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionBody}>
              {myPrivateClubs.length > 0 ? (
                myPrivateClubs.map((club) => (
                  <ClubCard
                    key={club.id}
                    name={club.name}
                    amount={`$${club.contribution_amount}`}
                    status="Active"
                    onPress={() => {
                      setSelectedCircle(club);
                      setShowActiveClub(true);
                    }}
                  />
                ))
              ) : (
                <View style={styles.emptyBox}>
                  <Text style={styles.emptyText}>
                    You have not joined any private clubs yet.
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
              {myPublicClubs.length > 0 &&
                myPublicClubs.map((club) => (
                  <ClubCard
                    key={`joined-${club.id}`}
                    name={club.name}
                    amount={`$${club.contribution_amount}`}
                    status="Active"
                    onPress={() => {
                      setSelectedCircle(club);
                      setShowActiveClub(true);
                    }}
                  />
                ))}

              {availablePublicClubs.length > 0 ? (
                availablePublicClubs.map((club) => (
                  <View key={`public-${club.id}`}>
                    <ClubCard
                      name={club.name}
                      amount={`$${club.contribution_amount}`}
                      status="Public"
                      onPress={() => {
                        setSelectedCircle(club);
                        setShowOverview(true);
                      }}
                    />

                    <TouchableOpacity
                      style={[
                        styles.joinButton,
                        joiningId === club.id && styles.joinButtonDisabled,
                      ]}
                      onPress={() => handleJoin(club.id)}
                      disabled={joiningId === club.id}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.joinButtonText}>
                        {joiningId === club.id ? "Joining..." : "Join Club"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))
              ) : myPublicClubs.length === 0 ? (
                <View style={styles.emptyBox}>
                  <Text style={styles.emptyText}>
                    No public clubs available right now.
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        )}
      </ScrollView>

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
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 20, paddingBottom: 120, gap: 16 },
  loaderWrap: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  loaderText: { marginTop: 12, fontSize: 14, color: Colors.textMid },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
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
  createTopButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  createTopButtonText: {
    color: Colors.white,
    fontWeight: "700",
  },
  welcomeText: {
    fontSize: 30,
    fontWeight: "800",
    color: Colors.textDark,
    lineHeight: 36,
    marginBottom: 4,
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
  emptyBox: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
  },
  emptyText: { fontSize: 14, color: Colors.textMid },
  joinButton: {
    marginTop: 8,
    marginBottom: 6,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  joinButtonDisabled: { opacity: 0.7 },
  joinButtonText: {
    color: Colors.white,
    fontWeight: "700",
  },
});
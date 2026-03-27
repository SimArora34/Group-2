import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppIcon from "../../components/AppIcon";
import ClubCard from "../../components/ClubCard";
import { Colors } from "../../constants/Colors";
import { supabase } from "../../src/lib/supabaseClient";
import {
  getPublicCircles,
  getUserCircles,
  joinCircle,
} from "../../src/services/circleService";
import { Circle } from "../../src/types";
import {
  ClubOverviewModal,
  MemberAgreementModal,
  ActiveClubOverviewScreen,
  GroupMembersScreen,
  RecipientModal,
  ContributionSuccessModal,
} from "../../components/JoinClubFlow";

type ExtendedCircle = Circle & {
  type?: "public" | "private";
  savings_goal?: number | null;
  contribution_frequency?: string | null;
  duration_months?: number | null;
  cycle_start_date?: string | null;
  total_positions?: number | null;
  circle_members?: Array<{
    id?: string;
    user_id?: string;
    order_position?: number | null;
    status?: string | null;
    joined_at?: string | null;
    profiles?: {
      full_name?: string | null;
    } | null;
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

      <TouchableOpacity style={styles.sectionHeaderIcon} activeOpacity={1}>
        <AppIcon
          name={expanded ? "keyboard-arrow-up" : "keyboard-arrow-down"}
          size={20}
          color={Colors.white}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

export default function ClubsScreen() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [joiningId, setJoiningId] = useState<string | null>(null);

  const [privateExpanded, setPrivateExpanded] = useState(true);
  const [publicExpanded, setPublicExpanded] = useState(true);

  const [myClubs, setMyClubs] = useState<ExtendedCircle[]>([]);
  const [publicClubs, setPublicClubs] = useState<ExtendedCircle[]>([]);

  const [selectedCircle, setSelectedCircle] = useState<ExtendedCircle | null>(null);
  const [showOverview, setShowOverview] = useState(false);
  const [showAgreement, setShowAgreement] = useState(false);
  const [showActiveClub, setShowActiveClub] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [showRecipient, setShowRecipient] = useState(false);
  const [showContributionSuccess, setShowContributionSuccess] = useState(false);
  const [agreeJoining, setAgreeJoining] = useState(false);

  const loadClubs = async () => {
    try {
      if (!refreshing) setLoading(true);

      const [myRes, publicRes] = await Promise.all([
        getUserCircles(),
        getPublicCircles(),
      ]);

      if (myRes.success && myRes.data) {
        setMyClubs(myRes.data as ExtendedCircle[]);
      } else {
        setMyClubs([]);
      }

      if (publicRes.success && publicRes.data) {
        setPublicClubs(publicRes.data as ExtendedCircle[]);
      } else {
        setPublicClubs([]);
      }
    } catch {
      Alert.alert("Error", "Failed to load clubs.");
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
    }, [])
  );

  useEffect(() => {
    const channel = supabase
      .channel("clubs-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "circle_members" },
        async () => {
          await loadClubs();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "circles" },
        async () => {
          await loadClubs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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

      const res = await joinCircle(selectedCircle.id);

      if (!res.success) {
        Alert.alert("Unable to join club", res.error || "Please try again.");
        return;
      }

      setShowAgreement(false);
      Alert.alert("Success", "You joined the club successfully.");
      await loadClubs();
    } catch {
      Alert.alert("Error", "Something went wrong while joining the club.");
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

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {showActiveClub && selectedCircle ? (
        <ActiveClubOverviewScreen
          circle={selectedCircle}
          onBack={() => setShowActiveClub(false)}
          onOpenMembers={() => {
            setShowActiveClub(false);
            setShowMembers(true);
          }}
          onRequestCashAdvance={() => router.push("/cash-advance" as any)}
        />
      ) : showMembers && selectedCircle ? (
        <GroupMembersScreen
          circle={selectedCircle}
          onBack={() => {
            setShowMembers(false);
            setShowActiveClub(true);
          }}
        />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          <SafeAreaView edges={["top"]}>
            <TouchableOpacity
              style={styles.topBar}
              activeOpacity={1}
            >
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
                onPress={() => router.push("/Create-club" as any)}
                activeOpacity={0.85}
              >
                <Text style={styles.createTopButtonText}>Create</Text>
              </TouchableOpacity>
            </TouchableOpacity>

            <Text style={styles.welcomeText}>Savings Clubs</Text>

            <SectionHeader
              title="Private Clubs"
              expanded={privateExpanded}
              onToggle={() => setPrivateExpanded((prev) => !prev)}
            />

            {privateExpanded && (
              <TouchableOpacity style={styles.sectionCard} activeOpacity={1}>
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
                  <TouchableOpacity style={styles.emptyBox} activeOpacity={1}>
                    <Text style={styles.emptyText}>
                      You have not joined any private clubs yet.
                    </Text>
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            )}

            <SectionHeader
              title="Public Clubs"
              expanded={publicExpanded}
              onToggle={() => setPublicExpanded((prev) => !prev)}
            />

            {publicExpanded && (
              <TouchableOpacity style={styles.sectionCard} activeOpacity={1}>
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
                    <TouchableOpacity key={`public-${club.id}`} activeOpacity={1}>
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
                    </TouchableOpacity>
                  ))
                ) : myPublicClubs.length === 0 ? (
                  <TouchableOpacity style={styles.emptyBox} activeOpacity={1}>
                    <Text style={styles.emptyText}>
                      No public clubs available right now.
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </TouchableOpacity>
            )}
          </SafeAreaView>
        </ScrollView>
      )}

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

      <RecipientModal
        visible={showRecipient}
        circle={selectedCircle}
        membersCount={selectedCircle?.circle_members?.length || 0}
        amountPerMember={Number(selectedCircle?.contribution_amount || 0)}
        onClose={() => setShowRecipient(false)}
        onViewClubDetails={() => setShowRecipient(false)}
        onViewCashAdvance={() => {
          setShowRecipient(false);
          router.push("/cash-advance" as any);
        }}
      />

      <ContributionSuccessModal
        visible={showContributionSuccess}
        circle={selectedCircle}
        amount={Number(selectedCircle?.contribution_amount || 0)}
        onClose={() => setShowContributionSuccess(false)}
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
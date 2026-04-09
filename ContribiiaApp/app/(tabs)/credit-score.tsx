import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
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
import { getCurrentUserTransactions } from "../../src/services/transactionService";

const SCORE_MIN = 300;
const SCORE_MAX = 850;
const BASELINE_SCORE = 620;
const GAUGE_SIZE = 198;
const GAUGE_RADIUS = 88;
const CHART_MIN = 560;
const CHART_MAX = 760;

type CreditView = "overview" | "improving";

type ScoreBand = {
  color: string;
  label: string;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getScoreBand(score: number): ScoreBand {
  if (score >= 740) return { label: "very good", color: "#2CA45E" };
  if (score >= 670) return { label: "good", color: "#54B766" };
  if (score >= 580) return { label: "fair", color: "#D89E00" };
  return { label: "poor", color: "#D95B2D" };
}

function buildYearScores(currentScore: number, clubCount: number, txCount: number) {
  return Array.from({ length: 12 }).map((_, idx) => {
    const drift = (idx - 11) * 1.4;
    const rhythm = ((idx % 4) - 1.5) * 2.3;
    const engagementBoost = Math.min(12, clubCount * 1.2 + Math.min(txCount, 20) * 0.2);
    return clamp(Math.round(currentScore + drift + rhythm - engagementBoost), CHART_MIN, CHART_MAX);
  });
}

function CreditGauge({ score }: { score: number }) {
  const normalized = (score - SCORE_MIN) / (SCORE_MAX - SCORE_MIN);
  const progress = clamp(normalized, 0, 1);
  const theta = Math.PI + progress * Math.PI;
  const center = GAUGE_SIZE / 2;
  const pointerX = center + GAUGE_RADIUS * Math.cos(theta);
  const pointerY = center + GAUGE_RADIUS * Math.sin(theta);
  const band = getScoreBand(score);

  return (
    <View style={styles.gaugeCard}>
      <View style={styles.rangeRow}>
        <Text style={styles.rangeText}>Poor{"\n"}300 - 579</Text>
        <Text style={styles.rangeText}>Fair{"\n"}580 - 669</Text>
        <Text style={styles.rangeText}>Good{"\n"}670 - 739</Text>
        <Text style={styles.rangeText}>Excellent{"\n"}740 - 850</Text>
      </View>

      <View style={styles.gaugeOuter}>
        <View style={styles.gaugeMask}>
          <View style={styles.gaugeRing} />
          <View style={[styles.gaugeNeedleDot, { left: pointerX - 6, top: pointerY - 6 }]} />
        </View>

        <View style={styles.scoreValueWrap}>
          <Text style={styles.scoreValue}>{score}</Text>
        </View>
      </View>

      <Text style={styles.scoreSentence}>
        Your credit score is <Text style={[styles.scoreBand, { color: band.color }]}>{band.label}</Text>
      </Text>
      <Text style={styles.scoreUpdated}>Last updated 07/04/2026</Text>
    </View>
  );
}

function TrendChart({ scores }: { scores: number[] }) {
  const months = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

  return (
    <View style={styles.trendCard}>
      <Text style={styles.blockTitle}>Your credit score throughout the year</Text>

      <View style={styles.chartWrap}>
        <View style={styles.chartAccentBar} />

        <View style={styles.chartColumns}>
          {scores.map((score, idx) => {
            const pct = (score - CHART_MIN) / (CHART_MAX - CHART_MIN);
            const barHeight = 26 + pct * 48;
            return (
              <View key={`${idx}-${score}`} style={styles.chartCol}>
                <Text style={styles.pointLabel}>{score}</Text>
                <View style={[styles.chartBar, { height: barHeight }]} />
                <View style={styles.chartDot} />
                <Text style={styles.monthLabel}>{months[idx]}</Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

function FactorCard({
  title,
  status,
  statusTone,
  description,
  children,
}: {
  children?: React.ReactNode;
  description: string;
  status: string;
  statusTone: "good" | "fair" | "poor";
  title: string;
}) {
  const toneStyle =
    statusTone === "good"
      ? styles.statusGood
      : statusTone === "fair"
        ? styles.statusFair
        : styles.statusPoor;

  return (
    <View style={styles.factorCard}>
      <View style={styles.factorHeader}>
        <Text style={styles.factorTitle}>{title}</Text>
        <View style={[styles.factorStatusPill, toneStyle]}>
          <Text style={styles.factorStatusText}>{status}</Text>
        </View>
      </View>

      <Text style={styles.factorDescription}>{description}</Text>
      {children}
    </View>
  );
}

export default function CreditScoreScreen() {
  const router = useRouter();

  const [view, setView] = useState<CreditView>("overview");
  const [clubCount, setClubCount] = useState(0);
  const [transactionCount, setTransactionCount] = useState(0);
  const [accountAgeMonths, setAccountAgeMonths] = useState(0);

  useEffect(() => {
    loadCreditData();
  }, []);

  const loadCreditData = async () => {
    const [profileRes, circlesRes, txRes] = await Promise.all([
      getCurrentProfile(),
      getUserCircles(),
      getCurrentUserTransactions(),
    ]);

    if (circlesRes.success && circlesRes.data) {
      setClubCount(circlesRes.data.length);
    } else {
      setClubCount(0);
    }

    if (txRes.success && txRes.data) {
      setTransactionCount(txRes.data.length);
    } else {
      setTransactionCount(0);
    }

    if (profileRes.success && profileRes.data?.created_at) {
      const created = new Date(profileRes.data.created_at);
      const now = new Date();
      const months = Math.max(
        0,
        (now.getFullYear() - created.getFullYear()) * 12 +
          (now.getMonth() - created.getMonth()),
      );
      setAccountAgeMonths(months);
    } else {
      setAccountAgeMonths(0);
    }
  };

  const currentScore = useMemo(() => {
    const score = BASELINE_SCORE + clubCount * 4 + Math.min(transactionCount, 20);
    return clamp(score, SCORE_MIN, SCORE_MAX);
  }, [clubCount, transactionCount]);

  const pointIncrease = currentScore - BASELINE_SCORE;
  const yearScores = useMemo(
    () => buildYearScores(currentScore, clubCount, transactionCount),
    [currentScore, clubCount, transactionCount],
  );

  const onTimeStatus = transactionCount >= 12 ? "Wow!" : transactionCount >= 6 ? "Fair" : "Poor";
  const onTimeTone = transactionCount >= 12 ? "good" : transactionCount >= 6 ? "fair" : "poor";

  const ageStatus = accountAgeMonths >= 24 ? "Fair" : "Poor";
  const ageTone = accountAgeMonths >= 24 ? "fair" : "poor";

  const cardStatus = clubCount >= 2 ? "Fair" : "Poor";
  const cardTone = clubCount >= 2 ? "fair" : "poor";

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.iconBtn}
          activeOpacity={0.85}
          onPress={() => router.replace("/(tabs)/DashboardScreen" as any)}
        >
          <AppIcon name="arrow-back" size={24} color={Colors.textDark} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Credit Score</Text>

        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconBtn} activeOpacity={0.85} onPress={() => Alert.alert('Coming Soon', 'Chat messaging will be available in a future update.')}>
            <AppIcon name="chat-bubble-outline" size={21} color={Colors.textDark} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} activeOpacity={0.85} onPress={() => Alert.alert('Coming Soon', 'Notifications will be available in a future update.')}>
            <AppIcon name="notifications-none" size={24} color={Colors.textDark} />
            <View style={styles.notifyDot} />
          </TouchableOpacity>
        </View>
      </View>

      {view === "overview" ? (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <CreditGauge score={currentScore} />

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={styles.statLine}>
                <MaterialIcons name="arrow-upward" size={18} color="#1FAE66" />
                <Text style={styles.statValueGreen}>{pointIncrease}</Text>
              </View>
              <Text style={styles.statText}>Point increase since joining Contribiia</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statValueBlue}>{BASELINE_SCORE}</Text>
              <Text style={styles.statText}>Your credit score when first joining Contribiia</Text>
            </View>
          </View>

          <TrendChart scores={yearScores} />

          <TouchableOpacity
            style={styles.primaryAction}
            activeOpacity={0.9}
            onPress={() => setView("improving")}
          >
            <Text style={styles.primaryActionText}>Improving your credit score</Text>
            <AppIcon name="arrow-forward" size={18} color={Colors.white} />
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.improvingTitleRow}>
            <Text style={styles.improvingTitle}>Improving your credit score</Text>
          </View>

          <FactorCard
            title="On-time payments"
            status={onTimeStatus}
            statusTone={onTimeTone}
            description={`Made ${Math.max(0, transactionCount)} wallet transactions this year.`}
          />

          <FactorCard
            title="Credit Age"
            status={ageStatus}
            statusTone={ageTone}
            description={`Your account age is ${accountAgeMonths} month${accountAgeMonths === 1 ? "" : "s"}.`}
          />

          <FactorCard
            title="Number of Credit Cards"
            status={cardStatus}
            statusTone={cardTone}
            description={`You currently have ${clubCount} active savings club${clubCount === 1 ? "" : "s"}.`}
          >
            <Text style={styles.subLabel}>Credit Card offers just for you!</Text>

            <View style={styles.offerRow}>
              <View style={[styles.offerDot, { backgroundColor: "#F0DE27" }]} />
              <Text style={styles.offerText}>Happy Bank - Travel Rewards</Text>
            </View>

            <View style={styles.offerRow}>
              <View style={[styles.offerDot, { backgroundColor: "#CBC8D3" }]} />
              <Text style={styles.offerText}>One Bank - Silver</Text>
            </View>

            <View style={styles.offerRow}>
              <View style={[styles.offerDot, { backgroundColor: "#2D99AF" }]} />
              <Text style={styles.offerText}>Country Bank - Signature</Text>
            </View>

            <View style={styles.offerRow}>
              <View style={[styles.offerDot, { backgroundColor: "#4E79BB" }]} />
              <Text style={styles.offerText}>Street Bank - Premium</Text>
            </View>
          </FactorCard>

          <TouchableOpacity
            style={styles.secondaryAction}
            activeOpacity={0.9}
            onPress={() => setView("overview")}
          >
            <Text style={styles.secondaryActionText}>Back to score summary</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F8F9" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.white,
  },
  iconBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.textDark,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
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
  scroll: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 34,
    gap: 10,
  },
  gaugeCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    padding: 12,
    alignItems: "center",
  },
  rangeRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  rangeText: {
    fontSize: 9,
    lineHeight: 11,
    color: Colors.textLight,
    textAlign: "center",
    fontWeight: "600",
  },
  gaugeOuter: {
    width: GAUGE_SIZE,
    height: GAUGE_SIZE / 2 + 16,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  gaugeMask: {
    width: GAUGE_SIZE,
    height: GAUGE_SIZE / 2,
    overflow: "hidden",
    alignItems: "center",
  },
  gaugeRing: {
    width: GAUGE_SIZE,
    height: GAUGE_SIZE,
    borderRadius: GAUGE_SIZE / 2,
    borderWidth: 11,
    borderLeftColor: "#E85D2A",
    borderTopColor: "#D8B80F",
    borderRightColor: "#36B864",
    borderBottomColor: "transparent",
    backgroundColor: "transparent",
  },
  gaugeNeedleDot: {
    position: "absolute",
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#2B2B2B",
    borderWidth: 2,
    borderColor: Colors.white,
  },
  scoreValueWrap: {
    position: "absolute",
    bottom: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  scoreValue: {
    fontSize: 42,
    fontWeight: "800",
    color: Colors.textDark,
    letterSpacing: 0.5,
  },
  scoreSentence: {
    marginTop: -2,
    fontSize: 14,
    color: Colors.textDark,
    fontWeight: "700",
  },
  scoreBand: {
    textTransform: "capitalize",
  },
  scoreUpdated: {
    marginTop: 4,
    fontSize: 11,
    color: Colors.textLight,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: "#CFE3E3",
    borderRadius: 10,
    padding: 10,
    minHeight: 90,
  },
  statLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    marginBottom: 3,
  },
  statValueGreen: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1FAE66",
    lineHeight: 32,
  },
  statValueBlue: {
    fontSize: 30,
    fontWeight: "800",
    color: "#1A92B8",
    lineHeight: 34,
    marginBottom: 3,
  },
  statText: {
    fontSize: 12,
    color: Colors.textMid,
    lineHeight: 16,
    fontWeight: "500",
  },
  trendCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D5E7E7",
    padding: 10,
  },
  blockTitle: {
    fontSize: 13,
    color: Colors.textDark,
    fontWeight: "700",
    marginBottom: 8,
  },
  chartWrap: {
    flexDirection: "row",
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#E9F6F9",
    borderWidth: 1,
    borderColor: "#CFE8ED",
  },
  chartAccentBar: {
    width: 8,
    backgroundColor: "#D97706",
  },
  chartColumns: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 6,
    paddingBottom: 7,
    paddingTop: 6,
  },
  chartCol: {
    alignItems: "center",
    justifyContent: "flex-end",
    width: 19,
  },
  pointLabel: {
    fontSize: 8,
    color: "#4A5A66",
    marginBottom: 2,
  },
  chartBar: {
    width: 2,
    borderRadius: 2,
    backgroundColor: "#4A687A",
  },
  chartDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#3B5569",
    marginTop: 2,
    marginBottom: 3,
  },
  monthLabel: {
    fontSize: 8,
    color: Colors.textLight,
  },
  primaryAction: {
    marginTop: 4,
    backgroundColor: "#2D9CB4",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  primaryActionText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "700",
  },
  improvingTitleRow: {
    marginTop: 2,
    marginBottom: 2,
  },
  improvingTitle: {
    fontSize: 28,
    lineHeight: 32,
    color: Colors.textDark,
    fontWeight: "800",
  },
  factorCard: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: "#BFD8DA",
    borderRadius: 10,
    padding: 10,
    gap: 5,
  },
  factorHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  factorTitle: {
    fontSize: 14,
    color: Colors.textDark,
    fontWeight: "700",
    flex: 1,
  },
  factorStatusPill: {
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  statusGood: { backgroundColor: "#27B2C5" },
  statusFair: { backgroundColor: "#58B56A" },
  statusPoor: { backgroundColor: "#93A1AD" },
  factorStatusText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: "700",
  },
  factorDescription: {
    fontSize: 11,
    lineHeight: 15,
    color: Colors.textMid,
  },
  subLabel: {
    marginTop: 3,
    fontSize: 11,
    color: Colors.textDark,
    fontWeight: "700",
  },
  offerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: 6,
  },
  offerDot: {
    width: 38,
    height: 18,
    borderRadius: 4,
  },
  offerText: {
    flex: 1,
    fontSize: 11,
    color: Colors.textDark,
    fontWeight: "500",
  },
  secondaryAction: {
    marginTop: 6,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: "#94B6B8",
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryActionText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: "700",
  },
});

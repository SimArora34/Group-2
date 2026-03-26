import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../constants/Colors";
import { getCurrentUserCircles } from "../../src/services/circleService";
import { getCurrentProfile } from "../../src/services/profileService";

const MAX_SCORE = 10;

function ScoreArc({ score }: { score: number }) {
  const pct = score / MAX_SCORE;
  const label =
    pct >= 0.85
      ? "Excellent"
      : pct >= 0.7
        ? "Good"
        : pct >= 0.5
          ? "Fair"
          : "Needs Work";
  const labelColor =
    pct >= 0.85
      ? Colors.success
      : pct >= 0.7
        ? Colors.primary
        : pct >= 0.5
          ? Colors.accent
          : Colors.error;

  return (
    <View style={styles.scoreContainer}>
      <View style={styles.scoreCircle}>
        <Text style={styles.scoreNumber}>{score.toFixed(1)}</Text>
        <Text style={styles.scoreMax}>/ {MAX_SCORE}</Text>
      </View>
      <Text style={[styles.scoreLabel, { color: labelColor }]}>{label}</Text>
      <View style={styles.scoreBarTrack}>
        <View
          style={[
            styles.scoreBarFill,
            { width: `${pct * 100}%` as any, backgroundColor: labelColor },
          ]}
        />
      </View>
    </View>
  );
}

function FactorRow({
  label,
  value,
  positive,
}: {
  label: string;
  value: string;
  positive: boolean;
}) {
  return (
    <View style={styles.factorRow}>
      <Text style={styles.factorLabel}>{label}</Text>
      <View style={styles.factorRight}>
        <Text style={styles.factorValue}>{value}</Text>
        <MaterialIcons
          name={positive ? "check-circle" : "warning"}
          size={18}
          color={positive ? Colors.success : Colors.accent}
        />
      </View>
    </View>
  );
}

export default function CreditScoreScreen() {
  const [firstName, setFirstName] = useState("");
  const [clubCount, setClubCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [profileRes, circlesRes] = await Promise.all([
        getCurrentProfile(),
        getCurrentUserCircles(),
      ]);
      if (profileRes.success && profileRes.data?.full_name) {
        setFirstName(profileRes.data.full_name.split(" ")[0]);
      }
      if (circlesRes.success && circlesRes.data) {
        setClubCount(circlesRes.data.length);
      }
      setLoading(false);
    })();
  }, []);

  // Derive a demo score from club membership (8.5 base, bonus for clubs)
  const score = Math.min(MAX_SCORE, 7 + clubCount * 0.5);

  const factors = [
    {
      label: "Savings club membership",
      value: `${clubCount} club${clubCount !== 1 ? "s" : ""}`,
      positive: clubCount > 0,
    },
    { label: "Account in good standing", value: "Yes", positive: true },
    { label: "Identity verified", value: "Complete", positive: true },
    {
      label: "Consistent contributions",
      value: clubCount > 0 ? "Active" : "No data yet",
      positive: clubCount > 0,
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <View style={{ width: 32 }} />
        <Text style={styles.headerTitle}>Credit Score</Text>
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
        {!loading && (
          <Text style={styles.greeting}>
            {firstName ? `Hi, ${firstName}` : "Your Score"}
          </Text>
        )}

        <ScoreArc score={score} />

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Score Factors</Text>
          {factors.map((f) => (
            <FactorRow
              key={f.label}
              label={f.label}
              value={f.value}
              positive={f.positive}
            />
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>How to Improve</Text>
          <Text style={styles.tipText}>
            • Join more savings clubs to show consistent saving behaviour.
          </Text>
          <Text style={styles.tipText}>
            • Complete your identity verification to unlock higher limits.
          </Text>
          <Text style={styles.tipText}>
            • Make regular contributions every month without missing.
          </Text>
          <Text style={styles.tipText}>
            • Link a bank account to enable direct deposit tracking.
          </Text>
        </View>
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
  headerIcon: { fontSize: 20 },
  scroll: { padding: 20, gap: 20, paddingBottom: 40 },
  greeting: { fontSize: 22, fontWeight: "800", color: Colors.textDark },
  scoreContainer: { alignItems: "center", gap: 10 },
  scoreCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 10,
    borderColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primaryLight,
  },
  scoreNumber: { fontSize: 48, fontWeight: "800", color: Colors.primary },
  scoreMax: { fontSize: 14, color: Colors.textMid, marginTop: -4 },
  scoreLabel: { fontSize: 18, fontWeight: "700" },
  scoreBarTrack: {
    width: "70%",
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.borderLight,
    overflow: "hidden",
  },
  scoreBarFill: { height: 8, borderRadius: 4 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textDark,
    marginBottom: 2,
  },
  factorRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  factorLabel: { fontSize: 14, color: Colors.textMid, flex: 1 },
  factorRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  factorValue: { fontSize: 13, fontWeight: "600", color: Colors.textDark },
  tipText: { fontSize: 14, color: Colors.textMid, lineHeight: 22 },
});

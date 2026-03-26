import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../constants/Colors";
import { Circle } from "../src/types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function MemberAvatar({
  name,
  size = 32,
}: {
  name: string;
  size?: number;
}) {
  return (
    <View
      style={[
        avatarStyles.circle,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <Text style={[avatarStyles.initials, { fontSize: size * 0.35 }]}>
        {getInitials(name)}
      </Text>
    </View>
  );
}

const avatarStyles = StyleSheet.create({
  circle: {
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: -6,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  initials: { color: Colors.white, fontWeight: "700" },
});

// ─── Browse Public Clubs Modal ────────────────────────────────────────────────

export function BrowseCirclesModal({
  visible,
  circles,
  myCircleIds,
  onClose,
  onSelect,
}: {
  visible: boolean;
  circles: Circle[];
  myCircleIds: Set<string>;
  onClose: () => void;
  onSelect: (c: Circle) => void;
}) {
  const joinable = circles.filter((c) => !myCircleIds.has(c.id));

  return (
    <Modal visible={visible} animationType="slide">
      <SafeAreaView style={browseStyles.container} edges={["top", "bottom"]}>
        {/* Header */}
        <View style={browseStyles.header}>
          <TouchableOpacity
            onPress={onClose}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MaterialIcons
              name="arrow-back"
              size={24}
              color={Colors.textDark}
            />
          </TouchableOpacity>
          <Text style={browseStyles.headerTitle}>Join a Public Club</Text>
          <MaterialIcons
            name="notifications-none"
            size={24}
            color={Colors.textDark}
          />
        </View>

        <Text style={browseStyles.subtitle}>
          Find community by joining one of our public savings clubs awaiting new
          members.
        </Text>

        {/* Filter row */}
        <View style={browseStyles.filterRow}>
          <TouchableOpacity style={browseStyles.filterChip}>
            <Text style={browseStyles.filterChipText}>Filter</Text>
            <MaterialIcons
              name="keyboard-arrow-down"
              size={16}
              color={Colors.textDark}
            />
          </TouchableOpacity>
        </View>

        {/* Count + Sort row */}
        <View style={browseStyles.countRow}>
          <Text style={browseStyles.countText}>{joinable.length} clubs</Text>
          <View style={browseStyles.sortRow}>
            <Text style={browseStyles.sortLabel}>Sort By: </Text>
            <Text style={browseStyles.sortValue}>Most Recent</Text>
            <MaterialIcons
              name="keyboard-arrow-down"
              size={16}
              color={Colors.textDark}
            />
          </View>
        </View>

        {/* List */}
        <FlatList
          data={joinable}
          keyExtractor={(item) => item.id}
          contentContainerStyle={browseStyles.list}
          ListEmptyComponent={
            <Text style={browseStyles.empty}>
              No public clubs available to join.
            </Text>
          }
          renderItem={({ item }) => {
            const memberCount = item.circle_members?.length ?? 0;
            const totalPositions = item.total_positions ?? 3;
            return (
              <TouchableOpacity
                style={browseStyles.card}
                activeOpacity={0.85}
                onPress={() => onSelect(item)}
              >
                <View style={browseStyles.cardTop}>
                  <Text style={browseStyles.cardName}>{item.name}</Text>
                  <View style={browseStyles.activeBadge}>
                    <Text style={browseStyles.activeBadgeText}>Active</Text>
                  </View>
                </View>

                {memberCount > 0 && (
                  <View style={browseStyles.avatarRow}>
                    {(item.circle_members ?? [])
                      .slice(0, 4)
                      .map((m: any, i: number) => (
                        <MemberAvatar
                          key={m.id ?? i}
                          name={m.profiles?.full_name ?? "?"}
                          size={28}
                        />
                      ))}
                  </View>
                )}

                <View style={browseStyles.detailRow}>
                  <Text style={browseStyles.detailLabel}>Savings Goal</Text>
                  <Text style={browseStyles.detailValue}>
                    {item.savings_goal
                      ? `$${Number(item.savings_goal).toLocaleString()}`
                      : "—"}
                  </Text>
                </View>
                <View style={browseStyles.detailRow}>
                  <Text style={browseStyles.detailLabel}>Contribution</Text>
                  <Text style={browseStyles.detailValue}>
                    ${Number(item.contribution_amount).toLocaleString()}, every{" "}
                    {item.contribution_frequency ?? "2 weeks"}
                  </Text>
                </View>
                <View style={browseStyles.detailRow}>
                  <Text style={browseStyles.detailLabel}>Duration</Text>
                  <Text style={browseStyles.detailValue}>
                    {item.duration_months
                      ? `${item.duration_months} months`
                      : "—"}
                  </Text>
                </View>
                <View style={browseStyles.detailRow}>
                  <Text style={browseStyles.detailLabel}>Cycle Start Date</Text>
                  <Text style={browseStyles.detailValue}>
                    {item.cycle_start_date
                      ? new Date(item.cycle_start_date).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric", year: "numeric" },
                        )
                      : "—"}
                  </Text>
                </View>

                <Text style={browseStyles.memberCount}>
                  {memberCount} out of {totalPositions} members
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </SafeAreaView>
    </Modal>
  );
}

const browseStyles = StyleSheet.create({
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
  subtitle: {
    fontSize: 13,
    color: Colors.textMid,
    lineHeight: 19,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 4,
  },
  filterRow: { paddingHorizontal: 20, paddingVertical: 8 },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  filterChipText: { fontSize: 13, color: Colors.textDark },
  countRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  countText: { fontSize: 13, color: Colors.textMid },
  sortRow: { flexDirection: "row", alignItems: "center" },
  sortLabel: { fontSize: 13, color: Colors.textMid },
  sortValue: { fontSize: 13, color: Colors.textDark, fontWeight: "600" },
  list: { paddingHorizontal: 20, paddingBottom: 40, gap: 12 },
  empty: { textAlign: "center", color: Colors.textLight, marginTop: 40 },
  card: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    backgroundColor: Colors.white,
    gap: 6,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardName: { fontSize: 15, fontWeight: "700", color: Colors.primary },
  activeBadge: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  activeBadgeText: { fontSize: 12, color: Colors.primary, fontWeight: "600" },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 6,
    marginVertical: 4,
  },
  detailRow: { flexDirection: "row", justifyContent: "space-between" },
  detailLabel: { fontSize: 12, color: Colors.textMid },
  detailValue: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textDark,
    textAlign: "right",
    flex: 1,
    marginLeft: 8,
  },
  memberCount: { fontSize: 12, color: Colors.textLight, marginTop: 4 },
});

// ─── Club Overview Modal ──────────────────────────────────────────────────────

function OverviewDetailRow({
  label,
  value,
  last = false,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View
      style={[
        overviewStyles.detailRow,
        !last && overviewStyles.detailRowBorder,
      ]}
    >
      <Text style={overviewStyles.detailLabel}>{label}</Text>
      <Text style={overviewStyles.detailValue}>{value}</Text>
    </View>
  );
}

export function ClubOverviewModal({
  visible,
  circle,
  alreadyMember,
  onClose,
  onJoinPress,
}: {
  visible: boolean;
  circle: Circle | null;
  alreadyMember: boolean;
  onClose: () => void;
  onJoinPress: () => void;
}) {
  if (!circle) return null;

  const isPrivate = circle.type === "private";
  const memberCount = circle.circle_members?.length ?? 0;
  const totalPositions = circle.total_positions ?? 3;
  const openPositions = Math.max(0, totalPositions - memberCount);
  const members: any[] = circle.circle_members ?? [];

  return (
    <Modal visible={visible} animationType="slide">
      <SafeAreaView style={overviewStyles.container} edges={["top", "bottom"]}>
        {/* Header */}
        <View style={overviewStyles.header}>
          <TouchableOpacity
            onPress={onClose}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MaterialIcons
              name="arrow-back"
              size={24}
              color={Colors.textDark}
            />
          </TouchableOpacity>
          <Text style={overviewStyles.headerTitle}>Club Overview</Text>
          <MaterialIcons
            name="notifications-none"
            size={24}
            color={Colors.textDark}
          />
        </View>

        <ScrollView contentContainerStyle={overviewStyles.scroll}>
          {/* Club identity */}
          <View style={overviewStyles.identityCard}>
            <View style={overviewStyles.clubBadge}>
              <Text style={overviewStyles.clubBadgeInitials}>
                {getInitials(circle.name)}
              </Text>
            </View>

            <View style={{ flex: 1 }}>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                <Text style={overviewStyles.clubName}>{circle.name}</Text>
                <View
                  style={[
                    overviewStyles.typeBadge,
                    isPrivate && overviewStyles.typeBadgePrivate,
                  ]}
                >
                  <Text
                    style={[
                      overviewStyles.typeBadgeText,
                      isPrivate && overviewStyles.typeBadgeTextPrivate,
                    ]}
                  >
                    {isPrivate ? "Private" : "Public"}
                  </Text>
                </View>
              </View>

              <View style={overviewStyles.membersRow}>
                {members.slice(0, 4).map((m: any, i: number) => (
                  <MemberAvatar
                    key={m.id ?? i}
                    name={m.profiles?.full_name ?? "?"}
                    size={30}
                  />
                ))}
                <View style={{ width: 6 }} />
                {members.slice(0, 3).map((m: any, i: number) => (
                  <Text key={i} style={overviewStyles.memberName}>
                    {m.profiles?.full_name?.split(" ")[0] ?? "Member"}
                    {i < Math.min(members.length, 3) - 1 ? " · " : ""}
                  </Text>
                ))}
              </View>
            </View>
          </View>

          {/* Position slots */}
          <View style={overviewStyles.slotsRow}>
            {Array.from({ length: Math.min(totalPositions, 6) }).map((_, i) => {
              const filled = i < memberCount;
              return (
                <View
                  key={i}
                  style={[
                    overviewStyles.slot,
                    filled && overviewStyles.slotFilled,
                  ]}
                >
                  {filled ? (
                    <MaterialIcons
                      name="person"
                      size={16}
                      color={Colors.white}
                    />
                  ) : (
                    <Text style={overviewStyles.slotOpenText}>Open</Text>
                  )}
                </View>
              );
            })}
          </View>

          <Text style={overviewStyles.slotsNote}>
            {openPositions > 0
              ? `${openPositions} position${openPositions > 1 ? "s" : ""} available`
              : "Club is full"}
          </Text>

          {/* Club Details */}
          <Text style={overviewStyles.sectionTitle}>Club Details</Text>
          <View style={overviewStyles.detailsCard}>
            <OverviewDetailRow
              label="Savings Goal"
              value={
                circle.savings_goal
                  ? `$${Number(circle.savings_goal).toLocaleString()}`
                  : "—"
              }
            />
            <OverviewDetailRow
              label="Contribution"
              value={`$${Number(circle.contribution_amount).toLocaleString()}, every ${circle.contribution_frequency ?? "2 weeks"}`}
            />
            <OverviewDetailRow
              label="Duration"
              value={
                circle.duration_months
                  ? `${circle.duration_months} months`
                  : "—"
              }
            />
            <OverviewDetailRow
              label="Cycle Start Date"
              value={
                circle.cycle_start_date
                  ? new Date(circle.cycle_start_date).toLocaleDateString(
                      "en-US",
                      { month: "short", day: "numeric", year: "numeric" },
                    )
                  : "—"
              }
              last
            />
          </View>
        </ScrollView>

        {/* Join Button */}
        <View style={overviewStyles.footer}>
          <TouchableOpacity
            style={[
              overviewStyles.joinBtn,
              (alreadyMember || openPositions === 0) &&
                overviewStyles.joinBtnDisabled,
            ]}
            onPress={onJoinPress}
            disabled={alreadyMember || openPositions === 0}
          >
            <Text style={overviewStyles.joinBtnText}>
              {alreadyMember
                ? "Already a Member"
                : openPositions === 0
                  ? "Club is Full"
                  : "Join Club"}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const overviewStyles = StyleSheet.create({
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
  scroll: { padding: 20, paddingBottom: 20, gap: 16 },
  identityCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  clubBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  clubBadgeInitials: { color: Colors.white, fontWeight: "800", fontSize: 18 },
  clubName: { fontSize: 16, fontWeight: "800", color: Colors.textDark },
  typeBadge: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  typeBadgePrivate: { backgroundColor: "#FFF3E0" },
  typeBadgeText: { fontSize: 11, color: Colors.primary, fontWeight: "600" },
  typeBadgeTextPrivate: { color: "#E07B3A" },
  membersRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    flexWrap: "wrap",
  },
  memberName: { fontSize: 12, color: Colors.textMid },
  slotsRow: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  slot: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.surface,
  },
  slotFilled: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  slotOpenText: { fontSize: 11, color: Colors.textLight, fontWeight: "500" },
  slotsNote: { fontSize: 12, color: Colors.textLight, textAlign: "center" },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.textDark,
    marginTop: 4,
  },
  detailsCard: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    backgroundColor: Colors.white,
    overflow: "hidden",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  detailRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  detailLabel: { fontSize: 13, color: Colors.textMid },
  detailValue: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textDark,
    textAlign: "right",
    flex: 1,
    marginLeft: 16,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.white,
  },
  joinBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  joinBtnDisabled: { backgroundColor: Colors.disabled },
  joinBtnText: { color: Colors.white, fontWeight: "700", fontSize: 15 },
});

// ─── Member Agreement Modal ───────────────────────────────────────────────────

export function MemberAgreementModal({
  visible,
  circle,
  joining,
  onConfirm,
  onCancel,
}: {
  visible: boolean;
  circle: Circle | null;
  joining: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (visible) setChecked(false);
  }, [visible]);

  if (!circle) return null;

  const amount = `$${Number(circle.contribution_amount).toLocaleString()}`;
  const freq = circle.contribution_frequency ?? "every 2 weeks";
  const duration = circle.duration_months ? `${circle.duration_months}` : "6";

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={agreementStyles.overlay}>
        <View style={agreementStyles.sheet}>
          <Text style={agreementStyles.title}>Member Agreement</Text>

          <ScrollView
            style={agreementStyles.textScroll}
            showsVerticalScrollIndicator={false}
          >
            <Text style={agreementStyles.body}>
              By joining this club, I commit to contributing{" "}
              <Text style={agreementStyles.bold}>
                {amount} {freq}
              </Text>{" "}
              to the <Text style={agreementStyles.bold}>{circle.name}</Text>{" "}
              savings club, starting once all members have joined, for a
              duration of{" "}
              <Text style={agreementStyles.bold}>{duration} months</Text>.
            </Text>

            <Text style={[agreementStyles.body, { marginTop: 14 }]}>
              Failure to meet my payment obligations may result in the
              suspension of my Contribia account and the reporting of
              non-payment to credit agencies, which can negatively impact my
              credit score.
            </Text>
          </ScrollView>

          {/* Checkbox */}
          <TouchableOpacity
            style={agreementStyles.checkRow}
            onPress={() => setChecked((v) => !v)}
            activeOpacity={0.7}
          >
            <View
              style={[
                agreementStyles.checkbox,
                checked && agreementStyles.checkboxChecked,
              ]}
            >
              {checked && (
                <MaterialIcons name="check" size={14} color={Colors.white} />
              )}
            </View>
            <Text style={agreementStyles.checkLabel}>
              I acknowledge and agree to these terms.
            </Text>
          </TouchableOpacity>

          {/* Actions */}
          <TouchableOpacity
            style={[
              agreementStyles.joinBtn,
              (!checked || joining) && agreementStyles.joinBtnDisabled,
            ]}
            onPress={onConfirm}
            disabled={!checked || joining}
          >
            {joining ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={agreementStyles.joinBtnText}>Join Club</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={agreementStyles.cancelBtn}
            onPress={onCancel}
            disabled={joining}
          >
            <Text style={agreementStyles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const agreementStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  sheet: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxHeight: "80%",
  },
  title: {
    fontSize: 17,
    fontWeight: "800",
    color: Colors.textDark,
    marginBottom: 14,
  },
  textScroll: { maxHeight: 180 },
  body: { fontSize: 14, color: Colors.textMid, lineHeight: 21 },
  bold: { fontWeight: "700", color: Colors.textDark },
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 18,
    marginBottom: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.white,
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkLabel: { flex: 1, fontSize: 13, color: Colors.textMid, lineHeight: 19 },
  joinBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
  },
  joinBtnDisabled: { backgroundColor: Colors.disabled },
  joinBtnText: { color: Colors.white, fontWeight: "700", fontSize: 15 },
  cancelBtn: { alignItems: "center", marginTop: 14 },
  cancelText: { fontSize: 14, color: Colors.textMid, fontWeight: "600" },
});

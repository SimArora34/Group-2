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

export function BrowseCirclesModal({
  visible,
  circles,
  myCircleIds,
  onClose,
  onSelect,
}: {
  visible: boolean;
  circles: any[];
  myCircleIds: Set<string>;
  onClose: () => void;
  onSelect: (c: any) => void;
}) {
  const joinable = circles.filter((c) => !myCircleIds.has(c.id));

  return (
    <Modal visible={visible} animationType="slide">
      <SafeAreaView style={browseStyles.container} edges={["top", "bottom"]}>
        <View style={browseStyles.header}>
          <TouchableOpacity onPress={onClose}>
            <MaterialIcons name="arrow-back" size={24} color={Colors.textDark} />
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
            const memberCount = item.circle_members?.length || 0;
            const totalPositions = item.total_positions || 0;

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
                    ${Number(item.contribution_amount).toLocaleString()}
                    {item.contribution_frequency
                      ? `, every ${item.contribution_frequency}`
                      : ""}
                  </Text>
                </View>

                <View style={browseStyles.detailRow}>
                  <Text style={browseStyles.detailLabel}>Duration</Text>
                  <Text style={browseStyles.detailValue}>
                    {item.duration_months ? `${item.duration_months} months` : "—"}
                  </Text>
                </View>

                <View style={browseStyles.detailRow}>
                  <Text style={browseStyles.detailLabel}>Cycle Start Date</Text>
                  <Text style={browseStyles.detailValue}>
                    {item.cycle_start_date
                      ? new Date(item.cycle_start_date).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric", year: "numeric" }
                        )
                      : "—"}
                  </Text>
                </View>

                <Text style={browseStyles.memberCount}>
                  {memberCount}
                  {totalPositions ? ` out of ${totalPositions}` : ""} members
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
  circle: any | null;
  alreadyMember: boolean;
  onClose: () => void;
  onJoinPress: () => void;
}) {
  if (!circle) return null;

  const isPrivate = circle.type === "private";
  const memberCount = circle.circle_members?.length || 0;
  const totalPositions = circle.total_positions || 0;
  const openPositions = Math.max(0, totalPositions - memberCount);
  const members: any[] = circle.circle_members || [];

  return (
    <Modal visible={visible} animationType="slide">
      <SafeAreaView style={overviewStyles.container} edges={["top", "bottom"]}>
        <View style={overviewStyles.header}>
          <TouchableOpacity onPress={onClose}>
            <MaterialIcons name="arrow-back" size={24} color={Colors.textDark} />
          </TouchableOpacity>
          <Text style={overviewStyles.headerTitle}>Club Overview</Text>
          <MaterialIcons
            name="notifications-none"
            size={24}
            color={Colors.textDark}
          />
        </View>

        <ScrollView contentContainerStyle={overviewStyles.scroll}>
          <View style={overviewStyles.identityCard}>
            <View style={overviewStyles.clubBadge}>
              <Text style={overviewStyles.clubBadgeInitials}>
                {getInitials(circle.name)}
              </Text>
            </View>

            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
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

          {totalPositions > 0 && (
            <>
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
                        <MaterialIcons name="person" size={16} color={Colors.white} />
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
            </>
          )}

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
              value={
                `$${Number(circle.contribution_amount).toLocaleString()}${
                  circle.contribution_frequency
                    ? `, every ${circle.contribution_frequency}`
                    : ""
                }`
              }
            />
            <OverviewDetailRow
              label="Duration"
              value={circle.duration_months ? `${circle.duration_months} months` : "—"}
            />
            <OverviewDetailRow
              label="Cycle Start Date"
              value={
                circle.cycle_start_date
                  ? new Date(circle.cycle_start_date).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      }
                    )
                  : "—"
              }
              last
            />
          </View>
        </ScrollView>

        <View style={overviewStyles.footer}>
          <TouchableOpacity
            style={[
              overviewStyles.joinBtn,
              (alreadyMember || (totalPositions > 0 && openPositions === 0)) &&
                overviewStyles.joinBtnDisabled,
            ]}
            onPress={onJoinPress}
            disabled={alreadyMember || (totalPositions > 0 && openPositions === 0)}
          >
            <Text style={overviewStyles.joinBtnText}>
              {alreadyMember
                ? "Already a Member"
                : totalPositions > 0 && openPositions === 0
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

export function MemberAgreementModal({
  visible,
  circle,
  joining,
  onConfirm,
  onCancel,
}: {
  visible: boolean;
  circle: any | null;
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
  const freq = circle.contribution_frequency
    ? ` every ${circle.contribution_frequency}`
    : "";
  const duration = circle.duration_months
    ? `${circle.duration_months} months`
    : "the stated period";

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
                {amount}
                {freq}
              </Text>{" "}
              to the <Text style={agreementStyles.bold}>{circle.name}</Text>{" "}
              savings club, starting once all members have joined, for a
              duration of <Text style={agreementStyles.bold}>{duration}</Text>.
            </Text>

            <Text style={[agreementStyles.body, { marginTop: 14 }]}>
              Failure to meet my payment obligations may result in the
              suspension of my Contribia account and the reporting of
              non-payment to credit agencies, which can negatively impact my
              credit score.
            </Text>
          </ScrollView>

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

function DetailRow({
  label,
  value,
  valueColor,
  last = false,
}: {
  label: string;
  value: string;
  valueColor?: string;
  last?: boolean;
}) {
  return (
    <View
      style={[
        extraStyles.detailRow,
        !last && extraStyles.detailRowBorder,
      ]}
    >
      <Text style={extraStyles.detailLabel}>{label}</Text>
      <Text
        style={[
          extraStyles.detailValue,
          valueColor ? { color: valueColor } : null,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

function MemberBubble({
  name,
  order,
}: {
  name: string;
  order?: number;
}) {
  return (
    <View style={extraStyles.memberBubbleWrap}>
      <View style={extraStyles.memberBubble}>
        <Text style={extraStyles.memberBubbleText}>{getInitials(name)}</Text>

        {!!order && (
          <View style={extraStyles.memberOrderBadge}>
            <Text style={extraStyles.memberOrderText}>{order}</Text>
          </View>
        )}
      </View>

      <Text style={extraStyles.memberNameText} numberOfLines={1}>
        {name.split(" ")[0]}
      </Text>
    </View>
  );
}

export function ActiveClubOverviewScreen({
  circle,
  onBack,
  onOpenMembers,
  onRequestCashAdvance,
}: {
  circle: any;
  onBack: () => void;
  onOpenMembers: () => void;
  onRequestCashAdvance: () => void;
}) {
  const members = circle?.circle_members || [];

  return (
    <SafeAreaView style={extraStyles.screen} edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={extraStyles.scroll}>
        <View style={extraStyles.header}>
          <TouchableOpacity onPress={onBack}>
            <MaterialIcons name="arrow-back" size={24} color={Colors.textDark} />
          </TouchableOpacity>

          <Text style={extraStyles.headerTitle}>{circle?.name}</Text>

          <View style={extraStyles.headerIcons}>
            <MaterialIcons
              name="notifications-none"
              size={24}
              color={Colors.textDark}
            />
            <MaterialIcons name="settings" size={24} color={Colors.textDark} />
          </View>
        </View>

        <View style={extraStyles.waitingBanner}>
          <View style={extraStyles.waitingDot} />
          <Text style={extraStyles.waitingText}>Waiting for members to join</Text>
        </View>

        {members.length > 0 && (
          <View style={extraStyles.membersStrip}>
            {members.map((m: any, i: number) => (
              <MemberBubble
                key={m.id ?? i}
                name={m.profiles?.full_name ?? "Member"}
                order={m.order_position ?? i + 1}
              />
            ))}
          </View>
        )}

        <TouchableOpacity
          style={extraStyles.outlinePrimaryButton}
          onPress={onRequestCashAdvance}
          activeOpacity={0.85}
        >
          <Text style={extraStyles.outlinePrimaryButtonText}>
            Request Cash Advance
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={extraStyles.primaryButton}
          onPress={onOpenMembers}
          activeOpacity={0.85}
        >
          <Text style={extraStyles.primaryButtonText}>View Club Members</Text>
        </TouchableOpacity>

        <View style={extraStyles.card}>
          <View style={extraStyles.cardTitleRow}>
            <Text style={extraStyles.cardTitle}>Club Settings</Text>
            <View style={extraStyles.redDot} />
          </View>

          <DetailRow
            label="Contribution"
            value={`$${Number(circle?.contribution_amount ?? 0).toLocaleString()}`}
          />
          <DetailRow
            label="Duration"
            value={circle?.duration_months ? `${circle.duration_months} months` : "—"}
          />
          <DetailRow
            label="Cycle Start"
            value={
              circle?.cycle_start_date
                ? new Date(circle.cycle_start_date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "—"
            }
            last
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export function GroupMembersScreen({
  circle,
  onBack,
}: {
  circle: any;
  onBack: () => void;
}) {
  const members = circle?.circle_members || [];

  return (
    <SafeAreaView style={extraStyles.screen} edges={["top", "bottom"]}>
      <View style={extraStyles.header}>
        <TouchableOpacity onPress={onBack}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.textDark} />
        </TouchableOpacity>
        <Text style={extraStyles.headerTitle}>Group Members</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20 }}>
        {members.length === 0 ? (
          <View style={{ paddingVertical: 40, alignItems: "center" }}>
            <Text style={{ color: Colors.textMid, fontSize: 15 }}>
              No members found for this club.
            </Text>
          </View>
        ) : (
          members.map((m: any, i: number) => {
            const name = m.profiles?.full_name ?? "Member";
            const order = m.order_position ?? i + 1;

            return (
              <View key={m.id ?? i} style={extraStyles.memberRow}>
                <View style={extraStyles.memberLeft}>
                  <View style={extraStyles.listOrderBadge}>
                    <Text style={extraStyles.listOrderText}>{order}</Text>
                  </View>

                  <View style={extraStyles.listAvatar}>
                    <Text style={extraStyles.listAvatarText}>
                      {getInitials(name)}
                    </Text>
                  </View>

                  <View>
                    <Text style={extraStyles.listMemberName}>{name}</Text>
                    <Text style={extraStyles.listMemberRole}>Member</Text>
                  </View>
                </View>

                <View style={extraStyles.activeBadgePill}>
                  <Text style={extraStyles.activeBadgePillText}>Active</Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

export function RecipientModal({
  visible,
  circle,
  payoutAmount = 800,
  payoutDate = "Mar 26, 2026",
  membersCount = 4,
  amountPerMember = 200,
  onClose,
  onViewClubDetails,
  onViewCashAdvance,
}: {
  visible: boolean;
  circle: any;
  payoutAmount?: number;
  payoutDate?: string;
  membersCount?: number;
  amountPerMember?: number;
  onClose: () => void;
  onViewClubDetails: () => void;
  onViewCashAdvance: () => void;
}) {
  if (!circle) return null;

  return (
    <Modal visible={visible} animationType="slide">
      <SafeAreaView style={extraStyles.screen} edges={["top", "bottom"]}>
        <View style={extraStyles.header}>
          <TouchableOpacity onPress={onClose}>
            <MaterialIcons name="close" size={28} color={Colors.textDark} />
          </TouchableOpacity>
          <Text style={extraStyles.headerTitle}>{circle.name}</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView contentContainerStyle={extraStyles.modalScroll}>
          <View style={extraStyles.bigIconCircle}>
            <MaterialIcons name="credit-card" size={48} color={Colors.white} />
          </View>

          <Text style={extraStyles.bigTitle}>You're the{"\n"}Recipient!</Text>

          <Text style={extraStyles.bigSubtitle}>
            Congratulations! This round's full contribution pool has been deposited
            into your Contribiia wallet.
          </Text>

          <View style={extraStyles.payoutBox}>
            <Text style={extraStyles.payoutLabel}>Total Payout</Text>
            <Text style={extraStyles.payoutAmount}>
              ${payoutAmount.toLocaleString()} CAD
            </Text>
          </View>

          <View style={extraStyles.card}>
            <DetailRow label="Club" value={circle.name} />
            <DetailRow label="Payout" value={payoutDate} />
            <DetailRow label="Contributions" value={`${membersCount} members`} />
            <DetailRow
              label="Amount per"
              value={`$${amountPerMember.toLocaleString()} CAD`}
              last
            />
          </View>
        </ScrollView>

        <View style={extraStyles.footerActions}>
          <TouchableOpacity
            style={extraStyles.primaryButton}
            onPress={onViewClubDetails}
            activeOpacity={0.85}
          >
            <Text style={extraStyles.primaryButtonText}>View Club Details</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={extraStyles.outlinePrimaryButton}
            onPress={onViewCashAdvance}
            activeOpacity={0.85}
          >
            <Text style={extraStyles.outlinePrimaryButtonText}>View Cash Advance</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

export function ContributionSuccessModal({
  visible,
  circle,
  amount = 200,
  date = "Mar 26, 2026",
  nextDue = "Apr 9, 2026",
  onClose,
}: {
  visible: boolean;
  circle: any;
  amount?: number;
  date?: string;
  nextDue?: string;
  onClose: () => void;
}) {
  if (!circle) return null;

  return (
    <Modal visible={visible} animationType="slide">
      <SafeAreaView style={extraStyles.screen} edges={["top", "bottom"]}>
        <View style={extraStyles.header}>
          <TouchableOpacity onPress={onClose}>
            <MaterialIcons name="close" size={28} color={Colors.textDark} />
          </TouchableOpacity>
          <Text style={extraStyles.headerTitle}>{circle.name}</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView contentContainerStyle={extraStyles.modalScroll}>
          <View style={extraStyles.bigIconCircle}>
            <MaterialIcons name="check" size={56} color={Colors.white} />
          </View>

          <Text style={extraStyles.bigTitle}>Contribution{"\n"}Successful!</Text>

          <Text style={extraStyles.bigSubtitle}>
            Your contribution has been deducted from your Contriibia wallet.
          </Text>

          <View style={extraStyles.card}>
            <DetailRow label="Club" value={circle.name} />
            <DetailRow
              label="Amount"
              value={`$${amount.toLocaleString()} CAD`}
              valueColor={Colors.primary}
            />
            <DetailRow label="Date" value={date} />
            <DetailRow label="Next Due" value={nextDue} last />
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const extraStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    padding: 20,
    paddingBottom: 40,
  },
  modalScroll: {
    padding: 20,
    paddingBottom: 30,
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.white,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.textDark,
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  waitingBanner: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F2D47A",
    backgroundColor: "#FBF5DD",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 20,
  },
  waitingDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#F2A600",
    marginRight: 12,
  },
  waitingText: {
    color: "#9E5B14",
    fontWeight: "700",
    fontSize: 14,
  },
  membersStrip: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 18,
    marginBottom: 26,
  },
  memberBubbleWrap: {
    alignItems: "center",
    width: 72,
  },
  memberBubble: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  memberBubbleText: {
    color: Colors.white,
    fontSize: 26,
    fontWeight: "800",
  },
  memberOrderBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.primary,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  memberOrderText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: "800",
  },
  memberNameText: {
    marginTop: 8,
    fontSize: 13,
    color: Colors.textDark,
    textAlign: "center",
  },
  outlinePrimaryButton: {
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: Colors.white,
  },
  outlinePrimaryButtonText: {
    color: Colors.primary,
    fontSize: 17,
    fontWeight: "700",
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: "center",
    marginBottom: 18,
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: "700",
  },
  card: {
    width: "100%",
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 0,
    overflow: "hidden",
    marginBottom: 20,
  },
  cardTitleRow: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: Colors.textDark,
  },
  redDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#E73A36",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  detailRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.textDark,
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 14,
    color: Colors.textDark,
    fontWeight: "600",
    textAlign: "right",
    flex: 1,
    marginLeft: 16,
  },
  memberRow: {
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  memberLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    flex: 1,
  },
  listOrderBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#E8F7F7",
    alignItems: "center",
    justifyContent: "center",
  },
  listOrderText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: "700",
  },
  listAvatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  listAvatarText: {
    color: Colors.white,
    fontSize: 22,
    fontWeight: "800",
  },
  listMemberName: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textDark,
  },
  listMemberRole: {
    fontSize: 13,
    color: Colors.textMid,
    marginTop: 3,
  },
  activeBadgePill: {
    backgroundColor: "#EAF8E8",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
  },
  activeBadgePillText: {
    color: "#43974A",
    fontWeight: "700",
    fontSize: 14,
  },
  bigIconCircle: {
    width: 132,
    height: 132,
    borderRadius: 66,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    marginBottom: 26,
  },
  bigTitle: {
    textAlign: "center",
    fontSize: 28,
    lineHeight: 40,
    fontWeight: "800",
    color: Colors.textDark,
    marginBottom: 16,
  },
  bigSubtitle: {
    textAlign: "center",
    fontSize: 16,
    lineHeight: 28,
    color: Colors.textDark,
    marginBottom: 22,
    paddingHorizontal: 8,
  },
  payoutBox: {
    width: "100%",
    backgroundColor: "#EAF7F7",
    borderRadius: 16,
    paddingVertical: 22,
    alignItems: "center",
    marginBottom: 24,
  },
  payoutLabel: {
    color: Colors.primary,
    fontWeight: "700",
    fontSize: 18,
    marginBottom: 6,
  },
  payoutAmount: {
    color: Colors.primary,
    fontWeight: "800",
    fontSize: 32,
  },
  footerActions: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,
    backgroundColor: Colors.background,
  },
});
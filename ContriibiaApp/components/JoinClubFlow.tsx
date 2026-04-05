import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
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

  const memberCount = circle.circle_members?.length || 0;
  const totalPositions = circle.total_positions || 0;
  const openPositions = Math.max(0, totalPositions - memberCount);

  return (
    <Modal visible={visible} animationType="slide">
      <SafeAreaView style={overviewStyles.container} edges={["top", "bottom"]}>
        <View style={overviewStyles.header}>
          <TouchableOpacity onPress={onClose}>
            <MaterialIcons name="arrow-back" size={24} color={Colors.textDark} />
          </TouchableOpacity>
          <Text style={overviewStyles.headerTitle}>Club Overview</Text>
          <MaterialIcons name="notifications-none" size={24} color={Colors.textDark} />
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
                <View style={overviewStyles.typeBadge}>
                  <Text style={overviewStyles.typeBadgeText}>
                    {circle.visibility === "private" ? "Private" : "Public"}
                  </Text>
                </View>
              </View>

              {!!circle.circle_members?.length && (
                <View style={overviewStyles.membersRow}>
                  {circle.circle_members.slice(0, 4).map((m: any, i: number) => (
                    <MemberAvatar
                      key={m.id ?? i}
                      name={m.profiles?.full_name ?? "?"}
                      size={30}
                    />
                  ))}
                </View>
              )}
            </View>
          </View>

          {totalPositions > 0 && (
            <Text style={overviewStyles.slotsNote}>
              {openPositions > 0
                ? `${openPositions} position${openPositions > 1 ? "s" : ""} available`
                : "Club is full"}
            </Text>
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
              value={`$${Number(circle.contribution_amount || 0).toLocaleString()}${
                circle.contribution_frequency
                  ? `, every ${circle.contribution_frequency}`
                  : ""
              }`}
            />
            <OverviewDetailRow
              label="Duration"
              value={circle.duration_months ? `${circle.duration_months} months` : "—"}
            />
            <OverviewDetailRow
              label="Cycle Start Date"
              value={
                circle.cycle_start_date
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

          <ScrollView style={agreementStyles.textScroll}>
            <Text style={agreementStyles.body}>
              By joining this club, I commit to contributing{" "}
              <Text style={agreementStyles.bold}>{amount + freq}</Text> to the{" "}
              <Text style={agreementStyles.bold}>{circle.name}</Text> savings club
              for a duration of <Text style={agreementStyles.bold}>{duration}</Text>.
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
  onShowRecipient?: () => void;
  onShowContributionSuccess?: () => void;
}) {
  return (
    <SafeAreaView style={extraStyles.screen} edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={extraStyles.scroll}>
        <View style={extraStyles.header}>
          <TouchableOpacity onPress={onBack}>
            <MaterialIcons name="arrow-back" size={24} color={Colors.textDark} />
          </TouchableOpacity>

          <Text style={extraStyles.headerTitle}>{circle?.name}</Text>

          <View style={extraStyles.headerIcons}>
            <MaterialIcons name="notifications-none" size={24} color={Colors.textDark} />
            <MaterialIcons name="settings" size={24} color={Colors.textDark} />
          </View>
        </View>

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

function DetailRow({
  label,
  value,
  last = false,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View style={[extraStyles.detailRow, !last && extraStyles.detailRowBorder]}>
      <Text style={extraStyles.detailLabel}>{label}</Text>
      <Text style={extraStyles.detailValue}>{value}</Text>
    </View>
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
            return (
              <View key={m.id ?? i} style={extraStyles.memberRow}>
                <View style={extraStyles.memberLeft}>
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
  typeBadgeText: { fontSize: 11, color: Colors.primary, fontWeight: "600" },
  membersRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    flexWrap: "wrap",
  },
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

const extraStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    padding: 20,
    paddingBottom: 40,
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
});
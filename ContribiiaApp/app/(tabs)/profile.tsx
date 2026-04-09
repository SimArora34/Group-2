import AppIcon from "@/components/AppIcon";
import { useFocusEffect } from "@react-navigation/native";
import {
  getCurrentProfile,
  updateCurrentProfile,
} from "@/src/services/profileService";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../constants/Colors";

type ScreenMode = "view" | "edit" | "success";

type ProfileForm = {
  fullName: string;
  username: string;
  email: string;
  phone: string;
  createdAt: string;
};

function HeaderAction({
  name,
  onPress,
}: {
  name: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={styles.headerIconButton}
    >
      <AppIcon name={name} size={22} color={Colors.textDark} />
    </TouchableOpacity>
  );
}

function ProfileField({
  label,
  value,
  onChangeText,
  keyboardType = "default",
  autoCapitalize = "words",
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: "default" | "email-address" | "phone-pad";
  autoCapitalize?: "none" | "words";
}) {
  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.fieldLabel}>
        {label}
        <Text style={styles.required}> *</Text>
      </Text>
      <View style={styles.fieldShell}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          style={styles.fieldInput}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          placeholderTextColor={Colors.textPlaceholder}
        />
        {!!value && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => onChangeText("")}
            style={styles.clearButton}
          >
            <AppIcon name="close" size={16} color={Colors.primary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const [mode, setMode] = useState<ScreenMode>("view");
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<ProfileForm>({
    fullName: "",
    username: "",
    email: "",
    phone: "",
    createdAt: "",
  });
  const [draft, setDraft] = useState(profile);
  const [usernameNotice, setUsernameNotice] = useState(profile.username);

  const loadProfile = useCallback(async () => {
    const profileRes = await getCurrentProfile();

    if (!profileRes.success || !profileRes.data) {
      return;
    }

    const loadedProfile = {
      fullName: profileRes.data.full_name || "",
      username: profileRes.data.username || "",
      email: profileRes.data.email || "",
      phone: profileRes.data.phone || "",
      createdAt: profileRes.data.created_at || "",
    };

    setProfile(loadedProfile);
    setDraft(loadedProfile);
    setUsernameNotice(loadedProfile.username);
    setMode("view");
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile]),
  );

  const memberSince = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "";

  const initials =
    profile.fullName
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "";

  const hasChanges =
    draft.fullName.trim() !== profile.fullName.trim() ||
    draft.username.trim() !== profile.username.trim() ||
    draft.email.trim() !== profile.email.trim() ||
    draft.phone.trim() !== profile.phone.trim();

  const canSave =
    hasChanges &&
    !!draft.fullName.trim() &&
    !!draft.username.trim() &&
    !!draft.phone.trim();

  const score = 8.5;
  const historyItems = [
    "5 on-time payments",
    "Participant in 2 clubs",
  ];

  const handleStartEdit = () => {
    setDraft(profile);
    router.push("/edit-profile");
  };

  const handleSave = async () => {
    if (!canSave) {
      return;
    }

    setSaving(true);

    const result = await updateCurrentProfile({
      full_name: draft.fullName.trim(),
      username: draft.username.trim().replace(/^@/, ""),
      email: draft.email.trim(),
      phone: draft.phone.trim(),
    });

    setSaving(false);

    if (!result.success) {
      Alert.alert("Update failed", result.error || "Unable to save profile.");
      return;
    }

    const nextProfile = {
      fullName: draft.fullName.trim(),
      username: draft.username.trim().replace(/^@/, ""),
      email: draft.email.trim(),
      phone: draft.phone.trim(),
      createdAt: profile.createdAt,
    };

    setProfile(nextProfile);
    setDraft(nextProfile);
    setUsernameNotice(nextProfile.username);
    setMode("success");
  };

  const renderAvatar = (editable = false) => (
    <TouchableOpacity
      activeOpacity={editable ? 0.8 : 1}
      disabled={!editable}
      onPress={() =>
        editable &&
        Alert.alert(
          "Profile photo",
          "Photo upload is the next profile feature to wire up.",
        )
      }
      style={[styles.avatar, editable && styles.avatarEditable]}
    >
      {editable ? (
        <AppIcon name="photo-camera" size={30} color={Colors.textMid} />
      ) : (
        <Text style={styles.avatarText}>{initials}</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <HeaderAction name="arrow-back" onPress={() => router.back()} />
        <Text style={styles.headerTitle}>
          {mode === "edit" ? "Edit User Profile" : "User Profile"}
        </Text>
        <View style={styles.headerRight}>
          <HeaderAction name="chat-bubble-outline" onPress={() => Alert.alert('Coming Soon', 'Chat messaging will be available in a future update.')} />
          <HeaderAction name="notifications-none" onPress={() => Alert.alert('Coming Soon', 'Notifications will be available in a future update.')} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {mode === "success" && (
          <>
            <View style={styles.successBanner}>
              <Text style={styles.successBannerText}>
                Profile updated successfully!
              </Text>
            </View>

            <View style={styles.successCard}>
              <View style={styles.successIcon}>
                <AppIcon name="check" size={48} color={Colors.white} />
              </View>
              <Text style={styles.successTitle}>Congratulations!</Text>
              <Text style={styles.successMessage}>
                Your <Text style={styles.emphasis}>username</Text> has been
                changed to{" "}
                <Text style={styles.successUsername}>@{usernameNotice}</Text>
              </Text>

              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.primaryButton}
                onPress={() => setMode("view")}
              >
                <Text style={styles.primaryButtonText}>Go back to My Profile</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {mode !== "success" && (
          <>
            <View style={styles.profileIntro}>
              {mode === "view" && (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => router.push("/settings")}
                  style={styles.settingsButton}
                >
                  <AppIcon name="settings" size={24} color={Colors.textDark} />
                </TouchableOpacity>
              )}

              {renderAvatar(mode === "edit")}

              {mode === "view" ? (
                <>
                  <View style={styles.nameRow}>
                    <Text style={styles.name}>{profile.fullName}</Text>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={handleStartEdit}
                      style={styles.inlineEditButton}
                    >
                      <AppIcon name="edit" size={18} color="#F2A43A" />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.username}>@{profile.username}</Text>
                  {!!profile.email && (
                    <Text style={styles.emailText}>{profile.email}</Text>
                  )}
                  <Text style={styles.memberSince}>Member since: {memberSince}</Text>
                </>
              ) : (
                <View style={styles.editPanel}>
                  <ProfileField
                    label="Name"
                    value={draft.fullName}
                    onChangeText={(text) =>
                      setDraft((current) => ({ ...current, fullName: text }))
                    }
                  />
                  <ProfileField
                    label="Username"
                    value={`@${draft.username.replace(/^@/, "")}`}
                    autoCapitalize="none"
                    onChangeText={(text) =>
                      setDraft((current) => ({
                        ...current,
                        username: text.replace(/^@/, ""),
                      }))
                    }
                  />
                  <ProfileField
                    label="Email address"
                    value={draft.email}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    onChangeText={(text) =>
                      setDraft((current) => ({ ...current, email: text }))
                    }
                  />
                  <ProfileField
                    label="Phone number"
                    value={draft.phone}
                    keyboardType="phone-pad"
                    onChangeText={(text) =>
                      setDraft((current) => ({ ...current, phone: text }))
                    }
                  />

                  <TouchableOpacity
                    activeOpacity={canSave ? 0.85 : 1}
                    disabled={!canSave || saving}
                    style={[
                      styles.primaryButton,
                      (!canSave || saving) && styles.primaryButtonDisabled,
                    ]}
                    onPress={handleSave}
                  >
                    <Text
                      style={[
                        styles.primaryButtonText,
                        (!canSave || saving) && styles.primaryButtonTextDisabled,
                      ]}
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {mode === "view" && (
              <View style={styles.trustSection}>
                <Text style={styles.sectionTitle}>Contriibia Trust Score</Text>

                <View style={styles.scoreCircle}>
                  <Text style={styles.scoreText}>{score.toFixed(1)}</Text>
                </View>

                <Text style={styles.scoreCaption}>Out of 2 ratings*</Text>

                <View style={styles.starRow}>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <AppIcon
                      key={index}
                      name="star"
                      size={32}
                      color="#F4A93D"
                    />
                  ))}
                </View>

                <View style={styles.detailBlock}>
                  <Text style={styles.detailHeading}>User History</Text>
                  {historyItems.map((item) => (
                    <View key={item} style={styles.detailRow}>
                      <AppIcon name="check-box" size={18} color="#3DA7BA" />
                      <Text style={styles.detailText}>{item}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.detailBlock}>
                  <Text style={styles.detailHeading}>Feedback</Text>
                  <View style={styles.detailRow}>
                    <AppIcon name="chat" size={18} color="#3DA7BA" />
                    <Text style={styles.detailText}>
                      “Great at communicating”
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 17,
    fontWeight: "700",
    color: Colors.textDark,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerIconButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: {
    paddingBottom: 40,
  },
  profileIntro: {
    paddingHorizontal: 20,
    paddingTop: 24,
    alignItems: "center",
  },
  settingsButton: {
    alignSelf: "flex-end",
    marginBottom: -6,
  },
  avatar: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: "#D5DCE7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  avatarEditable: {
    backgroundColor: "#D9D9D9",
  },
  avatarText: {
    color: Colors.textDark,
    fontSize: 28,
    fontWeight: "800",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  name: {
    fontSize: 24,
    fontWeight: "800",
    color: "#163841",
    textAlign: "center",
    flexShrink: 1,
  },
  inlineEditButton: {
    paddingTop: 3,
  },
  username: {
    fontSize: 15,
    color: Colors.textMid,
    marginTop: 4,
    textAlign: "center",
    maxWidth: "100%",
    paddingHorizontal: 12,
  },
  emailText: {
    fontSize: 14,
    color: Colors.textMid,
    marginTop: 4,
    lineHeight: 20,
    textAlign: "center",
    maxWidth: "100%",
    paddingHorizontal: 12,
  },
  memberSince: {
    marginTop: 8,
    fontSize: 14,
    color: Colors.textDark,
    lineHeight: 20,
    textAlign: "center",
    maxWidth: "100%",
    paddingHorizontal: 12,
  },
  trustSection: {
    paddingHorizontal: 20,
    paddingTop: 26,
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.textDark,
    marginBottom: 18,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#15849A",
    alignItems: "center",
    justifyContent: "center",
  },
  scoreText: {
    fontSize: 40,
    fontWeight: "800",
    color: Colors.white,
  },
  scoreCaption: {
    fontSize: 11,
    color: Colors.textMid,
    marginTop: 14,
    lineHeight: 16,
    textAlign: "center",
    maxWidth: "100%",
    paddingHorizontal: 12,
  },
  starRow: {
    flexDirection: "row",
    marginTop: 6,
    marginBottom: 24,
    gap: 2,
  },
  detailBlock: {
    width: "100%",
    marginBottom: 16,
  },
  detailHeading: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textDark,
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
    width: "100%",
  },
  detailText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: Colors.textDark,
    flexWrap: "wrap",
  },
  editPanel: {
    width: "100%",
  },
  fieldBlock: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    color: Colors.textDark,
    marginBottom: 6,
  },
  required: {
    color: Colors.error,
  },
  fieldShell: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: "#5D8790",
    borderRadius: 10,
    backgroundColor: Colors.white,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  fieldInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.textDark,
  },
  clearButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButton: {
    marginTop: 8,
    minHeight: 54,
    borderRadius: 10,
    backgroundColor: "#2F96A7",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonDisabled: {
    backgroundColor: "#CBD6DA",
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: "700",
  },
  primaryButtonTextDisabled: {
    color: "#96A2A8",
  },
  successBanner: {
    backgroundColor: "#D7EFF5",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  successBannerText: {
    fontSize: 14,
    color: Colors.textDark,
  },
  successCard: {
    paddingHorizontal: 20,
    paddingTop: 30,
    alignItems: "center",
  },
  successIcon: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#1D7C68",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 26,
    borderWidth: 3,
    borderColor: "#C9E6DB",
  },
  successTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.textDark,
    marginBottom: 18,
  },
  successMessage: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.textDark,
    textAlign: "center",
    marginBottom: 34,
  },
  emphasis: {
    fontStyle: "italic",
  },
  successUsername: {
    fontWeight: "800",
  },
});

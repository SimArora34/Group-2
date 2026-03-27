import AppIcon from "@/components/AppIcon";
import {
  getCurrentProfile,
  updateCurrentProfile,
} from "@/src/services/profileService";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
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
import { Colors } from "../constants/Colors";

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

export default function EditProfileScreen() {
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<ProfileForm>({
    fullName: "",
    username: "",
    email: "",
    phone: "",
    createdAt: "",
  });
  const [draft, setDraft] = useState(profile);

  useEffect(() => {
    (async () => {
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
    })();
  }, []);

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

    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <HeaderAction name="arrow-back" onPress={() => router.back()} />
        <Text style={styles.headerTitle}>Edit User Profile</Text>
        <View style={styles.headerRight}>
          <HeaderAction name="chat-bubble-outline" />
          <HeaderAction name="notifications-none" />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.profileIntro}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() =>
              Alert.alert(
                "Profile photo",
                "Photo upload is the next profile feature to wire up.",
              )
            }
            style={[styles.avatar, styles.avatarEditable]}
          >
            <AppIcon name="photo-camera" size={30} color={Colors.textMid} />
          </TouchableOpacity>

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
        </View>
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
});

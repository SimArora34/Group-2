import { updatePassword } from "@/src/services/authService";
import { PASSWORD_REGEX } from "@/src/utils/validation";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../../components/Button";
import Input from "../../components/Input";
import Logo from "../../components/Logo";
import { Colors } from "../../constants/Colors";

type FormErrors = {
  password?: string;
  confirmPassword?: string;
  general?: string;
};

export default function SetPasswordScreen() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    const newErrors: FormErrors = {};

    if (!password) newErrors.password = "Password is required";
    if (!confirmPassword) newErrors.confirmPassword = "Please confirm your password";

    if (password && !PASSWORD_REGEX.test(password)) {
      newErrors.password =
        "Use 8+ chars with uppercase, lowercase, number, and symbol";
    }

    if (password && confirmPassword && password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    const result = await updatePassword(password);

    setLoading(false);

    if (!result.success) {
      if (result.error?.toLowerCase().includes("session")) {
        setErrors({
          general:
            "Session expired. Please verify your reset code again or sign in, then try updating your password.",
        });
        return;
      }

      setErrors({ general: result.error || "Failed to update password" });
      return;
    }

    router.replace("/(auth)/password-success");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Change Password</Text>
        <View style={styles.headerBtn} />
      </View>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoRow}>
          <Logo size="large" showTagline />
        </View>

        <Text style={styles.heading}>Set a new Password</Text>
        <Text style={styles.subheading}>
          Create a new password using 8+ characters with uppercase, lowercase,
          number, and symbol.
        </Text>
        {!!errors.general && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{errors.general}</Text>
          </View>
        )}

        <Input
          label="Password"
          placeholder="Enter new password"
          value={password}
          onChangeText={(v) => {
            setPassword(v);
            setErrors((prev) => ({ ...prev, password: undefined }));
          }}
          secureTextEntry
          error={errors.password}
        />
        <Input
          label="Confirm Password"
          placeholder="Re-enter new password"
          value={confirmPassword}
          onChangeText={(v) => {
            setConfirmPassword(v);
            setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
          }}
          secureTextEntry
          error={errors.confirmPassword}
        />

        <View style={styles.spacer} />
        <Button
          label="Update Password"
          onPress={handleUpdate}
          loading={loading}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.white,
  },
  headerBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 17, fontWeight: "700", color: Colors.textDark },
  scroll: { padding: 24, flexGrow: 1 },
  logoRow: { alignItems: "center", marginBottom: 32, marginTop: 8 },
  heading: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.textDark,
    marginBottom: 8,
    textAlign: "center",
  },
  subheading: {
    fontSize: 14,
    color: Colors.textMid,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  spacer: { flex: 1, minHeight: 40 },
  errorBanner: {
    backgroundColor: '#FDECEA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorBannerText: { fontSize: 13, color: Colors.error },
});

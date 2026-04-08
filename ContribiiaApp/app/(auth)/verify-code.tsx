import { verifyOtp } from "@/src/services/authService";
import { router, useLocalSearchParams } from "expo-router";
import React, { useRef, useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../../components/Button";
import Logo from "../../components/Logo";
import { Colors } from "../../constants/Colors";

const CODE_LENGTH = 6;

export default function VerifyCodeScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const inputs = useRef<(TextInput | null)[]>([]);

  const handleChange = (val: string, idx: number) => {
    if (!/^\d*$/.test(val)) return;

    const newCode = [...code];
    newCode[idx] = val.slice(-1);
    setCode(newCode);

    if (val && idx < CODE_LENGTH - 1) {
      inputs.current[idx + 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const entered = code.join("");

    if (entered.length < CODE_LENGTH) {
      Alert.alert("Error", "Please enter the full 6-digit code");
      return;
    }

    setLoading(true);

    const result = await verifyOtp(email || "", entered);

    setLoading(false);

    if (!result.success) {
      Alert.alert(
        "Invalid Code",
        result.error || "The code is incorrect. Please try again.",
      );
      return;
    }

    router.push("/(auth)/set-password");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoRow}>
          <Logo size="large" showTagline />
        </View>

        <Text style={styles.heading}>Check your email</Text>
        <Text style={styles.subheading}>
          We sent a reset link to{" "}
          <Text style={styles.emailBold}>{email || "your email"}</Text>.{"\n"}
          Enter the 6 digit code mentioned in the email.
        </Text>

        <View style={styles.codeRow}>
          {code.map((digit, idx) => (
            <TextInput
              key={idx}
              ref={(r) => {
                inputs.current[idx] = r;
              }}
              style={styles.codeBox}
              value={digit}
              onChangeText={(v) => handleChange(v, idx)}
              keyboardType="numeric"
              maxLength={1}
              textAlign="center"
            />
          ))}
        </View>

        <View style={styles.spacer} />
        <Button label="Verify Code" onPress={handleVerify} loading={loading} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
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
    marginBottom: 28,
    lineHeight: 20,
  },
  emailBold: { fontWeight: "700", color: Colors.textDark },
  codeRow: { flexDirection: "row", justifyContent: "center", gap: 12 },
  codeBox: {
    width: 50,
    height: 56,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 8,
    fontSize: 22,
    fontWeight: "700",
    color: Colors.textDark,
    backgroundColor: Colors.surface,
  },
  spacer: { flex: 1, minHeight: 40 },
});

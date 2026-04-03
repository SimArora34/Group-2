import { signIn } from "@/src/services/authService";
import { getCurrentProfile } from "@/src/services/profileService";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../../components/Button";
import Input from "../../components/Input";
import Logo from "../../components/Logo";
import { Colors } from "../../constants/Colors";

export default function LoginScreen() {
  const { prefillEmail } = useLocalSearchParams<{ prefillEmail?: string }>();
  const [email, setEmail] = useState(prefillEmail ?? "");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (prefillEmail) setEmail(prefillEmail);
  }, [prefillEmail]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);

    const result = await signIn(email.trim(), password);

    if (!result.success) {
      setLoading(false);
      Alert.alert("Login Failed", result.error || "Invalid email or password");
      return;
    }

    // Check whether the user has completed profile setup (verification step).
    // If legal_name is not set they haven't gone through the setup wizard yet.
    const profileResult = await getCurrentProfile();
    setLoading(false);

    const hasCompletedSetup =
      profileResult.success && !!profileResult.data?.legal_name;

    if (hasCompletedSetup) {
      router.replace("/(tabs)/DashbaordScreen");
    } else {
      router.replace("/(verification)/setup-overview");
    }
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

        <Text style={styles.heading}>Welcome back to Contribiia.</Text>

        <Input
          label="Email address"
          placeholder="saver@contribiia.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Input
          label="Password"
          placeholder="Enter password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          onPress={() => router.push("/(auth)/forgot-password")}
        >
          <Text style={styles.forgotLink}>Forgot password?</Text>
        </TouchableOpacity>

        <View style={styles.spacer} />

        <Button label="Login" onPress={handleLogin} loading={loading} />

        <Text style={styles.bottomText}>
          Don't have an account?{" "}
          <Text
            style={styles.link}
            onPress={() => router.replace("/(auth)/signup")}
          >
            Sign Up
          </Text>
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scroll: {
    padding: 24,
    flexGrow: 1,
  },
  logoRow: {
    alignItems: "center",
    marginBottom: 32,
    marginTop: 8,
  },
  heading: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.textDark,
    marginBottom: 24,
    textAlign: "center",
  },
  forgotLink: {
    color: Colors.accent,
    fontSize: 14,
    marginTop: 4,
    marginBottom: 16,
  },
  spacer: {
    flex: 1,
    minHeight: 32,
  },
  bottomText: {
    textAlign: "center",
    color: Colors.textMid,
    fontSize: 14,
    marginTop: 16,
  },
  link: {
    color: Colors.primary,
    fontWeight: "600",
  },
});

import { router } from "expo-router";
import React, { useState } from "react";
import AppIcon from "../../components/AppIcon";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../constants/Colors";

type BiometricType = "face" | "fingerprint";

export default function BiometricsScreen() {
  const [type, setType] = useState<BiometricType>("face");
  const [verified, setVerified] = useState(false);

  const handleScan = () => {
    setVerified(true);
    setTimeout(() => router.back(), 1200);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.body}>
        <Text style={styles.title}>Verify Your Identity</Text>
        <Text style={styles.subtitle}>Please verify your identity</Text>

        <View style={styles.scanBox}>
          <View style={styles.faceIllustration}>
            <View style={styles.faceCornerTL} />
            <View style={styles.faceCornerTR} />
            <View style={styles.faceCornerBL} />
            <View style={styles.faceCornerBR} />
            <AppIcon
              name={type === "face" ? "happy-outline" : "finger-print"}
              size={80}
              color={Colors.primary}
            />
          </View>
        </View>

        <Text style={styles.scanLabel}>
          {verified
            ? "✓ Identity Verified"
            : type === "face"
              ? "Scan your face to proceed"
              : "Scan your fingerprint to proceed"}
        </Text>

        <TouchableOpacity
          style={[styles.scanBtn, verified && styles.scanBtnSuccess]}
          onPress={handleScan}
          disabled={verified}
        >
          <Text style={styles.scanBtnText}>{verified ? "Verified!" : "Scan Now"}</Text>
        </TouchableOpacity>

        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleBtn, type === "face" && styles.toggleBtnActive]}
            onPress={() => setType("face")}
          >
            <AppIcon
              name="happy-outline"
              size={20}
              color={type === "face" ? Colors.white : Colors.primary}
            />
            <Text
              style={[
                styles.toggleBtnText,
                type === "face" && styles.toggleBtnTextActive,
              ]}
            >
              Face ID
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toggleBtn,
              type === "fingerprint" && styles.toggleBtnActive,
            ]}
            onPress={() => setType("fingerprint")}
          >
            <AppIcon
              name="finger-print"
              size={20}
              color={type === "fingerprint" ? Colors.white : Colors.primary}
            />
            <Text
              style={[
                styles.toggleBtnText,
                type === "fingerprint" && styles.toggleBtnTextActive,
              ]}
            >
              Fingerprint
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const CORNER_SIZE = 24;
const CORNER_THICKNESS = 3;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  body: {
    flex: 1,
    padding: 24,
    alignItems: "center",
    gap: 24,
    justifyContent: "center",
  },
  title: { fontSize: 24, fontWeight: "800", color: Colors.textDark },
  subtitle: { fontSize: 14, color: Colors.textMid, marginTop: -16 },
  scanBox: { width: 220, height: 220, alignItems: "center", justifyContent: "center" },
  faceIllustration: {
    width: 200,
    height: 200,
    backgroundColor: Colors.primaryLight,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  faceCornerTL: {
    position: "absolute",
    top: 10,
    left: 10,
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderTopWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
    borderColor: Colors.primary,
  },
  faceCornerTR: {
    position: "absolute",
    top: 10,
    right: 10,
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderTopWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
    borderColor: Colors.primary,
  },
  faceCornerBL: {
    position: "absolute",
    bottom: 10,
    left: 10,
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderBottomWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
    borderColor: Colors.primary,
  },
  faceCornerBR: {
    position: "absolute",
    bottom: 10,
    right: 10,
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderBottomWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
    borderColor: Colors.primary,
  },
  scanLabel: { fontSize: 14, color: Colors.textMid },
  scanBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 28,
  },
  scanBtnSuccess: {
    backgroundColor: Colors.success,
  },
  scanBtnText: {
    color: Colors.white,
    fontWeight: "700",
    fontSize: 16,
  },
  toggleRow: {
    flexDirection: "row",
    gap: 12,
  },
  toggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.white,
  },
  toggleBtnActive: {
    backgroundColor: Colors.primary,
  },
  toggleBtnText: {
    color: Colors.primary,
    fontWeight: "600",
  },
  toggleBtnTextActive: {
    color: Colors.white,
  },
});
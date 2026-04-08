import React from "react";
import { Image, StyleSheet, View } from "react-native";

interface LogoProps {
  size?: "small" | "medium" | "large";
  showTagline?: boolean;
}

const LOGO_WIDTHS = { small: 100, medium: 140, large: 180 };

export default function Logo({ size = "medium" }: LogoProps) {
  const width = LOGO_WIDTHS[size];

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/logo_full.png")}
        style={{ width, height: width * 0.4 }}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
});

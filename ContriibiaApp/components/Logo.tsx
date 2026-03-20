import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { Colors } from "../constants/Colors";

const logoImage = require("../assets/images/Contriibia_full_logo.png");

interface LogoProps {
  size?: "small" | "medium" | "large";
  showTagline?: boolean;
}

export default function Logo({
  size = "large",
  showTagline = false,
}: LogoProps) {
  const imageHeight = size === "large" ? 100 : size === "small" ? 40 : 60;
  const imageWidth = imageHeight * 5;

  return (
    <View style={styles.container}>
      <Image
        source={logoImage}
        style={{ width: imageWidth, height: imageHeight }}
        resizeMode="contain"
      />
      {showTagline && <Text style={styles.tagline}></Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  tagline: {
    fontSize: 13,
    color: Colors.primary,
    marginTop: 2,
    fontStyle: "italic",
  },
});

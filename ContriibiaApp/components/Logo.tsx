import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../constants/Colors';

// Placeholder for the Contribiia logo (text-based until real assets are added)
interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showTagline?: boolean;
}

export default function Logo({ size = 'medium', showTagline = false }: LogoProps) {
  const textSize = size === 'large' ? 32 : size === 'small' ? 20 : 26;
  const iconSize = size === 'large' ? 36 : size === 'small' ? 22 : 28;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {/* Placeholder wave icon */}
        <View style={[styles.iconPlaceholder, { width: iconSize, height: iconSize }]}>
          <Text style={[styles.iconText, { fontSize: iconSize * 0.65 }]}>〰</Text>
        </View>
        <Text style={[styles.brandName, { fontSize: textSize }]}>Contribiia</Text>
      </View>
      {showTagline && <Text style={styles.tagline}>the savings club</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconPlaceholder: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    color: Colors.primary,
  },
  brandName: {
    fontWeight: '700',
    color: Colors.textDark,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 13,
    color: Colors.primary,
    marginTop: 2,
    fontStyle: 'italic',
  },
});

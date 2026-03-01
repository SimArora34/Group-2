import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/Button';
import Logo from '../../components/Logo';
import { Colors } from '../../constants/Colors';

export default function AuthIndex() {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Gradient background placeholder */}
      <View style={styles.heroArea}>
        <View style={styles.gradientPlaceholder}>
          <View style={styles.wave1} />
          <View style={styles.wave2} />
          <View style={styles.wave3} />
        </View>
        <View style={styles.logoSection}>
          <Logo size="large" showTagline />
          <Text style={styles.taglineText}>Save together, achieve more!</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Button
          label="Sign Up"
          variant="outline"
          onPress={() => router.push('/(auth)/signup')}
        />
        <Button
          label="Log In"
          onPress={() => router.push('/(auth)/login')}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  heroArea: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  gradientPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.white,
  },
  wave1: {
    position: 'absolute',
    bottom: -100,
    left: -80,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: Colors.gradient3,
    opacity: 0.5,
  },
  wave2: {
    position: 'absolute',
    bottom: -160,
    left: -40,
    width: 380,
    height: 380,
    borderRadius: 190,
    backgroundColor: Colors.gradient2,
    opacity: 0.4,
  },
  wave3: {
    position: 'absolute',
    bottom: -220,
    left: -20,
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: Colors.gradient1,
    opacity: 0.3,
  },
  logoSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  taglineText: {
    fontSize: 16,
    color: Colors.textMid,
    fontWeight: '500',
    marginTop: 8,
  },
  actions: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    gap: 12,
  },
});

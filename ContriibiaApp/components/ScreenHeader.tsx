import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';

interface ScreenHeaderProps {
  title: string;
  showIcons?: boolean;
  onBack?: () => void;
}

export default function ScreenHeader({ title, showIcons = true, onBack }: ScreenHeaderProps) {
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <View style={styles.container}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{title}</Text>
        {showIcons ? (
          <View style={styles.icons}>
            <Text style={styles.icon}>🙂</Text>
            <Text style={styles.icon}>🔔</Text>
          </View>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: Colors.white,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  backButton: {
    width: 32,
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 30,
    color: Colors.textDark,
    lineHeight: 32,
    marginTop: -4,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '600',
    color: Colors.textDark,
  },
  icons: {
    flexDirection: 'row',
    gap: 8,
  },
  icon: {
    fontSize: 20,
  },
  placeholder: {
    width: 40,
  },
});

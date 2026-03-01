import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';

export default function ClubsScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.body}>
        <Text style={styles.emoji}>👥</Text>
        <Text style={styles.title}>Savings Clubs</Text>
        <Text style={styles.subtitle}>Coming soon – browse and join savings clubs here.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  emoji: { fontSize: 64 },
  title: { fontSize: 22, fontWeight: '700', color: Colors.textDark },
  subtitle: { fontSize: 14, color: Colors.textMid, textAlign: 'center', lineHeight: 20 },
});

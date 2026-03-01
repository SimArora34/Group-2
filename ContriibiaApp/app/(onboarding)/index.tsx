import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Dimensions, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/Button';
import Logo from '../../components/Logo';
import { Colors } from '../../constants/Colors';
import mockData from '../../data/mockData.json';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Placeholder image colors per slide
const SLIDE_COLORS = [Colors.primaryLight, '#FFF8E1', '#E8EAF6', '#FCE4EC'];
const SLIDE_EMOJIS = ['💰', '📊', '🛡️', '👛'];

interface Slide {
  id: string;
  title: string;
  description: string;
  image: string;
}

function SlideItem({ item, index }: { item: Slide; index: number }) {
  return (
    <View style={[styles.slide, { width: SCREEN_WIDTH - 48 }]}>
      <Text style={styles.slideTitle}>{item.title}</Text>
      {/* Placeholder image */}
      <View style={[styles.imagePlaceholder, { backgroundColor: SLIDE_COLORS[index % SLIDE_COLORS.length] }]}>
        <Text style={styles.imageEmoji}>{SLIDE_EMOJIS[index % SLIDE_EMOJIS.length]}</Text>
        <Text style={styles.imagePlaceholderText}>[ Illustration ]</Text>
      </View>
      <Text style={styles.slideDescription}>{item.description}</Text>
      <TouchableOpacity>
        <Text style={styles.learnMore}>Learn more</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function OnboardingScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const slides: Slide[] = mockData.onboardingSlides;

  const handleScroll = (e: any) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / (SCREEN_WIDTH - 48 + 16));
    setActiveIndex(index);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.logoRow}>
        <Logo size="large" showTagline />
      </View>

      <FlatList
        ref={flatListRef}
        data={slides}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled={false}
        snapToInterval={SCREEN_WIDTH - 48 + 16}
        snapToAlignment="start"
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        renderItem={({ item, index }) => <SlideItem item={item} index={index} />}
      />

      {/* Dots */}
      <View style={styles.dots}>
        {slides.map((_, i) => (
          <View key={i} style={[styles.dot, i === activeIndex && styles.dotActive]} />
        ))}
      </View>

      <View style={styles.actions}>
        <Button label="Get Started" onPress={() => router.replace('/(auth)')} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  logoRow: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  listContent: {
    paddingHorizontal: 24,
    gap: 16,
  },
  slide: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 20,
    marginBottom: 8,
  },
  slideTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textDark,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 26,
  },
  imagePlaceholder: {
    height: 200,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  imageEmoji: {
    fontSize: 64,
    marginBottom: 8,
  },
  imagePlaceholderText: {
    fontSize: 12,
    color: Colors.textLight,
    fontStyle: 'italic',
  },
  slideDescription: {
    fontSize: 14,
    color: Colors.textMid,
    lineHeight: 21,
    textAlign: 'center',
    marginBottom: 12,
  },
  learnMore: {
    color: Colors.accent,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  dotActive: {
    backgroundColor: Colors.primary,
    width: 20,
    borderRadius: 4,
  },
  actions: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    gap: 8,
  },
});

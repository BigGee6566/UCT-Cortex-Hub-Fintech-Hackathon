import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Image, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { router } from 'expo-router';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Colors, Radii, Spacing, Typography } from '@/constants/theme';

const slides = [
  {
    title: 'See Where Every Rand Goes',
    body: 'Track spending clearly and avoid surprises.',
    stickers: [
      require('@/assets/images/bankruptcy.png'),
      require('@/assets/images/business-report.png'),
      require('@/assets/images/finance.png'),
    ],
  },
  {
    title: 'Make Your Money Last Longer',
    body: 'Smart budgets that match student life.',
    stickers: [
      require('@/assets/images/productivity.png'),
      require('@/assets/images/business.png'),
      require('@/assets/images/invest.png'),
    ],
  },
  {
    title: 'Earn Rewards for Smart Spending',
    body: 'Get perks for good financial habits.',
    stickers: [require('@/assets/images/wallet.png'), require('@/assets/images/shopping-cart.png')],
  },
];

export default function OnboardingCarousel() {
  const [idx, setIdx] = useState(0);
  const [visibleCount, setVisibleCount] = useState(1);
  const isLast = idx === slides.length - 1;
  const { width } = useWindowDimensions();
  const wiggle = useRef(new Animated.Value(0)).current;

  const slide = useMemo(() => slides[idx], [idx]);
  const maxStickers = slide.stickers.length;
  const stickerSize = Math.min(80, Math.max(48, width * 0.18));

  function next() {
    if (isLast) return router.replace('/(auth)/signup');
    setVisibleCount(1);
    setIdx((v) => v + 1);
  }

  useEffect(() => {
    setVisibleCount(1);
  }, [idx]);

  useEffect(() => {
    if (visibleCount >= maxStickers) return;
    const timer = setTimeout(() => setVisibleCount((v) => Math.min(v + 1, maxStickers)), 2000);
    return () => clearTimeout(timer);
  }, [visibleCount, maxStickers]);

  useEffect(() => {
    wiggle.setValue(0);
    const anim = Animated.sequence([
      Animated.timing(wiggle, { toValue: 1, duration: 120, useNativeDriver: true }),
      Animated.timing(wiggle, { toValue: -1, duration: 120, useNativeDriver: true }),
      Animated.timing(wiggle, { toValue: 1, duration: 120, useNativeDriver: true }),
      Animated.timing(wiggle, { toValue: -1, duration: 120, useNativeDriver: true }),
      Animated.timing(wiggle, { toValue: 0, duration: 160, useNativeDriver: true }),
    ]);
    anim.start();
    return () => anim.stop();
  }, [visibleCount, wiggle]);

  const wiggleStyle = {
    transform: [
      {
        rotate: wiggle.interpolate({
          inputRange: [-1, 1],
          outputRange: ['-8deg', '8deg'],
        }),
      },
    ],
  };

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => {
          setVisibleCount(1);
          router.replace('/(auth)/signup');
        }}
        accessibilityRole="button"
      >
        <Text style={styles.skip}>Skip</Text>
      </Pressable>

      <View style={styles.card}>
        <Text style={styles.title}>{slide.title}</Text>
        <View style={styles.stickersRow}>
          {slide.stickers.slice(0, visibleCount).map((sticker, i) => {
            const isNew = i === visibleCount - 1;
            return (
              <Animated.View key={`${idx}-${i}`} style={isNew ? wiggleStyle : undefined}>
                <Image
                  source={sticker}
                  style={{ width: stickerSize, height: stickerSize }}
                  resizeMode="contain"
                />
              </Animated.View>
            );
          })}
        </View>
        <Text style={styles.body}>{slide.body}</Text>
      </View>

      <View style={styles.dots}>
        {slides.map((_, i) => (
          <View key={i} style={[styles.dot, i === idx && styles.dotOn]} />
        ))}
      </View>

      <PrimaryButton label={isLast ? 'Get Started' : 'Next'} onPress={next} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background, padding: Spacing.lg, justifyContent: 'center', gap: Spacing.sm },
  skip: { textAlign: 'right', fontWeight: '800', color: Colors.light.primary },
  card: {
    backgroundColor: Colors.light.card,
    padding: Spacing.lg,
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: Colors.light.shadow,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    minHeight: 300,
  },
  title: { fontSize: Typography.title, fontWeight: '800', color: Colors.light.text },
  stickersRow: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  body: { marginTop: Spacing.sm, color: Colors.light.mutedText, lineHeight: 20, fontWeight: '600', fontSize: Typography.body },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.xs },
  dot: { width: 8, height: 8, borderRadius: 999, backgroundColor: Colors.light.border },
  dotOn: { backgroundColor: Colors.light.secondary, width: 20 },
});

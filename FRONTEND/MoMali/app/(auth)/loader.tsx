import { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';

export default function LoaderScreen() {
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 900,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    anim.start();

    const timer = setTimeout(() => {
      router.replace('/(auth)/splash');
    }, 10000);

    return () => {
      anim.stop();
      clearTimeout(timer);
    };
  }, [spin]);

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <Image source={require('@/assets/images/splash.png')} style={styles.bg} contentFit="cover" />
      <View style={styles.overlay}>
        <Animated.View style={[styles.spinner, { transform: [{ rotate }] }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bg: { ...StyleSheet.absoluteFillObject },
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  spinner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.6)',
    borderTopColor: '#FFFFFF',
  },
});

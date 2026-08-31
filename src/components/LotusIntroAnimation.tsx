import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, ImageSourcePropType } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, G, Path } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  withDelay,
  withTiming,
  runOnJS,
  Easing,
  SharedValue,
} from 'react-native-reanimated';

/**
 * LotusIntroAnimation
 * ---------------------------------------------------------------
 * Splash / intro animation: generic lotus-petal silhouettes fan out
 * from a single base point (matching the real logo's shape — a fan
 * opening upward, tallest petal in the middle, shorter petals angled
 * outward on each side), then crossfade into the real logo image.
 *
 * v2 — smoother motion:
 *  - Every petal drives off ONE linear, fixed-duration timing value
 *    (no springs) so total animation time is exact, not guessed.
 *  - Two different easing *shapes* are derived from that same linear
 *    value in the worklet: a silky ease-out for position/opacity, and
 *    a gentle "ease-out-back" for scale only, so the petal glides in
 *    and settles with a soft bloom instead of a snap or a spring wobble.
 *  - Petals overlap heavily (short stagger vs. long duration) so the
 *    fan reads as one continuous wave, not discrete pops.
 *  - The crossfade to the real logo now starts slightly *before* the
 *    last petal fully settles, so there's no dead pause in the middle.
 *
 * Requires: react-native-svg, react-native-reanimated (both already
 * in the project).
 */

const AnimatedG = Animated.createAnimatedComponent(G);

// ---------- Tunables ----------------------------------------------------
const PETAL_COUNT: number = 7; // odd number so there's a true center petal
const FAN_SPREAD_DEG = 150; // total angle from leftmost to rightmost petal
const SCATTER_DISTANCE = 60; // px petals start out shifted away from resting spot
const SCATTER_ROT_DEG = 34; // extra rotation petals start with, alternating in/out

const PETAL_DURATION_MS = 680; // fixed, exact duration of one petal's fly-in
const STAGGER_MS = 55; // small vs. duration → petals overlap into one wave
const SCALE_OVERSHOOT = 0.85; // 0 = no bloom, ~1.7 = very bouncy; kept gentle

const CROSSFADE_OVERLAP_MS = 180; // crossfade starts this much BEFORE petals fully settle
const CROSSFADE_MS = 520;

// viewBox is a fixed 260x260 square; petals pivot from this base point,
// roughly where all the real logo's petals converge.
const VB = 260;
const PIVOT_X = VB / 2;
const PIVOT_Y = VB * 0.68;

// Generic teardrop/petal silhouette, base at (0,0), tip pointing "up" (-Y).
const PETAL_LEN = 118;
const PETAL_W = 42;
const PETAL_PATH = `M0,0 C-${PETAL_W / 2},-${PETAL_LEN * 0.35} -${
  PETAL_W * 0.55
},-${PETAL_LEN * 0.78} 0,-${PETAL_LEN} C${PETAL_W * 0.55},-${
  PETAL_LEN * 0.78
} ${PETAL_W / 2},-${PETAL_LEN * 0.35} 0,0 Z`;
// --------------------------------------------------------------------------

// Pure-math easing shapes, applied by hand inside the worklet so that a
// single linear driver value can be shaped two different ways at once
// (smooth glide for position/opacity, gentle bloom for scale).
function easeOutExpo(x: number) {
  'worklet';
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  return 1 - Math.pow(2, -10 * x);
}

function easeOutBack(x: number, overshoot: number) {
  'worklet';
  const c1 = overshoot;
  const c3 = c1 + 1;
  const t = x - 1;
  return 1 + c3 * t * t * t + c1 * t * t;
}

type Petal = { finalAngle: number; startAngle: number; lengthScale: number };

function buildPetals(): Petal[] {
  return Array.from({ length: PETAL_COUNT }, (_, i) => {
    const t = PETAL_COUNT === 1 ? 0.5 : i / (PETAL_COUNT - 1);
    const finalAngle = -FAN_SPREAD_DEG / 2 + t * FAN_SPREAD_DEG;
    const distFromCenter = Math.abs(t - 0.5) * 2; // 0 = center, 1 = edge
    return {
      finalAngle,
      startAngle: finalAngle + (i % 2 === 0 ? -SCATTER_ROT_DEG : SCATTER_ROT_DEG),
      lengthScale: 1 - distFromCenter * 0.4, // edge petals shorter, like the real logo
    };
  });
}

function PetalShape({
  petal,
  raw,
  gradientId,
}: {
  petal: Petal;
  raw: SharedValue<number>;
  gradientId: string;
}) {
  const animatedProps = useAnimatedProps(() => {
    const pos = easeOutExpo(raw.value); // shapes angle / translate / opacity
    const bloom = easeOutBack(raw.value, SCALE_OVERSHOOT); // shapes scale only

    const angle = petal.startAngle + (petal.finalAngle - petal.startAngle) * pos;
    const dist = SCATTER_DISTANCE * (1 - pos);
    const rad = (petal.finalAngle * Math.PI) / 180;
    const originX = PIVOT_X + Math.sin(rad) * dist;
    const originY = PIVOT_Y + Math.cos(rad) * dist * 0.4 + dist * 0.3;
    const scale = petal.lengthScale * Math.max(bloom, 0);

    return {
      opacity: 0.05 + 0.95 * pos,
      transform: [
        { translateX: originX },
        { translateY: originY },
        { rotate: `${angle}deg` },
        { scale: scale }
      ],
    } as any;
  });

  return (
    <AnimatedG animatedProps={animatedProps}>
      <Path d={PETAL_PATH} fill={`url(#${gradientId})`} />
    </AnimatedG>
  );
}

type Props = {
  /** require('./assets/sen-hong-logo.png') or a remote URI */
  logoSource: ImageSourcePropType;
  size?: number;
  petalColorLight?: string;
  petalColorDark?: string;
  /** Called once the crossfade to the real logo has finished */
  onFinish?: () => void;
};

export default function LotusIntroAnimation({
  logoSource,
  size = 240,
  petalColorLight = '#F472B6',
  petalColorDark = '#DB2777',
  onFinish,
}: Props) {
  const [showLogo, setShowLogo] = useState(false);
  const petalsOpacity = useSharedValue(1);
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.9);

  const petals = useMemo(buildPetals, []);
  // Fixed-length array of linear driver values — count never changes, so
  // declaring them individually (not in a loop) is safe with Rules of Hooks.
  const r0 = useSharedValue(0);
  const r1 = useSharedValue(0);
  const r2 = useSharedValue(0);
  const r3 = useSharedValue(0);
  const r4 = useSharedValue(0);
  const r5 = useSharedValue(0);
  const r6 = useSharedValue(0);
  const rawValues = [r0, r1, r2, r3, r4, r5, r6];

  useEffect(() => {
    const smoothGlide = { duration: PETAL_DURATION_MS, easing: Easing.linear };
    rawValues.forEach((r, i) => {
      r.value = withDelay(i * STAGGER_MS, withTiming(1, smoothGlide));
    });

    // Exact, not guessed: last petal starts at (COUNT-1)*STAGGER and runs
    // for PETAL_DURATION_MS.
    const totalPetalTime = (PETAL_COUNT - 1) * STAGGER_MS + PETAL_DURATION_MS;
    const crossfadeStart = Math.max(totalPetalTime - CROSSFADE_OVERLAP_MS, 0);

    const timer = setTimeout(() => {
      setShowLogo(true);
      const smoothFade = { duration: CROSSFADE_MS, easing: Easing.out(Easing.cubic) };
      logoOpacity.value = withTiming(1, smoothFade);
      logoScale.value = withTiming(1, smoothFade);
      petalsOpacity.value = withTiming(0, smoothFade, (finished) => {
        if (finished && onFinish) runOnJS(onFinish)();
      });
    }, crossfadeStart);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const petalsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: petalsOpacity.value,
  }));
  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Animated.View style={[StyleSheet.absoluteFill, petalsAnimatedStyle]}>
        <Svg width={size} height={size} viewBox={`0 0 ${VB} ${VB}`}>
          <Defs>
            <LinearGradient id="petalGrad" x1="0" y1="1" x2="0" y2="0">
              <Stop offset="0" stopColor={petalColorDark} />
              <Stop offset="1" stopColor={petalColorLight} />
            </LinearGradient>
          </Defs>
          {petals.map((petal, i) => (
            <PetalShape key={i} petal={petal} raw={rawValues[i]} gradientId="petalGrad" />
          ))}
        </Svg>
      </Animated.View>

      {showLogo && (
        <Animated.Image
          source={logoSource}
          resizeMode="contain"
          style={[styles.logo, { width: size, height: size }, logoAnimatedStyle]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  logo: { position: 'absolute' },
});

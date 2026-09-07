import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  Animated,
  LayoutChangeEvent,
  Platform,
  ViewStyle,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Typography, Colors, createThemedStyles, ThemeColors } from '../theme';
import { useTheme } from '../context/ThemeContext';

export interface GlassSliderProps {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  onValueChange?: (val: number) => void;
  onSlidingComplete?: (val: number) => void;
  disabled?: boolean;
  style?: ViewStyle;
  showValueBubble?: boolean;
  activeColor?: string[];
  inactiveColor?: string;
  label?: string;
}

const THUMB_WIDTH = 56; // 56f.dp chuẩn theo tài liệu
const THUMB_HEIGHT = 32; // 32f.dp chuẩn theo tài liệu
const TRACK_HEIGHT = 6; // 6f.dp chuẩn theo tài liệu

export function GlassSlider({
  value: controlledValue,
  defaultValue = 50,
  min = 0,
  max = 100,
  step = 1,
  onValueChange,
  onSlidingComplete,
  disabled = false,
  style,
  showValueBubble = true,
  activeColor,
  inactiveColor,
  label,
}: GlassSliderProps) {
  const { colors } = useTheme();
  const effectiveActiveColor = activeColor || [colors.primary, colors.primaryDeep];
  const effectiveInactiveColor = inactiveColor || colors.primarySoft;

  const [trackWidth, setTrackWidth] = useState(0);
  const [internalValue, setInternalValue] = useState(
    controlledValue !== undefined ? controlledValue : defaultValue
  );

  const thumbPosition = useRef(new Animated.Value(0)).current;
  const thumbScale = useRef(new Animated.Value(1)).current;
  const isDragging = useRef(false);

  const currentVal = controlledValue !== undefined ? controlledValue : internalValue;

  const clampValue = useCallback(
    (val: number) => {
      let clamped = Math.max(min, Math.min(max, val));
      if (step > 0) {
        clamped = Math.round((clamped - min) / step) * step + min;
      }
      return clamped;
    },
    [min, max, step]
  );

  const valueToPosition = useCallback(
    (val: number, width: number) => {
      if (width <= THUMB_WIDTH) return 0;
      const progress = (val - min) / (max - min);
      return progress * (width - THUMB_WIDTH);
    },
    [min, max]
  );

  const positionToValue = useCallback(
    (pos: number, width: number) => {
      if (width <= THUMB_WIDTH) return min;
      const progress = Math.max(0, Math.min(1, pos / (width - THUMB_WIDTH)));
      return clampValue(min + progress * (max - min));
    },
    [min, max, clampValue]
  );

  // Synchronize thumb position when value or width changes
  useEffect(() => {
    if (!isDragging.current && trackWidth > 0) {
      const pos = valueToPosition(currentVal, trackWidth);
      thumbPosition.setValue(pos);
    }
  }, [currentVal, trackWidth, valueToPosition, thumbPosition]);

  const handleLayout = (e: LayoutChangeEvent) => {
    const width = e.nativeEvent.layout.width;
    if (width > 0 && width !== trackWidth) {
      setTrackWidth(width);
      const pos = valueToPosition(currentVal, width);
      thumbPosition.setValue(pos);
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled,
      onMoveShouldSetPanResponder: () => !disabled,
      onPanResponderGrant: (evt) => {
        if (disabled) return;
        isDragging.current = true;

        // Spring scale up thumb on press (Hiệu ứng nhún phóng to thấu kính)
        Animated.spring(thumbScale, {
          toValue: 1.08,
          friction: 5,
          tension: 300,
          useNativeDriver: false,
        }).start();

        // If tap on track, jump thumb directly
        if (trackWidth > 0) {
          const touchX = evt.nativeEvent.locationX - THUMB_WIDTH / 2;
          const clampedX = Math.max(0, Math.min(trackWidth - THUMB_WIDTH, touchX));
          thumbPosition.setValue(clampedX);
          const newVal = positionToValue(clampedX, trackWidth);
          setInternalValue(newVal);
          onValueChange?.(newVal);
        }
      },
      onPanResponderMove: (_, gestureState) => {
        if (disabled || trackWidth <= THUMB_WIDTH) return;
        const currentPos = valueToPosition(currentVal, trackWidth) + gestureState.dx;
        const clampedX = Math.max(0, Math.min(trackWidth - THUMB_WIDTH, currentPos));
        thumbPosition.setValue(clampedX);

        const newVal = positionToValue(clampedX, trackWidth);
        if (newVal !== currentVal) {
          setInternalValue(newVal);
          onValueChange?.(newVal);
        }
      },
      onPanResponderRelease: () => {
        isDragging.current = false;

        // Spring scale back to normal
        Animated.spring(thumbScale, {
          toValue: 1.0,
          friction: 4,
          tension: 280,
          useNativeDriver: false,
        }).start();

        onSlidingComplete?.(currentVal);
      },
    })
  ).current;

  // Active track width animated interpolation
  const activeTrackWidth = thumbPosition.interpolate({
    inputRange: [0, Math.max(1, trackWidth - THUMB_WIDTH)],
    outputRange: [THUMB_WIDTH / 2, Math.max(THUMB_WIDTH / 2, trackWidth - THUMB_WIDTH / 2)],
    extrapolate: 'clamp',
  });

  return (
    <View style={[styles.container, style]}>
      {/* Optional Header Label & Current Value */}
      {(label || showValueBubble) && (
        <View style={styles.labelRow}>
          {label && <Text style={[styles.labelText, { color: colors.primaryDeep }]}>{label}</Text>}
          {showValueBubble && (
            <View style={[styles.valueBadge, { backgroundColor: colors.primarySoft, borderColor: colors.primaryGlow }]}>
              <Text style={[styles.valueText, { color: colors.primaryDeep }]}>{currentVal}</Text>
            </View>
          )}
        </View>
      )}

      {/* 🌟 SLIDER TRACK & THUMB CONTAINER */}
      <View
        style={styles.sliderContainer}
        onLayout={handleLayout}
        {...panResponder.panHandlers}
      >
        {/* 1. Inactive Track (Thanh ray nền bo tròn 6dp) */}
        <View style={[styles.inactiveTrack, { backgroundColor: effectiveInactiveColor }]} />

        {/* 2. Active Filled Track (Thanh ray hoạt động có dải màu gradient) */}
        <Animated.View
          style={[styles.activeTrackWrapper, { width: activeTrackWidth }]}
        >
          <LinearGradient
            colors={effectiveActiveColor as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.activeTrackGradient}
          />
        </Animated.View>

        {/* 3. 🌟 GLASS THUMB (Con trượt thấu kính 56x32dp - Combined Backdrop) */}
        <Animated.View
          style={[
            styles.thumbWrapper,
            {
              transform: [
                { translateX: thumbPosition },
                { scale: thumbScale },
              ],
            },
          ]}
        >
          {/* Backdrop Base */}
          <View style={styles.thumbBackdropBase} />

          {/* Frosted Blur Layer (Khúc xạ thanh ray và hình nền phía sau) */}
          <BlurView
            intensity={40}
            tint="light"
            style={StyleSheet.absoluteFill}
          />

          {/* Chromatic Aberration & Lens Refraction Sheen (Hiệu ứng quang sai thấu kính) */}
          <LinearGradient
            colors={[
              'rgba(255, 255, 255, 0.95)',
              colors.badgeBlueSoft || 'rgba(255, 255, 255, 0.25)',
              'rgba(255, 255, 255, 0.70)',
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />

          {/* Center Specular Lens Reflection Line (Vạch sáng phản quang trục thấu kính) */}
          <View style={[styles.thumbGripIndicator, { backgroundColor: colors.primaryDeep }]} />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = createThemedStyles((colors: ThemeColors) => ({
  container: {
    width: '100%',
    paddingVertical: 10,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  labelText: {
    fontSize: 14,
    fontFamily: Typography.bodySm.fontFamily,
    fontWeight: '700',
    color: colors.primaryDeep,
  },
  valueBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primaryGlow,
  },
  valueText: {
    fontSize: 13,
    fontFamily: Typography.captionSm.fontFamily,
    fontWeight: '800',
    color: colors.primaryDeep,
  },
  sliderContainer: {
    height: 40,
    justifyContent: 'center',
    position: 'relative',
  },
  inactiveTrack: {
    height: TRACK_HEIGHT, // 6f.dp chuẩn
    borderRadius: TRACK_HEIGHT / 2, // CircleShape
    width: '100%',
  },
  activeTrackWrapper: {
    position: 'absolute',
    left: 0,
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    overflow: 'hidden',
  },
  activeTrackGradient: {
    flex: 1,
    borderRadius: TRACK_HEIGHT / 2,
  },
  thumbWrapper: {
    position: 'absolute',
    left: 0,
    width: THUMB_WIDTH, // 56f.dp chuẩn
    height: THUMB_HEIGHT, // 32f.dp chuẩn
    borderRadius: THUMB_HEIGHT / 2, // CircleShape Capsule
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 8,
    elevation: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbBackdropBase: {
    ...StyleSheet.absoluteFill as any,
    backgroundColor: 'rgba(255, 255, 255, 0.50)',
  },
  thumbGripIndicator: {
    width: 14,
    height: 3.5,
    borderRadius: 2,
    backgroundColor: colors.primaryDeep,
    opacity: 0.75,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 1,
  },
}));

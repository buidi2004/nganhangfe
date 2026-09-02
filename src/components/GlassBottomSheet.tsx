import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
  Platform,
  PanResponder,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface GlassBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  sheetHeight?: number;
}

// Nested Glass Button Component (Kính lồng kính - Glass on Glass theo tài liệu)
export function NestedGlassButton({
  label,
  onPress,
  variant = 'primary',
  icon,
}: {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary';
  icon?: React.ReactNode;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.94,
      friction: 5,
      tension: 300,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1.0,
      friction: 4,
      tension: 300,
      useNativeDriver: true,
    }).start();
  };

  const isPrimary = variant === 'primary';

  return (
    <TouchableWithoutFeedback
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        style={[
          styles.glassButtonWrapper,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        {/* 1. Backdrop Layer for Button */}
        <BlurView
          intensity={Platform.OS === 'ios' ? 60 : 80}
          tint="light"
          style={StyleSheet.absoluteFill}
        />

        {/* 2. onDrawSurface = { drawRect(Color.White.copy(alpha = 0.5f)) } */}
        <LinearGradient
          colors={
            isPrimary
              ? ['#D2519D', '#700F43']
              : ['rgba(255, 255, 255, 0.85)', 'rgba(253, 242, 248, 0.65)']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.glassButtonSurface}
        >
          {/* Specular Top Lens Highlight */}
          <View style={styles.buttonLensHighlight} />

          <View style={styles.buttonContent}>
            {icon && <View style={styles.buttonIcon}>{icon}</View>}
            <Text
              style={[
                styles.buttonLabel,
                { color: isPrimary ? '#FFFFFF' : '#700F43' },
              ]}
            >
              {label}
            </Text>
          </View>
        </LinearGradient>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

export function GlassBottomSheet({
  visible,
  onClose,
  title,
  subtitle,
  children,
  actionLabel,
  onAction,
  sheetHeight = 360,
}: GlassBottomSheetProps) {
  const slideAnim = useRef(new Animated.Value(sheetHeight)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 220,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: sheetHeight,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, sheetHeight]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 5,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          slideAnim.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 80 || gestureState.vy > 0.5) {
          onClose();
        } else {
          Animated.spring(slideAnim, {
            toValue: 0,
            friction: 8,
            tension: 250,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlayContainer}>
        {/* Dim & Blur Backdrop Overlay */}
        <TouchableWithoutFeedback onPress={onClose}>
          <Animated.View
            style={[styles.backdropOverlay, { opacity: fadeAnim }]}
          >
            <BlurView
              intensity={80}
              tint="light"
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.backdropDimmer} />
          </Animated.View>
        </TouchableWithoutFeedback>

        {/* 🌟 GLASS BOTTOM SHEET CONTAINER (Bo cong đỉnh 44dp chuẩn RoundedCornerShape) */}
        <Animated.View
          style={[
            styles.sheetContainer,
            { height: sheetHeight, transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* 1. Backdrop Base Background (Ngăn chặn pixel đen trong suốt) */}
          <View style={styles.sheetBackdropBase} />

          {/* 2. Frosted Blur Layer (vibrancy + blur 4dp) */}
          <BlurView
            intensity={100}
            tint="light"
            style={StyleSheet.absoluteFill}
          />

          {/* 3. onDrawSurface = { drawRect(Color.White.copy(alpha = 0.5f)) } */}
          <LinearGradient
            colors={[
              'rgba(255, 255, 255, 0.88)',
              'rgba(253, 242, 248, 0.78)',
              'rgba(255, 255, 255, 0.92)',
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />

          {/* 4. Lens(24dp, 48dp) Specular Highlight Curve (Viền khúc xạ ánh sáng đỉnh kính 44dp) */}
          <View style={styles.lensHighlightArc} />

          {/* Content Area */}
          <View style={styles.contentWrapper}>
            {/* Drag Handle Bar */}
            <View {...panResponder.panHandlers} style={styles.handleBarTouchArea}>
              <View style={styles.handleBar} />
            </View>

            {/* Header */}
            {(title || subtitle) && (
              <View style={styles.headerContainer}>
                {title && <Text style={styles.titleText}>{title}</Text>}
                {subtitle && <Text style={styles.subtitleText}>{subtitle}</Text>}
                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={onClose}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close-circle" size={24} color="#700F43" />
                </TouchableOpacity>
              </View>
            )}

            {/* Body */}
            <View style={styles.bodyContainer}>{children}</View>

            {/* 🌟 KÍNH CHẠM KÍNH: Glass Action Button (56dp Height, CircleShape) */}
            {actionLabel && (
              <View style={styles.footerContainer}>
                <NestedGlassButton
                  label={actionLabel}
                  onPress={onAction || onClose}
                  variant="primary"
                />
              </View>
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlayContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdropOverlay: {
    ...StyleSheet.absoluteFill as any,
  },
  backdropDimmer: {
    ...StyleSheet.absoluteFill as any,
    backgroundColor: 'rgba(31, 4, 19, 0.40)',
  },
  sheetContainer: {
    width: '100%',
    borderTopLeftRadius: 44, // 44f.dp chuẩn theo tài liệu RoundedCornerShape
    borderTopRightRadius: 44,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderBottomWidth: 0,
    borderColor: 'rgba(255, 255, 255, 0.90)',
    shadowColor: '#700F43',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 20,
  },
  sheetBackdropBase: {
    ...StyleSheet.absoluteFill as any,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
  },
  lensHighlightArc: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  contentWrapper: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
  },
  handleBarTouchArea: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 12,
  },
  handleBar: {
    width: 44,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(112, 15, 67, 0.25)',
  },
  headerContainer: {
    marginBottom: 12,
    position: 'relative',
    paddingRight: 32,
  },
  titleText: {
    fontSize: 18,
    fontFamily: Typography.heading.fontFamily,
    fontWeight: '800',
    color: '#700F43',
    letterSpacing: 0.3,
  },
  subtitleText: {
    fontSize: 13,
    fontFamily: Typography.bodySm.fontFamily,
    color: 'rgba(112, 15, 67, 0.70)',
    marginTop: 3,
  },
  closeBtn: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  bodyContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  footerContainer: {
    marginTop: 12,
  },

  // Nested Glass Button Styles
  glassButtonWrapper: {
    height: 56, // 56f.dp chuẩn
    borderRadius: 28, // CircleShape Capsule
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.90)',
    shadowColor: '#D2519D',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  glassButtonSurface: {
    flex: 1,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonLensHighlight: {
    position: 'absolute',
    top: 0,
    left: 12,
    right: 12,
    height: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.90)',
    borderRadius: 1,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonLabel: {
    fontSize: 15,
    fontFamily: Typography.button.fontFamily,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
});

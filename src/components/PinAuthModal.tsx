import { Colors } from '../theme';
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from './typography/AppText';
import { useTheme } from '../context/ThemeContext';

interface PinAuthModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (pin: string) => Promise<void> | void;
  title?: string;
  subtitle?: string;
  isProcessing?: boolean;
  errorMessage?: string | null;
  onBiometricPress?: () => void;
  hasBiometrics?: boolean;
}

const { width } = Dimensions.get('window');

export function PinAuthModal({
  visible,
  onClose,
  onSuccess,
  title = 'Nhập mã PIN',
  subtitle = 'Nhập mã PIN gồm 6 chữ số để xác thực giao dịch',
  isProcessing = false,
  errorMessage = null,
  onBiometricPress,
  hasBiometrics = false,
}: PinAuthModalProps) {
  const { colors, isDark } = useTheme();
  const [pinDigits, setPinDigits] = useState<string[]>([]);

  useEffect(() => {
    if (!visible) {
      setPinDigits([]);
    }
  }, [visible]);

  const handleKeyPress = useCallback(
    (val: string) => {
      if (pinDigits.length < 6 && !isProcessing) {
        const nextPins = [...pinDigits, val];
        setPinDigits(nextPins);

        if (nextPins.length === 6) {
          onSuccess(nextPins.join(''));
        }
      }
    },
    [pinDigits, isProcessing, onSuccess]
  );

  const handleDelete = useCallback(() => {
    if (pinDigits.length > 0 && !isProcessing) {
      setPinDigits((prev) => prev.slice(0, -1));
    }
  }, [pinDigits.length, isProcessing]);

  if (!visible) return null;

  const keypadRows = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    [hasBiometrics ? 'bio' : '', '0', 'del'],
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <BlurView
          intensity={50}
          tint={isDark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={isProcessing ? undefined : onClose}
        />

        <View
          style={[
            styles.sheetContainer,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          {/* Drag handle */}
          <View style={[styles.dragHandle, { backgroundColor: isDark ? '#475569' : '#CBD5E1' }]} />

          {/* Close button */}
          <TouchableOpacity
            style={[styles.closeBtn, { backgroundColor: isDark ? '#334155' : '#F1F5F9' }]}
            onPress={onClose}
            disabled={isProcessing}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* Header */}
          <AppText style={[styles.title, { color: colors.textPrimary }]}>{title}</AppText>
          {subtitle ? (
            <AppText style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</AppText>
          ) : null}

          {/* PIN circles */}
          <View style={styles.pinRow}>
            {[0, 1, 2, 3, 4, 5].map((index) => {
              const isFilled = index < pinDigits.length;
              return (
                <View
                  key={index}
                  style={[
                    styles.pinCircle,
                    {
                      borderColor: isFilled ? colors.primary : colors.border,
                      backgroundColor: isFilled ? (isDark ? 'rgba(244, 114, 182, 0.2)' : '#FDF2F8') : 'transparent',
                    },
                  ]}
                >
                  {isFilled && (
                    <View style={[styles.pinDot, { backgroundColor: colors.primary }]} />
                  )}
                </View>
              );
            })}
          </View>

          {/* Error or Processing state */}
          {isProcessing ? (
            <View style={styles.statusRow}>
              <ActivityIndicator size="small" color={colors.primary} />
              <AppText style={[styles.processingText, { color: colors.primary }]}>
                Đang xử lý xác thực...
              </AppText>
            </View>
          ) : errorMessage ? (
            <AppText style={styles.errorText}>{errorMessage}</AppText>
          ) : (
            <View style={styles.statusPlaceholder} />
          )}

          {/* Numeric Keypad */}
          <View style={styles.keypad}>
            {keypadRows.map((row, rIdx) => (
              <View key={rIdx} style={styles.keypadRow}>
                {row.map((key, kIdx) => {
                  if (key === '') {
                    return <View key={kIdx} style={styles.keyEmpty} />;
                  }

                  if (key === 'bio') {
                    return (
                      <TouchableOpacity
                        key={kIdx}
                        style={[styles.keyBtn, { backgroundColor: isDark ? '#334155' : '#F8FAFC' }]}
                        onPress={onBiometricPress}
                        disabled={isProcessing}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="finger-print" size={26} color={colors.primary} />
                      </TouchableOpacity>
                    );
                  }

                  if (key === 'del') {
                    return (
                      <TouchableOpacity
                        key={kIdx}
                        style={[styles.keyBtn, { backgroundColor: isDark ? '#334155' : '#F8FAFC' }]}
                        onPress={handleDelete}
                        disabled={isProcessing || pinDigits.length === 0}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name="backspace-outline"
                          size={24}
                          color={pinDigits.length > 0 ? colors.textPrimary : colors.textMuted}
                        />
                      </TouchableOpacity>
                    );
                  }

                  return (
                    <TouchableOpacity
                      key={kIdx}
                      style={[styles.keyBtn, { backgroundColor: isDark ? '#334155' : '#F8FAFC' }]}
                      onPress={() => handleKeyPress(key)}
                      disabled={isProcessing}
                      activeOpacity={0.7}
                    >
                      <AppText style={[styles.keyText, { color: colors.textPrimary }]}>{key}</AppText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  sheetContainer: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    paddingTop: 12,
    paddingBottom: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 20,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    marginBottom: 16,
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 18,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
    lineHeight: 18,
  },
  pinRow: {
    flexDirection: 'row',
    gap: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 12,
  },
  pinCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 24,
    marginVertical: 6,
  },
  processingText: {
    fontSize: 13,
    fontWeight: '600',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12.5,
    fontWeight: '600',
    height: 24,
    marginVertical: 6,
    textAlign: 'center',
  },
  statusPlaceholder: {
    height: 24,
    marginVertical: 6,
  },
  keypad: {
    width: '100%',
    maxWidth: 340,
    marginTop: 8,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  keyBtn: {
    width: (width - 40 - 32) / 3 > 90 ? 90 : (width - 40 - 32) / 3,
    height: 54,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyEmpty: {
    width: (width - 40 - 32) / 3 > 90 ? 90 : (width - 40 - 32) / 3,
    height: 54,
  },
  keyText: {
    fontSize: 22,
    fontWeight: '700',
  },
});

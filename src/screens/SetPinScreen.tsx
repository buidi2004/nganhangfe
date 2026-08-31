import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius, Spacing } from '../theme';
import { Typography } from '../theme';
import { PrimaryButton } from '../components/PrimaryButton';
import { AppText } from '../components/typography/AppText';
import { GlassHeader } from '../components/GlassHeader';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

interface SetPinScreenProps {
  navigation: any;
}

import { WalletApi } from '../services/api';

export default function SetPinScreen({ navigation }: SetPinScreenProps) {
  const [pin, setPin] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePress = async (num: string) => {
    if (pin.length < 6 && !isLoading) {
      const newPin = pin + num;
      setPin(newPin);
      
      if (newPin.length === 6) {
        try {
          setIsLoading(true);
          await WalletApi.setPin(newPin);
          setIsLoading(false);
          navigation.navigate('Home');
        } catch (error: any) {
          setIsLoading(false);
          setPin('');
          Alert.alert('Lỗi', error.message || 'Không thể thiết lập mã PIN');
        }
      }
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
  };

  return (
    <View style={styles.container}>
      <GlassHeader
        title="Thiết lập PIN"
        onBack={() => navigation.goBack()}
      />
      <View style={styles.content}>
        <View style={styles.topSection}>
          <View style={styles.iconWrapper}>
            <Ionicons name="lock-closed-outline" size={36} color="#700F43" />
          </View>
          <AppText style={styles.subtitle}>Nhập PIN 6 chữ số mới để bảo vệ tài khoản</AppText>
        </View>

        <View style={styles.pinCirclesRow}>
          {[...Array(6)].map((_, index) => {
            const isFilled = index < pin.length;
            return (
              <View
                key={index}
                style={[
                  styles.pinCircle,
                  isFilled && styles.pinCircleFilled,
                  index === 0 && !isFilled && styles.pinCircleFirstEmpty,
                ]}
              >
                {isFilled && <View style={styles.pinInnerDot} />}
              </View>
            );
          })}
        </View>

        <View style={styles.keypadWrapper}>
          <BlurView intensity={30} tint="light" style={StyleSheet.absoluteFill} />
          <View style={styles.keypad}>
            {[
              ['1', '2', '3'],
              ['4', '5', '6'],
              ['7', '8', '9'],
              ['', '0', 'del'],
            ].map((row, rIdx) => (
              <View key={rIdx} style={styles.keypadRow}>
                {row.map((key, kIdx) => (
                  <TouchableOpacity
                    key={kIdx}
                    style={[styles.key, key === '' && styles.emptyKey]}
                    onPress={() => {
                      if (key === 'del') handleDelete();
                      else if (key) handlePress(key);
                    }}
                    activeOpacity={0.7}
                    disabled={!key}
                  >
                    {key === 'del' ? (
                      <Ionicons name="backspace-outline" size={28} color="#700F43" />
                    ) : key !== '' ? (
                      <AppText style={styles.keyText}>{key}</AppText>
                    ) : null}
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: 40,
  },
  topSection: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 40,
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FDF2F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FBCFE8',
  },
  subtitle: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
  },
  pinCirclesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    marginVertical: 40,
  },
  pinCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.8,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  pinCircleFirstEmpty: {
    borderColor: '#700F43',
  },
  pinCircleFilled: {
    borderColor: '#D2519D',
    backgroundColor: '#FDF2F8',
  },
  pinInnerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#D2519D',
  },
  keypadWrapper: {
    marginHorizontal: 16,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  keypad: {
    padding: 24,
    gap: 20,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  key: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyKey: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
  },
  keyText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#0F172A',
  },
});

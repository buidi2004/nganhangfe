import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '../components/typography/AppText';
import { Colors } from '../theme';
import { WalletApi } from '../services/api';

interface LimitItem {
  type: string;
  maxAmount: number;
  currency: string;
}

export default function ConfigScreen({ navigation }: any) {
  const [limits, setLimits] = useState<LimitItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLimits = async () => {
      try {
        const res = await WalletApi.getLimitsConfig();
        const data = res.data || [];
        // If it returns an object instead of array, map it. Assuming it's an array for now based on typical configs
        setLimits(Array.isArray(data) ? data : [data]);
      } catch (error) {
        console.error('Failed to load limits', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLimits();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <AppText style={styles.headerTitle}>Hạn mức giao dịch</AppText>
        <View style={{ width: 24 }} /> {/* Spacer */}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#D2519D" style={{ marginTop: 40 }} />
        ) : limits.length > 0 ? (
          limits.map((limit, index) => (
            <View key={index} style={styles.limitCard}>
              <View style={styles.limitIconWrapper}>
                <MaterialCommunityIcons name="shield-check" size={24} color="#10B981" />
              </View>
              <View style={styles.limitInfo}>
                <AppText style={styles.limitType}>Hạn mức {limit.type || 'Giao dịch'}</AppText>
                <AppText style={styles.limitAmount}>
                  {limit.maxAmount ? limit.maxAmount.toLocaleString('vi-VN') : 'Không giới hạn'} {limit.currency || 'VND'}
                </AppText>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="shield-alert-outline" size={64} color="#CBD5E1" style={{ marginBottom: 16 }} />
            <AppText style={styles.emptyTitle}>Chưa có thông tin hạn mức</AppText>
            <AppText style={styles.emptySubtitle}>
              Hệ thống chưa cấu hình hạn mức cho tài khoản của bạn.
            </AppText>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  content: {
    padding: 20,
  },
  limitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  limitIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  limitInfo: {
    flex: 1,
  },
  limitType: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  limitAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
    width: '100%',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  }
});

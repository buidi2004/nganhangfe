import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { AppText } from '../components/typography/AppText';
import { Colors } from '../theme';
import { useApp } from '../context/AppContext';

export default function SettingsScreen({ navigation }: any) {
  const { customBackgroundUri, setCustomBackgroundUri } = useApp();

  const handlePickImage = async () => {
    // Request permission first
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Lỗi', 'Cần cấp quyền truy cập thư viện ảnh để đổi ảnh nền.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setCustomBackgroundUri(result.assets[0].uri);
      Alert.alert('Thành công', 'Đã thay đổi ảnh nền trang chủ!');
    }
  };

  const handleResetImage = () => {
    setCustomBackgroundUri(null);
    Alert.alert('Thành công', 'Đã khôi phục ảnh nền mặc định!');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" translucent />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <AppText style={styles.headerTitle}>Cài đặt</AppText>
        <View style={{ width: 24 }} /> {/* Spacer */}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Personalization Section */}
        <AppText style={styles.sectionTitle}>Cá nhân hóa</AppText>
        <View style={styles.card}>
          <TouchableOpacity style={styles.rowItem} onPress={handlePickImage}>
            <View style={styles.rowIcon}>
              <Ionicons name="image-outline" size={20} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <AppText style={styles.rowTitle}>Đổi ảnh nền trang chủ</AppText>
              <AppText style={styles.rowSubtitle}>Tải ảnh lên từ điện thoại</AppText>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
          </TouchableOpacity>

          {customBackgroundUri && (
            <TouchableOpacity style={[styles.rowItem, styles.rowItemBorder]} onPress={handleResetImage}>
              <View style={[styles.rowIcon, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="refresh" size={20} color="#EF4444" />
              </View>
              <View style={{ flex: 1 }}>
                <AppText style={[styles.rowTitle, { color: '#EF4444' }]}>Khôi phục mặc định</AppText>
                <AppText style={styles.rowSubtitle}>Quay về ảnh nền màu hồng</AppText>
              </View>
            </TouchableOpacity>
          )}
        </View>

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
    backgroundColor: '#F8FAFC',
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 20,
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  rowItemBorder: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FDF2F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 2,
  },
  rowSubtitle: {
    fontSize: 13,
    color: '#64748B',
  },
});

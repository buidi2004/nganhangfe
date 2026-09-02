import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  FlatList,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AppText } from '../components/typography/AppText';
import { Colors } from '../theme';
import { WalletApi } from '../services/api';
import { ActivityIndicator } from 'react-native';
import { useHideOnScroll } from '../hooks/useHideOnScroll';
import { useApp } from '../context/AppContext';

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  time: string;
  isUnread: boolean;
  category: 'balance' | 'news' | 'mine';
}

interface DateGroup {
  date: string;
  items: NotificationItem[];
}

const BALANCE_TYPES = new Set([
  'BALANCE', 'DEBIT', 'CREDIT', 'DEPOSIT', 'WITHDRAWAL', 'TRANSFER',
  'TRANSFER_IN', 'TRANSFER_OUT', 'TOPUP', 'BILL_PAYMENT',
]);

const NEWS_TYPES = new Set(['NEWS', 'PROMO', 'PROMOTION', 'BROADCAST', 'ANNOUNCEMENT']);

function categorizeNotification(type: string, body: string): 'balance' | 'news' | 'mine' {
  const upperType = (type || '').toUpperCase();
  if (
    BALANCE_TYPES.has(upperType) ||
    body.includes('PS:') ||
    body.includes('Số dư') ||
    body.includes('SD:') ||
    body.includes('Tài khoản:')
  ) {
    return 'balance';
  }
  if (NEWS_TYPES.has(upperType)) {
    return 'news';
  }
  return 'mine';
}

const TABS = [
  { key: 'mine', title: 'Của tôi' },
  { key: 'balance', title: 'Biến động số dư' },
  { key: 'news', title: 'Bảng tin' },
];

export default function NotificationsScreen({ navigation }: { navigation: any }) {
  const { notifications: localNotifs } = useApp();
  const [activeTab, setActiveTab] = useState<'mine' | 'balance' | 'news'>('balance');
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<DateGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { onScroll } = useHideOnScroll();

  React.useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const res = await WalletApi.getNotifications();
        const rawItems = res.data?.content || res.data || [];
        console.log("NOTIFICATIONS RAW:", JSON.stringify(rawItems, null, 2));

        const grouped: Record<string, NotificationItem[]> = {};

        // Merge API notifications
        rawItems.forEach((it: any) => {
          const dateStr = new Date(it.createdAt).toLocaleDateString('vi-VN');
          if (!grouped[dateStr]) grouped[dateStr] = [];

          let displayTitle = it.title || '';
          if (displayTitle.includes('TRANSFER')) displayTitle = displayTitle.replace('TRANSFER', 'Chuyển tiền');
          else if (displayTitle.includes('DEPOSIT')) displayTitle = displayTitle.replace('DEPOSIT', 'Nạp tiền');
          else if (displayTitle.includes('WITHDRAWAL')) displayTitle = displayTitle.replace('WITHDRAWAL', 'Rút tiền');

          const body = it.content || it.message || it.body || '';
          grouped[dateStr].push({
            id: String(it.id),
            title: displayTitle,
            body,
            time: new Date(it.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
            isUnread: !(it.isRead ?? it.read),
            category: categorizeNotification(it.type || '', body),
          });
        });

        setNotifications(Object.keys(grouped).map((date) => ({ date, items: grouped[date] })));
      } catch (e) {
        console.error('Failed to get notifications', e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNotifs();
  }, []);

  // Combine fetched notifications with live local notifications from WebSocket
  const combinedNotifications = useMemo(() => {
    const grouped = [...notifications]; // Start with fetched groups
    const todayStr = new Date().toLocaleDateString('vi-VN');

    localNotifs.forEach((localIt) => {
      let group = grouped.find(g => g.date === todayStr);
      if (!group) {
        group = { date: todayStr, items: [] };
        grouped.unshift(group);
      }
      // Avoid duplicates if ID matches
      if (!group.items.some(it => it.id === localIt.id)) {
        group.items.unshift({
          id: localIt.id,
          title: localIt.title,
          body: localIt.body,
          time: localIt.time,
          isUnread: localIt.isUnread,
          category: categorizeNotification(localIt.type || '', localIt.body),
        });
      }
    });

    return grouped;
  }, [notifications, localNotifs]);

  const tabFilteredGroups = useMemo(() => {
    if (activeTab === 'mine') {
      return combinedNotifications;
    }
    return combinedNotifications
      .map((group) => ({
        ...group,
        items: group.items.filter((it) => it.category === activeTab),
      }))
      .filter((g) => g.items.length > 0);
  }, [combinedNotifications, activeTab]);

  // Search filtering
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return tabFilteredGroups;
    const q = searchQuery.toLowerCase();
    return tabFilteredGroups.map((group) => {
      const matchItems = group.items.filter(
        (it) => it.body.toLowerCase().includes(q) || it.title.toLowerCase().includes(q)
      );
      const isDateMatch = group.date.toLowerCase().includes(q);
      return {
        ...group,
        items: isDateMatch ? group.items : matchItems,
      };
    }).filter((g) => g.items.length > 0);
  }, [searchQuery, tabFilteredGroups]);

  const handleRead = useCallback(async (id: string) => {
    try {
      await WalletApi.markNotificationAsRead(id);
      setNotifications(prev => prev.map(group => ({
        ...group,
        items: group.items.map(it => it.id === id ? { ...it, isUnread: false } : it)
      })));
    } catch (e) {}
  }, []);


  const renderNotificationBody = useCallback((body: string) => {
    if (!body.includes('Tài khoản:') && !body.includes('PS:')) {
      return <AppText style={styles.itemBodyText}>{body}</AppText>;
    }
    const lines = body.split('\n');
    return (
      <View style={{ marginTop: 4, marginBottom: 4 }}>
        {lines.map((line, idx) => {
          if (!line.trim()) return null;
          let color = '#475569';
          let fontWeight = '500';
          if (line.startsWith('PS: +')) {
            color = '#10B981'; // Green
            fontWeight = '700';
          } else if (line.startsWith('PS: -')) {
            color = '#EF4444'; // Red
            fontWeight = '700';
          } else if (line.startsWith('Số dư cuối:') || line.startsWith('SD:')) {
            fontWeight = '700';
          }
          return (
            <AppText key={idx} style={{ fontSize: 13, color, lineHeight: 18, fontWeight: fontWeight as any }}>
              {line}
            </AppText>
          );
        })}
      </View>
    );
  }, []);

  const renderDateGroup = useCallback(({ item: group }: { item: DateGroup }) => (
    <View style={styles.dateGroupCard}>
      <View style={styles.dateHeaderStrip}>
        <AppText style={styles.dateHeaderText}>{group.date}</AppText>
      </View>
      <View style={styles.groupItemsContainer}>
        {group.items.map((item, itIdx) => (
          <View key={item.id}>
            <TouchableOpacity style={styles.notificationItem} activeOpacity={0.7} onPress={() => handleRead(item.id)}>
              <View style={styles.itemTitleRow}>
                <AppText style={styles.itemTitleText}>{item.title}</AppText>
                {item.isUnread && <View style={styles.unreadCyanDot} />}
              </View>
              {renderNotificationBody(item.body)}
              <AppText style={styles.itemTimeText}>{item.time}</AppText>
            </TouchableOpacity>
            {itIdx < group.items.length - 1 && <View style={styles.itemInnerDivider} />}
          </View>
        ))}
      </View>
    </View>
  ), [handleRead, renderNotificationBody]);

  const listEmpty = (
    <View style={styles.emptyWrap}>
      <Ionicons name="notifications-off-outline" size={64} color="#93C5FD" style={{ marginBottom: 16, opacity: 0.8 }} />
      <AppText style={styles.emptyText}>Không tìm thấy thông báo nào</AppText>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* 1. TOP HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#700F43" />
        </TouchableOpacity>

        <AppText style={styles.headerTitle}>Thông báo</AppText>

        <TouchableOpacity style={styles.settingsBtn} activeOpacity={0.7}>
          <Ionicons name="settings-outline" size={22} color="#700F43" />
        </TouchableOpacity>
      </View>

      {/* 2. 3 TABS HEADER (CỦA TÔI | BIẾN ĐỘNG SỐ DƯ | BẢNG TIN) */}
      <View style={styles.tabsContainer}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tabItem}
              onPress={() => setActiveTab(tab.key as any)}
              activeOpacity={0.8}
            >
              <AppText style={[styles.tabText, isActive && styles.tabTextActive]}>
                {tab.title}
              </AppText>
              {isActive && <View style={styles.tabIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={styles.tabsBottomBorder} />

      {/* 3. SEARCH INPUT BAR */}
      <View style={styles.searchBarWrapper}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm theo nội dung hoặc ngày"
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <Ionicons name="search-outline" size={22} color="#94A3B8" />
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#D2519D" style={{ marginTop: 40 }} />
      ) : (
        <LinearGradient colors={['#FFF0F5', '#FCE7F3', '#FDF2F8']} style={{ flex: 1 }}>
          <FlatList
            data={filteredGroups}
            keyExtractor={(item) => item.date}
            renderItem={renderDateGroup}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            onScroll={onScroll}
            scrollEventThrottle={16}
            ListEmptyComponent={listEmpty}
            initialNumToRender={6}
            maxToRenderPerBatch={8}
            windowSize={7}
            removeClippedSubviews
          />
        </LinearGradient>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#700F43',
    letterSpacing: -0.3,
  },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    position: 'relative',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  tabTextActive: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#700F43',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    width: '70%',
    height: 3,
    backgroundColor: '#700F43',
    borderRadius: 2,
  },
  tabsBottomBorder: {
    height: 1,
    backgroundColor: '#F1F5F9',
    width: '100%',
  },
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  searchInput: {
    flex: 1,
    fontSize: 14.5,
    fontWeight: '600',
    color: '#0F172A',
    paddingVertical: 2,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
    flexGrow: 1,
  },
  dateGroupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#700F43',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 16,
    overflow: 'hidden',
  },
  dateHeaderStrip: {
    backgroundColor: '#EEF2F6',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  dateHeaderText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  groupItemsContainer: {
    backgroundColor: '#FFFFFF',
  },
  notificationItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  itemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  itemTitleText: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  unreadCyanDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#38BDF8',
  },
  itemBodyText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    fontWeight: '500',
    marginVertical: 4,
  },
  itemTimeText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#700F43',
    marginTop: 2,
  },
  itemInnerDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 14,
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 120,
  },
  emptyText: {
    fontSize: 14.5,
    fontWeight: '600',
    color: '#64748B',
  },
});

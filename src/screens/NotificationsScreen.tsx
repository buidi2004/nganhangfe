import { Colors, createThemedStyles, ThemeColors } from '../theme';
import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  FlatList,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AppText } from '../components/typography/AppText';
import { useTheme } from '../context/ThemeContext';
import { WalletApi } from '../services/api';
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
  { key: 'balance', title: 'Biến động số dư' },
  { key: 'news', title: 'Bảng tin & Ưu đãi' },
  { key: 'mine', title: 'Hệ thống' },
];

export default function NotificationsScreen({ navigation }: { navigation: any }) {
  const { colors, isDark } = useTheme();
  const { notifications: localNotifs } = useApp();
  const [activeTab, setActiveTab] = useState<'mine' | 'balance' | 'news'>('balance');
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<DateGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { onScroll } = useHideOnScroll();

  React.useEffect(() => {
    fetchNotifs();
  }, []);

  const fetchNotifs = async () => {
    try {
      setIsLoading(true);
      const res = await WalletApi.getNotifications();
      const rawItems = res.data?.content || res.data || [];

      const grouped: Record<string, NotificationItem[]> = {};

      rawItems.forEach((it: any) => {
        const dateStr = new Date(it.createdAt).toLocaleDateString('vi-VN');
        if (!grouped[dateStr]) grouped[dateStr] = [];

        let displayTitle = it.title || '';
        if (displayTitle.includes('TRANSFER')) displayTitle = displayTitle.replace('TRANSFER', 'Chuyển tiền');
        else if (displayTitle.includes('DEPOSIT')) displayTitle = displayTitle.replace('DEPOSIT', 'Nạp tiền');
        else if (displayTitle.includes('WITHDRAWAL')) displayTitle = displayTitle.replace('WITHDRAWAL', 'Rút tiền');

        const body = it.content || it.body || it.message || '';
        grouped[dateStr].push({
          id: String(it.id),
          title: displayTitle || 'Thông báo giao dịch',
          body,
          time: new Date(it.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          isUnread: !(it.isRead ?? it.read ?? false),
          category: categorizeNotification(it.type || '', body),
        });
      });

      const sortedGroups: DateGroup[] = Object.keys(grouped).map((date) => ({
        date,
        items: grouped[date],
      }));

      setNotifications(sortedGroups);
    } catch (e) {
      console.error('Failed to fetch notifications', e);
    } finally {
      setIsLoading(false);
    }
  };

  const tabFilteredGroups = useMemo(() => {
    return notifications
      .map((group) => ({
        ...group,
        items: group.items.filter((it) => it.category === activeTab),
      }))
      .filter((group) => group.items.length > 0);
  }, [notifications, activeTab]);

  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return tabFilteredGroups;
    const q = searchQuery.toLowerCase().trim();

    return tabFilteredGroups.map((group) => {
      const matchItems = group.items.filter(
        (it) => it.title.toLowerCase().includes(q) || it.body.toLowerCase().includes(q)
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
      return <AppText style={[styles.itemBodyText, { color: colors.textSecondary }]}>{body}</AppText>;
    }
    const lines = body.split('\n');
    return (
      <View style={{ marginTop: 4, marginBottom: 4 }}>
        {lines.map((line, idx) => {
          if (!line.trim()) return null;
          let color = colors.textSecondary;
          let fontWeight = '500';
          if (line.startsWith('PS: +')) {
            color = '#10B981'; // Green
            fontWeight = '800';
          } else if (line.startsWith('PS: -')) {
            color = '#EF4444'; // Red
            fontWeight = '800';
          } else if (line.startsWith('Số dư cuối:') || line.startsWith('SD:')) {
            fontWeight = '700';
            color = colors.textPrimary;
          }
          return (
            <AppText key={idx} style={{ fontSize: 13, color, lineHeight: 18, fontWeight: fontWeight as any }}>
              {line}
            </AppText>
          );
        })}
      </View>
    );
  }, [colors]);

  const renderDateGroup = useCallback(({ item: group }: { item: DateGroup }) => (
    <View style={[styles.dateGroupCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
      <View style={[styles.dateHeaderStrip, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#EEF2F6', borderBottomColor: colors.border }]}>
        <AppText style={[styles.dateHeaderText, { color: colors.textPrimary }]}>{group.date}</AppText>
      </View>
      <View style={[styles.groupItemsContainer, { backgroundColor: colors.cardBackground }]}>
        {group.items.map((item, itIdx) => (
          <View key={item.id}>
            <TouchableOpacity style={styles.notificationItem} activeOpacity={0.7} onPress={() => handleRead(item.id)}>
              <View style={styles.itemTitleRow}>
                <AppText style={[styles.itemTitleText, { color: colors.textPrimary }]}>{item.title}</AppText>
                {item.isUnread && <View style={styles.unreadCyanDot} />}
              </View>
              {renderNotificationBody(item.body)}
              <AppText style={[styles.itemTimeText, { color: colors.primary }]}>{item.time}</AppText>
            </TouchableOpacity>
            {itIdx < group.items.length - 1 && <View style={[styles.itemInnerDivider, { backgroundColor: colors.border }]} />}
          </View>
        ))}
      </View>
    </View>
  ), [handleRead, renderNotificationBody, colors, isDark]);

  const listEmpty = (
    <View style={styles.emptyWrap}>
      <Ionicons name="notifications-off-outline" size={60} color={colors.primary} style={{ marginBottom: 16, opacity: 0.6 }} />
      <AppText style={[styles.emptyText, { color: colors.textSecondary }]}>Không tìm thấy thông báo nào</AppText>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgBase }]} edges={['top']}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      {/* 1. TOP HEADER */}
      <View style={[styles.header, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.backBtn}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color={colors.primary} />
        </TouchableOpacity>

        <AppText style={[styles.headerTitle, { color: colors.primary }]}>Thông báo</AppText>

        <TouchableOpacity
          style={styles.settingsBtn}
          activeOpacity={0.7}
          onPress={fetchNotifs}
        >
          <Ionicons name="refresh-outline" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* 2. 3 TABS HEADER */}
      <View style={[styles.tabsContainer, { backgroundColor: colors.cardBackground }]}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tabItem}
              onPress={() => setActiveTab(tab.key as any)}
              activeOpacity={0.8}
            >
              <AppText style={[
                styles.tabText,
                { color: isActive ? colors.primary : colors.textSecondary },
                isActive && styles.tabTextActive
              ]}>
                {tab.title}
              </AppText>
              {isActive && <View style={[styles.tabIndicator, { backgroundColor: colors.primary }]} />}
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={[styles.tabsBottomBorder, { backgroundColor: colors.border }]} />

      {/* 3. SEARCH INPUT BAR */}
      <View style={[styles.searchBarWrapper, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border }]}>
        <Ionicons name="search-outline" size={20} color={colors.textSecondary} style={{ marginRight: 8 }} />
        <TextInput
          style={[styles.searchInput, { color: colors.textPrimary }]}
          placeholder="Tìm theo nội dung hoặc ngày..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <AppText style={{ marginTop: 12, color: colors.textSecondary, fontSize: 13 }}>Đang tải thông báo...</AppText>
        </View>
      ) : (
        <LinearGradient
          colors={isDark ? [colors.bgBase, colors.surface, colors.bgBase] : [colors.background, colors.badgePinkSoft, colors.background]}
          style={{ flex: 1 }}
        >
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

const styles = createThemedStyles((colors: ThemeColors) => ({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
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
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    position: 'relative',
  },
  tabText: {
    fontSize: 13.5,
    fontWeight: '600',
  },
  tabTextActive: {
    fontSize: 14,
    fontWeight: '800',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    width: '70%',
    height: 3,
    borderRadius: 2,
  },
  tabsBottomBorder: {
    height: 1,
    width: '100%',
  },
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    paddingVertical: 2,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
    flexGrow: 1,
  },
  dateGroupCard: {
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 14,
    overflow: 'hidden',
  },
  dateHeaderStrip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  dateHeaderText: {
    fontSize: 14.5,
    fontWeight: '800',
  },
  groupItemsContainer: {},
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
  },
  unreadCyanDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#38BDF8',
  },
  itemBodyText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    marginVertical: 4,
  },
  itemTimeText: {
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
  },
  itemInnerDivider: {
    height: 1,
    marginHorizontal: 14,
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  emptyText: {
    fontSize: 14.5,
    fontWeight: '600',
  },
}));

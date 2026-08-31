import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppIcon } from '../components/icons/AppIcon';
import { Colors, Radius, Shadows, Spacing } from '../theme';
import { GroupedListRow } from '../components/GroupedListRow';
import { FAQAccordionItem } from '../components/FAQAccordionItem';
import { SearchBar } from '../components/SearchBar';
import { ProviderIconGrid } from '../components/ProviderIconGrid';
import { AppText } from '../components/typography/AppText';
import { WalletApi } from '../services/api';

interface HelpCenterScreenProps {
  navigation: any;
}

const quickTopics = [
  { icon: 'swap-horizontal', label: 'Chuyển tiền' },
  { icon: 'wallet', label: 'Nạp - Rút' },
  { icon: 'shield-checkmark', label: 'Bảo mật' },
  { icon: 'person', label: 'Tài khoản' },
];

export default function HelpCenterScreen({ navigation }: HelpCenterScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [faqs, setFaqs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const res = await WalletApi.getFaq();
        setFaqs(res.data || []);
      } catch (error) {
        console.error('Failed to load FAQs', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFaqs();
  }, []);

  const filteredFaqs = faqs.filter(faq => 
    (faq.question && faq.question.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (faq.answer && faq.answer.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
            <AppIcon name="arrow-back" size="md" color={Colors.textPrimary} />
        </TouchableOpacity>
        <AppText style={styles.headerTitle}>Trợ giúp</AppText>
        <View style={styles.spacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Search bar */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Tìm kiếm câu hỏi..."
        />

        {/* Quick topics */}
        <AppText style={styles.sectionTitle}>Chủ đề nhanh</AppText>
        <ProviderIconGrid
          providers={quickTopics.map((t) => ({ ...t, onPress: () => {} }))}
        />

        {/* FAQ list */}
        <AppText style={styles.sectionTitle}>Câu hỏi thường gặp</AppText>
        <View style={styles.faqList}>
          {isLoading ? (
            <ActivityIndicator size="small" color={Colors.primary} style={{ padding: 20 }} />
          ) : filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, index) => (
              <FAQAccordionItem
                key={index}
                question={faq.question}
                answer={faq.answer}
              />
            ))
          ) : (
            <AppText style={{ padding: 20, textAlign: 'center', color: Colors.textSecondary }}>Không tìm thấy kết quả</AppText>
          )}
        </View>

        {/* Chat CTA */}
        <TouchableOpacity style={styles.chatCard} onPress={() => navigation.navigate('LiveChat')}>
            <AppIcon name="chatbubble-ellipses" size="lg" color={Colors.primary} />
          <View style={styles.chatInfo}>
            <AppText style={styles.chatTitle}>Chat với hỗ trợ viên</AppText>
            <AppText style={styles.chatSubtitle}>Trả lời trong vòng 2 phút</AppText>
          </View>
            <AppIcon name="chevron-forward" size="sm" color={Colors.textSecondary} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgBase,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  headerTitle: {
    
    color: Colors.textPrimary,
  },
  spacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
    paddingTop: Spacing.md,
  },
  sectionTitle: {
    
    color: Colors.textPrimary,
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  faqList: {
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    overflow: 'hidden',
    ...Shadows.card,
  },
  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.xl,
    ...Shadows.card,
  },
  chatInfo: {
    flex: 1,
  },
  chatTitle: {
    
    color: Colors.textPrimary,
  },
  chatSubtitle: {
    
    color: Colors.textSecondary,
    marginTop: 4,
  },
});

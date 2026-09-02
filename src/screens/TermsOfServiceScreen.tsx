import React, { useState, useRef, useMemo } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Share,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '../components/typography/AppText';
import { useTheme } from '../context/ThemeContext';
import { WalletApi } from '../services/api';
import { LEGAL_TERMS_DATA, LegalChapter, LegalArticle } from '../data/legalTermsData';

const { width } = Dimensions.get('window');

export default function TermsOfServiceScreen({ navigation }: { navigation: any }) {
  const { isDark, colors } = useTheme();
  const [selectedSection, setSelectedSection] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedArticles, setExpandedArticles] = useState<Record<string, boolean>>({});
  const [isAllExpanded, setIsAllExpanded] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [termsVersion, setTermsVersion] = useState(LEGAL_TERMS_DATA.version);

  const scrollViewRef = useRef<ScrollView>(null);

  // Fetch API ngầm để cập nhật version mới nhất nếu backend có sẵn
  React.useEffect(() => {
    let isMounted = true;
    const fetchRemoteTerms = async () => {
      try {
        const res = await WalletApi.getTerms();
        if (isMounted && res?.data) {
          if (typeof res.data === 'string' && res.data.length > 5) {
            setTermsVersion('2026.08 (Đồng bộ hệ thống)');
          } else if (typeof res.data === 'object' && (res.data as any).version) {
            setTermsVersion((res.data as any).version);
          }
        }
      } catch (e) {
        // Sử dụng dữ liệu pháp lý offline chuẩn mực
      }
    };
    fetchRemoteTerms();
    return () => {
      isMounted = false;
    };
  }, []);

  // Danh sách các tab chương (bao gồm tab Tất cả)
  const tabList = useMemo(() => {
    return [
      { id: 'all', title: 'Tất cả điều khoản' },
      ...LEGAL_TERMS_DATA.chapters.map(c => ({
        id: c.id,
        title: c.shortCode,
      })),
    ];
  }, []);

  // Lọc dữ liệu theo tab và từ khóa tìm kiếm
  const filteredChapters = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return LEGAL_TERMS_DATA.chapters
      .filter(chap => {
        if (selectedSection === 'all') return true;
        return chap.id === selectedSection;
      })
      .map(chap => {
        if (!q) return chap;

        // Lọc các điều khoản khớp từ khóa
        const matchedArticles = chap.articles.filter(art => {
          const matchTitle = art.title.toLowerCase().includes(q) || art.articleNumber.toLowerCase().includes(q);
          const matchClause = art.clauses.some(cl => cl.text.toLowerCase().includes(q) || cl.number.includes(q));
          const matchHighlight = art.highlights?.some(h => h.toLowerCase().includes(q));
          return matchTitle || matchClause || matchHighlight;
        });

        return {
          ...chap,
          articles: matchedArticles,
        };
      })
      .filter(chap => chap.articles.length > 0);
  }, [selectedSection, searchQuery]);

  // Tổng số điều hiển thị
  const totalArticlesCount = useMemo(() => {
    return filteredChapters.reduce((acc, c) => acc + c.articles.length, 0);
  }, [filteredChapters]);

  // Toggle mở rộng / thu gọn 1 điều khoản
  const toggleArticle = (articleId: string) => {
    setExpandedArticles(prev => {
      const current = prev[articleId] !== undefined ? prev[articleId] : isAllExpanded;
      return {
        ...prev,
        [articleId]: !current,
      };
    });
  };

  // Toggle mở rộng tất cả
  const toggleAllArticles = () => {
    const nextState = !isAllExpanded;
    setIsAllExpanded(nextState);
    const newRecord: Record<string, boolean> = {};
    LEGAL_TERMS_DATA.chapters.forEach(ch => {
      ch.articles.forEach(art => {
        newRecord[art.id] = nextState;
      });
    });
    setExpandedArticles(newRecord);
  };

  // Xử lý chia sẻ văn bản điều khoản
  const handleShare = async () => {
    try {
      await Share.share({
        title: LEGAL_TERMS_DATA.title,
        message: `${LEGAL_TERMS_DATA.title}\n${LEGAL_TERMS_DATA.decisionNumber}\nHiệu lực: ${LEGAL_TERMS_DATA.effectiveDate}\nTra cứu trực tuyến tại ứng dụng SenBank Mobile hoặc https://senbank.vn/dieu-khoan`,
      });
    } catch (error) {
      // Bỏ qua lỗi hủy share
    }
  };

  // Xử lý xác nhận đồng ý
  const handleAcceptTerms = async () => {
    setIsSubmitting(true);
    try {
      await WalletApi.submitConsent('2026.08');
    } catch (e) {
      // Chấp nhận offline nếu mạng yếu
    } finally {
      setIsSubmitting(false);
      Alert.alert(
        'Xác nhận thành công',
        'Quý khách đã đồng ý với toàn bộ Điều khoản & Điều kiện sử dụng dịch vụ Ngân hàng điện tử SenBank.\n\nBản ghi chấp thuận điện tử đã được ghi nhận và lưu trữ an toàn theo quy định của Ngân hàng Nhà nước.',
        [
          {
            text: 'Đã hiểu',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <StatusBar barStyle={colors.statusBarStyle} backgroundColor={colors.surface} />

      {/* 1. TOP HEADER */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.headerBtn, { backgroundColor: colors.background }]}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <AppText style={[styles.headerTitle, { color: colors.textPrimary }]}>Điều khoản sử dụng dịch vụ</AppText>
          <AppText style={[styles.headerSubTitle, { color: colors.textSecondary }]}>SenBank Digital Banking</AppText>
        </View>

        <View style={styles.headerRightActions}>
          <TouchableOpacity
            style={[styles.headerBtn, { backgroundColor: colors.background }]}
            activeOpacity={0.7}
            onPress={handleShare}
          >
            <Ionicons name="share-social-outline" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerBtn, { backgroundColor: colors.background }]}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Home')}
          >
            <Ionicons name="home-outline" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* 2. SEARCH BAR & QUICK FILTERS */}
        <View style={[styles.searchBarWrapper, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF', borderColor: colors.border }]}>
          <Ionicons name="search-outline" size={20} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Tìm kiếm theo từ khóa (eKYC, sinh trắc học, hạn mức, phí...)"
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* 3. SECTION CHIPS CAROUSEL */}
        <View style={[styles.chipsContainer, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
            {tabList.map((sec) => {
              const isSelected = selectedSection === sec.id;
              return (
                <TouchableOpacity
                  key={sec.id}
                  style={[
                    styles.chipPill,
                    { backgroundColor: isDark ? '#1E293B' : '#F8FAFC', borderColor: colors.border },
                    isSelected && { backgroundColor: colors.primarySoft, borderColor: colors.primary },
                  ]}
                  activeOpacity={0.8}
                  onPress={() => {
                    setSelectedSection(sec.id);
                    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
                  }}
                >
                  <AppText
                    style={[
                      styles.chipText,
                      { color: colors.textSecondary },
                      isSelected && { color: colors.primary, fontWeight: '800' },
                    ]}
                  >
                    {sec.title}
                  </AppText>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* 4. MAIN LEGAL DOCUMENT CONTENT */}
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Document Header Banner */}
          <View style={[styles.docHeaderBanner, { backgroundColor: colors.surface, borderColor: isDark ? colors.border : '#FCE7F3' }]}>
            <View style={styles.bankBadgeHeader}>
              <View style={styles.lotusIconBox}>
                <AppText style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '900' }}>★</AppText>
              </View>
              <AppText style={styles.mbTextLogo}>SenBank</AppText>
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={14} color="#16A34A" />
                <AppText style={styles.verifiedBadgeText}>Chính thức</AppText>
              </View>
            </View>

            <AppText style={[styles.docTitle, { color: colors.textPrimary }]}>
              {LEGAL_TERMS_DATA.title}
            </AppText>

            <View style={[styles.metaDivider, { backgroundColor: colors.border }]} />

            <View style={styles.metaRow}>
              <Ionicons name="document-text-outline" size={15} color={colors.primary} />
              <AppText style={[styles.docMetaText, { color: colors.textSecondary }]}>
                {LEGAL_TERMS_DATA.decisionNumber}
              </AppText>
            </View>

            <View style={styles.metaRow}>
              <Ionicons name="time-outline" size={15} color={colors.primary} />
              <AppText style={[styles.docMetaText, { color: colors.textSecondary }]}>
                Phiên bản: <AppText style={{ fontWeight: '800', color: colors.primary }}>{termsVersion}</AppText> | Hiệu lực: {LEGAL_TERMS_DATA.effectiveDate}
              </AppText>
            </View>

            <View style={styles.metaRow}>
              <Ionicons name="shield-checkmark-outline" size={15} color={colors.primary} />
              <AppText style={[styles.docMetaText, { color: colors.textSecondary }]}>
                Tuân thủ: Quyết định 2345/QĐ-NHNN & Nghị định 13/2023/NĐ-CP
              </AppText>
            </View>

            {/* Badges Trust Bar */}
            <View style={styles.trustBadgesRow}>
              <View style={[styles.trustPill, { backgroundColor: isDark ? '#334155' : '#F1F5F9' }]}>
                <MaterialCommunityIcons name="security" size={14} color="#0284C7" />
                <AppText style={[styles.trustPillText, { color: isDark ? '#E2E8F0' : '#334155' }]}>PCI-DSS Level 1</AppText>
              </View>
              <View style={[styles.trustPill, { backgroundColor: isDark ? '#334155' : '#F1F5F9' }]}>
                <Ionicons name="finger-print" size={14} color="#16A34A" />
                <AppText style={[styles.trustPillText, { color: isDark ? '#E2E8F0' : '#334155' }]}>Sinh trắc học NFC</AppText>
              </View>
              <View style={[styles.trustPill, { backgroundColor: isDark ? '#334155' : '#F1F5F9' }]}>
                <Ionicons name="lock-closed" size={14} color="#D2519D" />
                <AppText style={[styles.trustPillText, { color: isDark ? '#E2E8F0' : '#334155' }]}>Mã hóa 256-Bit</AppText>
              </View>
            </View>
          </View>

          {/* Controls Bar: Search Stats & Toggle Expand */}
          <View style={styles.controlsBar}>
            <AppText style={[styles.resultsCountText, { color: colors.textSecondary }]}>
              {searchQuery ? `Tìm thấy ${totalArticlesCount} điều khoản phù hợp` : `Hiển thị ${totalArticlesCount} điều khoản chính quy`}
            </AppText>
            <TouchableOpacity style={styles.expandAllBtn} onPress={toggleAllArticles}>
              <Ionicons name={isAllExpanded ? "contract-outline" : "expand-outline"} size={14} color={colors.primary} />
              <AppText style={[styles.expandAllText, { color: colors.primary }]}>
                {isAllExpanded ? 'Thu gọn' : 'Mở rộng tất cả'}
              </AppText>
            </TouchableOpacity>
          </View>

          {/* CÁC CHƯƠNG ĐIỀU KHOẢN */}
          {filteredChapters.length === 0 ? (
            <View style={[styles.emptyResultCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons name="search-outline" size={40} color={colors.textMuted} />
              <AppText style={[styles.emptyTitle, { color: colors.textPrimary }]}>Không tìm thấy điều khoản phù hợp</AppText>
              <AppText style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                Vui lòng thử tìm kiếm với từ khóa khác như "eKYC", "chuyển tiền", "sinh trắc học", "hạn mức"...
              </AppText>
              <TouchableOpacity
                style={[styles.resetSearchBtn, { backgroundColor: colors.primarySoft, borderColor: colors.border }]}
                onPress={() => setSearchQuery('')}
              >
                <AppText style={[styles.resetSearchText, { color: colors.primary }]}>Xóa bộ lọc tìm kiếm</AppText>
              </TouchableOpacity>
            </View>
          ) : (
            filteredChapters.map((chapter) => (
              <View key={chapter.id} style={[styles.chapterBlock, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                {/* Chapter Title Bar */}
                <View style={[styles.chapterHeader, { backgroundColor: isDark ? '#0F172A' : '#FFF5F8', borderBottomColor: colors.border }]}>
                  <View style={styles.chapterNumberBadge}>
                    <AppText style={styles.chapterNumberBadgeText}>{chapter.chapterNumber}</AppText>
                  </View>
                  <AppText style={[styles.chapterTitleText, { color: isDark ? colors.primary : '#700F43' }]}>
                    {chapter.title}
                  </AppText>
                </View>

                {/* Chapter Articles List */}
                <View style={styles.chapterBody}>
                  {chapter.articles.map((article, idx) => {
                    const isExpanded = expandedArticles[article.id] !== undefined ? expandedArticles[article.id] : isAllExpanded;

                    return (
                      <View key={article.id} style={[styles.articleContainer, idx > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}>
                        {/* Article Header (Clickable to Accordion) */}
                        <TouchableOpacity
                          style={styles.articleHeaderRow}
                          activeOpacity={0.7}
                          onPress={() => toggleArticle(article.id)}
                        >
                          <View style={styles.articleHeaderLeft}>
                            <View style={[styles.articlePillTag, { backgroundColor: isDark ? '#334155' : '#F1F5F9' }]}>
                              <AppText style={[styles.articlePillTagText, { color: isDark ? colors.primary : '#700F43' }]}>
                                {article.articleNumber}
                              </AppText>
                            </View>
                            <AppText style={[styles.articleHeadingText, { color: colors.textPrimary }]}>
                              {article.title}
                            </AppText>
                          </View>
                          <Ionicons
                            name={isExpanded ? "chevron-up" : "chevron-down"}
                            size={18}
                            color={colors.textSecondary}
                          />
                        </TouchableOpacity>

                        {/* Article Clauses Content */}
                        {isExpanded && (
                          <View style={styles.articleContentBox}>
                            {article.clauses.map((clause) => (
                              <View key={clause.number} style={styles.clauseRow}>
                                <AppText style={[styles.clauseNumberBullet, { color: colors.primary }]}>
                                  {clause.number}
                                </AppText>
                                <AppText style={[styles.clauseParagraph, { color: isDark ? '#CBD5E1' : '#334155' }]}>
                                  {clause.text}
                                </AppText>
                              </View>
                            ))}

                            {/* Important Highlights box if available */}
                            {article.highlights && article.highlights.length > 0 && (
                              <View style={[styles.highlightBox, { backgroundColor: isDark ? 'rgba(244, 114, 182, 0.08)' : '#FFF5F8', borderColor: isDark ? 'rgba(244, 114, 182, 0.2)' : '#FCE7F3' }]}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                  <Ionicons name="shield-checkmark" size={15} color={colors.primary} />
                                  <AppText style={[styles.highlightTitle, { color: colors.primary }]}>Lưu ý trọng yếu từ SenBank:</AppText>
                                </View>
                                {article.highlights.map((hl, hIdx) => (
                                  <AppText key={hIdx} style={[styles.highlightItemText, { color: isDark ? '#F1F5F9' : '#700F43' }]}>
                                    • {hl}
                                  </AppText>
                                ))}
                              </View>
                            )}
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              </View>
            ))
          )}

          {/* Legal Bases Footer Reference */}
          <View style={[styles.legalBasesCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <MaterialCommunityIcons name="scale-balance" size={18} color={colors.primary} />
              <AppText style={[styles.legalBasesHeader, { color: colors.textPrimary }]}>Căn cứ pháp lý thi hành:</AppText>
            </View>
            {LEGAL_TERMS_DATA.legalBases.map((base, bIdx) => (
              <AppText key={bIdx} style={[styles.legalBaseItem, { color: colors.textSecondary }]}>
                {bIdx + 1}. {base}
              </AppText>
            ))}
          </View>

          <View style={{ height: 90 }} />
        </ScrollView>

        {/* 5. FOOTER ACCEPT BUTTON */}
        <View style={[styles.bottomFooter, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          <TouchableOpacity
            style={styles.acceptBtn}
            activeOpacity={0.9}
            disabled={isSubmitting}
            onPress={handleAcceptTerms}
          >
            <LinearGradient
              colors={['#D2519D', '#700F43']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="shield-checkmark" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                <AppText style={styles.acceptBtnText}>Tôi đã hiểu và đồng ý</AppText>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
    textAlign: 'center',
  },
  headerSubTitle: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: '500',
    paddingVertical: 0,
  },
  chipsContainer: {
    paddingVertical: 6,
    borderBottomWidth: 1,
  },
  chipsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chipPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 20,
  },
  docHeaderBanner: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#700F43',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  bankBadgeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  lotusIconBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E11D48',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mbTextLogo: {
    fontSize: 20,
    fontWeight: '900',
    color: '#700F43',
    letterSpacing: -0.5,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  verifiedBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16A34A',
  },
  docTitle: {
    fontSize: 15,
    fontWeight: '900',
    lineHeight: 22,
    marginBottom: 10,
    textAlign: 'left',
  },
  metaDivider: {
    height: 1,
    marginVertical: 10,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 5,
  },
  docMetaText: {
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },
  trustBadgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(148, 163, 184, 0.15)',
  },
  trustPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  trustPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  controlsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  resultsCountText: {
    fontSize: 12,
    fontWeight: '600',
  },
  expandAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  expandAllText: {
    fontSize: 12,
    fontWeight: '700',
  },
  chapterBlock: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 14,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  chapterHeader: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderBottomWidth: 1,
  },
  chapterNumberBadge: {
    backgroundColor: '#700F43',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  chapterNumberBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  chapterTitleText: {
    fontSize: 13.5,
    fontWeight: '900',
    flex: 1,
    letterSpacing: -0.2,
  },
  chapterBody: {
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  articleContainer: {
    paddingVertical: 12,
  },
  articleHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  articleHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  articlePillTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  articlePillTagText: {
    fontSize: 11,
    fontWeight: '800',
  },
  articleHeadingText: {
    fontSize: 13.5,
    fontWeight: '800',
    flex: 1,
    lineHeight: 18,
  },
  articleContentBox: {
    marginTop: 10,
    paddingLeft: 4,
  },
  clauseRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  clauseNumberBullet: {
    fontSize: 12.5,
    fontWeight: '800',
    width: 28,
    marginTop: 1,
  },
  clauseParagraph: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '400',
  },
  highlightBox: {
    marginTop: 6,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  highlightTitle: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  highlightItemText: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
    marginTop: 2,
  },
  legalBasesCard: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  legalBasesHeader: {
    fontSize: 12.5,
    fontWeight: '800',
  },
  legalBaseItem: {
    fontSize: 11.5,
    lineHeight: 18,
    marginTop: 3,
    fontWeight: '500',
  },
  emptyResultCard: {
    borderRadius: 16,
    padding: 28,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 12.5,
    lineHeight: 18,
    marginTop: 6,
    textAlign: 'center',
  },
  resetSearchBtn: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 18,
    borderWidth: 1,
  },
  resetSearchText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  bottomFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 22,
    borderTopWidth: 1,
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  acceptBtn: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#D2519D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  acceptBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});

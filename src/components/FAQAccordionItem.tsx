import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { AppIcon } from './icons/AppIcon';
import { Radius, Spacing, createThemedStyles, ThemeColors } from '../theme';
import { Typography } from '../theme';
import { AppText } from './typography/AppText';

import { useTheme } from '../context/ThemeContext';

interface FAQAccordionItemProps {
  question: string;
  answer: string;
}

export const FAQAccordionItem: React.FC<FAQAccordionItemProps> = ({ question, answer }) => {
  const { colors } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderBottomColor: colors.primarySoft }]}>
      <TouchableOpacity style={styles.header} onPress={() => setIsOpen(!isOpen)}>
        <AppText variant="body" style={[styles.question, { color: colors.textPrimary }]}>{question}</AppText>
        <AppIcon name={isOpen ? "chevronRight" : "chevronRight"} size="sm" color={colors.primary} />
      </TouchableOpacity>
      {isOpen && <AppText variant="caption" style={[styles.answer, { color: colors.textSecondary }]}>{answer}</AppText>}
    </View>
  );
};

const styles = createThemedStyles((colors: ThemeColors) => ({
  container: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.primarySoft,
    paddingHorizontal: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  question: {
    flex: 1,
    color: colors.textPrimary,
    marginRight: Spacing.sm,
  },
  answer: {
    color: colors.textSecondary,
    lineHeight: 20,
    paddingBottom: Spacing.md,
  },
}));

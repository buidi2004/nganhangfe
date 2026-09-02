import React from 'react';
import { StyleSheet, TouchableOpacity, View, Dimensions, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { AppText } from './typography/AppText';
import { AppIcon } from './icons/AppIcon';

interface GlassHeaderProps {
  title?: string;
  onBack?: () => void;
  rightIcon?: string;
  onRightPress?: () => void;
  hasNotification?: boolean;
}

export function GlassHeader({ title, onBack, rightIcon, onRightPress, hasNotification }: GlassHeaderProps) {
  return (
    <BlurView intensity={60} tint="light" style={styles.header}>
      {onBack ? (
        <TouchableOpacity onPress={onBack} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} style={styles.leftIcon}>
          <AppIcon name="arrow-back" size="md" color="#FFF" />
        </TouchableOpacity>
      ) : (
        <View style={styles.leftSpacer} />
      )}
      
      {title ? (
        <AppText style={styles.title} numberOfLines={1}>
          {title}
        </AppText>
      ) : (
        <View style={styles.titleSpacer} />
      )}
      
      {rightIcon && onRightPress ? (
        <TouchableOpacity onPress={onRightPress} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} style={styles.rightIcon}>
          <AppIcon name={rightIcon as any} size="md" color="#FFF" />
          {hasNotification && <View style={styles.dot} />}
        </TouchableOpacity>
      ) : (
        <View style={styles.rightSpacer} />
      )}
    </BlurView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  header: {
    width: width,
    height: Platform.OS === 'ios' ? 100 : 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 44 : 30,
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 100,
    overflow: 'hidden',
  },
  title: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  leftIcon: {
    width: 40,
    alignItems: 'flex-start',
  },
  rightIcon: {
    width: 40,
    alignItems: 'flex-end',
  },
  leftSpacer: {
    width: 40,
  },
  rightSpacer: {
    width: 40,
  },
  titleSpacer: {
    flex: 1,
  },
  dot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
});

import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '../components/typography/AppText';
import { Colors } from '../theme';
import { GlassHeader } from '../components/GlassHeader';
import { EmptyState } from '../components/EmptyState';

export default function CardsScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <GlassHeader
        title="Quản lý thẻ"
        onBack={() => navigation.goBack()}
        rightIcon="notification"
        onRightPress={() => {}}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <EmptyState
          icon="credit-card"
          title="Chưa có thẻ nào"
          description="Bạn chưa phát hành hoặc liên kết thẻ nào."
          actionLabel="Phát hành thẻ mới"
          onAction={() => {}}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
});

/**
 * notificationService.ts
 * Quản lý toàn diện Push Notification (FCM) cho ứng dụng Sen Hồng:
 * - Xin quyền runtime (Android 13+ POST_NOTIFICATIONS, iOS requestPermission)
 * - Lấy và refresh FCM Device Token, đăng ký lên Backend
 * - Xử lý 3 trạng thái: Foreground, Background (Headless Task), Killed (InitialNotification)
 * - Điều hướng khi người dùng nhấn vào thông báo (Notification Tap) tới TransactionDetail
 * - Chuẩn hóa mapping dữ liệu tương thích 100% với WebSocket contract
 */
import { Platform, PermissionsAndroid, Alert, DeviceEventEmitter } from 'react-native';
import { getMessaging, AuthorizationStatus, type RemoteMessage } from '@react-native-firebase/messaging';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { WalletApi } from './api';
import { navigate } from '../navigation/navigationRef';

// Helper tương thích chuẩn Firebase messaging()
const messaging = () => getMessaging();

// ── 0. Khởi tạo Notification Channel cho Android (Giúp thông báo lưu lại trên khay) ──
export async function initNotificationChannel() {
  if (Platform.OS === 'android') {
    try {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Giao dịch',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#D2519D',
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        bypassDnd: true,
        showBadge: true,
        sound: 'default',
      });
      console.log('[FCM] Đã khởi tạo Notification Channel default thành công');
    } catch (e) {
      console.warn('[FCM] Lỗi khởi tạo Notification Channel:', e);
    }
  }
}
initNotificationChannel();

// ── 1. Đăng ký Background Message Handler (Bắt buộc chạy ngoài React Component) ──
messaging().setBackgroundMessageHandler(async (remoteMessage: RemoteMessage) => {
  console.log('[FCM Background] Nhận được message khi app đang chạy nền/tắt:', remoteMessage);
  // Khi server gửi data-only notification, có thể hiển thị local notification nếu cần
  if (!remoteMessage.notification && remoteMessage.data) {
    const parsed = mapFcmToAppNotification(remoteMessage);
    await Notifications.scheduleNotificationAsync({
      content: {
        title: parsed.title,
        body: parsed.body,
        sound: true,
        data: remoteMessage.data,
      },
      trigger: { channelId: 'default' },
    });
  }
});

// ── 2. Xin quyền Notification chuẩn từng OS ──────────────────────────────────
export async function requestNotificationPermission(): Promise<boolean> {
  try {
    let enabled = false;

    if (Platform.OS === 'android') {
      if (Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          {
            title: 'Quyền thông báo',
            message: 'Sen Hồng cần quyền thông báo để gửi cho bạn biến động số dư và giao dịch real-time.',
            buttonPositive: 'Đồng ý',
            buttonNegative: 'Để sau',
          }
        );
        enabled = granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        enabled = true;
      }
    } else if (Platform.OS === 'ios') {
      const authStatus = await messaging().requestPermission();
      enabled =
        authStatus === AuthorizationStatus.AUTHORIZED ||
        authStatus === AuthorizationStatus.PROVISIONAL;
    }

    if (!enabled) {
      console.warn('[FCM] Người dùng từ chối cấp quyền thông báo');
      Alert.alert(
        'Bật thông báo giao dịch',
        'Để nhận được thông báo biến động số dư tức thì, vui lòng bật quyền Thông báo cho ứng dụng trong Cài đặt.',
        [{ text: 'Đã hiểu', style: 'cancel' }]
      );
    }
    return enabled;
  } catch (error) {
    console.warn('[FCM] Lỗi khi xin quyền thông báo:', error);
    return false;
  }
}

// ── 3. Lấy FCM Token và gửi lên Backend (Hỗ trợ Cách 1 Khuyến nghị & Cách 2) ─
export async function registerFcmTokenWithBackend(deviceId: string): Promise<string | null> {
  try {
    const hasPerm = await requestNotificationPermission();
    if (!hasPerm) return null;

    // Đảm bảo thiết bị đã đăng ký với APNs trên iOS
    if (Platform.OS === 'ios' && !messaging().isDeviceRegisteredForRemoteMessages) {
      await messaging().registerDeviceForRemoteMessages();
    }

    const token = await messaging().getToken();
    console.log('[FCM] Lấy FCM Token thành công:', token);

    const deviceType = Platform.OS === 'ios' ? 'IOS' : 'ANDROID';
    // Cách 1 (Khuyến nghị): POST /api/v1/devices/register
    try {
      await WalletApi.registerDevice(token, deviceType);
      console.log('[FCM] Đã đăng ký token (Cách 1: /devices/register) thành công');
    } catch (err1) {
      console.warn('[FCM] Cách 1 thông báo:', err1);
    }

    // Cách 2 (Session cũ): POST /api/v1/sessions/{deviceId}/fcm?fcmToken=
    try {
      await WalletApi.registerFcmToken(deviceId, token);
      console.log(`[FCM] Đã đăng ký token (Cách 2: /sessions/${deviceId}/fcm) thành công`);
    } catch (err2) {
      console.warn('[FCM] Cách 2 thông báo:', err2);
    }

    return token;
  } catch (error) {
    console.warn('[FCM] Lỗi khi lấy token hoặc gửi lên Backend:', error);
    return null;
  }
}

// ── 4. Lắng nghe Refresh Token tự động ───────────────────────────────────────
export function setupTokenRefreshListener(deviceId: string) {
  return messaging().onTokenRefresh(async (newToken: string) => {
    console.log('[FCM] Token đã tự động thay đổi (refreshed):', newToken);
    const deviceType = Platform.OS === 'ios' ? 'IOS' : 'ANDROID';
    try {
      await WalletApi.registerDevice(newToken, deviceType);
    } catch (e) {}
    try {
      await WalletApi.registerFcmToken(deviceId, newToken);
    } catch (e) {}
  });
}

// ── 5. Hủy đăng ký FCM khi Logout (Hỗ trợ Cách 1 & Cách 2) ───────────────────
export async function unregisterFcmTokenFromBackend(deviceId: string, token?: string) {
  if (token) {
    try {
      // Cách 1: DELETE /api/v1/devices/unregister?fcmToken=
      await WalletApi.unregisterDevice(token);
      console.log('[FCM] Đã hủy đăng ký token (Cách 1: /devices/unregister) thành công.');
    } catch (e) {
      console.warn('[FCM] Cách 1 unregister thông báo:', e);
    }
  }
  try {
    // Cách 2: DELETE /api/v1/sessions/{deviceId}
    await WalletApi.revokeSession(deviceId);
    console.log(`[FCM] Đã hủy phiên thiết bị ${deviceId} (Cách 2: /sessions) trên Backend.`);
  } catch (e) {
    console.warn('[FCM] Cách 2 revoke session thông báo:', e);
  }
}

// ── 6. Chuẩn hóa Data Payload tương thích 100% với WebSocket contract ────────
export function mapFcmToAppNotification(remoteMessage: RemoteMessage) {
  const data = (remoteMessage.data || {}) as any;
  const notif = (remoteMessage.notification || {}) as any;

  const transactionId = (data.transactionId as string) || remoteMessage.messageId || `fcm-${Date.now()}`;
  const requestId = (data.requestId as string) || '';
  const type = (data.type as string) || 'TRANSFER_OUT';
  const status = (data.status as string) || 'SUCCESS';
  const walletId = (data.walletId as string) || '';
  
  // Parse amount và transactionAmount (hỗ trợ cả Number lẫn String "50000.00")
  const rawAmount = data.amount !== undefined ? data.amount : (data.transactionAmount !== undefined ? data.transactionAmount : 0);
  const amount = isNaN(Number(rawAmount)) ? 0 : Number(rawAmount);
  const transactionAmount = amount;

  // Parse newBalance (hỗ trợ cả Number lẫn String "950000.00")
  const rawBalance = data.newBalance !== undefined ? data.newBalance : data.balance;
  const newBalance = rawBalance !== undefined && rawBalance !== null && !isNaN(Number(rawBalance)) ? Number(rawBalance) : undefined;

  const currency = (data.currency as string) || (data.transactionCurrency as string) || 'VND';
  const timestamp = (data.timestamp as string) || new Date().toISOString();
  const note = (data.note as string) || (data.body as string) || notif.body || '';
  const title = (data.title as string) || notif.title || (type === 'TRANSFER_OUT' || type === 'WITHDRAWAL' ? '📤 Tiền ra' : '📥 Tiền vào');
  const body = (data.body as string) || notif.body || (data.message as string) || note;

  return {
    transactionId,
    requestId,
    type,
    status,
    walletId,
    amount,
    transactionAmount,
    newBalance,
    runningBalance: newBalance,
    currency,
    timestamp,
    note,
    title,
    body,
    counterpartyName: (data.counterpartyName as string) || (data.recipientName as string) || (data.senderName as string),
    counterpartyAccount: (data.counterpartyAccount as string) || (data.recipientAccount as string) || (data.senderAccount as string),
  };
}

// ── 7. Điều hướng khi người dùng nhấn vào thông báo (Notification Tap) ───────
export function handleNotificationTap(remoteMessage: RemoteMessage) {
  if (!remoteMessage) return;
  console.log('[FCM Tap] Người dùng bấm vào thông báo:', remoteMessage);
  const parsed = mapFcmToAppNotification(remoteMessage);

  if (parsed.transactionId && parsed.transactionId !== '—') {
    navigate('TransactionDetail', { transaction: parsed });
  } else {
    navigate('Notifications');
  }
}

// ── 8. Thiết lập listeners cho Foreground & Click Notification ──────────────
export function setupNotificationListeners(onNewNotification?: (notif: ReturnType<typeof mapFcmToAppNotification>) => void) {
  // A. FOREGROUND (App đang mở)
  const unsubscribeOnMessage = messaging().onMessage(async (remoteMessage: RemoteMessage) => {
    console.log('[FCM Foreground] Nhận được thông báo khi app đang mở:', remoteMessage);
    const parsed = mapFcmToAppNotification(remoteMessage);

    // Hiển thị Banner Local Notification để người dùng nhìn thấy
    await Notifications.scheduleNotificationAsync({
      content: {
        title: parsed.title,
        body: parsed.body,
        sound: true,
        data: remoteMessage.data,
      },
      trigger: { channelId: 'default' },
    });

    // Phát sự kiện toàn cục để AppContext cập nhật số dư & danh sách thông báo
    DeviceEventEmitter.emit('FCM_NOTIFICATION_RECEIVED', parsed);

    if (onNewNotification) {
      onNewNotification(parsed);
    }
  });

  // B. BACKGROUND (Nhấn vào thông báo khi app đang ở background)
  const unsubscribeOnNotificationOpened = messaging().onNotificationOpenedApp((remoteMessage: RemoteMessage) => {
    console.log('[FCM Background Tap] Mở app từ background qua notification:', remoteMessage);
    handleNotificationTap(remoteMessage);
  });

  // C. KILLED (Mở app từ trạng thái tắt hẳn qua notification)
  messaging()
    .getInitialNotification()
    .then((remoteMessage: RemoteMessage | null) => {
      if (remoteMessage) {
        console.log('[FCM Killed Tap] Mở app từ trạng thái killed qua notification:', remoteMessage);
        handleNotificationTap(remoteMessage);
      }
    })
    .catch((err: any) => console.warn('[FCM] Lỗi kiểm tra getInitialNotification:', err));

  return () => {
    unsubscribeOnMessage();
    unsubscribeOnNotificationOpened();
  };
}

/**
 * AppContext.tsx — Global State & API Wiring for SenBank
 * Kết nối tất cả màn hình vào Spring Boot Backend
 * Quản lý: JWT auth, wallet balance, WebSocket real-time, notifications
 */
import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus, Platform } from 'react-native';
import { WalletApi, setAuthTokens, getAuthToken, API_BASE_URL } from '../services/api';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { clearCredentials } from '../services/secureStore';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function registerForPushNotificationsAsync() {
  let token;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Giao dịch',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#D2519D',
    });
  }
  if (Device.isDevice) {
    const perm = await Notifications.getPermissionsAsync() as any;
    let isGranted = perm.granted;
    if (!isGranted) {
      const requestPerm = await Notifications.requestPermissionsAsync() as any;
      isGranted = requestPerm.granted;
    }
    if (!isGranted) {
      console.warn('Failed to get push token for push notification!');
      return null;
    }
    try {
        const pushToken = await Notifications.getDevicePushTokenAsync();
        token = pushToken.data;
    } catch (e) {
        console.warn('Could not get push token', e);
        return null;
    }
  } else {
    console.warn('Must use physical device for Push Notifications');
  }
  return token;
}

// ─── Types ──────────────────────────────────────────────────────────────────
export interface WalletData {
  walletId: string;
  balance: number;
  currency: string;
}

export interface UserProfile {
  userId: string;
  phoneNumber: string;
  name: string;
  walletId: string;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  time: string;
  isUnread: boolean;
  type?: string;
}

interface AppContextValue {
  user: UserProfile | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (phone: string, password: string) => Promise<UserProfile>;
  register: (phone: string, password: string) => Promise<{ walletId: string }>;
  logout: () => void;
  wallet: WalletData | null;
  refreshBalance: () => Promise<void>;
  isBalanceLoading: boolean;
  notifications: AppNotification[];
  unreadCount: number;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  pendingTransactionId: string | null;
  setPendingTransactionId: (id: string | null) => void;
  wsConnected: boolean;
  lastError: string | null;
  clearError: () => void;
  customBackgroundUri: string | null;
  setCustomBackgroundUri: (uri: string | null) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}

// ─── Minimal STOMP client for React Native (no SockJS required) ─────────────
class NativeStompClient {
  private ws: WebSocket | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private subscriptions = new Map<string, (msg: any) => void>();
  private _connected = false;
  private onConnectCb?: () => void;
  private onDisconnectCb?: () => void;

  connect(url: string, token: string, onConnect: () => void, onDisconnect: () => void) {
    this.onConnectCb = onConnect;
    this.onDisconnectCb = onDisconnect;
    try {
      this.ws = new WebSocket(url);
      this.ws.onopen = () => {
        this._send(`CONNECT\naccept-version:1.2\nheart-beat:10000,10000\nAuthorization:Bearer ${token}\n\n\0`);
      };
      this.ws.onmessage = (evt) => this._onMessage(evt.data as string);
      this.ws.onclose = () => {
        this._connected = false;
        this._stopHeartbeat();
        this.onDisconnectCb?.();
      };
      this.ws.onerror = (e) => console.warn('[WS]', e);
    } catch (e) { console.warn('[WS] Connect error', e); }
  }

  private _send(data: string) {
    if (this.ws?.readyState === WebSocket.OPEN) this.ws.send(data);
  }

  private _onMessage(data: string) {
    if (data.startsWith('CONNECTED')) {
      this._connected = true;
      this._startHeartbeat();
      this.onConnectCb?.();
    } else if (data.startsWith('MESSAGE')) {
      try {
        const lines = data.split('\n');
        let dest = '';
        let inBody = false;
        let body = '';
        for (const line of lines) {
          if (line.startsWith('destination:')) dest = line.slice(12).trim();
          else if (line === '' && !inBody) inBody = true;
          else if (inBody && line !== '\0') body += line;
        }
        const cb = this.subscriptions.get(dest);
        if (cb && body) { try { cb(JSON.parse(body)); } catch { cb(body); } }
      } catch {}
    }
  }

  subscribe(dest: string, cb: (msg: any) => void) {
    this.subscriptions.set(dest, cb);
    this._send(`SUBSCRIBE\nid:sub-${Date.now()}\ndestination:${dest}\n\n\0`);
  }

  private _startHeartbeat() {
    this.heartbeatTimer = setInterval(() => this._send('\n'), 10000);
  }
  private _stopHeartbeat() {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
  }

  disconnect() {
    this._stopHeartbeat();
    this._send('DISCONNECT\n\n\0');
    this.ws?.close();
    this.ws = null;
    this._connected = false;
    this.subscriptions.clear();
  }

  isConnected() { return this._connected; }
}

// ─── AppProvider ─────────────────────────────────────────────────────────────
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [pendingTransactionId, setPendingTransactionId] = useState<string | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const [customBackgroundUri, setCustomBackgroundUri] = useState<string | null>(null);

  useEffect(() => {
    // Load custom background from global mock or actual storage on start
    const saved = (global as any).SAVED_BACKGROUND_URI;
    if (saved) {
      setCustomBackgroundUri(saved);
    }
  }, []);

  const updateCustomBackground = useCallback((uri: string | null) => {
    setCustomBackgroundUri(uri);
    (global as any).SAVED_BACKGROUND_URI = uri;
  }, []);

  const stomp = useRef(new NativeStompClient());
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  // ── connectWS ──────────────────────────────────────────────────────────
  const connectWS = useCallback((userId: string) => {
    const token = getAuthToken();
    if (!token) return;
    const wsUrl = API_BASE_URL
      .replace('http://', 'ws://')
      .replace('https://', 'wss://')
      .replace('/api/v1', '/ws-native');

      stomp.current.connect(wsUrl, token,
        () => {
          setWsConnected(true);
          console.log('[WS] Connected to SenBank');
          stomp.current.subscribe(`/topic/wallets/${userId}/notifications`, (msg) => {
            if (typeof msg.newBalance === 'number') {
              setWallet(prev => prev ? { ...prev, balance: msg.newBalance } : prev);
            }
            if (msg.message) {
              setNotifications(prev => [{
                id: `ws-${Date.now()}`,
                title: msg.type === 'DEBIT' ? '📤 Tiền ra' : '📥 Tiền vào',
                body: msg.message,
                time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
                isUnread: true,
                type: msg.type,
              }, ...prev]);
              
              // Bắn luôn thông báo Push Notification Native ra ngoài màn hình
              Notifications.scheduleNotificationAsync({
                content: {
                  title: msg.type === 'DEBIT' ? '📤 Biến động số dư' : '📥 Tiền vào tài khoản',
                  body: msg.message,
                  sound: true,
                },
                trigger: null, // trigger null means show immediately
              });
            }
          });
        },
      () => {
        setWsConnected(false);
        if (appStateRef.current === 'active') {
          console.log('[WS] Disconnected, reconnecting in 5s...');
          setTimeout(() => connectWS(userId), 5000);
        }
      }
    );
  }, []);

  // ── refreshBalance ─────────────────────────────────────────────────────
  const refreshBalance = useCallback(async () => {
    if (!user?.walletId) return;
    const t0 = Date.now();
    try {
      setIsBalanceLoading(true);
      const res = await WalletApi.getWallet(user.walletId);
      console.log(`[PERF] getWallet: ${Date.now() - t0}ms`);
      setWallet({ walletId: res.data.id, balance: res.data.balance, currency: res.data.currency || 'VND' });
    } catch (e: any) {
      console.warn('[Balance] Error:', e.message);
    } finally {
      setIsBalanceLoading(false);
    }
  }, [user?.walletId]);

  // ── login ──────────────────────────────────────────────────────────────
  const login = useCallback(async (phone: string, password: string) => {
    setIsLoading(true);
    setLastError(null);
    const t0 = Date.now();
    try {
      const res = await WalletApi.login(phone, password);
      console.log(`[PERF] Login: ${Date.now() - t0}ms`);
      const d = res.data as any;
      setAuthTokens(d.token || d.accessToken, d.refreshToken);

      let realWalletId = phone;
      try {
        const infoRes = await WalletApi.getRecipientInfo(undefined, phone);
        if (infoRes.data?.walletId) {
          realWalletId = infoRes.data.walletId;
        }
      } catch (e) {
        console.warn('Failed to fetch real walletId on login:', e);
      }

      const profile: UserProfile = {
        userId: d.userId || phone,
        phoneNumber: phone,
        name: d.fullName || phone,
        walletId: realWalletId,
      };
      setUser(profile);
      try {
        const wr = await WalletApi.getWallet(realWalletId);
        setWallet({ walletId: wr.data.id, balance: wr.data.balance, currency: wr.data.currency || 'VND' });
      } catch(e) {
        setWallet({ walletId: realWalletId, balance: 0, currency: 'VND' });
      }
      connectWS(realWalletId);
      await _loadNotifications();
      
      const pushToken = await registerForPushNotificationsAsync();
      if (pushToken) {
          const deviceId = Device.osBuildId || Constants.sessionId || `device-${phone}`;
          try {
              await WalletApi.registerFcmToken(deviceId, pushToken);
              console.log('[Push] Registered token for device:', deviceId);
          } catch (e) {
              console.warn('[Push] Failed to register token with backend', e);
          }
      }
      return profile;
    } catch (e: any) {
      setLastError(e.message || 'Đăng nhập thất bại. Kiểm tra lại SĐT/mật khẩu.');
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [connectWS]);

  // ── register ───────────────────────────────────────────────────────────
  const register = useCallback(async (phone: string, password: string) => {
    setIsLoading(true);
    setLastError(null);
    const t0 = Date.now();
    try {
      const res = await WalletApi.register(phone, password);
      console.log(`[PERF] Register: ${Date.now() - t0}ms`);
      const d = res.data as any;
      setAuthTokens(d.token || d.accessToken, d.refreshToken);

      let realWalletId = phone;
      try {
        const infoRes = await WalletApi.getRecipientInfo(undefined, phone);
        if (infoRes.data?.walletId) {
          realWalletId = infoRes.data.walletId;
        }
      } catch (e) {
        console.warn('Failed to fetch real walletId on register:', e);
      }

      const profile: UserProfile = {
        userId: d.userId || phone,
        phoneNumber: phone,
        name: phone,
        walletId: realWalletId,
      };
      setUser(profile);
      try {
        const wr = await WalletApi.getWallet(realWalletId);
        setWallet({ walletId: wr.data.id, balance: wr.data.balance, currency: wr.data.currency || 'VND' });
      } catch(e) {
        setWallet({ walletId: realWalletId, balance: 0, currency: 'VND' });
      }
      connectWS(realWalletId);
      
      const pushToken = await registerForPushNotificationsAsync();
      if (pushToken) {
          const deviceId = Device.osBuildId || Constants.sessionId || `device-${phone}`;
          try {
              await WalletApi.registerFcmToken(deviceId, pushToken);
              console.log('[Push] Registered token for device:', deviceId);
          } catch (e) {
              console.warn('[Push] Failed to register token with backend', e);
          }
      }
      return { walletId: realWalletId };
    } catch (e: any) {
      setLastError(e.message || 'Đăng ký thất bại');
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [connectWS]);

  // ── logout ─────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try { await WalletApi.logout(); } catch {}
    try { await clearCredentials(); } catch {}
    stomp.current.disconnect();
    setAuthTokens(null);
    setUser(null);
    setWallet(null);
    setNotifications([]);
    setWsConnected(false);
  }, []);

  // ── notifications ──────────────────────────────────────────────────────
  const _loadNotifications = async () => {
    try {
      const res = await WalletApi.getNotifications(0, 30);
      const items: any[] = Array.isArray(res.data) ? res.data : (res.data as any)?.content || [];
      setNotifications(items.map((n: any) => ({
        id: String(n.id),
        title: n.title || 'Thông báo',
        body: n.body || n.message || '',
        time: n.createdAt
          ? new Date(n.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
          : '',
        isUnread: !(n.isRead || n.read),
        type: n.type,
      })));
    } catch (e: any) { console.warn('[Notif] Load error:', e.message); }
  };

  const markRead = useCallback(async (id: string) => {
    try {
      await WalletApi.markNotificationAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isUnread: false } : n));
    } catch {}
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await WalletApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isUnread: false })));
    } catch {}
  }, []);

  // ── AppState: resume on foreground ─────────────────────────────────────
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (appStateRef.current === 'background' && next === 'active' && user) {
        refreshBalance();
        if (!stomp.current.isConnected() && user.walletId) connectWS(user.walletId);
      }
      appStateRef.current = next;
    });
    return () => sub.remove();
  }, [user, refreshBalance, connectWS]);

  useEffect(() => () => stomp.current.disconnect(), []);

  return (
    <AppContext.Provider value={{
      user, isLoggedIn: !!user, isLoading,
      login, register, logout,
      wallet, refreshBalance, isBalanceLoading,
      notifications, unreadCount: notifications.filter(n => n.isUnread).length,
      markRead, markAllRead,
      pendingTransactionId, setPendingTransactionId,
      wsConnected,
      lastError,
      clearError: () => setLastError(null),
      customBackgroundUri,
      setCustomBackgroundUri: updateCustomBackground,
    }}>
      {children}
    </AppContext.Provider>
  );
}

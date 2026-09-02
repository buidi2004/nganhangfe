import os

filepath = r'c:\dev\app\src\services\api.ts'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add TransferResponse
target1 = '''interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
  errorCode?: string;
}'''

replacement1 = target1 + '''

export interface TransferResponse {
  transactionId: string;
  requestId: string;
  sourceWalletId: string;
  targetWalletId: string;
  amount: number;
  currency: string;
  type: string;
  status: string;
  timestamp: string;
  note: string;
  bankCode: string;
  isInternal: boolean;
  feeAmount: number;
  balance: number;
  runningBalance: number;
  senderName?: string;
  senderAccount?: string;
  recipientName?: string;
  recipientAccount?: string;
  counterpartyName?: string;
  counterpartyAccount?: string;
  counterpartyBankName?: string;
}'''
content = content.replace(target1, replacement1)

# 2. Fix register
target2 = '''  register: (phoneNumber: string, password: string) =>
    request<{ userId: string; accessToken: string; refreshToken: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber, password }),
    }),'''
replacement2 = '''  register: (phoneNumber: string, password: string, fullName: string) =>
    request<{ userId: string; accessToken: string; refreshToken: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber, password, fullName }),
    }),'''
content = content.replace(target2, replacement2)

# 3. Fix initTransfer
target3 = '''  initTransfer: (sourceWalletId: string, targetWalletId: string, amount: number, note?: string, currency = 'VND') =>
    request<{ transactionId: string; status: string; requiresConfirmation: boolean }>(
      '/wallets/transfer/init',
      { method: 'POST', body: JSON.stringify({ requestId: generateUUID(), sourceWalletId, targetWalletId, amount, currency, note }) },
      true
    ),'''
replacement3 = '''  initTransfer: (sourceWalletId: string, targetWalletId: string, bankCode: string, amount: number, note?: string, currency = 'VND') =>
    request<TransferResponse>(
      '/wallets/transfer/init',
      { method: 'POST', body: JSON.stringify({ requestId: generateUUID(), sourceWalletId, targetWalletId, amount, currency, bankCode, note }) },
      true
    ),'''
content = content.replace(target3, replacement3)

# 4. Fix confirmTransfer
target4 = '''  confirmTransfer: (transactionId: string, pin: string, otp: string) => {
    const params = new URLSearchParams();
    if (pin) params.append('pin', pin);
    if (otp) params.append('otp', otp);
    return request<{ transactionId: string; status: string }>(/wallets/transfer//confirm?, { method: 'POST' }, true);
  },'''
replacement4 = '''  confirmTransfer: (transactionId: string, pin: string, otp?: string) => {
    const params = new URLSearchParams();
    if (pin) params.append('pin', pin);
    if (otp) params.append('otp', otp);
    return request<TransferResponse>(/wallets/transfer//confirm?, { method: 'POST' }, true);
  },'''
content = content.replace(target4, replacement4)

# 5. Fix registerFcmToken
target5 = '''  registerFcmToken: (deviceId: string, token: string) =>
    request<void>(/sessions//fcm, {
      method: 'POST',
      body: JSON.stringify({ token }),
    }),'''
replacement5 = '''  registerFcmToken: (deviceId: string, token: string) =>
    request<void>(/sessions//fcm?fcmToken=, {
      method: 'POST',
    }),'''
content = content.replace(target5, replacement5)

# 6. Fix getRecipientInfo and getBanks
target6 = '''    return request<{ walletId: string; phoneNumber: string; maskedName: string }>(
      /wallets/recipient-info?
    );
  },'''
replacement6 = '''    return request<{ walletId: string; phoneNumber: string; maskedName: string; fullName?: string; recipientName?: string }>(
      /wallets/recipient-info?
    );
  },

  getBanks: () =>
    request<any[]>('/banks'),'''
content = content.replace(target6, replacement6)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("done")

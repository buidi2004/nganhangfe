const fs = require('fs');
let code = fs.readFileSync('src/services/api.ts', 'utf-8');

// 1. Add TransferResponse
let target1 = `interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
  errorCode?: string;
}`;

let replacement1 = target1 + `

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
}`;
code = code.replace(target1, replacement1);

// 2. Fix register
let target2 = `  register: (phoneNumber: string, password: string) =>
    request<{ userId: string; accessToken: string; refreshToken: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber, password }),
    }),`;
let replacement2 = `  register: (phoneNumber: string, password: string, fullName: string) =>
    request<{ userId: string; accessToken: string; refreshToken: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber, password, fullName }),
    }),`;
code = code.replace(target2, replacement2);

// 3. Fix initTransfer
let target3 = `  initTransfer: (sourceWalletId: string, targetWalletId: string, amount: number, note?: string, currency = 'VND') =>
    request<{ transactionId: string; status: string; requiresConfirmation: boolean }>(
      '/wallets/transfer/init',
      { method: 'POST', body: JSON.stringify({ requestId: generateUUID(), sourceWalletId, targetWalletId, amount, currency, note }) },
      true
    ),`;
let replacement3 = `  initTransfer: (sourceWalletId: string, targetWalletId: string, bankCode: string, amount: number, note?: string, currency = 'VND') =>
    request<TransferResponse>(
      '/wallets/transfer/init',
      { method: 'POST', body: JSON.stringify({ requestId: generateUUID(), sourceWalletId, targetWalletId, amount, currency, bankCode, note }) },
      true
    ),`;
code = code.replace(target3, replacement3);

// 4. Fix confirmTransfer
let target4 = `  confirmTransfer: (transactionId: string, pin: string, otp: string) => {
    const params = new URLSearchParams();
    if (pin) params.append('pin', pin);
    if (otp) params.append('otp', otp);
    return request<{ transactionId: string; status: string }>(\`/wallets/transfer/\${transactionId}/confirm?\${params.toString()}\`, { method: 'POST' }, true);
  },`;
let replacement4 = `  confirmTransfer: (transactionId: string, pin: string, otp?: string) => {
    const params = new URLSearchParams();
    if (pin) params.append('pin', pin);
    if (otp) params.append('otp', otp);
    return request<TransferResponse>(\`/wallets/transfer/\${transactionId}/confirm?\${params.toString()}\`, { method: 'POST' }, true);
  },`;
code = code.replace(target4, replacement4);

// 5. Fix registerFcmToken
let target5 = `  registerFcmToken: (deviceId: string, token: string) =>
    request<void>(\`/sessions/\${deviceId}/fcm\`, {
      method: 'POST',
      body: JSON.stringify({ token }),
    }),`;
let replacement5 = `  registerFcmToken: (deviceId: string, token: string) =>
    request<void>(\`/sessions/\${deviceId}/fcm?fcmToken=\${encodeURIComponent(token)}\`, {
      method: 'POST',
    }),`;
code = code.replace(target5, replacement5);

// 6. Fix getRecipientInfo and getBanks
let target6 = `    return request<{ walletId: string; phoneNumber: string; maskedName: string }>(
      \`/wallets/recipient-info?\${params.toString()}\`
    );
  },`;
let replacement6 = `    return request<{ walletId: string; phoneNumber: string; maskedName: string; fullName?: string; recipientName?: string }>(
      \`/wallets/recipient-info?\${params.toString()}\`
    );
  },

  getBanks: () =>
    request<any[]>('/banks'),`;
code = code.replace(target6, replacement6);

fs.writeFileSync('src/services/api.ts', code);
console.log('Fixed API.ts completely');

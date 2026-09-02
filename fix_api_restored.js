const fs = require('fs');
let code = fs.readFileSync('src/services/api.ts', 'utf-8');

// 1. Add TransferResponse
if (!code.includes('export interface TransferResponse')) {
  code = code.replace(
    'async function request<T>(',
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
}

async function request<T>(
  );
}

// 2. Fix register
code = code.replace(
  /register: \(phoneNumber: string, password: string\) =>\s*request<{ userId: string; accessToken: string; refreshToken: string }>\('\/auth\/register', {\s*method: 'POST',\s*body: JSON.stringify\({ phoneNumber, password }\),\s*}\)/,
  \egister: (phoneNumber: string, password: string, fullName: string) =>
    request<{ userId: string; accessToken: string; refreshToken: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber, password, fullName }),
    })\
);

// 3. Fix initTransfer
code = code.replace(
  /initTransfer: \(sourceWalletId: string, targetWalletId: string, amount: number, note\?: string, currency = 'VND'\) =>\s*request<{ transactionId: string; status: string; requiresConfirmation: boolean }>\(\s*'\/wallets\/transfer\/init',\s*{ method: 'POST', body: JSON.stringify\({ requestId: generateUUID\(\), sourceWalletId, targetWalletId, amount, currency, note }\) },\s*true\s*\)/,
  \initTransfer: (sourceWalletId: string, targetWalletId: string, bankCode: string, amount: number, note?: string, currency = 'VND') =>
    request<TransferResponse>(
      '/wallets/transfer/init',
      { method: 'POST', body: JSON.stringify({ requestId: generateUUID(), sourceWalletId, targetWalletId, amount, currency, bankCode, note }) },
      true
    )\
);

// 4. Fix confirmTransfer
code = code.replace(
  /confirmTransfer: \(transactionId: string, pin: string, otp: string\) => {\s*const params = new URLSearchParams\(\);\s*if \(pin\) params\.append\('pin', pin\);\s*if \(otp\) params\.append\('otp', otp\);\s*return request<{ transactionId: string; status: string }>\(\s*\\/confirm\?\\s*,\s*{ method: 'POST' },\s*true\s*\);\s*}/,
  \confirmTransfer: (transactionId: string, pin: string, otp?: string) => {
    const params = new URLSearchParams();
    if (pin) params.append('pin', pin);
    if (otp) params.append('otp', otp);
    return request<TransferResponse>(\/wallets/transfer/\/confirm?\\, { method: 'POST' }, true);
  }\
);

// 5. Fix registerFcmToken
code = code.replace(
  /registerFcmToken: \(deviceId: string, token: string\) =>\s*request<void>\(\s*\\/fcm\s*,\s*{\s*method: 'POST',\s*body: JSON.stringify\({ token }\),\s*}\)/,
  \egisterFcmToken: (deviceId: string, token: string) =>
    request<void>(\/sessions/\/fcm?fcmToken=\\, {
      method: 'POST',
    })\
);

fs.writeFileSync('src/services/api.ts', code);
console.log('Fixed API.ts');

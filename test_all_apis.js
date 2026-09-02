const http = require('http');

const BASE_HOST = '203.145.46.200';
const BASE_PORT = 8080;
const BASE_PATH = '/api/v1';

const results = [];
let authToken = null;
let refreshToken = null;
let testUserId = null;
let testWalletId = null;
let testTransactionId = null;
let testBankAccountId = null;
let testMoneyRequestId = null;
let testBeneficiaryId = null;
let testFundingSourceId = null;

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function makeRequest(method, path, body = null, extraHeaders = {}, requireIdempotency = false) {
  return new Promise((resolve) => {
    const headers = {
      'Accept': 'application/json',
      ...extraHeaders,
    };

    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    if (requireIdempotency && !headers['Idempotency-Key']) {
      headers['Idempotency-Key'] = uuid();
    }

    let bodyStr = null;
    if (body !== null) {
      bodyStr = typeof body === 'string' ? body : JSON.stringify(body);
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = Buffer.byteLength(bodyStr);
    }

    const options = {
      hostname: BASE_HOST,
      port: BASE_PORT,
      path: `${BASE_PATH}${path}`,
      method,
      headers,
      timeout: 15000,
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = data ? JSON.parse(data) : null;
        } catch (e) {
          parsed = { raw: data.substring(0, 200) };
        }
        resolve({
          statusCode: res.statusCode,
          body: parsed,
          raw: data,
        });
      });
    });

    req.on('error', (e) => {
      resolve({
        statusCode: 0,
        body: null,
        error: e.message,
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        statusCode: 0,
        body: null,
        error: 'Timeout',
      });
    });

    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

function logResult(name, method, path, result, note = '') {
  const isError = result.statusCode >= 400 || result.statusCode === 0;
  const isBad = result.statusCode === 400 || result.statusCode === 500 || result.statusCode === 0;
  results.push({
    name,
    method,
    path,
    status: result.statusCode,
    isBad,
    isError,
    note,
    errorCode: result.body?.errorCode || null,
    message: result.body?.message || result.error || '',
  });

  const icon = isBad ? '❌' : (isError ? '⚠️' : '✅');
  const statusStr = result.statusCode === 0 ? 'ERR' : result.statusCode;
  console.log(`${icon} [${statusStr}] ${method.padEnd(6)} ${path.padEnd(55)} ${name}`);
  if (isBad && result.body?.message) {
    console.log(`     Message: ${result.body.message}`);
    if (result.body.errorCode) console.log(`     ErrorCode: ${result.body.errorCode}`);
  }
}

async function testPublicEndpoints() {
  console.log('\n========== PUBLIC ENDPOINTS (no auth) ==========\n');

  let r;

  // 12. BANKS - GET / (public)
  r = await makeRequest('GET', '/banks');
  logResult('List Banks', 'GET', '/banks', r, 'Public - should work');

  // 16. LEGAL - GET /legal/terms (public)
  r = await makeRequest('GET', '/legal/terms');
  logResult('Get Legal Terms', 'GET', '/legal/terms', r, 'Public');

  // 17. SUPPORT FAQ - GET /support/faq (public)
  r = await makeRequest('GET', '/support/faq');
  logResult('Get FAQ', 'GET', '/support/faq', r, 'Public');

  // 18. PROMOTIONS - GET /promotions (public)
  r = await makeRequest('GET', '/promotions');
  logResult('List Promotions', 'GET', '/promotions', r, 'Public');

  // 14. BILLS lookup - GET /bills/lookup (public)
  r = await makeRequest('GET', '/bills/lookup?type=ELECTRICITY&customerCode=TEST001');
  logResult('Lookup Bill', 'GET', '/bills/lookup?type=ELECTRICITY&customerCode=TEST001', r, 'Public');

  // 1. AUTH register - POST /auth/register
  const testPhone = '09' + Math.floor(10000000 + Math.random() * 89999999);
  const registerBody = {
    phoneNumber: testPhone,
    fullName: 'TEST USER AUTOMATION',
    password: 'password123',
    deviceId: 'test-device-001',
  };
  r = await makeRequest('POST', '/auth/register', registerBody);
  logResult('Register User', 'POST', '/auth/register', r, `phone=${testPhone}`);
  if (r.body?.data?.userId) testUserId = r.body.data.userId;

  // 1. AUTH login - POST /auth/login
  const loginBody = {
    phoneNumber: registerBody.phoneNumber,
    password: registerBody.password,
    deviceId: 'test-device-001',
  };
  r = await makeRequest('POST', '/auth/login', loginBody);
  logResult('Login', 'POST', '/auth/login', r);
  if (r.body?.data?.accessToken) {
    authToken = r.body.data.accessToken;
    refreshToken = r.body.data.refreshToken;
    if (!testUserId) testUserId = r.body.data.userId;
  }
  console.log(`     -> Got userId: ${testUserId}`);
  console.log(`     -> Got accessToken: ${authToken ? 'YES' : 'NO'}`);

  // 1. AUTH OTP send - POST /auth/otp/send
  r = await makeRequest('POST', `/auth/otp/send?phoneNumber=${registerBody.phoneNumber}`);
  logResult('Send OTP', 'POST', `/auth/otp/send?phoneNumber=xxx`, r, 'Rate limited 3/min');

  // 1. AUTH forgot-password - POST /auth/forgot-password
  r = await makeRequest('POST', `/auth/forgot-password?phoneNumber=${registerBody.phoneNumber}`);
  logResult('Forgot Password', 'POST', `/auth/forgot-password?phoneNumber=xxx`, r, 'Rate limited 3/min');

  // 5. ACCOUNT reset password - POST /account/password/reset (public)
  r = await makeRequest('POST', `/account/password/reset?phoneNumber=${registerBody.phoneNumber}&otp=000000&newPassword=newpass123`);
  logResult('Reset Password (wrong OTP)', 'POST', '/account/password/reset', r, 'Expected: OTP wrong');

  // 20. WEBHOOKS - napas callback
  r = await makeRequest('POST', '/webhooks/napas/callback', { test: 'payload' });
  logResult('Webhook Napas Callback', 'POST', '/webhooks/napas/callback', r, 'Public webhook');

  // 20. WEBHOOKS - bank deposit notify
  r = await makeRequest('POST', '/webhooks/bank/deposit-notify?walletId=fake-wallet-id&amount=100000&bankTxRef=TEST123');
  logResult('Webhook Bank Deposit Notify', 'POST', '/webhooks/bank/deposit-notify', r, 'Public webhook');

  // 20. WEBHOOKS - merchants callback
  r = await makeRequest('POST', '/webhooks/merchants/callback', { test: 'payload' });
  logResult('Webhook Merchants Callback', 'POST', '/webhooks/merchants/callback', r, 'Public webhook');
}

async function testAuthEndpoints() {
  console.log('\n========== AUTH ENDPOINTS ==========\n');
  if (!authToken) {
    console.log('SKIP - no auth token available');
    return;
  }
  let r;

  // 1. AUTH OTP verify - POST /auth/otp/verify
  r = await makeRequest('POST', '/auth/otp/verify?phoneNumber=0900000000&otp=000000');
  logResult('Verify OTP (wrong)', 'POST', '/auth/otp/verify', r, 'Wrong OTP test');

  // 1. AUTH reset password - POST /auth/reset-password
  r = await makeRequest('POST', '/auth/reset-password?phoneNumber=0900000000&otp=000000&newPassword=newpass123');
  logResult('Reset Password via Auth (wrong OTP)', 'POST', '/auth/reset-password', r, 'Wrong OTP test');

  // 1. AUTH refresh - POST /auth/refresh
  if (refreshToken) {
    r = await makeRequest('POST', `/auth/refresh?refreshToken=${encodeURIComponent(refreshToken)}`);
    logResult('Refresh Token', 'POST', '/auth/refresh', r);
  }

  // 1. AUTH logout - POST /auth/logout
  // Not calling to keep token valid for other tests
  // r = await makeRequest('POST', '/auth/logout');
  // logResult('Logout', 'POST', '/auth/logout', r);
}

async function testWalletEndpoints() {
  console.log('\n========== WALLET ENDPOINTS ==========\n');
  if (!authToken) {
    console.log('SKIP - no auth token available');
    return;
  }
  let r;

  // 2. WALLET create - POST /wallets/
  if (testUserId) {
    r = await makeRequest('POST', '/wallets', { ownerId: testUserId, currency: 'VND' });
    logResult('Create Wallet', 'POST', '/wallets', r);
    if (r.body?.data?.id) testWalletId = r.body.data.id;
  }

  // 2. WALLET get by id - GET /wallets/{walletId}
  if (testWalletId) {
    r = await makeRequest('GET', `/wallets/${testWalletId}`);
    logResult('Get Wallet By Id', 'GET', `/wallets/{id}`, r);
  } else {
    r = await makeRequest('GET', '/wallets/00000000-0000-0000-0000-000000000000');
    logResult('Get Wallet By Id (not found)', 'GET', '/wallets/{id}', r, 'Expected: WALLET_NOT_FOUND');
  }

  // 2. WALLET recipient-info by phone
  r = await makeRequest('GET', '/wallets/recipient-info?phoneNumber=0900000000');
  logResult('Get Recipient Info by Phone', 'GET', '/wallets/recipient-info?phoneNumber=xxx', r);

  // 2. WALLET recipient-info by walletId
  if (testWalletId) {
    r = await makeRequest('GET', `/wallets/recipient-info?walletId=${testWalletId}`);
    logResult('Get Recipient Info by WalletId', 'GET', '/wallets/recipient-info?walletId=xxx', r);
  }

  // 2. WALLET estimate fees
  r = await makeRequest('GET', '/wallets/fees/estimate?type=TRANSFER&amount=500000&currency=VND');
  logResult('Estimate Fees TRANSFER', 'GET', '/wallets/fees/estimate?type=TRANSFER&amount=500000', r);

  r = await makeRequest('GET', '/wallets/fees/estimate?type=WITHDRAWAL&amount=1000000&currency=VND');
  logResult('Estimate Fees WITHDRAWAL', 'GET', '/wallets/fees/estimate?type=WITHDRAWAL&amount=1M', r);

  r = await makeRequest('GET', '/wallets/fees/estimate?type=TOPUP&amount=100000&currency=VND');
  logResult('Estimate Fees TOPUP', 'GET', '/wallets/fees/estimate?type=TOPUP&amount=100k', r);

  // 2. WALLET deposit
  if (testWalletId) {
    r = await makeRequest(
      'POST', '/wallets/deposit',
      { requestId: uuid(), walletId: testWalletId, amount: 5000000, currency: 'VND' },
      {}, true
    );
    logResult('Deposit', 'POST', '/wallets/deposit', r, '+5M VND');
  }

  // 2. WALLET transfer init + confirm (internal, to self wallet for test)
  if (testWalletId) {
    r = await makeRequest(
      'POST', '/wallets/transfer/init',
      {
        requestId: uuid(),
        sourceWalletId: testWalletId,
        targetWalletId: testWalletId,
        amount: 100000,
        currency: 'VND',
        bankCode: 'SENHONG',
        note: 'Test transfer auto',
      },
      {}, true
    );
    logResult('Init Transfer', 'POST', '/wallets/transfer/init', r, 'OTP auto-generated');
    const txId = r.body?.data?.transactionId;

    if (txId) {
      testTransactionId = txId;
      r = await makeRequest('POST', `/wallets/transfer/${txId}/confirm?otp=123456`);
      logResult('Confirm Transfer (OTP=123456)', 'POST', '/wallets/transfer/{id}/confirm', r);
      if (!r.body?.success || r.body?.errorCode === 'INVALID_PIN') {
        r = await makeRequest('POST', `/wallets/transfer/${txId}/confirm?pin=123456`);
        logResult('Confirm Transfer (PIN=123456 fallback)', 'POST', '/wallets/transfer/{id}/confirm', r);
      }
    }
  }

  // 2. WALLET QR transfer init
  if (testWalletId) {
    r = await makeRequest(
      'POST', '/wallets/transfer/qr/init',
      {
        requestId: uuid(),
        sourceWalletId: testWalletId,
        qrCode: '00020101021238550010A00000072701320006970423011309000000000000208QRIBFTTA5204581253037045405100005802VN62190815Napas QR Demo6304ABCD',
        amount: 50000,
        currency: 'VND',
      },
      {}, true
    );
    logResult('QR Transfer Init', 'POST', '/wallets/transfer/qr/init', r);
  }

  // 2. WALLET withdraw (need bankAccountId + pinToken - will fail gracefully)
  if (testWalletId) {
    r = await makeRequest(
      'POST', '/wallets/withdraw',
      {
        requestId: uuid(),
        walletId: testWalletId,
        bankAccountId: '00000000-0000-0000-0000-000000000000',
        amount: 100000,
        currency: 'VND',
        pinToken: 'fake-pin-token',
      },
      {}, true
    );
    logResult('Withdraw (fake pin)', 'POST', '/wallets/withdraw', r, 'Expected: invalid pin');
  }
}

async function testTransactionEndpoints() {
  console.log('\n========== TRANSACTION ENDPOINTS ==========\n');
  if (!authToken) {
    console.log('SKIP - no auth token available');
    return;
  }
  let r;

  // 3. TRANSACTIONS history
  if (testWalletId) {
    r = await makeRequest('GET', `/transactions?walletId=${testWalletId}&page=0&size=20`);
    logResult('Get Transaction History', 'GET', '/transactions?walletId=...', r);

    r = await makeRequest('GET', `/transactions?walletId=${testWalletId}&type=TRANSFER&page=0&size=20`);
    logResult('Get History (filter TRANSFER)', 'GET', '/transactions?type=TRANSFER', r);

    r = await makeRequest('GET', `/transactions?walletId=${testWalletId}&type=DEPOSIT&page=0&size=20`);
    logResult('Get History (filter DEPOSIT)', 'GET', '/transactions?type=DEPOSIT', r);
  }

  // 3. TRANSACTIONS by id
  if (testTransactionId) {
    r = await makeRequest('GET', `/transactions/${testTransactionId}`);
    logResult('Get Transaction By Id', 'GET', '/transactions/{id}', r);

    // 3. Export CSV / PDF / Excel
    r = await makeRequest('GET', `/transactions/export/csv?walletId=${testWalletId}`);
    logResult('Export CSV', 'GET', '/transactions/export/csv', r);

    r = await makeRequest('GET', `/transactions/export/pdf?walletId=${testWalletId}`);
    logResult('Export PDF', 'GET', '/transactions/export/pdf', r);

    r = await makeRequest('GET', `/transactions/export/excel?walletId=${testWalletId}`);
    logResult('Export Excel', 'GET', '/transactions/export/excel', r);

    r = await makeRequest('GET', `/transactions/${testTransactionId}/receipt.pdf`);
    logResult('Get Receipt PDF', 'GET', '/transactions/{id}/receipt.pdf', r);
  }
}

async function testUserEndpoints() {
  console.log('\n========== USER & PROFILE ENDPOINTS ==========\n');
  if (!authToken) {
    console.log('SKIP - no auth token available');
    return;
  }
  let r;

  // 4. USERS me - GET
  r = await makeRequest('GET', '/users/me');
  logResult('Get My Profile', 'GET', '/users/me', r);

  // 4. USERS me - PUT (update)
  r = await makeRequest('PUT', '/users/me?fullName=Updated%20Name&email=test%40test.com&dob=1990-01-01');
  logResult('Update Profile (RequestParam)', 'PUT', '/users/me?fullName=...', r, '@RequestParam NOT body');

  // 4. USERS me avatar
  r = await makeRequest('POST', '/users/me/avatar?avatarUrl=https%3A%2F%2Fexample.com%2Favatar.png');
  logResult('Update Avatar', 'POST', '/users/me/avatar', r);

  // 4. USERS public info
  if (testUserId) {
    r = await makeRequest('GET', `/users/${testUserId}/public-info`);
    logResult('Get User Public Info', 'GET', '/users/{id}/public-info', r);
  }

  // 4. USERS search by phone
  r = await makeRequest('GET', '/users/search?phone=0900000000');
  logResult('Search User by Phone (not found)', 'GET', '/users/search?phone=xxx', r);

  // 4. USERS pin set
  r = await makeRequest('POST', '/users/pin/set', { pin: '123456' });
  logResult('Set PIN', 'POST', '/users/pin/set', r, '6 digits');

  // 4. USERS pin verify
  r = await makeRequest('POST', '/users/pin/verify', { pin: '123456' });
  logResult('Verify PIN', 'POST', '/users/pin/verify', r, 'Should return pinToken');
  const pinToken = r.body?.data;

  // 4. USERS KYC submit
  r = await makeRequest('POST', '/users/kyc', {
    idCardNumber: '012345678901',
    fullName: 'TEST USER AUTOMATION',
    dob: '1990-01-01',
    frontCardUrl: 'https://example.com/front.jpg',
    backCardUrl: 'https://example.com/back.jpg',
    selfieUrl: 'https://example.com/selfie.jpg',
  });
  logResult('Submit KYC', 'POST', '/users/kyc', r);

  // 4. USERS KYC status
  r = await makeRequest('GET', '/users/kyc/status');
  logResult('Get KYC Status', 'GET', '/users/kyc/status', r);

  // 4. USERS change password
  r = await makeRequest('POST', '/users/change-password?oldPassword=password123&newPassword=newpass123');
  logResult('Change Password via users', 'POST', '/users/change-password', r, '@RequestParam');

  // 4. USERS me qrcode
  r = await makeRequest('GET', '/users/me/qrcode');
  logResult('Get My QR Code', 'GET', '/users/me/qrcode', r, 'EMVCo QR string');
}

async function testAccountEndpoints() {
  console.log('\n========== ACCOUNT ENDPOINTS ==========\n');
  if (!authToken) {
    console.log('SKIP - no auth token available');
    return;
  }
  let r;

  // 5. ACCOUNT change password - uses JSON BODY (not RequestParam!)
  r = await makeRequest('POST', '/account/password/change', {
    oldPassword: 'newpass123',
    newPassword: 'password123',
  });
  logResult('Change Password via Account', 'POST', '/account/password/change', r, 'JSON BODY!');

  // 5. ACCOUNT 2FA enable
  r = await makeRequest('POST', '/account/2fa/enable');
  logResult('Enable 2FA', 'POST', '/account/2fa/enable', r);

  // 5. ACCOUNT 2FA disable
  r = await makeRequest('POST', '/account/2fa/disable');
  logResult('Disable 2FA', 'POST', '/account/2fa/disable', r);
}

async function testSecurityEndpoints() {
  console.log('\n========== SECURITY ENDPOINTS ==========\n');
  if (!authToken) {
    console.log('SKIP - no auth token available');
    return;
  }
  let r;

  // 6. SECURITY biometric register
  r = await makeRequest('POST', '/security/biometric/register?biometricToken=test-bio-token-123');
  logResult('Register Biometric', 'POST', '/security/biometric/register', r);

  // 6. SECURITY biometric verify
  r = await makeRequest('POST', '/security/biometric/verify?biometricToken=test-bio-token-123');
  logResult('Verify Biometric', 'POST', '/security/biometric/verify', r, 'Returns pinToken');

  // 6. SECURITY login history
  r = await makeRequest('GET', '/security/login-history');
  logResult('Get Login History', 'GET', '/security/login-history', r);
}

async function testSessionEndpoints() {
  console.log('\n========== SESSIONS ENDPOINTS ==========\n');
  if (!authToken) {
    console.log('SKIP - no auth token available');
    return;
  }
  let r;

  // 7. SESSIONS list
  r = await makeRequest('GET', '/sessions');
  logResult('List Sessions', 'GET', '/sessions', r);

  // 7. SESSIONS register FCM
  r = await makeRequest('POST', '/sessions/test-device-001/fcm?fcmToken=fake-fcm-token-123');
  logResult('Register FCM Token', 'POST', '/sessions/{deviceId}/fcm', r);

  // NOTE: Not calling DELETE endpoints to keep session alive
}

async function testNotificationEndpoints() {
  console.log('\n========== NOTIFICATIONS ENDPOINTS ==========\n');
  if (!authToken) {
    console.log('SKIP - no auth token available');
    return;
  }
  let r;

  // 8. NOTIFICATIONS list
  r = await makeRequest('GET', '/notifications?page=0&size=20');
  logResult('List Notifications', 'GET', '/notifications?page=0&size=20', r);

  r = await makeRequest('GET', '/notifications?type=BALANCE&page=0&size=20');
  logResult('List Notifs type=BALANCE', 'GET', '/notifications?type=BALANCE', r);

  r = await makeRequest('GET', '/notifications?type=PROMOTION&page=0&size=20');
  logResult('List Notifs type=PROMOTION', 'GET', '/notifications?type=PROMOTION', r);

  r = await makeRequest('GET', '/notifications?type=SYSTEM&page=0&size=20');
  logResult('List Notifs type=SYSTEM', 'GET', '/notifications?type=SYSTEM', r);

  // 8. NOTIFICATIONS read-all
  r = await makeRequest('PATCH', '/notifications/read-all');
  logResult('Mark All Read', 'PATCH', '/notifications/read-all', r);

  r = await makeRequest('PATCH', '/notifications/read-all?type=BALANCE');
  logResult('Mark All Read (type=BALANCE)', 'PATCH', '/notifications/read-all?type=...', r);

  // 8. NOTIFICATIONS settings
  r = await makeRequest('PUT', '/notifications/settings?transactionEnabled=true&promoEnabled=true');
  logResult('Update Notif Settings', 'PUT', '/notifications/settings', r);
}

async function testBankAccounts() {
  console.log('\n========== BANK ACCOUNTS ENDPOINTS ==========\n');
  if (!authToken) {
    console.log('SKIP - no auth token available');
    return;
  }
  let r;

  // 9. BANK ACCOUNTS list
  r = await makeRequest('GET', '/bank-accounts');
  logResult('List Bank Accounts', 'GET', '/bank-accounts', r);

  // 9. BANK ACCOUNTS link
  r = await makeRequest('POST', '/bank-accounts/link', {
    bankCode: 'VCB',
    accountNumber: '0123456789',
    accountHolderName: 'TEST USER AUTOMATION',
  });
  logResult('Link Bank Account VCB', 'POST', '/bank-accounts/link', r, '201 Created');
  if (r.body?.data?.id) testBankAccountId = r.body.data.id;

  // NOTE: not calling DELETE for cleanup reasons
}

async function testFundingSources() {
  console.log('\n========== FUNDING SOURCES ENDPOINTS ==========\n');
  if (!authToken) {
    console.log('SKIP - no auth token available');
    return;
  }
  let r;

  // 10. FUNDING SOURCES list
  r = await makeRequest('GET', '/funding-sources');
  logResult('List Funding Sources', 'GET', '/funding-sources', r);

  // 10. FUNDING SOURCES link
  r = await makeRequest('POST', '/funding-sources/link', {
    type: 'BANK_ACCOUNT',
    provider: 'VCB',
    number: '0123456789',
    cardHolderName: 'TEST USER',
  });
  logResult('Link Funding Source BANK', 'POST', '/funding-sources/link', r);
  if (r.body?.data?.id) testFundingSourceId = r.body.data.id;

  r = await makeRequest('POST', '/funding-sources/link', {
    type: 'CREDIT_CARD',
    provider: 'VISA',
    number: '4111111111111111',
    cardHolderName: 'TEST USER',
    expiryDate: '12/28',
    cvv: '123',
  });
  logResult('Link Funding Source CREDIT_CARD', 'POST', '/funding-sources/link', r);
}

async function testBeneficiaries() {
  console.log('\n========== BENEFICIARIES ENDPOINTS ==========\n');
  if (!authToken) {
    console.log('SKIP - no auth token available');
    return;
  }
  let r;

  // 11. BENEFICIARIES list
  r = await makeRequest('GET', '/beneficiaries');
  logResult('List Beneficiaries', 'GET', '/beneficiaries', r);

  // 11. BENEFICIARIES create
  const body = {
    beneficiaryWalletId: testWalletId || '00000000-0000-0000-0000-000000000000',
    nickname: 'Test Beneficiary',
    bankCode: 'SENHONG',
    accountNumber: '0900000000',
  };
  // walletId OR bankCode+accountNumber should be sufficient
  r = await makeRequest('POST', '/beneficiaries', body);
  logResult('Create Beneficiary', 'POST', '/beneficiaries', r, '201 Created');
  if (r.body?.data?.id) testBeneficiaryId = r.body.data.id;
}

async function testPayments() {
  console.log('\n========== PAYMENTS ENDPOINTS ==========\n');
  if (!authToken) {
    console.log('SKIP - no auth token available');
    return;
  }
  let r;

  // 13. PAYMENTS VietQR generate
  r = await makeRequest('POST', '/payments/vietqr/generate', {
    bankBin: '970423',
    accountNumber: '0900000000',
    amount: 100000,
    purpose: 'Test QR',
  });
  logResult('Generate VietQR', 'POST', '/payments/vietqr/generate', r);

  // 13. PAYMENTS VietQR decode
  r = await makeRequest('POST', '/payments/vietqr/decode?qrString=00020101021238550010A00000072701320006970423011309000000000000208QRIBFTTA5204581253037045405100005802VN62190815Napas%20QR%20Demo6304ABCD');
  logResult('Decode VietQR', 'POST', '/payments/vietqr/decode', r);

  // 13. PAYMENTS bills query
  r = await makeRequest('GET', '/payments/bills/query?billType=ELECTRICITY&customerCode=TEST001');
  logResult('Query Bill via payments', 'GET', '/payments/bills/query', r);

  // 13. PAYMENTS bills pay
  if (testWalletId) {
    r = await makeRequest(
      'POST', '/payments/bills/pay',
      {
        requestId: uuid(),
        walletId: testWalletId,
        billId: 'bill-test-001',
        amount: 200000,
        currency: 'VND',
      },
      {}, true
    );
    logResult('Pay Bill via payments', 'POST', '/payments/bills/pay', r);
  }

  // 13. PAYMENTS topup
  if (testWalletId) {
    r = await makeRequest(
      'POST', '/payments/topup',
      {
        requestId: uuid(),
        walletId: testWalletId,
        phoneNumber: '0900000000',
        amount: 100000,
        currency: 'VND',
      },
      {}, true
    );
    logResult('Topup Phone via payments', 'POST', '/payments/topup', r);
  }

  // 13. PAYMENTS QR scan
  r = await makeRequest('POST', '/payments/qr/scan?qrString=000201010212...');
  logResult('QR Scan Parse', 'POST', '/payments/qr/scan', r);
}

async function testBills() {
  console.log('\n========== BILLS ENDPOINTS (duplicate path) ==========\n');
  if (!authToken) {
    console.log('SKIP - no auth token available');
    return;
  }
  let r;

  // 14. BILLS pay (duplicate of /payments/bills/pay)
  if (testWalletId) {
    r = await makeRequest(
      'POST', '/bills/pay',
      {
        requestId: uuid(),
        walletId: testWalletId,
        billId: 'bill-test-002',
        amount: 300000,
        currency: 'VND',
      },
      {}, true
    );
    logResult('Pay Bill via /bills', 'POST', '/bills/pay', r);

    // 14. BILLS topup (duplicate of /payments/topup)
    r = await makeRequest(
      'POST', '/bills/topup',
      {
        requestId: uuid(),
        walletId: testWalletId,
        phoneNumber: '0900000001',
        amount: 50000,
        currency: 'VND',
      },
      {}, true
    );
    logResult('Topup Phone via /bills', 'POST', '/bills/topup', r);
  }
}

async function testMoneyRequests() {
  console.log('\n========== MONEY REQUESTS ENDPOINTS ==========\n');
  if (!authToken || !testUserId) {
    console.log('SKIP - no auth token / userId');
    return;
  }
  let r;

  // 15. MONEY REQUESTS create - use self as payer for test
  r = await makeRequest('POST', '/money-requests', {
    payerUserId: testUserId,
    amount: 200000,
    currency: 'VND',
    message: 'Test money request auto',
  });
  logResult('Create Money Request', 'POST', '/money-requests', r, '201 Created');
  if (r.body?.data?.id) testMoneyRequestId = r.body.data.id;

  // 15. MONEY REQUESTS received
  r = await makeRequest('GET', '/money-requests/received');
  logResult('List Received Requests', 'GET', '/money-requests/received', r);

  // 15. MONEY REQUESTS sent
  r = await makeRequest('GET', '/money-requests/sent');
  logResult('List Sent Requests', 'GET', '/money-requests/sent', r);

  // 15. MONEY REQUESTS detail
  if (testMoneyRequestId) {
    r = await makeRequest('GET', `/money-requests/${testMoneyRequestId}`);
    logResult('Get Money Request Detail', 'GET', '/money-requests/{id}', r);

    // 15. MONEY REQUESTS actions
    r = await makeRequest('POST', `/money-requests/${testMoneyRequestId}/reject`);
    logResult('Reject Money Request', 'POST', '/money-requests/{id}/reject', r);
  }
}

async function testConfigAndLegal() {
  console.log('\n========== CONFIG & LEGAL ENDPOINTS ==========\n');
  if (!authToken) {
    console.log('SKIP - no auth token available');
    return;
  }
  let r;

  // 16. CONFIG limits
  r = await makeRequest('GET', '/config/limits');
  logResult('Get Static Limits Config', 'GET', '/config/limits', r);

  // 16. CONFIG limits status
  r = await makeRequest('GET', '/config/limits/status');
  logResult('Get User Limit Status', 'GET', '/config/limits/status', r, 'Actual spent');

  // 16. LEGAL consent
  r = await makeRequest('POST', '/legal/consent?termsVersion=1.0.0');
  logResult('Consent to Terms', 'POST', '/legal/consent', r);
}

async function testSupport() {
  console.log('\n========== SUPPORT ENDPOINTS ==========\n');
  if (!authToken) {
    console.log('SKIP - no auth token available');
    return;
  }
  let r;
  let ticketId = null;

  // 17. SUPPORT create ticket
  r = await makeRequest('POST', '/support/tickets?subject=Test%20Ticket&category=GENERAL&initialMessage=Hello%20support%20auto');
  logResult('Create Support Ticket', 'POST', '/support/tickets', r, '201 Created');
  if (r.body?.data?.id) ticketId = r.body.data.id;

  // 17. SUPPORT list tickets
  r = await makeRequest('GET', '/support/tickets');
  logResult('List Support Tickets', 'GET', '/support/tickets', r);

  // 17. SUPPORT ticket detail + reply
  if (ticketId) {
    r = await makeRequest('GET', `/support/tickets/${ticketId}`);
    logResult('Get Ticket Detail', 'GET', '/support/tickets/{id}', r);

    r = await makeRequest('POST', `/support/tickets/${ticketId}/messages?content=Reply%20auto%20test`);
    logResult('Reply to Ticket', 'POST', '/support/tickets/{id}/messages', r);
  }
}

async function testMisc() {
  console.log('\n========== MISC ENDPOINTS (Promotions, Referrals, etc.) ==========\n');
  if (!authToken) {
    console.log('SKIP - no auth token available');
    return;
  }
  let r;

  // 18. PROMOTIONS
  r = await makeRequest('POST', '/promotions/redeem?code=PROMO2026');
  logResult('Redeem Promo Code', 'POST', '/promotions/redeem', r);

  r = await makeRequest('POST', '/promotions/apply?code=PROMO2026&orderAmount=1000000');
  logResult('Apply Promo Code', 'POST', '/promotions/apply', r);

  r = await makeRequest('GET', '/promotions/my-vouchers');
  logResult('Get My Vouchers', 'GET', '/promotions/my-vouchers', r);

  // 18. REFERRALS
  r = await makeRequest('GET', '/referrals/code');
  logResult('Get Referral Code', 'GET', '/referrals/code', r);

  r = await makeRequest('POST', '/referrals/apply?referralCode=REF123456');
  logResult('Apply Referral Code', 'POST', '/referrals/apply', r);

  r = await makeRequest('GET', '/referrals/history');
  logResult('Get Referral History', 'GET', '/referrals/history', r);

  // 18. FEEDBACK
  r = await makeRequest('POST', '/feedback?rating=5&comment=Great%20app%20auto%20test');
  logResult('Submit Feedback', 'POST', '/feedback', r);

  // 18. MERCHANTS confirm payment
  if (testWalletId) {
    r = await makeRequest('POST', `/merchants/payments/confirm?walletId=${testWalletId}&orderId=ORDER-TEST-001`);
    logResult('Confirm Merchant Payment', 'POST', '/merchants/payments/confirm', r);
  }

  // 1. AUTH logout/current (FINAL - keep token alive as long as possible)
  // Skipping to keep session valid
}

async function testLedgerAndAdmin() {
  console.log('\n========== LEDGER & RECONCILIATION (Admin) ==========\n');
  let r;

  // 19. LEDGER accounts create
  r = await makeRequest('POST', '/ledger/accounts', {
    accountName: 'Test Auto Account',
    accountType: 'ASSET',
    currency: 'VND',
  });
  logResult('Create Ledger Account', 'POST', '/ledger/accounts', r, 'Admin endpoint');

  // 19. LEDGER accounts list
  r = await makeRequest('GET', '/ledger/accounts');
  logResult('List Ledger Accounts', 'GET', '/ledger/accounts', r, 'Admin - may 403');

  // 19. LEDGER entries
  r = await makeRequest('GET', '/ledger/entries');
  logResult('List Ledger Entries', 'GET', '/ledger/entries', r, 'Admin - may 403');

  // 19. RECONCILIATION run
  r = await makeRequest('POST', '/reconciliation/run');
  logResult('Run Reconciliation', 'POST', '/reconciliation/run', r, 'Admin trigger');
}

async function testWalletReverseTransaction() {
  console.log('\n========== WALLET REVERSE (Admin/Support only) ==========\n');
  if (!authToken || !testTransactionId) {
    console.log('SKIP - no auth/txId');
    return;
  }
  let r;
  r = await makeRequest('POST', `/wallets/transactions/${testTransactionId}/reverse?reason=Test%20auto%20reverse`);
  logResult('Reverse Transaction', 'POST', '/wallets/transactions/{id}/reverse', r, 'Admin only - may 403');
}

function printSummary() {
  console.log('\n=============================================');
  console.log('             SUMMARY RESULTS');
  console.log('=============================================\n');

  const total = results.length;
  const passed = results.filter(r => !r.isError).length;
  const bad = results.filter(r => r.isBad).length;  // 400, 500, or connection error
  const otherErrors = results.filter(r => r.isError && !r.isBad).length;  // 401, 403, 404, 409, 422, etc.

  console.log(`Total endpoints tested: ${total}`);
  console.log(`✅  Success (2xx):       ${passed}`);
  console.log(`⚠️  Other errors (4xx):  ${otherErrors}`);
  console.log(`❌  BAD (400 / 500 / 0): ${bad}\n`);

  if (bad > 0) {
    console.log('============= ❌  BAD RESULTS (400, 500, connection) =============\n');
    results.filter(r => r.isBad).forEach(r => {
      console.log(`[${r.status === 0 ? 'CONN_ERR' : r.status}] ${r.method.padEnd(6)} ${r.path}`);
      console.log(`     Name: ${r.name}`);
      if (r.note) console.log(`     Note: ${r.note}`);
      if (r.errorCode) console.log(`     ErrorCode: ${r.errorCode}`);
      if (r.message) console.log(`     Message: ${r.message.substring(0, 150)}`);
      console.log('');
    });
  }

  if (otherErrors > 0) {
    console.log('============= ⚠️  OTHER 4xx (401, 403, 404, 409, 422...) =============\n');
    results.filter(r => r.isError && !r.isBad).forEach(r => {
      console.log(`[${r.status}] ${r.method.padEnd(6)} ${r.path}`);
      console.log(`     Name: ${r.name}`);
      if (r.note) console.log(`     Note: ${r.note}`);
      if (r.errorCode) console.log(`     ErrorCode: ${r.errorCode}`);
      if (r.message) console.log(`     Message: ${r.message.substring(0, 150)}`);
      console.log('');
    });
  }

  console.log('\n============= FINAL ANSWER ============');
  if (bad === 0) {
    console.log('✅ KHÔNG CÓ 400/500 ERROR NÀO TRONG TẤT CẢ CÁC API ENDPOINT!');
  } else {
    console.log(`❌ TỔNG CỘNG ${bad} ENDPOINT BỊ LỖI 400/500/CONNECTION:`);
    results.filter(r => r.isBad).forEach(r => {
      console.log(`   - [${r.status}] ${r.method} ${r.path} (${r.name})`);
    });
  }
}

async function main() {
  console.log('========================================');
  console.log('  API TEST SUITE - SEN HONG E-WALLET');
  console.log(`  Target: http://${BASE_HOST}:${BASE_PORT}${BASE_PATH}`);
  console.log('  Time: ' + new Date().toISOString());
  console.log('========================================');

  try {
    await testPublicEndpoints();
    await testAuthEndpoints();
    await testWalletEndpoints();
    await testTransactionEndpoints();
    await testUserEndpoints();
    await testAccountEndpoints();
    await testSecurityEndpoints();
    await testSessionEndpoints();
    await testNotificationEndpoints();
    await testBankAccounts();
    await testFundingSources();
    await testBeneficiaries();
    await testPayments();
    await testBills();
    await testMoneyRequests();
    await testConfigAndLegal();
    await testSupport();
    await testMisc();
    await testLedgerAndAdmin();
    await testWalletReverseTransaction();
  } catch (e) {
    console.error('FATAL ERROR IN TEST RUNNER:', e);
  }

  printSummary();
}

main();

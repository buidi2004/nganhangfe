const http = require('http');

const BASE_HOST = '203.145.46.200';
const BASE_PORT = 8080;
const BASE_PATH = '/api/v1';

const results = [];
let authToken = null;
let testPhone = '09' + Math.floor(10000000 + Math.random() * 89999999);
let testUserId = null;
let testWalletId = null;
let testPinToken = null;

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function makeRequest(method, path, body = null, extraHeaders = {}, requireIdempotency = false) {
  return new Promise((resolve) => {
    const headers = { 'Accept': 'application/json', ...extraHeaders };
    if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
    if (requireIdempotency && !headers['Idempotency-Key']) headers['Idempotency-Key'] = uuid();
    let bodyStr = null;
    if (body !== null) {
      bodyStr = typeof body === 'string' ? body : JSON.stringify(body);
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = Buffer.byteLength(bodyStr);
    }
    const options = { hostname: BASE_HOST, port: BASE_PORT, path: `${BASE_PATH}${path}`, method, headers, timeout: 15000 };
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        let parsed = null;
        try { parsed = data ? JSON.parse(data) : null; } catch (e) { parsed = { raw: data.substring(0, 300) }; }
        resolve({ statusCode: res.statusCode, body: parsed, raw: data });
      });
    });
    req.on('error', (e) => resolve({ statusCode: 0, body: null, error: e.message }));
    req.on('timeout', () => { req.destroy(); resolve({ statusCode: 0, body: null, error: 'Timeout' }); });
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

function bad(name, method, path, result) {
  const isBad = result.statusCode === 400 || result.statusCode === 500 || result.statusCode === 0;
  const realBad = isBad && !['wrong', 'expected', 'fake', 'invalid', 'not found', 'yourself'].some(k => name.toLowerCase().includes(k));
  results.push({
    name, method, path,
    status: result.statusCode,
    isBug: isBad,
    errorCode: result.body?.errorCode || null,
    message: result.body?.message || result.error || '',
  });
  const icon = result.statusCode === 500 ? '💥' : (result.statusCode === 400 ? '⚠️' : (result.statusCode >= 400 ? '🔒' : '✅'));
  const s = result.statusCode === 0 ? 'ERR' : result.statusCode;
  console.log(`${icon} [${s}] ${method.padEnd(6)} ${path.padEnd(60)} ${name}`);
  if ((result.statusCode === 400 || result.statusCode === 500) && result.body?.message) {
    console.log(`     └─> ${result.body.message}${result.body.errorCode ? ` [${result.body.errorCode}]` : ''}`);
  }
}

async function run() {
  console.log('====================================================================');
  console.log(' ROUND 2: DEEP TEST - Focus on wallet/transfer/bill flows + 500 bugs');
  console.log(` Test user: ${testPhone}`);
  console.log('====================================================================\n');
  let r;

  // ============= STEP 1: REGISTER + LOGIN =============
  console.log('--- STEP 1: Register & Login ---\n');
  r = await makeRequest('POST', '/auth/register', { phoneNumber: testPhone, fullName: 'TEST DEEP 2', password: 'password123', deviceId: 'deep-002' });
  bad('Register', 'POST', '/auth/register', r);

  r = await makeRequest('POST', '/auth/login', { phoneNumber: testPhone, password: 'password123', deviceId: 'deep-002' });
  bad('Login', 'POST', '/auth/login', r);
  authToken = r.body?.data?.accessToken;
  testUserId = r.body?.data?.userId;
  console.log(` userId: ${testUserId}`);

  // ============= STEP 2: GET WALLET ID (from me? or recipient-info using self phone) =============
  console.log('\n--- STEP 2: Discover walletId ---\n');
  r = await makeRequest('GET', `/wallets/recipient-info?phoneNumber=${testPhone}`);
  bad('Get self recipient-info for walletId', 'GET', '/wallets/recipient-info?phoneNumber=self', r);
  testWalletId = r.body?.data?.walletId;
  console.log(` walletId: ${testWalletId}`);

  if (!testWalletId) {
    // Try from users/me? maybe it has wallet info
    r = await makeRequest('GET', '/users/me');
    console.log(' /users/me payload:', JSON.stringify(r.body?.data).substring(0, 300));
  }

  if (!testWalletId) {
    console.log('\n  Could not discover walletId. Exiting wallet-dependent tests.\n');
  }

  // ============= STEP 3: WALLET CRITICAL FLOWS =============
  if (testWalletId) {
    console.log('\n--- STEP 3: Wallet Critical Flows ---\n');

    // 1. Get wallet
    r = await makeRequest('GET', `/wallets/${testWalletId}`);
    bad('Get My Wallet', 'GET', `/wallets/{id}`, r);

    // 2. Recipient info by walletId
    r = await makeRequest('GET', `/wallets/recipient-info?walletId=${testWalletId}`);
    bad('Get Recipient info by walletId', 'GET', '/wallets/recipient-info?walletId=', r);

    // 3. Deposit
    r = await makeRequest('POST', '/wallets/deposit', { requestId: uuid(), walletId: testWalletId, amount: 10000000, currency: 'VND' }, {}, true);
    bad('Deposit +10M', 'POST', '/wallets/deposit', r);

    // 4. Set PIN + get pinToken
    r = await makeRequest('POST', '/users/pin/set', { pin: '123456' });
    bad('Set PIN 123456', 'POST', '/users/pin/set', r);

    r = await makeRequest('POST', '/users/pin/verify', { pin: '123456' });
    bad('Verify PIN 123456 -> pinToken', 'POST', '/users/pin/verify', r);
    testPinToken = r.body?.data;

    // 5. Link bank account for withdraw
    r = await makeRequest('POST', '/bank-accounts/link', { bankCode: 'VCB', accountNumber: '0011002211', accountHolderName: 'TEST DEEP 2' });
    bad('Link Bank Account VCB', 'POST', '/bank-accounts/link', r);
    const bankAccId = r.body?.data?.id;
    console.log(` bankAccountId: ${bankAccId}`);
    const bankAccounts = r = await makeRequest('GET', '/bank-accounts');

    // 6. Withdraw
    if (testPinToken && (bankAccId || bankAccounts.body?.data?.[0]?.id)) {
      const bId = bankAccId || bankAccounts.body.data[0].id;
      r = await makeRequest('POST', '/wallets/withdraw', {
        requestId: uuid(), walletId: testWalletId, bankAccountId: bId, amount: 500000, currency: 'VND', pinToken: testPinToken,
      }, {}, true);
      bad('Withdraw 500k (has pinToken + bankAcc)', 'POST', '/wallets/withdraw', r);
    }

    // 7. Transfer INIT + CONFIRM (need 2 users, so use existing user from phone 2134569870 if that test user has wallet)
    // First, let's use the same registered phone (09xxxxxxx) for recipient:
    // Actually let's register a 2nd user for proper transfer testing
    const phone2 = '09' + Math.floor(10000000 + Math.random() * 89999999);
    console.log(`\n  Creating 2nd user for transfer: ${phone2}\n`);
    r = await makeRequest('POST', '/auth/register', { phoneNumber: phone2, fullName: 'RECIPIENT USER', password: 'password123', deviceId: 'deep-002-recv' });
    bad('Register 2nd user (recipient)', 'POST', '/auth/register', r);
    const user2Token = r.body?.data?.accessToken;

    r = await makeRequest('GET', `/wallets/recipient-info?phoneNumber=${phone2}`);
    bad('Get 2nd user walletId via recipient-info', 'GET', '/wallets/recipient-info?phoneNumber=user2', r);
    const wallet2Id = r.body?.data?.walletId;
    console.log(` wallet2Id: ${wallet2Id}`);

    // Deposit to user2 wallet as well so they have initial balance
    if (wallet2Id) {
      const origToken = authToken;
      authToken = user2Token;
      r = await makeRequest('POST', '/wallets/deposit', { requestId: uuid(), walletId: wallet2Id, amount: 2000000, currency: 'VND' }, {}, true);
      bad('Deposit +2M into recipient wallet (temporarily user2 token)', 'POST', '/wallets/deposit', r);
      authToken = origToken;
    }

    // Now transfer from user1 -> user2
    if (wallet2Id) {
      console.log('\n  --- Transfer flow user1 -> user2 ---\n');
      r = await makeRequest(
        'POST', '/wallets/transfer/init',
        {
          requestId: uuid(), sourceWalletId: testWalletId, targetWalletId: wallet2Id,
          amount: 300000, currency: 'VND', bankCode: 'SENHONG', note: 'Deep test transfer',
        }, {}, true
      );
      bad('Init Transfer 300k user1->user2', 'POST', '/wallets/transfer/init', r);
      const txId = r.body?.data?.transactionId;
      console.log(`   txId: ${txId}`);

      if (txId) {
        // Try OTP first (123456 mock)
        r = await makeRequest('POST', `/wallets/transfer/${txId}/confirm?otp=123456`);
        bad('Confirm Transfer (otp=123456)', 'POST', '/wallets/transfer/{id}/confirm', r);

        if (r.body?.errorCode === 'INVALID_PIN' || !r.body?.success) {
          // Try PIN instead
          r = await makeRequest('POST', `/wallets/transfer/${txId}/confirm?pin=123456`);
          bad('Confirm Transfer (pin=123456 fallback)', 'POST', '/wallets/transfer/{id}/confirm', r);
        }

        // 8. Transaction detail + history
        r = await makeRequest('GET', `/transactions/${txId}`);
        bad('Get Transaction Detail', 'GET', `/transactions/{id}`, r);
      }
    }

    // 9. Transaction history
    r = await makeRequest('GET', `/transactions?walletId=${testWalletId}&page=0&size=20`);
    bad('Get Transaction History', 'GET', '/transactions?walletId=...&page=0&size=20', r);

    r = await makeRequest('GET', `/transactions?walletId=${testWalletId}&type=TRANSFER&page=0&size=20`);
    bad('History filtered TRANSFER', 'GET', '/transactions?type=TRANSFER', r);

    r = await makeRequest('GET', `/transactions?walletId=${testWalletId}&type=DEPOSIT&page=0&size=20`);
    bad('History filtered DEPOSIT', 'GET', '/transactions?type=DEPOSIT', r);

    r = await makeRequest('GET', `/transactions?walletId=${testWalletId}&type=WITHDRAWAL&page=0&size=20`);
    bad('History filtered WITHDRAWAL', 'GET', '/transactions?type=WITHDRAWAL', r);

    // 10. Export endpoints (may return non-JSON but check 400/500)
    r = await makeRequest('GET', `/transactions/export/csv?walletId=${testWalletId}`);
    bad('Export CSV', 'GET', '/transactions/export/csv', r);
    r = await makeRequest('GET', `/transactions/export/pdf?walletId=${testWalletId}`);
    bad('Export PDF', 'GET', '/transactions/export/pdf', r);
    r = await makeRequest('GET', `/transactions/export/excel?walletId=${testWalletId}`);
    bad('Export Excel', 'GET', '/transactions/export/excel', r);

    // 11. Bills PAY / TOPUP (via both /bills and /payments)
    console.log('\n  --- Bills & Topup flows ---\n');
    r = await makeRequest(
      'POST', '/bills/pay',
      { requestId: uuid(), walletId: testWalletId, billId: 'BILL-ELEX-001', amount: 250000, currency: 'VND' },
      {}, true
    );
    bad('Pay Bill via /bills/pay', 'POST', '/bills/pay', r);

    r = await makeRequest(
      'POST', '/payments/bills/pay',
      { requestId: uuid(), walletId: testWalletId, billId: 'BILL-ELEX-002', amount: 350000, currency: 'VND' },
      {}, true
    );
    bad('Pay Bill via /payments/bills/pay (alt path)', 'POST', '/payments/bills/pay', r);

    r = await makeRequest(
      'POST', '/bills/topup',
      { requestId: uuid(), walletId: testWalletId, phoneNumber: testPhone, amount: 100000, currency: 'VND' },
      {}, true
    );
    bad('Topup Phone via /bills/topup', 'POST', '/bills/topup', r);

    r = await makeRequest(
      'POST', '/payments/topup',
      { requestId: uuid(), walletId: testWalletId, phoneNumber: testPhone, amount: 200000, currency: 'VND' },
      {}, true
    );
    bad('Topup Phone via /payments/topup (alt path)', 'POST', '/payments/topup', r);

    // 12. QR Transfer init
    r = await makeRequest(
      'POST', '/wallets/transfer/qr/init',
      {
        requestId: uuid(), sourceWalletId: testWalletId,
        qrCode: '00020101021238550010A000000727013200069704230113' + testPhone + '0208QRIBFTTA520458125303704540410005802VN6304DEAD',
        amount: 150000, currency: 'VND',
      }, {}, true
    );
    bad('QR Transfer Init (150k)', 'POST', '/wallets/transfer/qr/init', r);

    // 13. Merchant confirm payment
    r = await makeRequest('POST', `/merchants/payments/confirm?walletId=${testWalletId}&orderId=ORDER-DEEP-${uuid().substring(0, 8)}`);
    bad('Confirm Merchant Payment', 'POST', '/merchants/payments/confirm', r);
  }

  // ============= STEP 4: NOTIFICATIONS 500 ERROR DEEP DIVE =============
  console.log('\n--- STEP 4: Notifications 500 bug investigation ---\n');

  // First mark one as read to check endpoint works (using fake id)
  r = await makeRequest('PATCH', '/notifications/00000000-0000-0000-0000-000000000000/read');
  bad('Mark single notification read (fake id)', 'PATCH', '/notifications/{id}/read', r);

  // Now try read-all - this was 500 before, try with various scenarios
  // Maybe it needs notifications to exist? Let's read first, populate then try.
  // Actually let's just test directly because the error says INTERNAL_SERVER_ERROR
  r = await makeRequest('PATCH', '/notifications/read-all');
  bad('Mark ALL notifications read (NO TYPE)', 'PATCH', '/notifications/read-all', r);
  if (r.statusCode === 500) console.log('     └─> RAW BODY:', JSON.stringify(r.body).substring(0, 500));

  r = await makeRequest('PATCH', '/notifications/read-all?type=BALANCE');
  bad('Mark ALL read type=BALANCE', 'PATCH', '/notifications/read-all?type=BALANCE', r);

  r = await makeRequest('PATCH', '/notifications/read-all?type=PROMOTION');
  bad('Mark ALL read type=PROMOTION', 'PATCH', '/notifications/read-all?type=PROMOTION', r);

  r = await makeRequest('PATCH', '/notifications/read-all?type=SYSTEM');
  bad('Mark ALL read type=SYSTEM', 'PATCH', '/notifications/read-all?type=SYSTEM', r);

  // Try with empty string type?
  r = await makeRequest('PATCH', '/notifications/read-all?type=');
  bad('Mark ALL read type="" (empty)', 'PATCH', '/notifications/read-all?type=(empty)', r);

  // ============= STEP 5: PUBLIC ENDPOINT 403 ISSUES =============
  console.log('\n--- STEP 5: Public endpoints 403 investigation ---\n');

  // Try with auth header (just in case docs are wrong and these actually require auth)
  r = await makeRequest('GET', '/banks');
  bad('GET /banks PUBLIC (no auth)', 'GET', '/banks', r);

  const origAuth = authToken;
  // These were 403 - let's try WITHOUT any auth at all (no headers) to be sure
  r = await new Promise((resolve) => {
    const opts = { hostname: BASE_HOST, port: BASE_PORT, path: `${BASE_PATH}/banks`, method: 'GET', headers: { 'Accept': '*/*' }, timeout: 10000 };
    const req = http.request(opts, (res) => {
      let d = ''; res.on('data', c => d += c); res.on('end', () => resolve({ statusCode: res.statusCode, body: d.substring(0, 300) }));
    });
    req.on('error', e => resolve({ statusCode: 0, error: e.message }));
    req.end();
  });
  console.log(`   GET /banks (vanilla no-headers) -> [${r.statusCode}] ${r.body || r.error}`);

  r = await makeRequest('GET', '/promotions');
  bad('GET /promotions PUBLIC (no auth)', 'GET', '/promotions', r);

  r = await makeRequest('GET', '/bills/lookup?type=ELECTRICITY&customerCode=CUST001');
  bad('GET /bills/lookup PUBLIC (no auth)', 'GET', '/bills/lookup?type=ELECTRICITY', r);

  // ============= STEP 6: MONEY REQUESTS WITH DIFFERENT USER =============
  console.log('\n--- STEP 6: Money Requests with different payer ---\n');

  // Get 2nd user token if we created one, else create one
  const phone3 = '09' + Math.floor(10000000 + Math.random() * 89999999);
  r = await makeRequest('POST', '/auth/register', { phoneNumber: phone3, fullName: 'PAYER USER 3', password: 'password123', deviceId: 'deep-003' });
  bad('Register user3 (payer)', 'POST', '/auth/register', r);
  const user3Id = r.body?.data?.userId;

  // Now user1 (testUserId) requests money from user3
  r = await makeRequest('POST', '/money-requests', {
    payerUserId: user3Id, amount: 500000, currency: 'VND', message: 'Tra tien bua tiec',
  });
  bad('Create Money Request (user1 -> user3)', 'POST', '/money-requests', r);
  const mrId = r.body?.data?.id;

  // Actions on money request (as requester cancel)
  if (mrId) {
    r = await makeRequest('GET', `/money-requests/${mrId}`);
    bad('Get Money Request Detail', 'GET', '/money-requests/{id}', r);

    r = await makeRequest('POST', `/money-requests/${mrId}/cancel`);
    bad('Cancel Money Request (requester cancels)', 'POST', '/money-requests/{id}/cancel', r);
  }

  r = await makeRequest('GET', '/money-requests/received');
  bad('List Received Money Requests', 'GET', '/money-requests/received', r);

  r = await makeRequest('GET', '/money-requests/sent');
  bad('List Sent Money Requests', 'GET', '/money-requests/sent', r);

  // ============= FINAL SUMMARY =============
  console.log('\n====================================================================');
  console.log(' FINAL DEEP SUMMARY - ONLY 400 & 500 BUGS');
  console.log('====================================================================\n');

  const real400 = results.filter(r => r.status === 400);
  const real500 = results.filter(r => r.status === 500);
  const conn = results.filter(r => r.status === 0);

  console.log(`Total tested in round 2: ${results.length}`);
  console.log(`400: ${real400.length}  |  500: ${real500.length}  |  CONNECTION: ${conn.length}`);

  if (real500.length > 0) {
    console.log('\n💥💥💥 500 INTERNAL SERVER ERRORS (CRITICAL BUGS):\n');
    real500.forEach(r => {
      console.log(`  [500] ${r.method} ${r.path}`);
      console.log(`       ${r.name}`);
      console.log(`       ${r.message}`);
      console.log('');
    });
  }

  if (real400.length > 0) {
    console.log('⚠️⚠️  400 BAD REQUEST (check if these are legitimate bugs or expected):\n');
    real400.forEach(r => {
      console.log(`  [400] ${r.method} ${r.path}`);
      console.log(`       ${r.name}`);
      console.log(`       ${r.message}${r.errorCode ? ` [${r.errorCode}]` : ''}`);
      console.log('');
    });
  }

  if (conn.length > 0) {
    console.log('🔌 CONNECTION ERRORS:\n');
    conn.forEach(r => console.log(`  ${r.method} ${r.path} -> ${r.message}`));
  }

  if (real500.length === 0 && real400.length === 0) {
    console.log('\n✅✅✅ Round 2: NO 400/500 BUGS FOUND!');
  }
}

run();

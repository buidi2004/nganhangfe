const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

console.log('=== STARTING FLUTTER EXPANSION INTEGRATION ===');

// Paths
const fultetDir = 'C:\\dev\\app\\fultet';
const unpackedDir = 'C:\\dev\\app\\docx_unpacked';
const mediaDir = path.join(unpackedDir, 'word', 'media');
const relsFilePath = path.join(unpackedDir, 'word', '_rels', 'document.xml.rels');
const docXmlPath = path.join(unpackedDir, 'word', 'document.xml');

// 1. Verify unpacked directory exists
if (!fs.existsSync(docXmlPath)) {
  console.error('Error: docx_unpacked does not exist. Please unpack first.');
  process.exit(1);
}

// 2. Map of 29 images from c:\dev\app\fultet
const fultetFiles = fs.readdirSync(fultetDir).sort();
console.log(`Found ${fultetFiles.length} images in ${fultetDir}`);

if (fultetFiles.length !== 29) {
  console.error(`Expected 29 images, but found ${fultetFiles.length}`);
  process.exit(1);
}

// Ordered list of 29 screenshots mapping to logical application flows
const screensMetadata = [
  {
    idx: 28, // Splash
    targetName: 'flutter_screen_01.jpg',
    rId: 'rId51',
    figNum: '8.31',
    title: 'Màn hình Khởi động (Splash Screen) SenBank với Biểu tượng Hoa Sen Phát sáng',
    desc: 'Màn hình khởi động ứng dụng với thiết kế nền xanh Gradient sâu thẳm, logo Hoa Sen xanh ngọc phát quang quang học (Optical Glow Shader) tạo nhận diện thương hiệu số sang trọng, tích hợp tiến trình tải cấu hình hệ thống nền.'
  },
  {
    idx: 27, // Login
    targetName: 'flutter_screen_02.jpg',
    rId: 'rId52',
    figNum: '8.32',
    title: 'Màn hình Đăng nhập Tài khoản SenBank Tích hợp Xác thực Sinh trắc học FaceID',
    desc: 'Giao diện đăng nhập tài khoản an toàn với cảnh báo an ninh ngân hàng đa tầng, hỗ trợ nhận diện khuôn mặt sinh trắc học FaceID / Vân tay (LocalAuth), xử lý tự động làm mới JWT Access Token (TTL 5 phút) qua Refresh Token.'
  },
  {
    idx: 26, // Forgot Password
    targetName: 'flutter_screen_03.jpg',
    rId: 'rId53',
    figNum: '8.33',
    title: 'Quy trình Khôi phục Mật khẩu Tự động 3 Bước Bảo mật Đa lớp',
    desc: 'Luồng quên mật khẩu trực quan gồm 3 bước: Nhập số điện thoại chính chủ, xác thực SMS Brandname OTP 6 số và thiết lập mật khẩu mới đạt chuẩn NIST SP 800-63B kèm cơ chế chống tấn công Brute-Force.'
  },
  {
    idx: 25, // Terms of Service
    targetName: 'flutter_screen_04.jpg',
    rId: 'rId54',
    figNum: '8.34',
    title: 'Điều khoản Dịch vụ & Cơ sở Pháp lý Tuân thủ Nghị định 13/2023 & QĐ 2345',
    desc: 'Khung pháp lý ngân hàng số minh bạch, hiển thị chi tiết các điều khoản bảo vệ dữ liệu cá nhân theo Nghị định 13/2023/NĐ-CP, quy định bảo mật giao dịch trực tuyến Quyết định 2345/QĐ-NHNN và nút tải văn bản pháp lý PDF.'
  },
  {
    idx: 23, // Set PIN
    targetName: 'flutter_screen_05.jpg',
    rId: 'rId55',
    figNum: '8.35',
    title: 'Thiết lập Mã PIN Giao dịch 6 Số với Bàn phím Số CustomPinNumpad An toàn',
    desc: 'Giao diện cài đặt mã PIN bảo mật giao dịch tài chính với CustomPinNumpad chống ghi lại màn hình (Screen Recording Blocker), hỗ trợ cơ chế băm mật mã SHA-256 kèm Salt trước khi đồng bộ về Core Banking.'
  },
  {
    idx: 24, // OTP Verification
    targetName: 'flutter_screen_06.jpg',
    rId: 'rId56',
    figNum: '8.36',
    title: 'Màn hình Xác thực Bảo mật Giao dịch Hai lớp (SMS OTP & Smart OTP PKI)',
    desc: 'Cơ chế xác thực hai nhân tố (2FA) với cảnh báo chống lừa đảo mạo danh ngân hàng, hỗ trợ chuyển đổi linh hoạt giữa SMS OTP Brandname và Smart OTP PKI xác thực cục bộ an toàn cao, tự động đếm ngược 60 giây.'
  },
  {
    idx: 21, // Hero Home
    targetName: 'flutter_screen_07.jpg',
    rId: 'rId57',
    figNum: '8.37',
    title: 'Trang chủ SenBank: Thẻ Số dư Kính mờ BalanceCard & Floating Glass Bottom Bar',
    desc: 'Màn hình chính đẳng cấp với BalanceCard hiệu ứng kính mờ Liquid Glass (GPU Shader 60fps), hiển thị số dư thực tế, 4 nút tác vụ nhanh (Chuyển tiền, Nạp tiền, Rút tiền, Quét QR) và thanh điều hướng nổi Floating Glass Bar.'
  },
  {
    idx: 18, // More Screen
    targetName: 'flutter_screen_08.jpg',
    rId: 'rId58',
    figNum: '8.38',
    title: 'Menu Tiện ích Mở rộng (More Screen) & Hệ sinh thái Tài chính Số SenPoints',
    desc: 'Trung tâm quản trị tiện ích ngân hàng số toàn diện: Tích điểm đổi quà SenPoints Club, quản lý hạn mức giao dịch, chuyển đổi ngoại tệ, tra cứu lãi suất và danh mục liên kết tài khoản ngân hàng đối tác.'
  },
  {
    idx: 14, // Floating Notification HUD
    targetName: 'flutter_screen_09.jpg',
    rId: 'rId59',
    figNum: '8.39',
    title: 'Hệ thống Thông báo Nổi (Floating Notification HUD) Biến động Số dư Realtime',
    desc: 'Widget thông báo động FloatingNotificationHud hiển thị nổi trên đỉnh giao diện dưới dạng kính mờ quang học, nhận diện biến động số dư tức thì qua WebSocket STOMP mà không gây gián đoạn luồng thao tác của người dùng.'
  },
  {
    idx: 1, // Notification Center
    targetName: 'flutter_screen_10.jpg',
    rId: 'rId60',
    figNum: '8.40',
    title: 'Trung tâm Quản lý Thông báo Phân loại (Biến động, Ưu đãi & Hệ thống)',
    desc: 'Hộp thư thông báo đa kênh hỗ trợ phân loại 3 tab chuyên biệt: Biến động số dư tài khoản, Khuyến mãi quà tặng và Tin tức an ninh hệ thống, hỗ trợ đánh dấu đọc tất cả và cập nhật trạng thái đã đọc theo thời gian thực.'
  },
  {
    idx: 16, // Beneficiary Contacts
    targetName: 'flutter_screen_11.jpg',
    rId: 'rId61',
    figNum: '8.41',
    title: 'Danh bạ Người Thụ hưởng Chuyển tiền Thường xuyên Lưu sẵn Thông minh',
    desc: 'Giao diện quản lý danh bạ thụ hưởng yêu thích với ảnh đại diện Avatar tròn, hiển thị ngân hàng thụ hưởng, số tài khoản masked và thanh tìm kiếm tức thì giúp rút ngắn thời gian khởi tạo lệnh chuyển khoản dưới 5 giây.'
  },
  {
    idx: 15, // Transfer Amount & E-Card
    targetName: 'flutter_screen_12.jpg',
    rId: 'rId62',
    figNum: '8.42',
    title: 'Form Khởi tạo Số tiền Chuyển kèm Bộ sưu tập Thiệp Chúc mừng Điện tử (E-Cards)',
    desc: 'Màn hình nhập số tiền chuyển khoản tích hợp công cụ định dạng tiền tệ VND tự động (CurrencyFormatter), hỗ trợ đính kèm thiệp mừng điện tử sinh nhật, chúc mừng và thiệp đám cưới cá nhân hóa.'
  },
  {
    idx: 17, // QR Scanner
    targetName: 'flutter_screen_13.jpg',
    rId: 'rId63',
    figNum: '8.43',
    title: 'Camera Quét mã QR Napas 24/7 & Chuẩn Quốc tế EMVCo Đa năng Tốc độ Cao',
    desc: 'Tính năng quét mã QR thanh toán tích hợp thư viện MobileScanner 60fps, tự động nhận diện mã VietQR, Napas247 và chuẩn thanh toán quốc tế EMVCo, hỗ trợ bật đèn Flash và tải ảnh QR từ bộ sưu tập điện thoại.'
  },
  {
    idx: 12, // Money Request / Split Bill
    targetName: 'flutter_screen_14.jpg',
    rId: 'rId64',
    figNum: '8.44',
    title: 'Tính năng Yêu cầu Chuyển tiền & Chia sẻ Tiền nhóm (Split Bill) Văn minh',
    desc: 'Công cụ tài chính xã hội cho phép người dùng gửi lời nhắc thanh toán lịch sự hoặc tự động chia đều hóa đơn ăn uống, giải trí cho nhiều thành viên trong nhóm bạn bè với liên kết thanh toán 1 chạm.'
  },
  {
    idx: 13, // Internal Transfer Success
    targetName: 'flutter_screen_15.jpg',
    rId: 'rId65',
    figNum: '8.45',
    title: 'Màn hình Xác nhận Giao dịch Chuyển tiền Nội bộ SenBank Thành công Tức thì',
    desc: 'Thông báo chuyển tiền nội bộ ví SenBank thành công 100% thời gian thực (Latency < 200ms), miễn phí giao dịch trọn đời, cập nhật ngay số dư khả dụng mới của ví mà không cần tải lại trang.'
  },
  {
    idx: 0, // Napas 24/7 Receipt
    targetName: 'flutter_screen_16.jpg',
    rId: 'rId66',
    figNum: '8.46',
    title: 'Biên lai Điện tử Chuyển tiền Liên ngân hàng Napas 24/7 Chuẩn Quốc gia',
    desc: 'Biên lai chuyển khoản chính thức có mã tham chiếu giao dịch độc nhất (FT Code), chữ ký số ngân hàng, thời gian khớp lệnh chuẩn xác đến từng mili-giây, hỗ trợ chia sẻ ảnh biên lai và xuất file PDF lưu trữ.'
  },
  {
    idx: 20, // Transaction History
    targetName: 'flutter_screen_17.jpg',
    rId: 'rId67',
    figNum: '8.47',
    title: 'Sổ Lịch sử Giao dịch Thông minh với Bộ lọc Đa tiêu chí & Tìm kiếm Từ khóa',
    desc: 'Trang sao kê lịch sử giao dịch phân loại trực quan với icon nhận diện theo từng danh mục chi tiêu, bộ lọc giao dịch (Tất cả, Tiền vào, Tiền ra) và phân trang tự động Lazy-loading tối ưu hóa bộ nhớ RAM.'
  },
  {
    idx: 9, // Bill Payment
    targetName: 'flutter_screen_18.jpg',
    rId: 'rId68',
    figNum: '8.48',
    title: 'Trung tâm Thanh toán Hóa đơn Đa dịch vụ (Điện EVN, Nước, Cước Internet)',
    desc: 'Cổng thanh toán sinh hoạt gia đình kết nối trực tiếp với Điện lực EVN, Cấp nước Sawaco, Viễn thông FPT/VNPT, hỗ trợ tự động lưu mã khách hàng và kích hoạt tính năng trích nợ tự động Auto-Debit định kỳ.'
  },
  {
    idx: 11, // Mobile Topup
    targetName: 'flutter_screen_19.jpg',
    rId: 'rId69',
    figNum: '8.49',
    title: 'Nạp tiền Điện thoại & Mua Gói Cước Data 4G/5G Chiết khấu Cao Tức thì',
    desc: 'Dịch vụ viễn thông liên kết 5 nhà mạng lớn (Viettel, Vinaphone, Mobifone, Vietnamobile, Wintel) với chiết khấu trực tiếp tới 4%, nạp tiền trực tiếp vào tài khoản di động hoặc gửi mã thẻ cào qua SMS.'
  },
  {
    idx: 6, // Vietlott Online
    targetName: 'flutter_screen_20.jpg',
    rId: 'rId70',
    figNum: '8.50',
    title: 'Tiện ích Mua Vé số Điện toán Vietlott Online (Mega 6/45, Power 6/55, Max 3D)',
    desc: 'Tích hợp giải trí số trực tuyến cho phép chọn số may mắn Mega 6/45, Power 6/55, Max 3D Pro an toàn, lưu vé điện tử kèm mã định danh và tự động thông báo trúng thưởng qua Notification.'
  },
  {
    idx: 8, // Savings
    targetName: 'flutter_screen_21.jpg',
    rId: 'rId71',
    figNum: '8.51',
    title: 'Tiết kiệm Tích lũy Sinh lời Sen Lộc Phát với Lãi suất Bậc thang Hấp dẫn',
    desc: 'Sản phẩm tiền gửi tiết kiệm thông minh: Gửi góp linh hoạt từ 100.000đ, hưởng lãi suất sinh lời mỗi ngày lên đến 7.4%/năm, theo dõi tiền lãi dự kiến thời gian thực và hỗ trợ tất toán trước hạn linh hoạt.'
  },
  {
    idx: 3, // QuickLoan
    targetName: 'flutter_screen_22.jpg',
    rId: 'rId72',
    figNum: '8.52',
    title: 'Vay Tiêu dùng Tức thì QuickLoan: Duyệt Hạn mức Tự động Bằng AI 50 Triệu',
    desc: 'Sản phẩm tín dụng số tiên tiến: Chấm điểm tín dụng bằng mô hình AI dựa trên lịch sử thanh toán ví, phê duyệt hạn mức tối đa 50 triệu đồng trong 60 giây mà không cần chứng minh thu nhập giấy tờ.'
  },
  {
    idx: 7, // Loan Schedule
    targetName: 'flutter_screen_23.jpg',
    rId: 'rId73',
    figNum: '8.53',
    title: 'Công cụ Tính toán Lãi vay Minh bạch & Lịch Thanh toán Gốc Lãi Chi tiết',
    desc: 'Bảng mô phỏng tài chính trực quan: Tự động tính toán số tiền trả góp hàng tháng theo phương thức dư nợ giảm dần hoặc niên kim cố định, hiển thị biểu đồ phân bổ gốc và lãi rõ ràng trước khi ký hợp đồng vay.'
  },
  {
    idx: 4, // Home & Car Loan
    targetName: 'flutter_screen_24.jpg',
    rId: 'rId74',
    figNum: '8.54',
    title: 'Gói Vay Trả góp Mua Nhà & Ô tô Điện VinFast Liên kết Đối tác Chiến lược',
    desc: 'Gói tài trợ vốn quy mô lớn liên kết với Tập đoàn Vingroup (VinFast, Masterise Homes): Lãi suất cố định ưu đãi 24 tháng đầu, hỗ trợ định giá tài sản trực tuyến và giải ngân nhanh qua ứng dụng.'
  },
  {
    idx: 5, // Visa Signature Card
    targetName: 'flutter_screen_25.jpg',
    rId: 'rId75',
    figNum: '8.55',
    title: 'Quản lý Thẻ Thanh toán Quốc tế SenBank Visa Signature Ảo Đa Tiện ích',
    desc: 'Giao diện quản lý thẻ ảo thông minh: Hiển thị đồ họa thẻ Visa Signature phong cách Glassmorphism, nút ẩn/hiện số CVV bảo mật, khóa/mở thẻ tức thì và cài đặt hạn mức thanh toán trực tuyến quốc tế.'
  },
  {
    idx: 10, // Profile & eKYC
    targetName: 'flutter_screen_26.jpg',
    rId: 'rId76',
    figNum: '8.56',
    title: 'Hồ sơ Cá nhân & Cấp độ Định danh eKYC Cấp 2 (Verified Citizen)',
    desc: 'Trang thông tin tài khoản người dùng hiển thị trạng thái định danh điện tử Cấp 2 thành công, mã định danh khách hàng CID, số điện thoại, ngày sinh và chứng chỉ bảo mật sinh trắc học khuôn mặt.'
  },
  {
    idx: 2, // Vouchers & Gifts
    targetName: 'flutter_screen_27.jpg',
    rId: 'rId77',
    figNum: '8.57',
    title: 'Kho Ưu đãi, Quà tặng & Voucher Giảm giá Độc quyền Hệ sinh thái Sen Hồng',
    desc: 'Ví voucher cá nhân hóa: Danh mục mã giảm giá 50.000đ khi thanh toán hóa đơn, mã hoàn tiền nạp thẻ, tính năng 1-chạm sao chép mã ưu đãi và tự động áp dụng khi chuyển sang luồng thanh toán.'
  },
  {
    idx: 19, // Promotions & Deals
    targetName: 'flutter_screen_28.jpg',
    rId: 'rId78',
    figNum: '8.58',
    title: 'Banner Khuyến mãi Động & Chương trình Săn Deal Giờ vàng Đối tác',
    desc: 'Hệ thống banner động CurvedPromoBanner lướt ngang tự động (Auto-scroll), hiển thị các chương trình hợp tác độc quyền mua sắm xe điện, hoàn tiền mua vé xem phim và ưu đãi ẩm thực cuối tuần.'
  },
  {
    idx: 22, // Help Center & SenBot
    targetName: 'flutter_screen_29.jpg',
    rId: 'rId79',
    figNum: '8.59',
    title: 'Trung tâm Trợ giúp 24/7, Hotline 1900 6688 & Trợ lý Trực tuyến SenBot AI',
    desc: 'Kênh chăm sóc khách hàng đa nền tảng: Tổng đài hỗ trợ khẩn cấp 1900 6688, hệ thống câu hỏi thường gặp FAQ phân loại theo nghiệp vụ, cổng gửi ticket khiếu nại và kênh live-chat tự động cùng trợ lý ảo SenBot AI.'
  }
];

// 3. Copy 29 images from fultet to docx_unpacked/word/media/
console.log('Copying 29 images into docx_unpacked/word/media/...');
screensMetadata.forEach(meta => {
  const srcPath = path.join(fultetDir, fultetFiles[meta.idx]);
  const destPath = path.join(mediaDir, meta.targetName);
  fs.copyFileSync(srcPath, destPath);
  console.log(`  Copied: ${fultetFiles[meta.idx]} -> ${meta.targetName} (${(fs.statSync(destPath).size / 1024).toFixed(1)} KB)`);
});

// 4. Update word/_rels/document.xml.rels
console.log('Updating document.xml.rels with 29 new image relationships...');
let relsXml = fs.readFileSync(relsFilePath, 'utf8');

screensMetadata.forEach(meta => {
  const relEntry = `<Relationship Id="${meta.rId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/${meta.targetName}"/>`;
  if (!relsXml.includes(`Id="${meta.rId}"`)) {
    // Insert before closing </Relationships>
    relsXml = relsXml.replace('</Relationships>', `${relEntry}</Relationships>`);
  }
});
fs.writeFileSync(relsFilePath, relsXml, 'utf8');
console.log('Relationships updated successfully.');

console.log('Finished image copy and relationship registration.');

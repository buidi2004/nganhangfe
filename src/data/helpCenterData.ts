export interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  popular?: boolean;
}

export interface BankBranch {
  id: string;
  name: string;
  type: 'BRANCH' | 'ATM_SMARTBANK';
  address: string;
  phone: string;
  workingHours: string;
  is247?: boolean;
}

export const SUPPORT_CONTACTS = {
  tollFreeHotline: '1800 5858',
  tollFreeLabel: 'Hotline Miễn cước (Khẩn cấp & KH Ưu tiên)',
  generalHotline: '1900 8888',
  generalLabel: 'Tổng đài Chăm sóc Khách hàng 24/7 (1.000 đ/phút)',
  internationalPhone: '+84 24 3988 8888',
  supportEmail: 'hotro@senbank.vn',
  website: 'https://senbank.vn',
  workingHours: 'Trực 24 giờ / 7 ngày trong tuần (kể cả Lễ, Tết)',
};

export const FAQ_CATEGORIES = [
  { id: 'all', label: 'Tất cả', icon: 'apps-outline' },
  { id: 'transfer', label: 'Chuyển tiền', icon: 'swap-horizontal-outline' },
  { id: 'security', label: 'Bảo mật & 2345', icon: 'shield-checkmark-outline' },
  { id: 'cards', label: 'Tài khoản & Thẻ', icon: 'card-outline' },
  { id: 'savings', label: 'Tiết kiệm & Vay', icon: 'wallet-outline' },
  { id: 'tech', label: 'Ứng dụng & OTP', icon: 'phone-portrait-outline' },
];

export const BANK_FAQS: FAQItem[] = [
  // --- Chuyển tiền & Thanh toán ---
  {
    id: 'f1',
    category: 'transfer',
    question: 'Tài khoản đã bị trừ tiền nhưng người nhận chưa nhận được thì phải làm sao?',
    answer: 'Khi chuyển tiền nhanh Napas 247 hoặc VietQR, thông thường người nhận sẽ nhận được tiền trong vòng vài giây. Tuy nhiên, nếu hệ thống liên ngân hàng bị nghẽn mạng hoặc bảo trì:\n\n1. Quý khách vui lòng kiểm tra Lịch sử giao dịch để xem trạng thái giao dịch là "Thành công" hay "Đang xử lý".\n2. Nếu giao dịch "Thành công", tiền sẽ tự động ghi có vào tài khoản người nhận trong tối đa 15 - 30 phút.\n3. Nếu sau 30 phút người nhận vẫn chưa nhận được, quý khách bấm nút "Tra soát khiếu nại" ngay dưới chi tiết giao dịch hoặc liên hệ Hotline 1900 8888. SenBank cam kết hoàn tất tra soát trong tối đa 3 ngày làm việc.',
    popular: true,
  },
  {
    id: 'f2',
    category: 'transfer',
    question: 'Chuyển nhầm tiền cho người khác thì có lấy lại được không?',
    answer: 'Theo quy định của Ngân hàng Nhà nước, SenBank không được quyền tự ý trích nợ tài khoản người khác nếu không có sự đồng thuận của họ.\n\nTuy nhiên, SenBank sẽ hỗ trợ tối đa bằng cách:\n1. Tiếp nhận yêu cầu tra soát nhầm lẫn của quý khách.\n2. Liên hệ trực tiếp với người nhận hoặc ngân hàng thụ hưởng để thông báo và đề nghị chuyển trả lại số tiền.\n3. Trong trường hợp người nhận cố tình không hoàn trả, SenBank sẽ cung cấp hồ sơ pháp lý để quý khách khởi kiện hoặc trình báo cơ quan công an theo quy định của Bộ luật Hình sự.',
    popular: true,
  },
  {
    id: 'f3',
    category: 'transfer',
    question: 'Hạn mức chuyển tiền trực tuyến trong ngày là bao nhiêu?',
    answer: 'Hạn mức chuyển tiền trực tuyến phụ thuộc vào cấp bậc xác thực tài khoản của quý khách:\n\n• Tài khoản Basic (Chưa eKYC): Chỉ được nhận tiền, không được chuyển đi.\n• Tài khoản Standard (Đã eKYC CCCD): Tối đa 20 triệu VNĐ/lần và 100 triệu VNĐ/ngày.\n• Tài khoản Premium (Đã xác thực Sinh trắc học theo QĐ 2345): Tối đa 100 triệu VNĐ/lần và 500 triệu VNĐ/ngày.\n\nQuý khách có thể nâng hạn mức bằng cách thực hiện xác thực khuôn mặt sinh trắc học qua chip NFC CCCD trong mục Cài đặt bảo mật.',
  },
  {
    id: 'f4',
    category: 'transfer',
    question: 'Chuyển tiền vào thứ Bảy, Chủ Nhật hoặc ngày Lễ có bị trễ không?',
    answer: 'Hoàn toàn không. Dịch vụ chuyển tiền nội bộ SenBank và chuyển tiền liên ngân hàng qua VietQR/Napas 247 hoạt động liên tục 24/7/365, kể cả ngày nghỉ cuối tuần và các dịp Lễ, Tết. Tiền được chuyển đến tài khoản thụ hưởng ngay lập tức.',
  },

  // --- Bảo mật & Sinh trắc học (QĐ 2345) ---
  {
    id: 'f5',
    category: 'security',
    question: 'Tại sao giao dịch trên 10 triệu đồng bắt buộc phải quét khuôn mặt sinh trắc học?',
    answer: 'Từ ngày 01/07/2024, theo Quyết định số 2345/QĐ-NHNN của Ngân hàng Nhà nước Việt Nam, mọi giao dịch chuyển tiền trực tuyến vượt quá 10 triệu VNĐ/lần HOẶC tổng giá trị giao dịch trong ngày vượt quá 20 triệu VNĐ bắt buộc phải được xác thực bằng dữ liệu sinh trắc học khuôn mặt.\n\nQuy định này nhằm bảo vệ an toàn tuyệt đối tài sản của quý khách, ngăn chặn triệt để tình trạng kẻ gian lừa đảo chiếm đoạt tài khoản hoặc ép buộc chuyển tiền.',
    popular: true,
  },
  {
    id: 'f6',
    category: 'security',
    question: 'Làm thế nào để quét chip NFC trên Căn cước công dân gắn chip?',
    answer: 'Để quét chip NFC thành công, quý khách thực hiện theo các bước:\n\n1. Bật tính năng NFC trên điện thoại (Vào Cài đặt > Kết nối > Bật NFC).\n2. Tháo ốp lưng điện thoại để sóng NFC bắt tín hiệu tốt nhất.\n3. Áp mặt sau thẻ CCCD (khu vực có con chip màu vàng) sát vào lưng điện thoại (vị trí gần cụm camera với iPhone hoặc chính giữa lưng với máy Android).\n4. Giữ yên thẻ và điện thoại trong khoảng 3 - 5 giây cho đến khi ứng dụng báo "Đọc chip thành công".',
    popular: true,
  },
  {
    id: 'f7',
    category: 'security',
    question: 'Tôi bị mất điện thoại hoặc nghi ngờ bị lộ mật khẩu thì phải làm gì ngay?',
    answer: 'Quý khách cần hành động khẩn cấp theo thứ tự ưu tiên:\n\n1. Gọi ngay Tổng đài Khẩn cấp 1900 8888 (bấm phím 1) để yêu cầu khóa tài khoản và dịch vụ ngân hàng điện tử ngay lập tức.\n2. Sử dụng một thiết bị khác đăng nhập vào ứng dụng SenBank và thực hiện Đổi mật khẩu / Đổi mã PIN.\n3. Liên hệ nhà mạng viễn thông để khóa SIM điện thoại tạm thời, tránh kẻ gian nhận mã OTP SMS.',
    popular: true,
  },
  {
    id: 'f8',
    category: 'security',
    question: 'Khuôn mặt của tôi không khớp với ảnh trên CCCD thì xử lý thế nào?',
    answer: 'Khi xác thực khuôn mặt, nếu ứng dụng báo không khớp:\n• Đảm bảo ngồi ở nơi đủ ánh sáng, không bị ngược sáng hoặc bóng râm.\n• Tháo kính râm, mũ, khẩu trang và nhìn thẳng vào camera.\n• Nếu quý khách có thay đổi lớn về diện mạo (phẫu thuật thẩm mỹ, thay đổi kiểu tóc lớn), quý khách có thể mang CCCD gốc đến Chi nhánh/Phòng giao dịch SenBank gần nhất để nhân viên hỗ trợ cập nhật dữ liệu sinh trắc học thủ công trong 5 phút.',
  },

  // --- Tài khoản & Thẻ ngân hàng ---
  {
    id: 'f9',
    category: 'cards',
    question: 'Mở tài khoản số đẹp SenBank có mất phí không?',
    answer: 'SenBank tặng miễn phí 100% tài khoản số đẹp theo Số điện thoại, Ngày tháng năm sinh hoặc Số phong thủy may mắn cho tất cả khách hàng mới đăng ký eKYC trên ứng dụng. Quý khách không phải trả bất kỳ khoản phí duy trì nào.',
  },
  {
    id: 'f10',
    category: 'cards',
    question: 'Làm sao để kích hoạt và sử dụng thẻ SenBank Platinum Signature?',
    answer: 'Sau khi phát hành thẻ thành công trên ứng dụng, quý khách vào mục "Thẻ" > chọn thẻ cần kích hoạt > bấm "Kích hoạt thẻ" và thiết lập mã PIN 6 số bí mật. Quý khách có thể sử dụng ngay thẻ phi vật lý để thanh toán online quốc tế (Visa/Mastercard) hoặc liên kết Apple Pay, Google Wallet.',
  },
  {
    id: 'f11',
    category: 'cards',
    question: 'Thẻ bị nuốt tại cây ATM thì phải làm thế nào?',
    answer: 'Nếu thẻ bị nuốt tại cây ATM:\n1. Vào ứng dụng SenBank > chọn mục Thẻ > bật tính năng "Khóa thẻ tạm thời".\n2. Ghi lại địa chỉ cây ATM, thời gian xảy ra sự cố và mã số cây ATM (in trên thân máy).\n3. Liên hệ Hotline 1900 8888 để được hướng dẫn thủ tục nhận lại thẻ hoặc phát hành thẻ mới miễn phí.',
  },

  // --- Tiết kiệm & Vay tiêu dùng ---
  {
    id: 'f12',
    category: 'savings',
    question: 'Lãi suất gửi tiết kiệm online có cao hơn gửi tại quầy không?',
    answer: 'Có. Gửi tiết kiệm trực tuyến trên ứng dụng SenBank luôn được hưởng mức lãi suất ưu đãi cao hơn từ 0.3% đến 0.5%/năm so với gửi tại quầy giao dịch, do ngân hàng tối ưu hóa được chi phí vận hành.',
  },
  {
    id: 'f13',
    category: 'savings',
    question: 'Rút tiền tiết kiệm trước ngày đáo hạn thì tính lãi như thế nào?',
    answer: 'Theo quy định của Ngân hàng Nhà nước, trường hợp quý khách rút tiền tiết kiệm có kỳ hạn trước ngày đáo hạn, toàn bộ số tiền rút sẽ chỉ được hưởng mức lãi suất không kỳ hạn (thường từ 0.1% - 0.2%/năm) tính trên số ngày thực tế gửi.',
  },

  // --- Ứng dụng & OTP ---
  {
    id: 'f14',
    category: 'tech',
    question: 'Không nhận được mã OTP SMS gửi về điện thoại thì làm sao?',
    answer: 'Nếu không nhận được mã OTP:\n1. Kiểm tra cột sóng điện thoại xem thiết bị có đang ở vùng sóng yếu hoặc bật Chế độ máy bay không.\n2. Kiểm tra bộ nhớ tin nhắn của điện thoại có bị đầy không.\n3. Khuyến nghị: Quý khách nên chuyển sang sử dụng Smart OTP (mã xác thực tự sinh ngay trong ứng dụng), an toàn hơn, không phụ thuộc vào sóng viễn thông và hoàn toàn miễn phí.',
  },
  {
    id: 'f15',
    category: 'tech',
    question: 'Tôi muốn đổi số điện thoại đăng nhập ứng dụng thì làm như thế nào?',
    answer: 'Do số điện thoại gắn liền với danh tính và an toàn số dư tài khoản ngân hàng, để đổi số điện thoại đăng ký, quý khách vui lòng mang bản gốc Căn cước công dân gắn chip đến Chi nhánh/Phòng giao dịch SenBank gần nhất để nhân viên xác thực trực tiếp và cập nhật thông tin.',
  },
];

export const BANK_BRANCHES: BankBranch[] = [
  {
    id: 'b1',
    name: 'Hội sở chính SenBank Tower',
    type: 'BRANCH',
    address: '88 Phố Huế, P. Hàng Bài, Q. Hoàn Kiếm, Hà Nội',
    phone: '(024) 3988 8888',
    workingHours: 'Thứ 2 - Thứ 6: 08:00 - 17:00 | Thứ 7: 08:00 - 11:30',
  },
  {
    id: 'b2',
    name: 'Chi nhánh Sài Gòn — Trung tâm Kỹ thuật số',
    type: 'BRANCH',
    address: '68 Nguyễn Huệ, P. Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    phone: '(028) 3822 8888',
    workingHours: 'Thứ 2 - Thứ 6: 08:00 - 17:00 | Thứ 7: 08:00 - 11:30',
  },
  {
    id: 'b3',
    name: 'SmartBank 24/7 — Hoàn Kiếm',
    type: 'ATM_SMARTBANK',
    address: '12 Lê Thái Tổ, P. Hàng Trống, Q. Hoàn Kiếm, Hà Nội',
    phone: '1900 8888',
    workingHours: 'Phục vụ 24/7 toàn bộ các ngày trong năm',
    is247: true,
  },
  {
    id: 'b4',
    name: 'SmartBank 24/7 — Quận 1',
    type: 'ATM_SMARTBANK',
    address: '135 Nguyễn Thái Học, P. Cầu Ông Lãnh, Quận 1, TP. Hồ Chí Minh',
    phone: '1900 8888',
    workingHours: 'Phục vụ 24/7 toàn bộ các ngày trong năm',
    is247: true,
  },
  {
    id: 'b5',
    name: 'Chi nhánh Đà Nẵng',
    type: 'BRANCH',
    address: '120 Nguyễn Văn Linh, P. Nam Dương, Q. Hải Châu, TP. Đà Nẵng',
    phone: '(0236) 388 8888',
    workingHours: 'Thứ 2 - Thứ 6: 08:00 - 17:00',
  },
];

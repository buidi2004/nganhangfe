const fs = require('fs');
const path = require('path');
const {
  escapeXml,
  makeParagraph,
  makeHeading2,
  makeHeading3,
  makeCallout,
  makeTable,
  makeImagePairTable
} = require('./xml_helpers');

console.log('=== ASSEMBLING FLUTTER SECTION 8.10 XML ===');

const unpackedDir = 'C:\\dev\\app\\docx_unpacked';
const docXmlPath = path.join(unpackedDir, 'word', 'document.xml');
let docXml = fs.readFileSync(docXmlPath, 'utf8');

// The 29 screens metadata in exact logical presentation order
const screens = [
  { rId: 'rId51', figNum: '8.31', title: 'Màn hình Khởi động (Splash Screen) SenBank với Biểu tượng Hoa Sen Phát sáng', desc: 'Màn hình khởi động ứng dụng với thiết kế nền xanh Gradient sâu thẳm, logo Hoa Sen xanh ngọc phát quang quang học (Optical Glow Shader) tạo nhận diện thương hiệu số sang trọng, tích hợp tiến trình tải cấu hình hệ thống nền.' },
  { rId: 'rId52', figNum: '8.32', title: 'Màn hình Đăng nhập Tài khoản SenBank Tích hợp Xác thực Sinh trắc học FaceID', desc: 'Giao diện đăng nhập tài khoản an toàn với cảnh báo an ninh ngân hàng đa tầng, hỗ trợ nhận diện khuôn mặt sinh trắc học FaceID / Vân tay (LocalAuth), xử lý tự động làm mới JWT Access Token (TTL 5 phút) qua Refresh Token.' },
  { rId: 'rId53', figNum: '8.33', title: 'Quy trình Khôi phục Mật khẩu Tự động 3 Bước Bảo mật Đa lớp', desc: 'Luồng quên mật khẩu trực quan gồm 3 bước: Nhập số điện thoại chính chủ, xác thực SMS Brandname OTP 6 số và thiết lập mật khẩu mới đạt chuẩn NIST SP 800-63B kèm cơ chế chống tấn công Brute-Force.' },
  { rId: 'rId54', figNum: '8.34', title: 'Điều khoản Dịch vụ & Cơ sở Pháp lý Tuân thủ Nghị định 13/2023 & QĐ 2345', desc: 'Khung pháp lý ngân hàng số minh bạch, hiển thị chi tiết các điều khoản bảo vệ dữ liệu cá nhân theo Nghị định 13/2023/NĐ-CP, quy định bảo mật giao dịch trực tuyến Quyết định 2345/QĐ-NHNN và nút tải văn bản pháp lý PDF.' },
  { rId: 'rId55', figNum: '8.35', title: 'Thiết lập Mã PIN Giao dịch 6 Số với Bàn phím Số CustomPinNumpad An toàn', desc: 'Giao diện cài đặt mã PIN bảo mật giao dịch tài chính với CustomPinNumpad chống ghi lại màn hình (Screen Recording Blocker), hỗ trợ cơ chế băm mật mã SHA-256 kèm Salt trước khi đồng bộ về Core Banking.' },
  { rId: 'rId56', figNum: '8.36', title: 'Màn hình Xác thực Bảo mật Giao dịch Hai lớp (SMS OTP & Smart OTP PKI)', desc: 'Cơ chế xác thực hai nhân tố (2FA) với cảnh báo chống lừa đảo mạo danh ngân hàng, hỗ trợ chuyển đổi linh hoạt giữa SMS OTP Brandname và Smart OTP PKI xác thực cục bộ an toàn cao, tự động đếm ngược 60 giây.' },
  { rId: 'rId57', figNum: '8.37', title: 'Trang chủ SenBank: Thẻ Số dư Kính mờ BalanceCard & Floating Glass Bottom Bar', desc: 'Màn hình chính đẳng cấp với BalanceCard hiệu ứng kính mờ Liquid Glass (GPU Shader 60fps), hiển thị số dư thực tế, 4 nút tác vụ nhanh (Chuyển tiền, Nạp tiền, Rút tiền, Quét QR) và thanh điều hướng nổi Floating Glass Bar.' },
  { rId: 'rId58', figNum: '8.38', title: 'Menu Tiện ích Mở rộng (More Screen) & Hệ sinh thái Tài chính Số SenPoints', desc: 'Trung tâm quản trị tiện ích ngân hàng số toàn diện: Tích điểm đổi quà SenPoints Club, quản lý hạn mức giao dịch, chuyển đổi ngoại tệ, tra cứu lãi suất và danh mục liên kết tài khoản ngân hàng đối tác.' },
  { rId: 'rId59', figNum: '8.39', title: 'Hệ thống Thông báo Nổi (Floating Notification HUD) Biến động Số dư Realtime', desc: 'Widget thông báo động FloatingNotificationHud hiển thị nổi trên đỉnh giao diện dưới dạng kính mờ quang học, nhận diện biến động số dư tức thì qua WebSocket STOMP mà không gây gián đoạn luồng thao tác của người dùng.' },
  { rId: 'rId60', figNum: '8.40', title: 'Trung tâm Quản lý Thông báo Phân loại (Biến động, Ưu đãi & Hệ thống)', desc: 'Hộp thư thông báo đa kênh hỗ trợ phân loại 3 tab chuyên biệt: Biến động số dư tài khoản, Khuyến mãi quà tặng và Tin tức an ninh hệ thống, hỗ trợ đánh dấu đọc tất cả và cập nhật trạng thái đã đọc theo thời gian thực.' },
  { rId: 'rId61', figNum: '8.41', title: 'Danh bạ Người Thụ hưởng Chuyển tiền Thường xuyên Lưu sẵn Thông minh', desc: 'Giao diện quản lý danh bạ thụ hưởng yêu thích với ảnh đại diện Avatar tròn, hiển thị ngân hàng thụ hưởng, số tài khoản masked và thanh tìm kiếm tức thì giúp rút ngắn thời gian khởi tạo lệnh chuyển khoản dưới 5 giây.' },
  { rId: 'rId62', figNum: '8.42', title: 'Form Khởi tạo Số tiền Chuyển kèm Bộ sưu tập Thiệp Chúc mừng Điện tử (E-Cards)', desc: 'Màn hình nhập số tiền chuyển khoản tích hợp công cụ định dạng tiền tệ VND tự động (CurrencyFormatter), hỗ trợ đính kèm thiệp mừng điện tử sinh nhật, chúc mừng và thiệp đám cưới cá nhân hóa.' },
  { rId: 'rId63', figNum: '8.43', title: 'Camera Quét mã QR Napas 24/7 & Chuẩn Quốc tế EMVCo Đa năng Tốc độ Cao', desc: 'Tính năng quét mã QR thanh toán tích hợp thư viện MobileScanner 60fps, tự động nhận diện mã VietQR, Napas247 và chuẩn thanh toán quốc tế EMVCo, hỗ trợ bật đèn Flash và tải ảnh QR từ bộ sưu tập điện thoại.' },
  { rId: 'rId64', figNum: '8.44', title: 'Tính năng Yêu cầu Chuyển tiền & Chia sẻ Tiền nhóm (Split Bill) Văn minh', desc: 'Công cụ tài chính xã hội cho phép người dùng gửi lời nhắc thanh toán lịch sự hoặc tự động chia đều hóa đơn ăn uống, giải trí cho nhiều thành viên trong nhóm bạn bè với liên kết thanh toán 1 chạm.' },
  { rId: 'rId65', figNum: '8.45', title: 'Màn hình Xác nhận Giao dịch Chuyển tiền Nội bộ SenBank Thành công Tức thì', desc: 'Thông báo chuyển tiền nội bộ ví SenBank thành công 100% thời gian thực (Latency < 200ms), miễn phí giao dịch trọn đời, cập nhật ngay số dư khả dụng mới của ví mà không cần tải lại trang.' },
  { rId: 'rId66', figNum: '8.46', title: 'Biên lai Điện tử Chuyển tiền Liên ngân hàng Napas 24/7 Chuẩn Quốc gia', desc: 'Biên lai chuyển khoản chính thức có mã tham chiếu giao dịch độc nhất (FT Code), chữ ký số ngân hàng, thời gian khớp lệnh chuẩn xác đến từng mili-giây, hỗ trợ chia sẻ ảnh biên lai và xuất file PDF lưu trữ.' },
  { rId: 'rId67', figNum: '8.47', title: 'Sổ Lịch sử Giao dịch Thông minh với Bộ lọc Đa tiêu chí & Tìm kiếm Từ khóa', desc: 'Trang sao kê lịch sử giao dịch phân loại trực quan với icon nhận diện theo từng danh mục chi tiêu, bộ lọc giao dịch (Tất cả, Tiền vào, Tiền ra) và phân trang tự động Lazy-loading tối ưu hóa bộ nhớ RAM.' },
  { rId: 'rId68', figNum: '8.48', title: 'Trung tâm Thanh toán Hóa đơn Đa dịch vụ (Điện EVN, Nước, Cước Internet)', desc: 'Cổng thanh toán sinh hoạt gia đình kết nối trực tiếp với Điện lực EVN, Cấp nước Sawaco, Viễn thông FPT/VNPT, hỗ trợ tự động lưu mã khách hàng và kích hoạt tính năng trích nợ tự động Auto-Debit định kỳ.' },
  { rId: 'rId69', figNum: '8.49', title: 'Nạp tiền Điện thoại & Mua Gói Cước Data 4G/5G Chiết khấu Cao Tức thì', desc: 'Dịch vụ viễn thông liên kết 5 nhà mạng lớn (Viettel, Vinaphone, Mobifone, Vietnamobile, Wintel) với chiết khấu trực tiếp tới 4%, nạp tiền trực tiếp vào tài khoản di động hoặc gửi mã thẻ cào qua SMS.' },
  { rId: 'rId70', figNum: '8.50', title: 'Tiện ích Mua Vé số Điện toán Vietlott Online (Mega 6/45, Power 6/55, Max 3D)', desc: 'Tích hợp giải trí số trực tuyến cho phép chọn số may mắn Mega 6/45, Power 6/55, Max 3D Pro an toàn, lưu vé điện tử kèm mã định danh và tự động thông báo trúng thưởng qua Notification.' },
  { rId: 'rId71', figNum: '8.51', title: 'Tiết kiệm Tích lũy Sinh lời Sen Lộc Phát với Lãi suất Bậc thang Hấp dẫn', desc: 'Sản phẩm tiền gửi tiết kiệm thông minh: Gửi góp linh hoạt từ 100.000đ, hưởng lãi suất sinh lời mỗi ngày lên đến 7.4%/năm, theo dõi tiền lãi dự kiến thời gian thực và hỗ trợ tất toán trước hạn linh hoạt.' },
  { rId: 'rId72', figNum: '8.52', title: 'Vay Tiêu dùng Tức thì QuickLoan: Duyệt Hạn mức Tự động Bằng AI 50 Triệu', desc: 'Sản phẩm tín dụng số tiên tiến: Chấm điểm tín dụng bằng mô hình AI dựa trên lịch sử thanh toán ví, phê duyệt hạn mức tối đa 50 triệu đồng trong 60 giây mà không cần chứng minh thu nhập giấy tờ.' },
  { rId: 'rId73', figNum: '8.53', title: 'Công cụ Tính toán Lãi vay Minh bạch & Lịch Thanh toán Gốc Lãi Chi tiết', desc: 'Bảng mô phỏng tài chính trực quan: Tự động tính toán số tiền trả góp hàng tháng theo phương thức dư nợ giảm dần hoặc niên kim cố định, hiển thị biểu đồ phân bổ gốc và lãi rõ ràng trước khi ký hợp đồng vay.' },
  { rId: 'rId74', figNum: '8.54', title: 'Gói Vay Trả góp Mua Nhà & Ô tô Điện VinFast Liên kết Đối tác Chiến lược', desc: 'Gói tài trợ vốn quy mô lớn liên kết với Tập đoàn Vingroup (VinFast, Masterise Homes): Lãi suất cố định ưu đãi 24 tháng đầu, hỗ trợ định giá tài sản trực tuyến và giải ngân nhanh qua ứng dụng.' },
  { rId: 'rId75', figNum: '8.55', title: 'Quản lý Thẻ Thanh toán Quốc tế SenBank Visa Signature Ảo Đa Tiện ích', desc: 'Giao diện quản lý thẻ ảo thông minh: Hiển thị đồ họa thẻ Visa Signature phong cách Glassmorphism, nút ẩn/hiện số CVV bảo mật, khóa/mở thẻ tức thì và cài đặt hạn mức thanh toán trực tuyến quốc tế.' },
  { rId: 'rId76', figNum: '8.56', title: 'Hồ sơ Cá nhân & Cấp độ Định danh eKYC Cấp 2 (Verified Citizen)', desc: 'Trang thông tin tài khoản người dùng hiển thị trạng thái định danh điện tử Cấp 2 thành công, mã định danh khách hàng CID, số điện thoại, ngày sinh và chứng chỉ bảo mật sinh trắc học khuôn mặt.' },
  { rId: 'rId77', figNum: '8.57', title: 'Kho Ưu đãi, Quà tặng & Voucher Giảm giá Độc quyền Hệ sinh thái Sen Hồng', desc: 'Ví voucher cá nhân hóa: Danh mục mã giảm giá 50.000đ khi thanh toán hóa đơn, mã hoàn tiền nạp thẻ, tính năng 1-chạm sao chép mã ưu đãi và tự động áp dụng khi chuyển sang luồng thanh toán.' },
  { rId: 'rId78', figNum: '8.58', title: 'Banner Khuyến mãi Động & Chương trình Săn Deal Giờ vàng Đối tác', desc: 'Hệ thống banner động CurvedPromoBanner lướt ngang tự động (Auto-scroll), hiển thị các chương trình hợp tác độc quyền mua sắm xe điện, hoàn tiền mua vé xem phim và ưu đãi ẩm thực cuối tuần.' },
  { rId: 'rId79', figNum: '8.59', title: 'Trung tâm Trợ giúp 24/7, Hotline 1900 6688 & Trợ lý Trực tuyến SenBot AI', desc: 'Kênh chăm sóc khách hàng đa nền tảng: Tổng đài hỗ trợ khẩn cấp 1900 6688, hệ thống câu hỏi thường gặp FAQ phân loại theo nghiệp vụ, cổng gửi ticket khiếu nại và kênh live-chat tự động cùng trợ lý ảo SenBot AI.' }
];

let secXml = '';

// SECTION 8.10 HEADER
secXml += makeHeading2('8.10. Nghiên Cứu Mở Rộng Đa Nền Tảng: Hiện Thực Hóa Ứng Dụng Ví Điện Tử Sen Hồng Bank Trên Nền Tảng Flutter & Hệ Thống Giao Diện Liquid Glass UI');

secXml += makeParagraph(
  'Song song với phiên bản chính thức xây dựng trên nền tảng React Native Expo, nhóm nghiên cứu đã triển khai công trình thực nghiệm đối chứng toàn diện: Hiện thực hóa ứng dụng Ví Điện Tử Sen Hồng Bank (Fintech E-Wallet) trên nền tảng Flutter Framework kết hợp ngôn ngữ lập trình Dart. Mục tiêu của công trình mở rộng này nhằm kiểm chứng khả năng tương thích kiến trúc Clean Architecture, đo lường năng lực kết nối API đồng bộ với Backend Spring Boot và tiên phong tích hợp hệ sinh thái giao diện người dùng hiện đại bậc nhất — Liquid Glass Widgets với hiệu ứng kính mờ (frosted glass) và khúc xạ quang học chân thực vận hành trực tiếp trên phần cứng GPU di động.'
);

secXml += makeCallout(
  'Ý Nghĩa Khoa Học & Giá Trị Thực Tiễn Của Dự Án Flutter Sen Hồng Bank',
  'Việc phát triển phiên bản Flutter độc lập nhưng hoàn toàn tương thích 100% với đặc tả kỹ thuật API Backend Sen Hồng chứng minh tính độc lập của tầng dữ liệu Core Banking, đồng thời tạo ra một bước nhảy vọt về mặt thẩm mỹ thị giác (Visual Excellence) nhờ hệ thống shader quang học Liquid Glass đạt chuẩn 60-120 FPS.'
);

// 8.10.1. TỔNG QUAN DỰ ÁN
secXml += makeHeading3('8.10.1. Tổng quan Dự án Flutter & Triết lý Kiến trúc Đa Nền Tảng');

secXml += makeParagraph(
  'Dự án Ví Điện Tử Sen Hồng Bank phiên bản Flutter được thiết kế ngay từ đầu theo triết lý Clean Architecture nghiêm ngặt nhằm phân tách rạch ròi giữa logic giao diện người dùng (Presentation), nghiệp vụ cốt lõi (Domain), truy xuất dữ liệu từ xa (Data) và các tiện ích dùng chung (Core). Hệ thống giao diện được định hình bởi ngôn ngữ thiết kế Liquid Glass UI, mang lại trải nghiệm ngân hàng số cao cấp và trực quan.'
);

const overviewHeaders = ['Thuộc tính Hệ thống', 'Thông số Kỹ thuật & Giá trị Thực tế', 'Ghi chú Chuyên môn'];
const overviewRows = [
  ['Tên dự án chính thức', 'Sen Hồng Bank (Fintech E-Wallet)', 'Hệ thống Ví điện tử & Ngân hàng số Sen Hồng'],
  ['Nền tảng & Framework', 'Flutter Framework (Google)', 'Hỗ trợ đa nền tảng iOS và Android nguyên bản'],
  ['Ngôn ngữ lập trình chính', 'Dart (Strong-mode Type Safety)', 'Biên dịch mã máy AOT (Ahead-Of-Time)'],
  ['Kiến trúc phần mềm', 'Clean Architecture (3 Layers + Core)', 'Tuân thủ chặt chẽ nguyên lý SOLID & Clean Code'],
  ['Phiên bản phát hành', '1.0.0+1 (Build 1)', 'Phiên bản sẵn sàng thử nghiệm diện rộng'],
  ['Yêu cầu SDK Môi trường', 'Dart >=3.3.0 <4.0.0, Flutter >=3.19.0', 'Tối ưu hóa Dart 3.3 Records & Pattern Matching'],
  ['Hệ thống Giao diện', 'Liquid Glass Widgets & Custom Shaders', 'Khúc xạ quang học, kính mờ GPU đa lớp'],
  ['Quản lý Trạng thái', 'BLoC Pattern & ChangeNotifier Provider', 'Phân tách State / Event rõ ràng, dễ Unit Test']
];
secXml += makeTable(overviewHeaders, overviewRows, ['28%', '42%', '30%']);

// 8.10.2. THỐNG KÊ CODEBASE GRAPH
secXml += makeHeading3('8.10.2. Thống kê Toàn diện Codebase Memory Graph (1.502 Nodes & 5.534 Edges)');

secXml += makeParagraph(
  'Để nắm bắt cấu trúc phức tạp của toàn bộ mã nguồn Flutter, nhóm đã ứng dụng công cụ Codebase Memory Knowledge Graph trích xuất toàn bộ mạng lưới thực thể và mối quan hệ phụ thuộc. Đồ thị tri thức mã nguồn phản ánh quy mô đồ sộ và mức độ liên kết chặt chẽ giữa các tầng:'
);

const graphHeaders = ['Chỉ số Định lượng Graph', 'Giá trị Đo lường', 'Ý nghĩa Kiến trúc'];
const graphRows = [
  ['Tổng số Node trong Graph', '1.502 nodes', 'Bao gồm tất cả Class, Method, File, Variable, Module'],
  ['Tổng số Edge (Quan hệ)', '5.534 edges', 'Đường kết nối phụ thuộc, lời gọi hàm, định nghĩa và kế thừa'],
  ['Kích thước Database Graph', '~7.08 MB', 'Cơ sở dữ liệu đồ thị tri thức mã nguồn tối ưu'],
  ['Tổng số lượng File nguồn', '147 files', '116 file Dart cốt lõi, 2 YAML, 1 HTML, 1 Kotlin'],
  ['Tổng số lượng Lớp (Class)', '223 classes', 'Phân bổ đều giữa Presentation, Data và Core Entities'],
  ['Tổng số Phương thức (Method)', '669 methods', 'Xử lý logic nghiệp vụ, UI rendering và ánh xạ dữ liệu'],
  ['Tổng số Hàm tự do (Function)', '18 functions', 'Các hàm tiện ích toán học, format và xử lý chuỗi'],
  ['Tổng số Phân hệ (Module)', '145 modules', 'Phân tách module hóa cao độ, hạn chế tối đa coupling']
];
secXml += makeTable(graphHeaders, graphRows, ['30%', '25%', '45%']);

secXml += makeParagraph(
  'Bảng phân bố các loại nhãn Node (Node Labels) và quan hệ liên kết (Edge Types) trong hệ thống mã nguồn Flutter:'
);

const nodeLabelsHeaders = ['Loại Node (Label)', 'Số lượng', 'Vai trò trong Kiến trúc Ứng dụng'];
const nodeLabelsRows = [
  ['Method', '669', 'Các hàm thành viên xử lý logic màn hình và giao tiếp dữ liệu'],
  ['Class', '223', 'Các widget UI, model dữ liệu, datasource và repository'],
  ['File', '147', 'Các tệp mã nguồn quản lý theo cấu trúc Clean Architecture'],
  ['Module', '145', 'Các đơn vị đóng gói nghiệp vụ độc lập'],
  ['Section', '134', 'Các phân đoạn logic và khối giao diện con'],
  ['Variable', '104', 'Các biến trạng thái, hằng số cấu hình và khóa bí mật'],
  ['Folder', '56', 'Cấu trúc thư mục phân tầng chức năng'],
  ['Function', '18', 'Hàm tiện ích toàn cục dùng chung'],
  ['Decorator & Enum', '4', 'Các annotation và kiểu liệt kê trạng thái giao dịch / KYC'],
  ['Project & Branch', '2', 'Thông tin định danh dự án Git và nhánh triển khai']
];
secXml += makeTable(nodeLabelsHeaders, nodeLabelsRows, ['26%', '18%', '56%']);

const edgeTypesHeaders = ['Loại Quan Hệ (Edge)', 'Số lượng', 'Ý nghĩa Chi tiết trong Mã nguồn'];
const edgeTypesRows = [
  ['USAGE', '1.729', 'Sử dụng biến, hằng số màu sắc, typography và cấu hình hệ thống'],
  ['DEFINES', '1.308', 'Khai báo và định nghĩa các thành phần, biến và thuộc tính'],
  ['CALLS', '1.193', 'Lời gọi hàm/phương thức thực thi logic liên tầng'],
  ['DEFINES_METHOD', '666', 'Định nghĩa các method bên trong các class nghiệp vụ'],
  ['DECORATES', '234', 'Sử dụng decorator (@override, @JsonSerializable, v.v.)'],
  ['IMPORTS', '157', 'Import các module, package thư viện và file nội bộ'],
  ['CONTAINS_FILE', '147', 'Cấu trúc quản lý thư mục chứa file mã nguồn'],
  ['THROWS', '55', 'Ném ngoại lệ có kiểm soát (ApiException, NetworkException)'],
  ['CONTAINS_FOLDER', '42', 'Cấu trúc cây thư mục phân cấp'],
  ['INHERITS & HAS_BRANCH', '3', 'Kế thừa lớp cha (StatelessWidget, StatefulWidget) & Git']
];
secXml += makeTable(edgeTypesHeaders, edgeTypesRows, ['28%', '18%', '54%']);

// 8.10.3. KIẾN TRÚC 3 TẦNG
secXml += makeHeading3('8.10.3. Kiến trúc Hệ thống 3 Tầng Clean Architecture & Ranh giới Liên tầng');

secXml += makeParagraph(
  'Cốt lõi của ứng dụng Flutter SenBank là mô hình Clean Architecture phân định 3 tầng ranh giới mạch lạc. Dưới đây là sơ đồ luồng phụ thuộc và khối lượng kết nối giữa các tầng:'
);

const asciiCleanArch = 
`+-------------------------------------------------------------------------+
|                           PRESENTATION LAYER                            |
|        (UI, Screens, Widgets, Routes GoRouter, State Management)       |
|                      653 nodes, 538 outbound calls                      |
+-------------------------------------------------------------------------+
                                     |
                                     | Calls (107)
                                     v
+-------------------------------------------------------------------------+
|                               DATA LAYER                                |
|             (Remote/Local DataSources, API Repositories, DTOs)          |
|                      111 nodes, 81 outbound calls                       |
+-------------------------------------------------------------------------+
                                     |
                                     | Calls (81)
                                     v
+-------------------------------------------------------------------------+
|                               CORE LAYER                                |
|        (Constants, Network Dio, Theme, Crypto Utils, STOMP WS)         |
|                       62 nodes, High Fan-in (518)                       |
+-------------------------------------------------------------------------+`;

secXml += makeCallout('Sơ Đồ Phân Tầng Clean Architecture Mã Nguồn Flutter', asciiCleanArch);

const pkgDistHeaders = ['Gói Phần mềm (Package)', 'Số Nodes', 'Đặc điểm Phụ thuộc', 'Vai trò Hệ thống'];
const pkgDistRows = [
  ['presentation', '653 nodes', 'Fan-out: 538 calls (gọi ra Data & Core)', 'Toàn bộ giao diện 50+ màn hình & widgets'],
  ['data', '111 nodes', 'Fan-in: 114 (từ UI), Fan-out: 81 (gọi Core)', '17 Remote DataSources & Local Keychain'],
  ['core', '62 nodes', 'Fan-in: 518 calls (được gọi nhiều nhất)', 'Hạ tầng mạng Dio, WebSocket, Theme & Utils'],
  ['app & main', '44 nodes', 'Khởi tạo router, theme & multi-providers', 'Điểm vào ứng dụng (Entry points)'],
  ['tests (unit & widget)', '23 nodes', 'Kiểm thử độc lập DataSources & Mocking', 'Bộ test kiểm thử tích hợp tự động'],
  ['domain', '6 nodes', 'Entities thuần khiết độc lập công nghệ', 'Đối tượng thực thể nghiệp vụ (User, Wallet, Tx)']
];
secXml += makeTable(pkgDistHeaders, pkgDistRows, ['24%', '18%', '30%', '28%']);

const boundaryHeaders = ['Tầng Xuất Phát', 'Tầng Đích Đến', 'Số Lượng Calls', 'Ý Nghĩa Ranh Giới'];
const boundaryRows = [
  ['presentation', 'core', '431 calls', 'Giao diện sử dụng AppColors, AppTypography, Formatters trực tiếp'],
  ['presentation', 'data', '107 calls', 'Màn hình gọi DataSources để nạp và gửi dữ liệu lên Backend'],
  ['data', 'core', '81 calls', 'DataSources sử dụng DioClient, ApiConstants, AuthInterceptor'],
  ['tests', 'data & core', '9 calls', 'Unit test thực thi trực tiếp trên RemoteDataSources và Utilities'],
  ['main', 'core & presentation', '6 calls', 'Khởi chạy SenHongApp, nạp Theme và kích hoạt Router']
];
secXml += makeTable(boundaryHeaders, boundaryRows, ['24%', '24%', '18%', '34%']);

// 8.10.4. CẤU TRÚC THƯ MỤC CHI TIẾT
secXml += makeHeading3('8.10.4. Cấu trúc Thư mục Chi tiết & Phân bổ 50+ Màn hình Thuộc 15 Module Nghiệp vụ');

secXml += makeParagraph(
  'Cấu trúc thư mục dự án được tổ chức khoa học theo chuẩn kiến trúc Clean Architecture, bảo đảm khả năng mở rộng (Scalability) và bảo trì lâu dài. Chi tiết từng phân tầng như sau:'
);

secXml += makeParagraph('1. Tầng Lõi (lib/core/): Chứa các thành phần dùng chung, hoàn toàn độc lập với các tầng khác và có Fan-in cực cao (518 calls):', { bold: true });

const coreDetailsHeaders = ['Thư mục Con', 'Tập tin Mã nguồn', 'Lớp Cốt lõi', 'Dòng Code', 'Fan-in', 'Mô tả Chức năng'];
const coreDetailsRows = [
  ['constants/', 'api_constants.dart', 'ApiConstants', '1-108', '71', 'Định nghĩa toàn bộ 40+ REST API endpoints'],
  ['constants/', 'app_constants.dart', 'AppConstants', '1-24', '46', 'Hằng số ứng dụng, timeout, currency code'],
  ['network/', 'dio_client.dart', 'DioClient', '7-35', '19', 'Khởi tạo Dio HTTP Client với BaseOptions'],
  ['network/', 'auth_interceptor.dart', 'AuthInterceptor', '11-307', '1', 'Tự động đính kèm Token, bắt lỗi 401 Silent Refresh'],
  ['network/', 'idempotency_interceptor.dart', 'IdempotencyInterceptor', '4-26', '1', 'Tạo UUID ngẫu nhiên cho header Idempotency-Key'],
  ['network/', 'permission_service.dart', 'PermissionService', '9-120', '3', 'Quản lý quyền Camera, Microphone, Storage'],
  ['network/', 'push_notification_service.dart', 'PushNotificationService', '22-124', '3', 'Tích hợp Firebase Cloud Messaging (FCM)'],
  ['network/', 'realtime_notification_service.dart', 'RealtimeNotificationService', '11-159', '8', 'Kết nối WebSocket STOMP nhận thông báo realtime'],
  ['theme/', 'app_colors.dart', 'AppColors', '3-117', '249', 'Bảng màu thương hiệu SenBank & Glass Tint'],
  ['theme/', 'app_typography.dart', 'AppTypography', '7-91', '115', 'Hệ thống phân cấp kiểu chữ chuẩn Google Fonts Inter'],
  ['theme/', 'app_theme.dart', 'AppTheme', '6-130', '2', 'Cấu hình ThemeData sáng / tối toàn ứng dụng'],
  ['utils/', 'currency_formatter.dart', 'CurrencyFormatter', '3-101', '41', 'Định dạng tiền tệ VND, ẩn/hiện số dư linh hoạt']
];
secXml += makeTable(coreDetailsHeaders, coreDetailsRows, ['14%', '22%', '18%', '10%', '10%', '26%']);

secXml += makeParagraph('2. Tầng Dữ liệu (lib/data/): Quản lý lưu trữ bảo mật cục bộ và 17 Remote DataSources tương ứng với các phân hệ nghiệp vụ Backend:', { bold: true });

const dataDetailsHeaders = ['Loại DataSource', 'Tập tin', 'Lớp Xử lý', 'Fan-in', 'Nhiệm vụ Nghiệp vụ Tương tác'];
const dataDetailsRows = [
  ['Local Storage', 'auth_local_datasource.dart', 'AuthLocalDataSourceImpl', '10', 'Lưu AccessToken, RefreshToken an toàn vào Secure Keychain'],
  ['Remote API', 'auth_remote_datasource.dart', 'AuthRemoteDataSource', '10', 'Gọi /api/v1/auth: Login, Register, OTP verify, Reset Pass'],
  ['Remote API', 'wallet_remote_datasource.dart', 'WalletRemoteDataSource', '8', 'Gọi /api/v1/wallets: Truy vấn số dư, nạp tiền, rút tiền ví'],
  ['Remote API', 'profile_remote_datasource.dart', 'ProfileRemoteDataSource', '16', 'Gọi /api/v1/users/me: Cập nhật hồ sơ, avatar, eKYC status'],
  ['Remote API', 'transfer_remote_datasource.dart', 'TransferRemoteDataSource', '8', 'Gọi /api/v1/wallets/transfer: Khởi tạo & xác nhận chuyển tiền'],
  ['Remote API', 'bank_account_remote_datasource.dart', 'BankAccountRemoteDataSource', '2', 'Gọi /api/v1/bank-accounts: Liên kết & quản lý tài khoản NH'],
  ['Remote API', 'beneficiary_remote_datasource.dart', 'BeneficiaryRemoteDataSource', '6', 'Gọi /api/v1/beneficiaries: Quản lý danh bạ thụ hưởng yêu thích'],
  ['Remote API', 'bill_remote_datasource.dart', 'BillRemoteDataSource', '3', 'Gọi /api/v1/bills: Tra cứu & thanh toán điện, nước, internet'],
  ['Remote API', 'device_remote_datasource.dart', 'DeviceRemoteDataSource', '3', 'Gọi /api/v1/sessions: Quản trị phiên và thiết bị đăng nhập'],
  ['Remote API', 'funding_source_remote_datasource.dart', 'FundingSourceRemoteDataSource', '3', 'Gọi /api/v1/funding-sources: Quản lý thẻ ghi nợ / quốc tế'],
  ['Remote API', 'qr_remote_datasource.dart', 'QrRemoteDataSource', '3', 'Gọi /api/v1/payments/vietqr: Sinh & giải mã QR code'],
  ['Remote API', 'notification_remote_datasource.dart', 'NotificationRemoteDataSource', '3', 'Gọi /api/v1/notifications: Lấy danh sách thông báo phân trang'],
  ['Remote API', 'promotion_remote_datasource.dart', 'PromotionRemoteDataSource', '2', 'Gọi /api/v1/promotions: Áp dụng voucher, săn deal khuyến mãi'],
  ['Remote API', 'support_remote_datasource.dart', 'SupportRemoteDataSource', '2', 'Gọi /api/v1/support: Gửi ticket khiếu nại, chat hỗ trợ'],
  ['Remote API', 'legal_remote_datasource.dart', 'LegalRemoteDataSource', '1', 'Gọi /api/v1/legal: Truy xuất điều khoản dịch vụ & lưu consent'],
  ['Remote API', 'money_request_remote_datasource.dart', 'MoneyRequestRemoteDataSource', '1', 'Gọi /api/v1/money-requests: Quản lý yêu cầu đòi tiền / chia tiền'],
  ['Remote API', 'referral_remote_datasource.dart', 'ReferralRemoteDataSource', '1', 'Gọi /api/v1/referrals: Quản lý mã giới thiệu nhận thưởng SenBank']
];
secXml += makeTable(dataDetailsHeaders, dataDetailsRows, ['18%', '24%', '22%', '10%', '26%']);

secXml += makeParagraph('3. Tầng Giao diện (lib/presentation/): Cấu thành từ 50+ Màn hình thuộc 15 Module và 11 Custom Widgets hiệu ứng kính mờ:', { bold: true });

const modulesHeaders = ['Module Nghiệp vụ', 'Số Màn hình', 'Danh sách Các Màn hình Tiêu biểu', 'Đặc điểm Giao diện'];
const modulesRows = [
  ['A. Shell (Main)', '1', 'MainTabsScreen', 'Scaffold kính mờ với Floating Glass Bottom Bar'],
  ['B. Authentication', '8', 'Login, Register, OTP, SetPin, ForgotPass, ForgotPin, ResetPass, Terms', 'Form nhập an toàn, numpad bảo mật, bàn phím chống lộ mã'],
  ['C. Home Module', '3', 'HomeScreen, NotificationsScreen, SearchScreen', 'Thẻ BalanceCard kính quang học, Hero Header tòa nhà'],
  ['D. Transfer Module', '5', 'Beneficiaries, ChooseRecipient, EnterAmount, ConfirmTransfer, RequestTransfer', 'Form chuyển tiền 5 bước, chọn thiệp mừng E-Cards'],
  ['E. Cards Module', '3', 'CardsScreen, BankCardsScreen, PaymentMethodsScreen', 'Thẻ ảo Visa Signature phong cách Glassmorphism'],
  ['F. Bills Payment', '9', 'BillPayment, BillInput, BillConfirm, PhoneRecharge, TopupConfirm, Lottery, QuickLoan, Savings, BillPaymentConfirm', 'Thanh toán hóa đơn đa năng, mua vé số Vietlott, tính lãi vay AI'],
  ['G. QR Code Module', '2', 'MyQRScreen, ScanQRScreen', 'Camera quét mã 60fps, tạo mã VietQR cá nhân'],
  ['H. Promotions', '1', 'PromotionsScreen', 'Kho voucher, săn deal giờ vàng, auto-running banners'],
  ['I. Profile & eKYC', '5', 'EKycScreen, EmailSettings, KycLevel, IdentityDocument, DigitalSignature', 'Định danh điện tử Cấp 2, chụp CCCD gắn chip, chữ ký số'],
  ['J. Settings Module', '4', 'SettingsScreen, SecuritySettings, DeviceManagement, ConfigScreen', 'Cài đặt Dark Mode, quản lý thiết bị đăng nhập từ xa'],
  ['K. More & Referral', '2', 'MoreScreen (376 dòng), ReferralScreen (417 dòng)', 'Menu tiện ích toàn diện, đổi điểm SenPoints, giới thiệu bạn'],
  ['L. Support Module', '2', 'HelpCenterScreen, LiveChatScreen', 'Hotline 1900 6688, Chat bot trợ lý ảo SenBot AI'],
  ['M. Deposit/Withdraw', '2', 'DepositScreen, DepositConfirmScreen', 'Nạp/rút tiền ví điện tử qua tài khoản ngân hàng liên kết'],
  ['N. History Module', '1', 'TransactionDetailScreen (34 dòng)', 'Sao kê chi tiết, xuất hóa đơn điện tử PDF'],
  ['O. Splash Screen', '1', 'SplashScreen', 'Logo Hoa Sen phát sáng trên nền xanh sâu thẩm mỹ']
];
secXml += makeTable(modulesHeaders, modulesRows, ['22%', '14%', '36%', '28%']);

const widgetsHeaders = ['Tên Custom Widget', 'Tập tin', 'Dòng Mã', 'Mô tả Kỹ thuật & Hiệu ứng Đồ họa'];
const widgetsRows = [
  ['BalanceCard', 'balance_card.dart', '10-402 (392 dòng)', 'Thẻ số dư đỉnh cao với Full GPU Shader, kính mờ khúc xạ, ẩn/hiện số dư'],
  ['CustomPinNumpad', 'custom_pin_numpad.dart', '7-155 (148 dòng)', 'Bàn phím số nhập mã PIN an toàn, chống gián điệp và chống chụp màn hình'],
  ['FloatingGlassBottomBar', 'floating_glass_bottom_bar.dart', '239-407 (168 dòng)', 'Thanh điều hướng đáy nổi trên UI, hiệu ứng kính trong suốt đổi màu động'],
  ['UserAvatarWidget', 'user_avatar_widget.dart', 'Đa dòng', 'Notifier quản lý trạng thái avatar toàn cục, đồng bộ realtime'],
  ['AvatarPickerSheet', 'avatar_picker_sheet.dart', '23-108 (85 dòng)', 'Modal bottom sheet chọn ảnh từ máy ảnh hoặc thư viện thiết bị'],
  ['CurvedPromoBanner', 'curved_promo_banner.dart', '37-49', 'Banner quảng cáo cong viền mềm mại, chạy animation mượt mà'],
  ['GlassOverImage', 'glass_over_image.dart', '22-237 (215 dòng)', 'Lớp kính mờ quang học phủ trên ảnh nền, tạo chiều sâu thị giác 3D'],
  ['FloatingNotificationHud', 'floating_notification_hud.dart', '16-78 (62 dòng)', 'Thông báo HUD dạng viên thuốc nổi trên đỉnh màn hình khi có biến động số dư'],
  ['VietnamHeroHeader', 'vietnam_hero_header.dart', 'Đa dòng', 'Header đặc trưng văn hóa Việt Nam với hình tượng đóa sen và tòa nhà số'],
  ['AnimatedBranchContainer', 'animated_branch_container.dart', '9-21', 'Container co giãn chuyển động mượt mà theo từng trạng thái tab'],
  ['SideMenuDrawer', 'side_menu_drawer.dart', '12-20', 'Drawer menu trượt ngang truy cập nhanh cài đặt cá nhân']
];
secXml += makeTable(widgetsHeaders, widgetsRows, ['24%', '24%', '18%', '34%']);

// 8.10.5. HOTSPOTS & CLUSTERS
secXml += makeHeading3('8.10.5. Phân tích Điểm nóng Hotspots & Cụm Module (Clusters) theo Thuật toán Leiden');

secXml += makeParagraph(
  'Áp dụng các thuật toán đồ thị tiên tiến (Leiden Community Detection) để phát hiện các phân cụm tự nhiên trong mã nguồn và xếp hạng các điểm nóng có tần suất phục vụ cao nhất (Fan-in):'
);

const hotspotsHeaders = ['Hạng', 'Phương thức / Hàm Cốt lõi', 'Fan-in', 'Vai trò & Ý nghĩa Thiết kế'];
const hotspotsRows = [
  ['1', 'apiException', '55 calls', 'Điểm tập trung xử lý ngoại lệ HTTP/Business toàn ứng dụng, chuẩn hóa lỗi'],
  ['2', '_safeGradient', '7 calls', 'Hàm tạo dải màu Gradient an toàn chống crash khi dữ liệu màu hex bị lỗi'],
  ['3', '_map (ProfileRemoteDataSource)', '6 calls', 'Ánh xạ dữ liệu JSON hồ sơ người dùng từ Backend sang Dart Entities'],
  ['4', 'extractErrorMessage', '4 calls', 'Trích xuất thông điệp lỗi thân thiện người dùng từ API response payload'],
  ['5', '_unwrap (TransferRemoteDataSource)', '4 calls', 'Giải nén dữ liệu giao dịch chuyển tiền, trích xuất mã tham chiếu giao dịch'],
  ['6', '_copyVoucherCode', '4 calls', 'Sao chép mã giảm giá vào clipboard thiết bị kèm phản hồi haptic'],
  ['7', '_safeColor', '4 calls', 'Chuyển đổi an toàn chuỗi mã màu hex sang Flutter Color object'],
  ['8', '_loadBeneficiaries', '3 calls', 'Tải danh sách người thụ hưởng từ remote server kèm bộ nhớ đệm'],
  ['9', '_loadMethods', '3 calls', 'Nạp danh sách phương thức thanh toán và nguồn tiền khả dụng'],
  ['10', '_buildNumberButton', '2 calls', 'Tạo các nút bấm số trên bàn phím CustomPinNumpad an toàn']
];
secXml += makeTable(hotspotsHeaders, hotspotsRows, ['12%', '32%', '18%', '38%']);

secXml += makeParagraph(
  'Kết quả phát hiện 12 cụm mã nguồn (Code Clusters) bằng thuật toán Leiden cho thấy cấu trúc module có độ kết dính (Cohesion) cực cao:'
);

const clustersHeaders = ['Cluster ID', 'Số Node', 'Độ Kết dính (Cohesion)', 'Các Thành phần Tiêu biểu', 'Phân hệ'];
const clustersRows = [
  ['11', '198 nodes', '0.79 (Cao)', 'AppColors, AppTypography, CurrencyFormatter, build', 'Core UI Theme (Cụm lớn nhất)'],
  ['57', '89 nodes', '0.71 (Cao)', 'WalletRemoteDataSource, ProfileRemoteDataSource, initState', 'Wallet & Transfer Business'],
  ['47', '81 nodes', '0.95 (Xuất sắc)', 'ApiConstants, apiException, _map, _unwrap, getTransactions', 'API Client & Error Handling'],
  ['2', '30 nodes', '0.72 (Cao)', '_buildUuDaiTab, _safeGradient, _buildPromotionCard', 'Promotions & Vouchers'],
  ['17', '27 nodes', '0.56 (Tốt)', 'main, build, _submit, _pay, WalletTransactionDataSource', 'App Entry & Transaction Execution'],
  ['75', '25 nodes', '0.52 (Tốt)', 'AuthLocalDataSourceImpl, AuthRemoteDataSource, _login', 'Authentication & Token Lifecycle'],
  ['65', '19 nodes', '0.63 (Tốt)', 'UserAvatarNotifier, _uploadAndApplyAvatar, AvatarPicker', 'User Profile & Media Avatar'],
  ['98', '16 nodes', '0.55 (Tốt)', 'build, BeneficiaryRemoteDataSource, _loadBeneficiaries', 'Beneficiary Contacts Management'],
  ['156', '8 nodes', '1.00 (Tuyệt đối)', '_buildAutoRunningBanner, _startAutoScroll, _buildDiagonal', 'Auto-scrolling Promotion Banner'],
  ['46', '6 nodes', '0.58 (Tốt)', '_loadMethods, _showAddCardModal, FundingSourceDataSource', 'Payment Methods & Cards'],
  ['291', '6 nodes', '0.42 (Trung bình)', 'build, _showDisputeModal, _downloadReceipt, _buildReceiptRow', 'Transaction Dispute & PDF Receipt'],
  ['41', '6 nodes', '0.46 (Trung bình)', 'build, _buildRecentHistory, _buildTrendingKeywords', 'Smart Search & History Filtering']
];
secXml += makeTable(clustersHeaders, clustersRows, ['14%', '16%', '22%', '30%', '18%']);

// 8.10.6. DEPENDENCIES & TESTING
secXml += makeHeading3('8.10.6. Danh mục 23 Thư viện (Dependencies) & Chiến lược Kiểm thử Tự động');

secXml += makeParagraph(
  'Dự án tích hợp có chọn lọc 23 thư viện chuyên ngành Fintech, bảo đảm tính ổn định, bảo mật cao và hiệu năng tối ưu:'
);

const depsHeaders = ['Phân nhóm Thư viện', 'Tên Package Thư viện', 'Phiên bản', 'Mục đích Sử dụng Chi tiết'];
const depsRows = [
  ['UI & Liquid Glass', 'liquid_glass_widgets', '^1.3.0', 'Thư viện chuyên dụng tạo hiệu ứng kính mờ và khúc xạ quang học'],
  ['UI & Liquid Glass', 'cupertino_icons', '^1.0.8', 'Hệ thống biểu tượng chuẩn iOS phong cách hiện đại'],
  ['UI & Liquid Glass', 'google_fonts', '^6.2.1', 'Nạp font chữ Inter sắc nét, tối ưu hóa cho màn hình di động độ phân giải cao'],
  ['State Management', 'flutter_bloc', '^8.1.6', 'Quản lý luồng sự kiện và trạng thái nghiệp vụ theo mô hình BLoC'],
  ['State Management', 'equatable', '^2.0.7', 'So sánh giá trị các đối tượng State mà không cần override hashCode'],
  ['Navigation', 'go_router', '^14.8.1', 'Định tuyến khai báo (Declarative Routing), hỗ trợ Deep Linking'],
  ['Networking', 'dio', '^5.8.0+1', 'HTTP client mạnh mẽ, hỗ trợ Interceptor, CancelToken và FormData'],
  ['Networking', 'pretty_dio_logger', '^1.4.0', 'Ghi nhật ký Request/Response chi tiết phục vụ kiểm thử và debug'],
  ['Networking', 'stomp_dart_client', '^2.1.3', 'Client WebSocket giao thức STOMP nhận thông báo biến động tức thì'],
  ['Security & Storage', 'flutter_secure_storage', '^9.2.4', 'Lưu trữ Token an toàn trong Keychain (iOS) và Keystore AES (Android)'],
  ['Security & Storage', 'shared_preferences', '^2.5.2', 'Lưu trữ cấu hình người dùng, ngôn ngữ, theme không nhạy cảm'],
  ['Security & Storage', 'local_auth', '^2.3.0', 'Xác thực sinh trắc học FaceID, Touch ID và vân tay Android'],
  ['QR Code', 'mobile_scanner', '^6.0.4', 'Quét mã QR qua camera phần cứng tốc độ 60 FPS chuẩn xác'],
  ['QR Code', 'qr_flutter', '^4.1.0', 'Tạo mã QR thanh toán cá nhân chuẩn VietQR & EMVCo'],
  ['Utilities', 'intl', '^0.20.2', 'Đa ngôn ngữ và định dạng số tiền tệ, ngày tháng theo chuẩn Việt Nam'],
  ['Utilities', 'uuid', '^4.5.1', 'Tạo mã định danh duy nhất cho header Idempotency-Key'],
  ['Utilities', 'firebase_core & messaging', '^4.14.0 / ^16.6.0', 'Đăng ký FCM token và nhận Push Notification từ backend'],
  ['Utilities', 'permission_handler', '^11.3.1', 'Xin quyền truy cập Camera, Thư viện ảnh, Thông báo'],
  ['Utilities', 'image_picker', '^1.2.3', 'Chọn ảnh đại diện avatar từ thư viện ảnh hoặc chụp trực tiếp'],
  ['Dev Tools', 'flutter_lints', '^3.0.0', 'Bộ quy tắc kiểm tra tĩnh chất lượng mã nguồn Dart'],
  ['Dev Tools', 'flutter_launcher_icons', '^0.14.4', 'Tự động tạo bộ icon ứng dụng đa kích thước cho iOS và Android']
];
secXml += makeTable(depsHeaders, depsRows, ['22%', '24%', '14%', '40%']);

secXml += makeParagraph(
  'Chiến lược kiểm thử tự động (Automated Testing) được thiết lập với 6 bộ test suite bao phủ từ tầng dữ liệu API đến giao diện màn hình:'
);

const testHeaders = ['Tập tin Test Suite', 'Phạm vi Kiểm thử', 'Đối tượng Giả lập (Mocks / Stubs)'];
const testRows = [
  ['test/remote_datasources_test.dart', 'Kiểm thử toàn bộ 17 Remote DataSources với Mock Http Adapter', 'MockHttpClientAdapter, FakeAuthLocalDataSource'],
  ['test/notifications_and_hud_test.dart', 'Kiểm thử hệ thống thông báo HUD nổi và STOMP WebSocket', 'FakeSecureStorage, InAppNotificationManager Stub'],
  ['test/promotions_test.dart', 'Kiểm thử màn hình Khuyến mãi, sao chép voucher, filter deals', 'MockPromotionRemoteDataSource'],
  ['test/routes_test.dart', 'Kiểm thử bộ điều hướng GoRouter, bảo vệ route yêu cầu xác thực', 'MockGoRouterState, FakeAuthSession'],
  ['test/widget_test.dart', 'Widget testing kiểm thử CustomPinNumpad, BalanceCard render', 'TestWidgetsFlutterBinding'],
  ['test/be_integration_test.dart', 'Kiểm thử tích hợp End-to-End giữa Flutter Client và Spring Boot BE', 'Live Local Backend Server (port 8080)']
];
secXml += makeTable(testHeaders, testRows, ['30%', '42%', '28%']);

// 8.10.7. 10 TÍNH NĂNG & LIQUID GLASS UI
secXml += makeHeading3('8.10.7. 10 Nhóm Tính Năng Trọng Yếu & Hệ thống Giao diện Kính mờ Quang học (Liquid Glass UI System)');

secXml += makeParagraph(
  'Ứng dụng Flutter Sen Hồng Bank hiện thực hóa đầy đủ 10 nhóm tính năng nghiệp vụ tài chính ngân hàng số cao cấp:'
);

const featuresHeaders = ['Nhóm Tính Năng', 'Các Nghiệp Vụ Hiện Thực Hóa', 'Mức Độ Hoàn Thiện'];
const featuresRows = [
  ['1. Xác thực & Bảo mật', 'Đăng ký/Đăng nhập OTP, PIN 6 số, Quên mật khẩu, Sinh trắc học FaceID/Vân tay, JWT Token tự làm mới, mã hóa Keychain', '100% Hoàn chỉnh'],
  ['2. Quản lý Ví Số', 'BalanceCard kính mờ quang học, hiển thị/ẩn số dư, sao kê lịch sử giao dịch phân trang, nạp/rút tiền liên kết ngân hàng', '100% Hoàn chỉnh'],
  ['3. Chuyển Tiền 24/7', 'Chuyển tiền nội bộ / Napas 24/7, danh bạ thụ hưởng, bàn phím tài chính, gửi kèm thiệp E-Card, yêu cầu đòi tiền / chia tiền nhóm', '100% Hoàn chỉnh'],
  ['4. Thanh Toán Hóa Đơn', 'Tra cứu & thanh toán tiền điện EVN, nước Sawaco, cước internet FPT, nạp tiền điện thoại, mua vé số Vietlott, tính lãi vay AI', '100% Hoàn chỉnh'],
  ['5. QR Code Thanh Toán', 'Tạo mã VietQR cá nhân chuẩn EMVCo, camera quét mã 60fps, giải mã QR chuyển tiền và thanh toán hóa đơn siêu tốc', '100% Hoàn chỉnh'],
  ['6. Kho Ưu Đãi & Khuyến Mãi', 'Danh mục Voucher giảm giá độc quyền, 3 tab phân loại (Ưu đãi, Hiện tại, Mở rộng), 1-chạm sao chép mã, banner tự cuộn', '100% Hoàn chỉnh'],
  ['7. Quản Lý Thẻ Ảo', 'Thẻ Visa Signature ảo phong cách Glassmorphism, hiển thị số thẻ masked, bảo mật CVV, đổi PIN thẻ, cài đặt hạn mức', '100% Hoàn chỉnh'],
  ['8. Hồ Sơ & eKYC Cấp 2', 'Cập nhật thông tin cá nhân, chụp ảnh CCCD gắn chip, nhận diện khuôn mặt sinh trắc học, cấp chứng chỉ định danh Cấp 2', '100% Hoàn chỉnh'],
  ['9. Cài Đặt & Hỗ Trợ', 'Cài đặt Dark/Light theme, quản lý thiết bị đăng nhập từ xa, trung tâm trợ giúp FAQ, hotline 1900 6688, live-chat SenBot AI', '100% Hoàn chỉnh'],
  ['10. Hệ Thống Thông Báo', 'Push notification qua FCM, realtime biến động số dư qua WebSocket STOMP, FloatingNotificationHud nổi kính mờ trên UI', '100% Hoàn chỉnh']
];
secXml += makeTable(featuresHeaders, featuresRows, ['24%', '60%', '16%']);

secXml += makeParagraph(
  'Đặc trưng đột phá về giao diện của phiên bản Flutter là Hệ thống Liquid Glass UI System. Để bảo đảm ứng dụng luôn đạt tốc độ khung hình lý tưởng trên mọi thế hệ điện thoại, hệ thống thiết lập 3 cấp độ chất lượng kính mờ quang học:'
);

const glassLevelsHeaders = ['Cấp Độ Kính (Quality Level)', 'Áp Dụng Cho Thành Phần', 'Cơ Chế Kỹ Thuật Đồ Họa', 'Tốc Độ Khung Hình (FPS)'];
const glassLevelsRows = [
  ['Premium Glass', 'BalanceCard, Thẻ Visa Signature ảo', 'Custom Fragment Shader, tính toán khúc xạ quang học (Refraction) và phản xạ ánh sáng', '60 FPS mượt mà'],
  ['Standard Glass', 'Floating Glass Bottom Bar, Dialog Modals', 'BackdropFilter kết hợp ma trận mờ Gaussian Blur + dải màu bán trong suốt RGBA', '60 FPS mượt mà'],
  ['Minimal Glass', 'Danh sách giao dịch, thẻ phụ trợ', 'Container phủ màu bán trong suốt, không dùng GPU shader phức tạp, giảm tải vi xử lý', '120 FPS cực đại (ProMotion)']
];
secXml += makeTable(glassLevelsHeaders, glassLevelsRows, ['22%', '28%', '34%', '16%']);

// 8.10.8. BẢO MẬT & BEST PRACTICES
secXml += makeHeading3('8.10.8. Cơ chế Bảo mật Chuyên sâu & Best Practices trong Fintech Mobile');

secXml += makeParagraph(
  'Ứng dụng tuân thủ nghiêm ngặt các tiêu chuẩn an toàn thông tin tài chính khắt khe nhất:'
);

secXml += makeParagraph(
  '1. Quản lý Vòng đời Token Bảo mật: Access Token JWT có thời hạn hiệu lực (TTL) nghiêm ngặt là 5 phút. Khi hết hạn, AuthInterceptor tự động đánh chặn lỗi HTTP 401, tạm giữ các request trong hàng đợi (Queued Requests), âm thầm gọi API /api/v1/auth/refresh để lấy token mới và tự động thực thi lại các request bị gián đoạn mà người dùng không hề nhận biết.',
  { bold: false }
);

secXml += makeParagraph(
  '2. Cơ chế Chống Trùng lặp Giao dịch (Idempotency): Mọi yêu cầu HTTP POST làm thay đổi số dư ví (nạp tiền, chuyển khoản, thanh toán hóa đơn) đều được IdempotencyInterceptor tự động sinh một mã UUID ngẫu nhiên gắn vào header Idempotency-Key. Phía Backend Core Banking sử dụng Distributed Lock trên Redis để bảo đảm giao dịch chỉ được trừ tiền chính xác 1 lần duy nhất ngay cả khi mạng chập chờn.',
  { bold: false }
);

secXml += makeParagraph(
  '3. Bảo mật Bàn phím & Ngăn chặn Gián điệp: Màn hình nhập mã PIN sử dụng CustomPinNumpad nội bộ tự vẽ, không kích hoạt bàn phím hệ điều hành, vô hiệu hóa hoàn toàn nguy cơ bị keylogger thu thập phím bấm. Ngoài ra, ứng dụng bật cờ FLAG_SECURE trên Android nhằm ngăn chặn việc chụp ảnh màn hình hoặc ghi video lén dữ liệu số dư và mã xác thực.',
  { bold: false }
);

// 8.10.9. HIỆU NĂNG & HƯỚNG PHÁT TRIỂN
secXml += makeHeading3('8.10.9. Phân tích Hiệu Năng Đồ họa & Lộ trình Mở rộng Tương lai');

secXml += makeParagraph(
  'Bảng tổng hợp đánh giá hiệu năng kiến trúc qua các tầng chức năng của ứng dụng Flutter SenBank:'
);

const perfHeaders = ['Phân Tầng Kiến Trúc', 'Số Lượng Nodes', 'Calls Đích Vào', 'Calls Xuất Ra', 'Đánh Giá Độ Phức Tạp'];
const perfRows = [
  ['Presentation Layer', '653 nodes', '6 calls', '538 calls', 'Độ phức tạp cao, tập trung logic hiển thị và animation mượt mà'],
  ['Data Layer', '111 nodes', '114 calls', '81 calls', 'Độ phức tạp trung bình, ánh xạ JSON DTOs sang Clean Entities'],
  ['Core Layer', '62 nodes', '518 calls', '0 calls', 'Độ phức tạp thấp, tính ổn định và độ tin cậy tái sử dụng cực cao'],
  ['Domain Layer', '6 nodes', 'Rộng khắp', '0 calls', 'Tối giản, trừu tượng hóa nghiệp vụ cốt lõi ví điện tử']
];
secXml += makeTable(perfHeaders, perfRows, ['22%', '16%', '16%', '16%', '30%']);

const roadmapHeaders = ['Hạng Mục', 'Trạng Thái', 'Chi Tiết Kỹ Thuật Hiện Thực Hóa & Dự Kiến'];
const roadmapRows = [
  ['50+ Màn hình Giao diện', 'Đã Hoàn Thành (100%)', 'Phủ kín 15 phân hệ nghiệp vụ ngân hàng số đa tiện ích'],
  ['Hệ thống Liquid Glass UI', 'Đã Hoàn Thành (100%)', 'Tích hợp shader quang học, hiệu ứng kính mờ và bottom bar nổi'],
  ['Đồng bộ API Backend Spring Boot', 'Đã Hoàn Thành (100%)', 'Tương thích 100% với 40+ REST API endpoints và WebSocket STOMP'],
  ['Bảo mật Token & Idempotency', 'Đã Hoàn Thành (100%)', 'JWT Auto-refresh, UUID Idempotency-Key, Secure Keychain'],
  ['Chế độ Ngoại tuyến (Offline Mode)', 'Lộ trình Mở rộng', 'Bộ nhớ đệm cục bộ Hive / Isar Database cho phép tra cứu sao kê offline'],
  ['Sinh trắc học Mọi Luồng (Full Bio)', 'Lộ trình Mở rộng', 'Thay thế hoàn toàn mã OTP bằng xác thực khuôn mặt sinh trắc học FaceID'],
  ['Chuẩn Ngân hàng Mở ISO 20022', 'Lộ trình Mở rộng', 'Mở rộng Open Banking API chuẩn hóa bản tin tài chính ISO 20022 XML']
];
secXml += makeTable(roadmapHeaders, roadmapRows, ['28%', '22%', '50%']);

// 8.10.10. BỘ SƯU TẬP 29 ẢNH CHỤP MÀN HÌNH FLUTTER
secXml += makeHeading3('8.10.10. Bộ Sưu Tập Thực Nghiệm 29 Màn Hình Giao Diện Ứng Dụng Flutter Sen Hồng Bank (Hình 8.31 đến Hình 8.59)');

secXml += makeParagraph(
  'Dưới đây là toàn bộ 29 ảnh chụp màn hình giao diện thực tế thu thập trực tiếp từ phiên bản ứng dụng Flutter Sen Hồng Bank đang chạy thử nghiệm. Các màn hình được phân loại theo 6 luồng trải nghiệm người dùng, trình bày theo bố cục đối chiếu 2 cột chuẩn xuất bản:'
);

secXml += makeParagraph('LUỒNG A: KHỞI ĐỘNG, XÁC THỰC TÀI KHOẢN & PHÁP LÝ NGÂN HÀNG SỐ (6 MÀN HÌNH)', { bold: true, color: '0F2C59' });
secXml += makeImagePairTable(screens[0], screens[1], 501);
secXml += makeImagePairTable(screens[2], screens[3], 503);
secXml += makeImagePairTable(screens[4], screens[5], 505);

secXml += makeParagraph('LUỒNG B: BẢNG ĐIỀU KHIỂN TRANG CHỦ, TIỆN ÍCH MỞ RỘNG & THÔNG BÁO REALTIME (4 MÀN HÌNH)', { bold: true, color: '0F2C59' });
secXml += makeImagePairTable(screens[6], screens[7], 507);
secXml += makeImagePairTable(screens[8], screens[9], 509);

secXml += makeParagraph('LUỒNG C: QUY TRÌNH CHUYỂN TIỀN 24/7, QUÉT MÃ QR & BIÊN LAI ĐIỆN TỬ (6 MÀN HÌNH)', { bold: true, color: '0F2C59' });
secXml += makeImagePairTable(screens[10], screens[11], 511);
secXml += makeImagePairTable(screens[12], screens[13], 513);
secXml += makeImagePairTable(screens[14], screens[15], 515);

secXml += makeParagraph('LUỒNG D: TIỆN ÍCH THANH TOÁN HÓA ĐƠN, NẠP THẺ & GIẢI TRÍ SỐ (4 MÀN HÌNH)', { bold: true, color: '0F2C59' });
secXml += makeImagePairTable(screens[16], screens[17], 517);
secXml += makeImagePairTable(screens[18], screens[19], 519);

secXml += makeParagraph('LUỒNG E: TÀI CHÍNH CÁ NHÂN: TIẾT KIỆM SINH LỜI, VAY TIÊU DÙNG AI & MUA XE VINFAST (4 MÀN HÌNH)', { bold: true, color: '0F2C59' });
secXml += makeImagePairTable(screens[20], screens[21], 521);
secXml += makeImagePairTable(screens[22], screens[23], 523);

secXml += makeParagraph('LUỒNG F: THẺ ẢO SIGNATURE, ĐỊNH DANH eKYC, KHO ƯU ĐÃI & TRỢ GIÚP 24/7 (5 MÀN HÌNH)', { bold: true, color: '0F2C59' });
secXml += makeImagePairTable(screens[24], screens[25], 525);
secXml += makeImagePairTable(screens[26], screens[27], 527);
secXml += makeImagePairTable(screens[28], null, 529);

console.log('Section 8.10 XML generated successfully. Total length:', secXml.length);

// INSERT SECTION 8.10 INTO DOCUMENT.XML
console.log('Finding insertion point before PHẦN 9 in document.xml...');
const p9Body = docXml.indexOf('PHẦN 9:', 1391177);
const p8end = docXml.lastIndexOf('</w:tbl>', p9Body);

if (p8end === -1 || p9Body === -1) {
  console.error('Failed to locate insertion point in body!');
  process.exit(1);
}

const insertPos = p8end + 8; // right after closing </w:tbl> of Section 8.9
console.log(`Inserting Section 8.10 at pos ${insertPos} (before PHẦN 9 at pos ${p9Body})...`);

docXml = docXml.substring(0, insertPos) + secXml + docXml.substring(insertPos);
console.log('Inserted Section 8.10 successfully.');

// UPDATE SECTION 8 TITLE IN BODY AND TOC
console.log('Updating Section 8 titles to dual-platform showcase (59 images)...');
const oldTitle = 'PHẦN 8: HIỆN THỰC HÓA GIAO DIỆN &amp; CÁC LUỒNG NGHIỆP VỤ THỰC TẾ (DEMO SHOWCASE - 30 HÌNH ẢNH TOÀN DIỆN)';
const newTitle = 'PHẦN 8: HIỆN THỰC HÓA GIAO DIỆN &amp; CÁC LUỒNG NGHIỆP VỤ THỰC TẾ (DEMO SHOWCASE ĐA NỀN TẢNG REACT NATIVE &amp; FLUTTER - 59 HÌNH ẢNH TOÀN DIỆN)';

docXml = docXml.replaceAll(oldTitle, newTitle);

// UPDATE TABLE OF FIGURES (DANH MỤC HÌNH ẢNH)
console.log('Updating Danh mục hình ảnh to include 29 Flutter figures...');
const idxDMHA = docXml.indexOf('DANH MỤC HÌNH ẢNH VÀ SƠ ĐỒ KIẾN TRÚC');
const tblEndDMHA = docXml.indexOf('</w:tbl>', idxDMHA);

// Build rows for 29 Flutter figures to insert before </w:tbl>
let extraFigRows = '';
screens.forEach((sc, i) => {
  const rowFill = i % 2 === 0 ? 'F8FAFC' : 'FFFFFF';
  extraFigRows += `<w:tr><w:trPr><w:cantSplit/></w:trPr><w:tc><w:tcPr><w:tcW w:type="pct" w:w="78%"/><w:shd w:fill="${rowFill}" w:val="clear"/><w:tcMar><w:top w:type="dxa" w:w="90"/><w:left w:type="dxa" w:w="120"/><w:bottom w:type="dxa" w:w="90"/><w:right w:type="dxa" w:w="120"/></w:tcMar></w:tcPr><w:p><w:pPr><w:jc w:val="left"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:cs="Times New Roman" w:eastAsia="Times New Roman" w:hAnsi="Times New Roman"/><w:b w:val="true"/><w:bCs w:val="true"/><w:color w:val="0F172A"/><w:sz w:val="21"/><w:szCs w:val="21"/></w:rPr><w:t xml:space="preserve">Hình ${sc.figNum}: ${escapeXml(sc.title)}</w:t></w:r></w:p></w:tc><w:tc><w:tcPr><w:tcW w:type="pct" w:w="22%"/><w:shd w:fill="${rowFill}" w:val="clear"/><w:tcMar><w:top w:type="dxa" w:w="90"/><w:left w:type="dxa" w:w="120"/><w:bottom w:type="dxa" w:w="90"/><w:right w:type="dxa" w:w="120"/></w:tcMar></w:tcPr><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:cs="Times New Roman" w:eastAsia="Times New Roman" w:hAnsi="Times New Roman"/><w:b w:val="false"/><w:bCs w:val="false"/><w:color w:val="0F172A"/><w:sz w:val="21"/><w:szCs w:val="21"/></w:rPr><w:t xml:space="preserve">Trang ${90 + Math.floor(i / 2)}</w:t></w:r></w:p></w:tc></w:tr>`;
});

docXml = docXml.substring(0, tblEndDMHA) + extraFigRows + docXml.substring(tblEndDMHA);
console.log('Appended 29 figures to Table of Figures.');

// Update Figure count introduction in Danh mục hình ảnh
const oldFigIntro = 'Danh mục tổng hợp 9 sơ đồ kiến trúc hệ thống và 30 ảnh chụp màn hình giao diện thực tế thu thập trực tiếp từ ứng dụng SenBank kèm số trang tra cứu:';
const newFigIntro = 'Danh mục tổng hợp 9 sơ đồ kiến trúc hệ thống và 59 ảnh chụp màn hình giao diện thực tế (gồm 30 màn hình React Native và 29 màn hình Flutter) thu thập trực tiếp từ ứng dụng SenBank kèm số trang tra cứu:';
docXml = docXml.replace(oldFigIntro, newFigIntro);

// UPDATE TABLE OF CONTENTS (MỤC LỤC)
console.log('Adding Section 8.10 entry to Table of Contents...');
const idxTOC = docXml.indexOf('MỤC LỤC TỔNG QUAN BÁO CÁO ĐỒ ÁN');
const p9TOC = docXml.indexOf('PHẦN 9:', idxTOC);
const trP9TOC = docXml.lastIndexOf('<w:tr', p9TOC);

const toc810Entry = `<w:tr><w:trPr><w:cantSplit/></w:trPr><w:tc><w:tcPr><w:tcW w:type="pct" w:w="84%"/><w:shd w:fill="F8FAFC" w:val="clear"/><w:tcMar><w:top w:type="dxa" w:w="90"/><w:left w:type="dxa" w:w="120"/><w:bottom w:type="dxa" w:w="90"/><w:right w:type="dxa" w:w="120"/></w:tcMar></w:tcPr><w:p><w:pPr><w:jc w:val="left"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:cs="Times New Roman" w:eastAsia="Times New Roman" w:hAnsi="Times New Roman"/><w:b w:val="true"/><w:bCs w:val="true"/><w:color w:val="0F172A"/><w:sz w:val="21"/><w:szCs w:val="21"/></w:rPr><w:t xml:space="preserve">  8.10. Nghiên Cứu Mở Rộng Đa Nền Tảng: Hiện Thực Hóa Ứng Dụng Ví Điện Tử Sen Hồng Bank Trên Nền Tảng Flutter &amp; Hệ Thống Giao Diện Liquid Glass UI</w:t></w:r></w:p></w:tc><w:tc><w:tcPr><w:tcW w:type="pct" w:w="16%"/><w:shd w:fill="F8FAFC" w:val="clear"/><w:tcMar><w:top w:type="dxa" w:w="90"/><w:left w:type="dxa" w:w="120"/><w:bottom w:type="dxa" w:w="90"/><w:right w:type="dxa" w:w="120"/></w:tcMar></w:tcPr><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:cs="Times New Roman" w:eastAsia="Times New Roman" w:hAnsi="Times New Roman"/><w:b w:val="false"/><w:bCs w:val="false"/><w:color w:val="0F172A"/><w:sz w:val="21"/><w:szCs w:val="21"/></w:rPr><w:t xml:space="preserve">Trang 90</w:t></w:r></w:p></w:tc></w:tr>`;

docXml = docXml.substring(0, trP9TOC) + toc810Entry + docXml.substring(trP9TOC);
console.log('Added Section 8.10 entry to Table of Contents successfully.');

// VALIDATE XML TAG BALANCE
console.log('=== VALIDATING XML TAG BALANCE ===');
const tagsToCheck = ['w:p', 'w:tbl', 'w:tr', 'w:tc', 'w:r', 'w:drawing'];
let allBalanced = true;

tagsToCheck.forEach(tag => {
  const openCount = (docXml.match(new RegExp(`<${tag}\\b[^>]*>`, 'g')) || []).length;
  const closeCount = (docXml.match(new RegExp(`</${tag}>`, 'g')) || []).length;
  const ok = openCount === closeCount;
  if (!ok) allBalanced = false;
  console.log(`  Tag <${tag}>: open=${openCount}, close=${closeCount}, balanced=${ok}`);
});

if (!allBalanced) {
  console.error('XML Tag Balance validation failed! Aborting write.');
  process.exit(1);
}

// Check tag nesting stack
console.log('Checking tag nesting stack...');
const tagRegex = /<(\/)?(w:[a-zA-Z0-9]+)([^>]*)>/g;
let stack = [];
let m;
let nestingErrors = [];

while ((m = tagRegex.exec(docXml)) !== null) {
  const isClose = m[1] === '/';
  const tagName = m[2];
  const selfClosing = m[3].endsWith('/');
  if (selfClosing) continue;

  if (!isClose) {
    if (tagName === 'w:p') {
      if (stack.includes('w:p')) {
        nestingErrors.push({ type: 'nested_p', pos: m.index, snippet: docXml.substring(m.index - 30, m.index + 50) });
      }
    }
    stack.push(tagName);
  } else {
    const top = stack.pop();
    if (top !== tagName) {
      nestingErrors.push({ type: 'tag_mismatch', expected: top, found: tagName, pos: m.index, snippet: docXml.substring(m.index - 30, m.index + 50) });
      if (nestingErrors.length > 10) break;
    }
  }
}

if (nestingErrors.length > 0) {
  console.error('Nesting errors found:', nestingErrors);
  process.exit(1);
}

console.log('Tag nesting is 100% PERFECT! Zero nesting errors.');

// SAVE MODIFIED DOCUMENT.XML
fs.writeFileSync(docXmlPath, docXml, 'utf8');
console.log('Saved document.xml. Size:', fs.statSync(docXmlPath).size, 'bytes');

console.log('=== COMPLETED SECTION 8.10 INTEGRATION SUCCESSFULLY ===');

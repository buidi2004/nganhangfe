export interface LegalClause {
  number: string;
  text: string;
}

export interface LegalArticle {
  id: string;
  articleNumber: string;
  title: string;
  clauses: LegalClause[];
  highlights?: string[];
}

export interface LegalChapter {
  id: string;
  shortCode: string;
  chapterNumber: string;
  title: string;
  articles: LegalArticle[];
}

export interface LegalDocument {
  title: string;
  shortTitle: string;
  issuer: string;
  decisionNumber: string;
  version: string;
  effectiveDate: string;
  scope: string;
  legalBases: string[];
  chapters: LegalChapter[];
}

export const LEGAL_TERMS_DATA: LegalDocument = {
  title: 'ĐIỀU KHOẢN VÀ ĐIỀU KIỆN SỬ DỤNG DỊCH VỤ NGÂN HÀNG ĐIỆN TỬ & VÍ ĐIỆN TỬ SEN HỒNG',
  shortTitle: 'Điều khoản sử dụng dịch vụ SenBank',
  issuer: 'Ngân hàng TMCP Sen Hồng (SenBank)',
  decisionNumber: 'Quyết định số 186/2026/QĐ-TGĐ-SENBANK',
  version: '2026.08 (Bản sửa đổi lần 3)',
  effectiveDate: '01/09/2026',
  scope: 'Áp dụng trên toàn bộ lãnh thổ Việt Nam và người dùng quốc tế sử dụng ứng dụng SenBank',
  legalBases: [
    'Luật Các tổ chức tín dụng số 32/2024/QH15',
    'Luật Giao dịch điện tử số 20/2023/QH15',
    'Luật Phòng, chống rửa tiền số 14/2022/QH15',
    'Nghị định số 52/2024/NĐ-CP về thanh toán không dùng tiền mặt',
    'Nghị định số 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân',
    'Quyết định số 2345/QĐ-NHNN về triển khai các giải pháp an toàn, bảo mật trong thanh toán trực tuyến',
    'Thông tư số 40/2024/TT-NHNN của Ngân hàng Nhà nước Việt Nam về hướng dẫn mở và sử dụng tài khoản thanh toán',
  ],
  chapters: [
    {
      id: 'c1',
      shortCode: 'I. Quy định chung',
      chapterNumber: 'CHƯƠNG I',
      title: 'QUY ĐỊNH CHUNG VÀ GIẢI THÍCH TỪ NGỮ',
      articles: [
        {
          id: 'c1_a1',
          articleNumber: 'Điều 1',
          title: 'Phạm vi điều chỉnh và Đối tượng áp dụng',
          clauses: [
            {
              number: '1.1',
              text: 'Bản Điều khoản và Điều kiện sử dụng dịch vụ ngân hàng điện tử (sau đây gọi tắt là "Điều khoản") quy định về quyền, nghĩa vụ, trách nhiệm pháp lý và các quy tắc giao dịch giữa Ngân hàng TMCP Sen Hồng (sau đây gọi là "SenBank") và Khách hàng cá nhân, tổ chức khi đăng ký, mở, kích hoạt, quản lý và sử dụng các dịch vụ ngân hàng số, ví điện tử, thanh toán không tiền mặt trên ứng dụng di động SenBank Mobile App, website và các nền tảng kỹ thuật số trực thuộc SenBank.',
            },
            {
              number: '1.2',
              text: 'Việc Khách hàng nhấn chọn nút "Tôi đồng ý", "Xác nhận", "Tiếp tục" trong quá trình cài đặt, đăng ký hoặc thực hiện bất kỳ thao tác đăng nhập, giao dịch tài chính nào trên hệ thống được coi là bằng chứng pháp lý xác thực, thể hiện sự đồng thuận tự nguyện, vô điều kiện và không thể hủy ngang đối với toàn bộ nội dung của bản Điều khoản này cùng các văn bản sửa đổi, bổ sung công bố công khai theo từng thời kỳ.',
            },
            {
              number: '1.3',
              text: 'Các Điều khoản này tạo thành một hợp đồng dịch vụ điện tử có giá trị pháp lý ràng buộc giữa SenBank và Khách hàng theo quy định của Luật Giao dịch điện tử và Bộ luật Dân sự nước Cộng hòa Xã hội Chủ nghĩa Việt Nam.',
            },
          ],
          highlights: [
            'Hợp đồng dịch vụ điện tử có giá trị pháp lý đầy đủ',
            'Bấm "Tôi đồng ý" đồng nghĩa chấp thuận toàn bộ điều khoản không thể hủy ngang',
          ],
        },
        {
          id: 'c1_a2',
          articleNumber: 'Điều 2',
          title: 'Giải thích từ ngữ pháp lý chuyên ngành',
          clauses: [
            {
              number: '2.1',
              text: 'SenBank: Là Ngân hàng TMCP Sen Hồng, tổ chức tín dụng thành lập và hoạt động hợp pháp theo Giấy phép của Ngân hàng Nhà nước Việt Nam (NHNN), cung cấp dịch vụ ngân hàng thương mại, thanh toán trung gian và ví điện tử.',
            },
            {
              number: '2.2',
              text: 'Khách hàng (KH): Là cá nhân từ đủ 15 tuổi trở lên có đầy đủ năng lực hành vi dân sự hoặc người giám hộ hợp pháp theo luật định, đã hoàn tất quy trình định danh điện tử (eKYC) và được cấp quyền truy cập tài khoản.',
            },
            {
              number: '2.3',
              text: 'Dịch vụ Ngân hàng điện tử (E-Banking / SenBank Digital): Hệ thống công nghệ thông tin cho phép Khách hàng thực hiện các giao dịch vấn tin tài khoản, chuyển tiền nội bộ và liên ngân hàng, nạp/rút tiền, thanh toán hóa đơn, mở tiết kiệm trực tuyến, quản lý thẻ và các dịch vụ giá trị gia tăng 24/7.',
            },
            {
              number: '2.4',
              text: 'Định danh điện tử (eKYC): Quy trình nhận biết, xác thực và thu thập dữ liệu Khách hàng bằng phương tiện điện tử dựa trên Căn cước công dân gắn chip (CCCD chip) kết hợp công nghệ đọc chip NFC và nhận diện khuôn mặt động (Face Liveness Detection) đối chiếu với Cơ sở dữ liệu quốc gia về dân cư.',
            },
            {
              number: '2.5',
              text: 'Dữ liệu sinh trắc học: Đặc điểm sinh học duy nhất của cá nhân (khuôn mặt, vân tay) được thu thập, mã hóa và lưu trữ phục vụ đối chiếu, xác thực giao dịch theo đúng Quyết định số 2345/QĐ-NHNN.',
            },
            {
              number: '2.6',
              text: 'Yếu tố xác thực bảo mật: Bao gồm Mật khẩu truy cập, Mã khóa bảo mật PIN 6 chữ số, Mã xác thực một lần (SMS OTP, Smart OTP, Soft OTP) và Dữ liệu sinh trắc học đã đăng ký hợp lệ.',
            },
            {
              number: '2.7',
              text: 'Giao dịch gian lận / Rửa tiền: Mọi hành vi chiếm đoạt thông tin truy cập của người khác, rửa tiền, tài trợ khủng bố hoặc cung ứng dịch vụ thanh toán cho mục đích phi pháp theo quy định của Luật Phòng, chống rửa tiền 2022.',
            },
          ],
        },
      ],
    },
    {
      id: 'c2',
      shortCode: 'II. Đăng ký & eKYC',
      chapterNumber: 'CHƯƠNG II',
      title: 'ĐĂNG KÝ, ĐỊNH DANH eKYC VÀ PHÂN CẤP TÀI KHOẢN',
      articles: [
        {
          id: 'c2_a3',
          articleNumber: 'Điều 3',
          title: 'Điều kiện mở tài khoản và Tiêu chuẩn khách hàng',
          clauses: [
            {
              number: '3.1',
              text: 'Khách hàng cá nhân là công dân Việt Nam hoặc người nước ngoài cư trú hợp pháp tại Việt Nam từ 12 tháng trở lên, sở hữu số điện thoại di động chính chủ của các nhà mạng viễn thông Việt Nam.',
            },
            {
              number: '3.2',
              text: 'Sở hữu thiết bị di động thông minh có hệ điều hành được hỗ trợ (iOS hoặc Android phiên bản an toàn), hỗ trợ tính năng kết nối không dây NFC và không bị bẻ khóa hệ thống (Jailbreak / Root / ROM can thiệp).',
            },
            {
              number: '3.3',
              text: 'Có bản gốc Căn cước công dân gắn chip hoặc Thẻ Căn cước còn nguyên vẹn, còn thời hạn sử dụng theo quy định của pháp luật.',
            },
          ],
        },
        {
          id: 'c2_a4',
          articleNumber: 'Điều 4',
          title: 'Quy trình thu thập và đối soát eKYC theo Thông tư 40/2024/TT-NHNN',
          clauses: [
            {
              number: '4.1',
              text: 'Khách hàng sử dụng camera trên thiết bị để chụp trực tiếp mặt trước và mặt sau của CCCD gắn chip gốc. Mọi hình ảnh chụp qua màn hình, bản photo, can thiệp chỉnh sửa đồ họa sẽ bị từ chối ngay lập tức.',
            },
            {
              number: '4.2',
              text: 'Đọc và xác thực chip NFC: Khách hàng áp mặt lưng điện thoại vào vị trí chip trên CCCD để ứng dụng SenBank đọc dữ liệu số hóa có chữ ký số bảo mật của Bộ Công an, bảo đảm không bị làm giả.',
            },
            {
              number: '4.3',
              text: 'Xác thực khuôn mặt động (Face Liveness Detection): Khách hàng thực hiện các chuyển động theo hướng dẫn trên màn hình (quay đầu, chớp mắt, mỉm cười) trong môi trường đủ ánh sáng. Thuật toán AI của SenBank sẽ phát hiện và ngăn chặn 100% video dựng lại, ảnh in hoặc mặt nạ 3D.',
            },
            {
              number: '4.4',
              text: 'SenBank có toàn quyền đình chỉ hoặc hủy bỏ tài khoản nếu phát hiện thông tin đăng ký không khớp đúng với Cơ sở dữ liệu quốc gia về dân cư hoặc có dấu hiệu mạo danh.',
            },
          ],
          highlights: [
            'Bắt buộc quét chip NFC CCCD để ngăn chặn hồ sơ giả mạo',
            'Công nghệ Face Liveness Detection chống giả mạo bằng AI Deepfake',
          ],
        },
        {
          id: 'c2_a5',
          articleNumber: 'Điều 5',
          title: 'Phân cấp tài khoản và Hạn mức giao dịch trực tuyến',
          clauses: [
            {
              number: '5.1',
              text: 'Cấp 1 - Tài khoản Khởi tạo (Basic - Chưa eKYC): Khách hàng chỉ được phép xem thông tin tài khoản, nhận tiền vào ví; KHÔNG được thực hiện lệnh chuyển tiền ra hoặc thanh toán dịch vụ ngoài hệ thống.',
            },
            {
              number: '5.2',
              text: 'Cấp 2 - Tài khoản Tiêu chuẩn (Standard - Đã hoàn tất eKYC): Được chuyển khoản, thanh toán hóa đơn với hạn mức tối đa 20.000.000 VNĐ/giao dịch và 100.000.000 VNĐ/ngày.',
            },
            {
              number: '5.3',
              text: 'Cấp 3 - Tài khoản Sinh trắc học Nâng cao (Premium - Tuân thủ QĐ 2345): Đã đối chiếu sinh trắc học khuôn mặt trực tiếp với chip NFC CCCD, hạn mức giao dịch lên tới 500.000.000 VNĐ/ngày đối với khách hàng cá nhân và không giới hạn nhận tiền.',
            },
          ],
        },
      ],
    },
    {
      id: 'c3',
      shortCode: 'III. Giao dịch & Hạn mức',
      chapterNumber: 'CHƯƠNG III',
      title: 'QUY ĐỊNH VỀ GIAO DỊCH, CHUYỂN TIỀN VÀ XÁC THỰC AN TOÀN',
      articles: [
        {
          id: 'c3_a6',
          articleNumber: 'Điều 6',
          title: 'Các loại hình giao dịch trực tuyến được cung cấp',
          clauses: [
            {
              number: '6.1',
              text: 'Chuyển tiền nội bộ SenBank: Chuyển tiền tức thì 24/7/365 qua số tài khoản, số điện thoại hoặc mã cá nhân giữa các người dùng SenBank, thời gian xử lý theo thời gian thực (Real-time).',
            },
            {
              number: '6.2',
              text: 'Chuyển tiền nhanh liên ngân hàng Napas 247 & VietQR: Chuyển tiền tới hơn 55 ngân hàng thương mại tại Việt Nam thông qua hệ thống thanh toán quốc gia Napas.',
            },
            {
              number: '6.3',
              text: 'Thanh toán hóa đơn & Nạp tiền: Điện, Nước, Viễn thông, Cước Internet, Học phí, Lệ phí công, Thuế điện tử và Nạp tiền điện thoại di động chiết khấu cao.',
            },
            {
              number: '6.4',
              text: 'Tiết kiệm trực tuyến & Tiện ích tín dụng: Gửi tiết kiệm điện tử nhận lãi suất bậc thang cao hơn tại quầy, quản lý phát hành thẻ ảo, thẻ tín dụng SenBank Platinum và các khoản vay tiêu dùng nhanh đã được cấp hạn mức.',
            },
          ],
        },
        {
          id: 'c3_a7',
          articleNumber: 'Điều 7',
          title: 'Xác thực giao dịch an toàn theo Quyết định số 2345/QĐ-NHNN',
          clauses: [
            {
              number: '7.1',
              text: 'Giao dịch chuyển tiền giá trị dưới 10.000.000 VNĐ/lần và tổng giá trị giao dịch trong ngày dưới 20.000.000 VNĐ: Khách hàng xác thực bằng Mã PIN bí mật 6 chữ số hoặc Smart OTP bảo mật sinh ra từ ứng dụng.',
            },
            {
              number: '7.2',
              text: 'Giao dịch chuyển tiền từ 10.000.000 VNĐ/lần trở lên HOẶC giao dịch làm tổng giá trị chuyển tiền trong ngày vượt quá 20.000.000 VNĐ: Bắt buộc phải xác thực bằng Dữ liệu sinh trắc học khuôn mặt đối chiếu với dữ liệu trên chip CCCD do Bộ Công an cấp.',
            },
            {
              number: '7.3',
              text: 'Giao dịch chuyển tiền lần đầu trên thiết bị mới hoặc sau khi cài đặt lại ứng dụng: Bắt buộc thực hiện quét NFC CCCD và xác thực sinh trắc học khuôn mặt trước khi hệ thống cho phép kích hoạt giao dịch.',
            },
          ],
          highlights: [
            'Chuyển tiền trên 10 triệu đồng/lần bắt buộc xác thực khuôn mặt sinh trắc học',
            'Đăng nhập thiết bị mới yêu cầu quét lại CCCD gắn chip NFC',
          ],
        },
        {
          id: 'c3_a8',
          articleNumber: 'Điều 8',
          title: 'Tính hiệu lực và Không thể hủy ngang của Giao dịch',
          clauses: [
            {
              number: '8.1',
              text: 'Lệnh giao dịch điện tử của Khách hàng có giá trị pháp lý tương đương với văn bản có chữ ký của chủ tài khoản. Khi Khách hàng đã nhập mã PIN, mã OTP hoặc xác thực sinh trắc học thành công, lệnh giao dịch được coi là đã phát hành hợp lệ.',
            },
            {
              number: '8.2',
              text: 'Sau khi lệnh giao dịch được SenBank ghi nhận xử lý thành công trên hệ thống trung tâm, giao dịch đó KHÔNG THỂ bị hủy bỏ, thay đổi hoặc đảo ngược đơn phương bởi Khách hàng.',
            },
            {
              number: '8.3',
              text: 'Trường hợp chuyển nhầm tiền do Khách hàng nhập sai thông tin người nhận, SenBank sẽ hỗ trợ liên hệ ngân hàng thụ hưởng theo đúng Quy trình tra soát liên ngân hàng nhưng không bảo đảm chắc chắn việc thu hồi được tiền nếu bên nhận không đồng ý hoàn trả.',
            },
          ],
        },
      ],
    },
    {
      id: 'c4',
      shortCode: 'IV. Quyền KH',
      chapterNumber: 'CHƯƠNG IV',
      title: 'QUYỀN VÀ NGHĨA VỤ CỦA KHÁCH HÀNG',
      articles: [
        {
          id: 'c4_a9',
          articleNumber: 'Điều 9',
          title: 'Quyền lợi hợp pháp của Khách hàng',
          clauses: [
            {
              number: '9.1',
              text: 'Được bảo đảm an toàn, bí mật tuyệt đối về thông tin tài khoản, số dư tiền gửi và lịch sử giao dịch theo quy định của Luật Các tổ chức tín dụng và Nghị định về bảo vệ dữ liệu cá nhân.',
            },
            {
              number: '9.2',
              text: 'Được hưởng lãi suất tiền gửi không kỳ hạn và có kỳ hạn theo đúng biểu lãi suất niêm yết công khai của SenBank trong từng thời kỳ.',
            },
            {
              number: '9.3',
              text: 'Được quyền yêu cầu tra soát, khiếu nại đối với các giao dịch có nghi vấn hoặc sai sót trong thời hạn tối đa 60 (sáu mươi) ngày kể từ ngày phát sinh giao dịch.',
            },
            {
              number: '9.4',
              text: 'Được quyền chủ động tạm khóa tài khoản, khóa thẻ, vô hiệu hóa tính năng chuyển tiền trực tuyến hoặc yêu cầu đóng tài khoản bất kỳ lúc nào.',
            },
          ],
        },
        {
          id: 'c4_a10',
          articleNumber: 'Điều 10',
          title: 'Nghĩa vụ và Trách nhiệm bảo mật của Khách hàng',
          clauses: [
            {
              number: '10.1',
              text: 'Có trách nhiệm bảo mật tuyệt đối Tên đăng nhập, Mật khẩu, Mã PIN, Mã OTP và thiết bị di động cài đặt ứng dụng. Tuyệt đối KHÔNG cung cấp các thông tin này cho bất kỳ bên thứ ba nào, kể cả nhân viên tự xưng là cán bộ ngân hàng SenBank, cơ quan công an, tòa án hay kiểm sát viên.',
            },
            {
              number: '10.2',
              text: 'Chịu hoàn toàn trách nhiệm về mọi rủi ro, thiệt hại phát sinh nếu Khách hàng để lộ mật khẩu, mã OTP, chia sẻ tài khoản cho người khác hoặc cài đặt các ứng dụng giả mạo, file APK độc hại ngoài kho ứng dụng chính thức (App Store, Google Play).',
            },
            {
              number: '10.3',
              text: 'Nghiêm cấm mọi hành vi mở hộ tài khoản, cho thuê, cho mượn, mua bán tài khoản thanh toán hoặc sử dụng tài khoản vào các mục đích phi pháp như cờ bạc, cá độ, lừa đảo trực tuyến theo Nghị định 52/2024/NĐ-CP.',
            },
            {
              number: '10.4',
              text: 'Phải thông báo ngay lập tức cho SenBank qua Hotline 1900 8888 khi phát hiện mất thiết bị di động, nghi ngờ lộ mật khẩu hoặc phát hiện giao dịch bất thường.',
            },
          ],
          highlights: [
            'Cán bộ SenBank không bao giờ yêu cầu khách hàng cung cấp mã OTP hoặc mật khẩu',
            'Nghiêm cấm hành vi mua bán, cho mượn, cho thuê tài khoản ngân hàng',
          ],
        },
      ],
    },
    {
      id: 'c5',
      shortCode: 'V. Trách nhiệm SenBank',
      chapterNumber: 'CHƯƠNG V',
      title: 'QUYỀN VÀ TRÁCH NHIỆM CỦA NGÂN HÀNG SENBANK',
      articles: [
        {
          id: 'c5_a11',
          articleNumber: 'Điều 11',
          title: 'Trách nhiệm và Cam kết của SenBank',
          clauses: [
            {
              number: '11.1',
              text: 'Cung cấp dịch vụ ngân hàng điện tử ổn định, thông suốt, an toàn 24/7/365, đáp ứng đầy đủ tiêu chuẩn an toàn bảo mật hệ thống thông tin ngân hàng Cấp độ 3 trở lên theo quy định của Chính phủ và NHNN.',
            },
            {
              number: '11.2',
              text: 'Xử lý các lệnh giao dịch của Khách hàng chính xác, kịp thời và minh bạch; cung cấp thông báo biến động số dư tức thì qua ứng dụng (OTT Notification).',
            },
            {
              number: '11.3',
              text: 'Lưu trữ hồ sơ chứng từ giao dịch điện tử tối thiểu 05 (năm) năm kể từ ngày giao dịch hoàn tất theo quy định của Luật Kế toán và Luật Các tổ chức tín dụng.',
            },
            {
              number: '11.4',
              text: 'Tiếp nhận, xử lý tra soát và giải quyết khiếu nại của Khách hàng trong thời hạn không quá 30 (ba mươi) ngày làm việc đối với giao dịch nội bộ.',
            },
          ],
        },
        {
          id: 'c5_a12',
          articleNumber: 'Điều 12',
          title: 'Quyền hạn và Miễn trừ trách nhiệm của SenBank',
          clauses: [
            {
              number: '12.1',
              text: 'SenBank có quyền tự động trích nợ tài khoản thanh toán của Khách hàng để thu các khoản nợ vay đến hạn, phí dịch vụ niêm yết hoặc các khoản tiền ghi có nhầm lẫn vào tài khoản do sự cố kỹ thuật.',
            },
            {
              number: '12.2',
              text: 'SenBank có quyền tạm dừng dịch vụ, phong tỏa tài khoản một phần hoặc toàn bộ số dư mà không cần báo trước trong các trường hợp: (i) Có văn bản yêu cầu từ Cơ quan điều tra, Tòa án, Viện Kiểm sát; (ii) Hệ thống phòng chống gian lận phát hiện dấu hiệu xâm nhập trái phép; (iii) Nhập sai mã PIN quá 05 lần liên tiếp.',
            },
            {
              number: '12.3',
              text: 'Miễn trừ trách nhiệm: SenBank không chịu trách nhiệm đối với các thiệt hại phát sinh do: sự cố bất khả kháng (động đất, chiến tranh, gián đoạn mạng viễn thông quốc gia); Khách hàng bị lừa đảo cài đặt mã độc; hoặc Khách hàng cung cấp sai thông tin người thụ hưởng.',
            },
          ],
        },
      ],
    },
    {
      id: 'c6',
      shortCode: 'VI. Bảo mật & NĐ 13',
      chapterNumber: 'CHƯƠNG VI',
      title: 'BẢO VỆ DỮ LIỆU CÁ NHÂN VÀ AN TOÀN THÔNG TIN',
      articles: [
        {
          id: 'c6_a13',
          articleNumber: 'Điều 13',
          title: 'Thu thập và Xử lý dữ liệu cá nhân theo Nghị định 13/2023/NĐ-CP',
          clauses: [
            {
              number: '13.1',
              text: 'SenBank thu thập và xử lý các loại Dữ liệu cá nhân cơ bản và nhạy cảm của Khách hàng bao gồm: Họ và tên, ngày sinh, số CCCD/Hộ chiếu, địa chỉ cư trú, số điện thoại, email, hình ảnh chân dung, dữ liệu sinh trắc học khuôn mặt từ chip CCCD, thông tin vị trí địa lý thiết bị, lịch sử giao dịch và thói quen tiêu dùng.',
            },
            {
              number: '13.2',
              text: 'Mục đích xử lý dữ liệu: Xác minh định danh Khách hàng, cung cấp dịch vụ ngân hàng số, chấm điểm tín dụng tự động, phòng chống gian lận rửa tiền, nâng cấp trải nghiệm người dùng và tuân thủ các quy định của pháp luật.',
            },
            {
              number: '13.3',
              text: 'Khách hàng có quyền được biết, đồng ý, rút lại sự đồng ý hoặc yêu cầu xóa dữ liệu cá nhân theo quy định của Nghị định 13, trừ trường hợp SenBank có nghĩa vụ pháp lý phải lưu trữ dữ liệu theo Luật Kế toán và Luật Phòng chống rửa tiền.',
            },
          ],
        },
        {
          id: 'c6_a14',
          articleNumber: 'Điều 14',
          title: 'Tiêu chuẩn bảo mật và Cam kết không chia sẻ dữ liệu trái phép',
          clauses: [
            {
              number: '14.1',
              text: 'SenBank áp dụng các công nghệ bảo mật hàng đầu: Mã hóa đường truyền SSL/TLS 256-bit, mã hóa dữ liệu cơ sở dữ liệu AES-256, đạt chứng nhận bảo mật thanh toán quốc tế PCI DSS Cấp độ 1 (Level 1) và chứng nhận Hệ thống quản lý an toàn thông tin ISO/IEC 27001:2022.',
            },
            {
              number: '14.2',
              text: 'SenBank cam kết KHÔNG bán, chia sẻ hoặc chuyển giao thông tin cá nhân của Khách hàng cho bất kỳ bên thứ ba nào vì mục đích quảng cáo thương mại trái phép nếu không có sự chấp thuận trước của Khách hàng.',
            },
            {
              number: '14.3',
              text: 'Việc cung cấp dữ liệu chỉ được thực hiện cho các đối tác thanh toán bắt buộc (NAPAS, Visa, Mastercard), Trung tâm Thông tin Tín dụng Quốc gia (CIC) hoặc cơ quan nhà nước có thẩm quyền theo yêu cầu hợp pháp.',
            },
          ],
          highlights: [
            'Tuân thủ tuyệt đối Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân',
            'Đạt chuẩn quốc tế PCI DSS Level 1 và ISO 27001:2022',
          ],
        },
      ],
    },
    {
      id: 'c7',
      shortCode: 'VII. Biểu phí & Khiếu nại',
      chapterNumber: 'CHƯƠNG VII',
      title: 'BIỂU PHÍ DỊCH VỤ, LÃI SUẤT VÀ QUY TRÌNH KHIẾU NẠI',
      articles: [
        {
          id: 'c7_a15',
          articleNumber: 'Điều 15',
          title: 'Biểu phí dịch vụ và Nguyên tắc tính lãi',
          clauses: [
            {
              number: '15.1',
              text: 'Chính sách Phí 0 Đồng Trọn Đời: Miễn 100% phí chuyển tiền nội bộ SenBank; Miễn 100% phí chuyển tiền liên ngân hàng 24/7 qua VietQR và Napas; Miễn phí quản lý tài khoản và duy trì dịch vụ hàng tháng.',
            },
            {
              number: '15.2',
              text: 'Các khoản phí dịch vụ khác (như phí phát hành thẻ vật lý, phí giao dịch quốc tế, phí tra soát theo yêu cầu) được công bố công khai trên website chính thức của SenBank và hiển thị rõ ràng trên màn hình trước khi Khách hàng thực hiện xác nhận giao dịch.',
            },
            {
              number: '15.3',
              text: 'Tiền gửi thanh toán được trả lãi theo lãi suất tiền gửi không kỳ hạn, tính trên số dư thực tế cuối mỗi ngày và trả lãi định kỳ hàng tháng vào tài khoản của Khách hàng.',
            },
          ],
        },
        {
          id: 'c7_a16',
          articleNumber: 'Điều 16',
          title: 'Quy trình tiếp nhận và Giải quyết Khiếu nại',
          clauses: [
            {
              number: '16.1',
              text: 'Kênh tiếp nhận khiếu nại: Tổng đài Chăm sóc Khách hàng 24/7: 1900 8888; Email tiếp nhận: hotro@senbank.vn; hoặc trực tiếp tại các Chi nhánh/Phòng giao dịch SenBank trên toàn quốc.',
            },
            {
              number: '16.2',
              text: 'Thời hạn xử lý khiếu nại: Tối đa 30 (ba mươi) ngày làm việc đối với các giao dịch nội bộ SenBank và tối đa 45 (bốn mươi lăm) ngày làm việc đối với giao dịch liên ngân hàng quốc tế.',
            },
            {
              number: '16.3',
              text: 'Bồi hoàn thiệt hại: Trường hợp xác định nguyên nhân sự cố phát sinh do lỗi hệ thống kỹ thuật của SenBank, SenBank sẽ hoàn trả đầy đủ số tiền bị trừ sai cùng khoản lãi bồi thường tương ứng trong vòng 24 (hai mươi tư) giờ kể từ khi có kết luận tra soát.',
            },
          ],
        },
      ],
    },
    {
      id: 'c8',
      shortCode: 'VIII. Thi hành',
      chapterNumber: 'CHƯƠNG VIII',
      title: 'ĐIỀU KHOẢN THI HÀNH VÀ HIỆU LỰC ÁP DỤNG',
      articles: [
        {
          id: 'c8_a17',
          articleNumber: 'Điều 17',
          title: 'Sửa đổi, Bổ sung Điều khoản',
          clauses: [
            {
              number: '17.1',
              text: 'SenBank có quyền sửa đổi, bổ sung các nội dung trong bản Điều khoản này vào bất kỳ thời điểm nào nhằm đáp ứng yêu cầu thay đổi của pháp luật hoặc cải tiến chất lượng dịch vụ.',
            },
            {
              number: '17.2',
              text: 'Nội dung sửa đổi sẽ được công bố công khai trên ứng dụng SenBank và website chính thức ít nhất 30 (ba mươi) ngày trước khi chính thức áp dụng. Nếu Khách hàng không đồng ý với nội dung sửa đổi, Khách hàng có quyền chấm dứt sử dụng dịch vụ trước ngày có hiệu lực.',
            },
            {
              number: '17.3',
              text: 'Việc Khách hàng tiếp tục duy trì đăng nhập hoặc thực hiện giao dịch sau ngày nội dung sửa đổi có hiệu lực được coi là sự đồng thuận hoàn toàn với các nội dung sửa đổi đó.',
            },
          ],
        },
        {
          id: 'c8_a18',
          articleNumber: 'Điều 18',
          title: 'Luật áp dụng và Cơ quan Giải quyết tranh chấp',
          clauses: [
            {
              number: '18.1',
              text: 'Bản Điều khoản này được điều chỉnh, diễn giải và áp dụng toàn bộ theo quy định của Pháp luật Nước Cộng hòa Xã hội Chủ nghĩa Việt Nam.',
            },
            {
              number: '18.2',
              text: 'Mọi tranh chấp phát sinh giữa SenBank và Khách hàng sẽ được ưu tiên giải quyết trước hết thông qua thương lượng, hòa giải trên tinh thần tôn trọng quyền lợi của cả hai bên.',
            },
            {
              number: '18.3',
              text: 'Trường hợp hòa giải không thành trong vòng 60 (sáu mươi) ngày kể từ ngày phát sinh tranh chấp, một trong hai bên có quyền đưa vụ việc ra Tòa án nhân dân có thẩm quyền tại Việt Nam để giải quyết theo luật định.',
            },
          ],
        },
      ],
    },
  ],
};

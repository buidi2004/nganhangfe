# Sen Hồng Bank (SenBank) — Ứng Dụng Ngân Hàng Số & Ví Điện Tử

Ứng dụng Ngân hàng số & Ví điện tử **Sen Hồng E-Wallet (SenBank)** được xây dựng trên nền tảng **React Native (Expo SDK 52)** và **TypeScript**, kết nối Backend **Spring Boot** với đầy đủ các nghiệp vụ tài chính thực tế: quản lý số dư, chuyển tiền nội bộ/liên ngân hàng VietQR, quản lý thẻ, thanh toán hóa đơn, biến động số dư thời gian thực qua WebSocket và giao diện Dark Mode chuẩn ngân hàng thương mại.

---

## 🚀 Hướng Dẫn Cài Đặt và Khởi Chạy

Chi tiết từng bước cấu hình môi trường (JDK 17, Android Studio SDK, biến môi trường, thiết bị thật/máy ảo) và chạy lệnh `npx expo run:android`:

👉 **[Xem tài liệu hướng dẫn đầy đủ tại RUN_ANDROID.md](file:///c:/dev/app/RUN_ANDROID.md)**

---

## 📱 Các Tính Năng Nổi Bật

1. **Bảo mật & Xác thực**:
   - JWT Authentication, Refresh Token tự động.
   - Hỗ trợ mã PIN 6 số, sinh trắc học (Vân tay / FaceID).
   - Quản lý phiên đăng nhập thiết bị và đăng xuất từ xa.
2. **Nghiệp vụ Tài chính**:
   - Chuyển tiền nội bộ Sen Hồng & Chuyển tiền liên ngân hàng nhanh VietQR 24/7.
   - Quét mã QR thanh toán và tạo mã QR cá nhân EMVCo.
   - Nạp tiền / Rút tiền từ tài khoản ngân hàng liên kết.
   - Thanh toán hóa đơn (Điện, Nước, Internet, Viễn thông, Chung cư, Học phí).
   - Biến động số dư tức thời qua WebSocket Stomp/SockJS.
3. **Quản lý Thẻ & Hạn mức**:
   - Quản lý danh mục thẻ Visa/Mastercard/JCB (MB Hi Visa, Platinum, Sakura).
   - Khóa/mở thẻ tức thì, đổi hạn mức giao dịch trực tuyến.
4. **Trải nghiệm Người dùng (UI/UX)**:
   - Chế độ Sáng / Tối (**Dark Mode**) đồng bộ hệ thống.
   - Hiệu ứng chuông rung vật lý ngẫu nhiên (**Damped Oscillation Wiggle**).
   - Viền gradient 7 màu chuyển động vi tế (**Animated Rainbow Pill**).
   - Trung tâm trợ giúp chuẩn ngân hàng với Trợ lý AI SenBot & FAQ tương tác.
   - Điều khoản dịch vụ pháp chế 8 Chương 18 Điều tích hợp tìm kiếm trực tiếp.

---

## 🛠️ Ngăn Xếp Công Nghệ (Tech Stack)

- **Frontend**: React Native, Expo 52, TypeScript, React Navigation v6.
- **Styling & Animation**: React Native Reanimated, Expo Linear Gradient, Lucide Icons.
- **Backend**: Spring Boot REST API (`http://localhost:8080`), WebSocket `/ws-native`.
- **Dữ liệu đối tác**: Tích hợp VietQR API tra cứu hệ thống ngân hàng Việt Nam.

---

## 📂 Cấu Trúc Dự Án

```
├── src/
│   ├── components/      # Các component tái sử dụng (GlassCard, Buttons, Badges, Icons...)
│   ├── context/         # Quản lý trạng thái toàn cục (AppContext, ThemeContext)
│   ├── data/            # Dữ liệu ngân hàng, FAQ, điều khoản pháp lý
│   ├── navigation/      # Cấu hình Stack Navigator & Bottom Tabs
│   ├── screens/         # 25+ Màn hình nghiệp vụ
│   ├── services/        # Tầng gọi REST API & WebSocket service
│   └── theme.ts         # Hệ thống Design Tokens (Màu sắc, Typography, Shadows)
├── RUN_ANDROID.md       # Hướng dẫn chi tiết chạy npx expo run:android
└── App.tsx              # Entry point ứng dụng
```

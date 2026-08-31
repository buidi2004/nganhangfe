# Báo Cáo Tổng Quan Dự Án & Môi Trường Thiết Lập

## 1. Tổng Quan Dự Án (Project Overview)

Đây là một ứng dụng di động (Mobile App) được phát triển bằng **React Native** kết hợp với framework **Expo**. Ứng dụng mang thiên hướng về lĩnh vực Tài chính/Ngân hàng/Ví điện tử (Fintech) với số lượng tính năng rất đồ sộ và giao diện được thiết kế theo phong cách hiện đại (Glassmorphism - hiệu ứng kính mờ).

### 1.1 Thông tin chung
- **Tên dự án**: mobile-app
- **Package Android**: `com.anonymous.mobileapp`
- **Nền tảng hỗ trợ**: Android, iOS, Web
- **Version**: 1.0.0
- **Expo SDK**: 54.0.0

### 1.2 Công nghệ cốt lõi
- **Ngôn ngữ**: TypeScript
- **Framework**: React Native (0.81.5), React (19.1.0)
- **Toolchain**: Expo (54.0.0)
- **Điều hướng (Navigation)**: React Navigation v7 (`@react-navigation/native`, `@react-navigation/stack`, `@react-navigation/bottom-tabs`)
- **Animation & Cử chỉ**: `react-native-reanimated` (v4), `react-native-gesture-handler`
- **Giao diện & UI**: Sử dụng các custom component tự xây dựng với hiệu ứng kính mờ (Glassmorphism) như `expo-blur`, `expo-linear-gradient`.
- **Icon**: `lucide-react-native`, `@expo/vector-icons`
- **Mã vạch & QR Code**: `react-native-qrcode-svg`, `expo-camera`

## 2. Cấu Trúc Thư Mục (Project Structure)

Dự án được tổ chức rõ ràng theo kiến trúc chuẩn của một ứng dụng React Native quy mô khá lớn. Mọi mã nguồn chính nằm trong thư mục `src/`.

- `assets/`: Chứa các tài nguyên tĩnh như hình ảnh, biểu tượng (icon), màn hình khởi động (splash screen).
- `src/components/`: Chứa các UI Component dùng chung. Đáng chú ý có các component mang phong cách Glassmorphism: `GlassBottomNavbar`, `GlassBottomSheet`, `GlassCard`, `GlassHeader`, `ProgressiveBlur`,...
- `src/screens/`: Chứa 47 màn hình (screens) của ứng dụng, được chia thành các nhóm tính năng chính:
  - **Xác thực & Bảo mật**: `LoginScreen`, `RegisterScreen`, `OtpVerificationScreen`, `SetPinScreen`, `DigitalSignatureScreen`, `DeviceManagementScreen`,...
  - **Định danh (eKYC)**: `EKycScreen`, `IdentityDocumentScreen`, `KycLevelScreen`, `UserProfileScreen`.
  - **Giao dịch & Chuyển tiền**: `ChooseRecipientScreen`, `EnterAmountScreen`, `ConfirmTransferScreen`, `RequestTransferScreen`.
  - **Thanh toán & Dịch vụ**: `BillPaymentScreen`, `PhoneRechargeScreen`, `ScanQRScreen`, `QRMyScreen`.
  - **Quản lý Thẻ & Nạp/Rút**: `BankCardsScreen`, `DepositScreen`, `WithdrawScreen`.
  - **Khác**: `HomeScreen`, `NotificationsScreen`, `PromotionsScreen`, `TransactionHistoryScreen`,...
- `src/navigation/`: Chứa cấu hình điều hướng (Router) của ứng dụng (`AppNavigator.tsx`, `MainTabs.tsx`).
- `src/theme.ts`: File định nghĩa màu sắc, kích thước, font chữ chuẩn (Design System) của toàn app.
- `src/hooks/` & `src/context/` & `src/services/`: Chứa logic nghiệp vụ, quản lý state và gọi API (nếu có).
- `app.json`: Cấu hình ứng dụng Expo (Tên app, version, icon, splash, quyền android/ios).
- `package.json`: Chứa danh sách thư viện và các scripts chạy dự án.

## 3. Các Tính Năng Nổi Bật
- **Hiệu ứng UI Cao Cấp**: Ứng dụng đầu tư rất mạnh vào UI với phong cách Glassmorphism, các thành phần đều có độ bóng, mờ và chuyển động mượt mà.
- **Hệ sinh thái tính năng Fintech toàn diện**: Từ eKYC, quản lý thẻ, quét mã QR, đến thanh toán hóa đơn, nạp tiền điện thoại, quản lý thiết bị đăng nhập, và bảo mật bằng chữ ký số / mã PIN.
- **Hỗ trợ quét mã QR & Camera**: Tích hợp sẵn `expo-camera` và sinh mã QR nội bộ.

## 4. Hướng Dẫn Thiết Lập Môi Trường (Environment Setup)

Để chạy dự án này trên máy local, cần thực hiện các bước sau:

### Yêu cầu hệ thống (Prerequisites)
- **Node.js**: Phiên bản 18.x hoặc 20.x trở lên.
- **Git**: Dùng để quản lý source code.
- **Phần mềm giả lập hoặc thiết bị thật**:
  - *Android*: Android Studio (đã cài đặt Android SDK và Emulator).
  - *iOS*: Xcode (chỉ dùng được trên macOS) hoặc sử dụng ứng dụng **Expo Go** trên điện thoại thật.
- Khuyến nghị dùng **VS Code** làm trình soạn thảo.

### Các bước cài đặt (Installation Steps)

**Bước 1: Cài đặt các thư viện phụ thuộc**
Mở terminal tại thư mục gốc của dự án (`c:\dev\app`) và chạy:
```bash
npm install
```
*(Nếu hệ thống dùng yarn hoặc pnpm, bạn có thể thay thế bằng `yarn install` hoặc `pnpm install` tùy thuộc vào lock file).*

**Bước 2: Khởi động Metro Bundler (Development Server)**
Chạy lệnh sau để bật Expo server:
```bash
npm start
```
Hoặc:
```bash
npx expo start
```
*Lệnh này sẽ mở ra một bảng điều khiển hiển thị mã QR trên Terminal. Bạn có thể dùng app Camera (trên iOS) hoặc app Expo Go (trên Android/iOS) quét mã này để chạy app trực tiếp trên điện thoại thật.*

**Bước 3: Chạy trên máy ảo (Emulator/Simulator)**
- **Chạy trên Android Emulator**:
  Yêu cầu máy tính đang mở sẵn máy ảo Android (từ Android Studio). Nhấn phím `a` trong terminal Expo, hoặc chạy lệnh:
  ```bash
  npm run android
  ```
  *(Lưu ý: Hiện tại dự án đang chạy lệnh `npx expo run:android` để build trực tiếp).*

- **Chạy trên iOS Simulator (Chỉ macOS)**:
  Yêu cầu máy tính đang mở sẵn Simulator. Nhấn phím `i` trong terminal Expo, hoặc chạy lệnh:
  ```bash
  npm run ios
  ```

- **Chạy trên nền tảng Web (Trình duyệt)**:
  Nhấn phím `w` trong terminal Expo, hoặc chạy lệnh:
  ```bash
  npm run web
  ```

### Các lưu ý thêm (Notes)
- Dự án có sử dụng `patch-package` (thể hiện qua lệnh `postinstall` trong `package.json` và thư mục `patches/`), do đó sau khi chạy `npm install`, hệ thống sẽ tự động patch một số thư viện. Không được bỏ qua bước này.
- Dự án sử dụng `expo-build-properties` với cấu hình Android (Kotlin 2.1.20, compile/target SDK 36, min SDK 24). Khi build ứng dụng thật (.apk/.aab) cần đảm bảo môi trường Java/Android SDK đáp ứng yêu cầu.
- Tài liệu về Expo đang sử dụng phiên bản SDK rất mới (54), do đó mọi cấu hình API cần refer chuẩn từ docs của Expo SDK mới nhất (tham khảo thêm theo quy tắc `AGENTS.md`).
## 5. Chi tiết cấu hình Bottom Tab Navigation

Ứng dụng sử dụng một Bottom Tab tùy chỉnh mang tên `GlassBottomNavbar` (nằm trong `src/components/GlassBottomNavbar.tsx`) thay cho tab bar mặc định của React Navigation, nhằm mang lại trải nghiệm Glassmorphism cao cấp.

### 5.1 Ánh xạ các màn hình (Screen Mapping)
Bottom Tab bao gồm 5 chức năng chính, được định nghĩa trong `src/navigation/MainTabs.tsx`:

- **Trang chủ (HomeTab)**: Ánh xạ tới `HomeScreen`.
- **Thẻ (Card)**: Ánh xạ tới `CardsScreen`.
- **QR Code (QR)**: Nút trung tâm nổi bật, ánh xạ tới `ScanQRScreen` (Tab bar mặc định bị ẩn trên màn hình này).
- **Ưu đãi (Gift)**: Ánh xạ tới `PromotionsScreen`.
- **Cá nhân (More)**: Ánh xạ tới `ProfileScreen`.

### 5.2 Thông số cấu hình giao diện (UI Parameters)
Component `GlassBottomNavbar` cho phép cấu hình linh hoạt các thông số sau:
- **Kích thước & Vị trí**:
  - `BAR_HEIGHT`: `75` (Chiều cao của thanh tab).
  - `BOTTOM`: `30` (Khoảng cách nổi từ mép dưới màn hình).
- **Độ bo góc (Border Radius)**:
  - Cả 4 góc đều được bo tròn với bán kính `16` (`R_TOP_LEFT`, `R_TOP_RIGHT`, `R_BOTTOM_LEFT`, `R_BOTTOM_RIGHT`).
- **Nút trung tâm (QR Code)**:
  - Nút QR ở giữa có kích thước `54x54`, bo cong `16` thay vì tròn hoàn toàn (`centerCircle`).
  - Sử dụng component `AnimatedGradientQRIcon` để tạo hiệu ứng chuyển sắc (gradient).
- **Hiệu ứng Kính (Glassmorphism)**:
  - Sử dụng `BlurView` từ `expo-blur` với `intensity={50}`, `tint="light"`.
  - Phủ lên trên bằng `LinearGradient` chuyển sắc từ `rgba(210, 81, 157, 0.85)` đến `rgba(163, 27, 107, 0.92)`.
  - Viền nổi 3D (Inner Border) sử dụng `rgba(255, 255, 255, 0.15)`.

### 5.3 Mã nguồn chính (Code Snippets)

**Cấu hình trong `MainTabs.tsx`:**
```tsx
const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <GlassBottomNavbar {...props} />}
      screenOptions={{ 
        headerShown: false, 
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
        }
      }}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ title: "Trang chu" }} />
      <Tab.Screen name="Card" component={CardsScreen} options={{ title: "The" }} />
      <Tab.Screen name="QR" component={ScanQRScreen} options={{ tabBarStyle: { display: "none" } }} />
      <Tab.Screen name="Gift" component={PromotionsScreen} options={{ title: "Uu dai" }} />
      <Tab.Screen name="More" component={ProfileScreen} options={{ title: "Ca nhan" }} />
    </Tab.Navigator>
  );
}
```

**Định nghĩa thông số trong `GlassBottomNavbar.tsx`:**
```tsx
// THÔNG SỐ CẤU HÌNH GIAO DIỆN
const BAR_HEIGHT = 75; // Chiều cao của thanh
const BOTTOM = 30;     // Khoảng cách cách mép dưới màn hình

// ĐỘ BO CONG 4 GÓC:
const R_TOP_LEFT = 16;     // Góc trên - bên trái
const R_TOP_RIGHT = 16;    // Góc trên - bên phải
const R_BOTTOM_LEFT = 16;  // Góc dưới - bên trái
const R_BOTTOM_RIGHT = 16; // Góc dưới - bên phải

const TABS = [
  { name: 'HomeTab', label: 'Trang chủ', icon: 'home-outline', iconFocused: 'home', lib: 'Ionicons' },
  { name: 'Card', label: 'Thẻ', icon: 'credit-card-multiple-outline', iconFocused: 'credit-card-multiple', lib: 'MaterialCommunityIcons' },
  { name: 'QR', label: '', icon: 'qrcode-scan', iconFocused: 'qrcode-scan', lib: 'MaterialCommunityIcons', isCenter: true },
  { name: 'Gift', label: 'Ưu đãi', icon: 'gift-outline', iconFocused: 'gift', lib: 'Ionicons' },
  { name: 'More', label: 'Cá nhân', icon: 'account-outline', iconFocused: 'account', lib: 'MaterialCommunityIcons' },
];
```

---
*Báo cáo được trích xuất dựa trên trạng thái mã nguồn và cấu trúc hiện tại của dự án.*

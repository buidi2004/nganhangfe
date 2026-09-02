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
- **Thêm (Menu)**: Ánh xạ tới `MoreScreen`.

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
  - Sử dụng `LiquidGlassView` từ thư viện `react-native-liquid-glassmorphism` (với `preset="floatingTabBar"`) để tạo hiệu ứng khúc xạ thực tế.
  - Các lớp phủ gradient thông thường được loại bỏ để hiển thị độ trong suốt chân thật nhất.
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
      <Tab.Screen name="Menu" component={MoreScreen} options={{ title: "Thêm" }} />
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
  { name: 'Menu', label: 'Thêm', icon: 'grid-outline', iconFocused: 'grid', lib: 'Ionicons' },
];
```

*Báo cáo được trích xuất dựa trên trạng thái mã nguồn và cấu trúc hiện tại của dự án.*

## 6. Báo Cáo Tối Ưu Hóa Hiệu Năng (Chuyên Sâu)

Trong quá trình rà soát hiệu năng (Performance Audit) chuyên sâu, một số vấn đề liên quan đến việc "vẽ lại màn hình thừa thãi" (unnecessary re-renders) đã được phát hiện và xử lý triệt để. 
**Cam kết: 100% không làm thay đổi bất kỳ yếu tố UX/UI nào.**

### 6.1 Tối ưu `AppContext.tsx` (Trái tim của ứng dụng)
- **Vị trí Lag**: Toàn bộ dữ liệu trạng thái (số dư, trạng thái đăng nhập, WebSocket) được gom chung vào một thẻ `<AppContext.Provider>`. Mỗi khi có một tín hiệu nhỏ (ví dụ WebSocket nhận thông báo đang tải số dư), React sẽ ép **tất cả** các màn hình đang mở phải vẽ lại từ đầu, dù màn hình đó không liên quan.
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
- **Thêm (Menu)**: Ánh xạ tới `MoreScreen`.

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
  - Sử dụng `LiquidGlassView` từ thư viện `react-native-liquid-glassmorphism` (với `preset="floatingTabBar"`) để tạo hiệu ứng khúc xạ thực tế.
  - Các lớp phủ gradient thông thường được loại bỏ để hiển thị độ trong suốt chân thật nhất.
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
      <Tab.Screen name="Menu" component={MoreScreen} options={{ title: "Thêm" }} />
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
  { name: 'Menu', label: 'Thêm', icon: 'grid-outline', iconFocused: 'grid', lib: 'Ionicons' },
];
```

*Báo cáo được trích xuất dựa trên trạng thái mã nguồn và cấu trúc hiện tại của dự án.*

## 6. Báo Cáo Tối Ưu Hóa Hiệu Năng (Chuyên Sâu)

Trong quá trình rà soát hiệu năng (Performance Audit) chuyên sâu, một số vấn đề liên quan đến việc "vẽ lại màn hình thừa thãi" (unnecessary re-renders) đã được phát hiện và xử lý triệt để. 
**Cam kết: 100% không làm thay đổi bất kỳ yếu tố UX/UI nào.**

### 6.1 Tối ưu `AppContext.tsx` (Trái tim của ứng dụng)
- **Vị trí Lag**: Toàn bộ dữ liệu trạng thái (số dư, trạng thái đăng nhập, WebSocket) được gom chung vào một thẻ `<AppContext.Provider>`. Mỗi khi có một tín hiệu nhỏ (ví dụ WebSocket nhận thông báo đang tải số dư), React sẽ ép **tất cả** các màn hình đang mở phải vẽ lại từ đầu, dù màn hình đó không liên quan.
- **Giải pháp**: Đã gói toàn bộ khối dữ liệu Context vào `React.useMemo()`. Điều này giúp bộ não của React tính toán thông minh hơn và từ chối các lệnh vẽ lại (re-render) nếu dữ liệu lõi chưa thực sự thay đổi.

### 6.2 Tối ưu `GlassBottomNavbar.tsx` (Thanh điều hướng kính mờ)
- **Vị trí Lag**: Mỗi lần người dùng chạm để chuyển Tab (từ Trang chủ sang Quét QR), thanh Bottom Bar nhận tín hiệu đổi Tab và vẽ lại toàn bộ hiệu ứng kính mờ 3D (`LiquidGlassView`) từ đầu. Đây là một tác vụ cực kỳ nặng cho GPU.
- **Giải pháp**: Đã "đóng băng" đồ họa của thanh kính mờ bằng `React.useMemo()`. Tấm kính được đúc đúng 1 lần lúc khởi động app. Khi chuyển Tab, chỉ có màu sắc của Icon thay đổi chứ GPU không phải tính toán lại bóng kính.

### 6.3 Tối ưu màn hình nhập mã PIN (`SetPinScreen.tsx` & `DepositConfirmScreen.tsx`)
- **Vị trí Lag**: Mỗi lần bấm 1 số PIN, toàn bộ mảng màn hình chứa lớp kính mờ `BlurView` (ở SetPinScreen) hoặc mảng giao diện thẻ Modal (ở DepositConfirmScreen) bị vẽ lại. Gây trễ (delay) khi nhập số nhanh.
- **Giải pháp**: Tách rời cụm phím bấm số (Keypad) và các hàm xử lý (`handlePress`, `handleDelete`) ra khỏi luồng render chính bằng `useMemo` và `useCallback`. Riêng màn hình Xác nhận Nạp tiền (`DepositConfirmScreen`), toàn bộ khung cuộn chứa thông tin cũng được cô lập bằng `useMemo` để không bao giờ bị render lại vô ích.

### 6.4 Tối ưu `HomeScreen.tsx` & `LoginScreen.tsx`
- **Vị trí Lag**: Hoạt ảnh đồ họa SVG 3D và danh sách cuộn FlatList (chứa 72 banner) chạy vô hạn ngốn rất nhiều RAM.
- **Giải pháp**: 
  - Kích hoạt `removeClippedSubviews` cho Android để tự dọn dẹp các banner ngoài màn hình.
  - Bọc các mảng SVG tĩnh khổng lồ (Capsules, Background Waves) vào các Component tĩnh (`React.memo`) để không bị render lại mỗi khi người dùng gõ phím hoặc cuộn trang.

## 7. Báo Cáo Lỗi Kết Nối API Backend (Bug Report cho Team BE)

Trong quá trình ghép nối luồng **Chuyển tiền qua Số tài khoản / Số điện thoại**, Frontend đã phát hiện 2 endpoint trên Backend hiện đang bị lỗi từ chối kết nối (timeout / không phản hồi / 500). Việc này gây ảnh hưởng trực tiếp đến luồng tra cứu thông tin người nhận và danh sách ngân hàng. 

Yêu cầu team Backend (BE) kiểm tra lại Server `203.145.46.200:8080` (hoặc môi trường Dev hiện tại) và cấu hình lại 2 API sau:

### 7.1 Lỗi API Lấy danh sách Ngân hàng (getBanks)
- **Endpoint**: `GET /api/v1/banks`
- **Tình trạng**: Đang trả về lỗi kết nối hoặc HTTP 500 khi FE gọi `WalletApi.getBanks()`.
- **Hậu quả**: Modal chọn ngân hàng trên app bị trống trơn.
- **Yêu cầu BE**: API cần trả về mảng danh sách ngân hàng hợp lệ (ví dụ: `[{ "id": "1", "code": "SENHONG", "shortName": "SenBank", ... }]`).
- **Xử lý tạm thời bên FE**: Đã hardcode (mock) danh sách ngân hàng mặc định gồm SenBank, MBBank, VCB để QC/Tester không bị block luồng test.

### 7.2 Lỗi API Tra cứu thông tin người nhận (getRecipientInfo)
- **Endpoint**: `GET /api/v1/wallets/recipient-info?phoneNumber={sdt}`
- **Tình trạng**: Cổng 8080 timeout/không phản hồi. Test bằng `curl` trực tiếp lên `http://203.145.46.200:8080/api/v1/wallets/recipient-info?phoneNumber=0793919384` cũng không trả về dữ liệu.
- **Hậu quả**: Khi người dùng gõ số điện thoại thủ công, app không thể lấy được Tên người nhận (`maskedName`) để hiển thị. (Lưu ý: Quét QR thì vẫn hiện tên do dữ liệu tên đã được nhúng sẵn trong mã QR, không đi qua API này).
- **Yêu cầu BE**: Đảm bảo API nhận tham số `phoneNumber` và trả về đúng chuẩn JSON: `{"success": true, "data": {"walletId": "...", "phoneNumber": "...", "maskedName": "TÊN NGƯỜI NHẬN"}}`.
- **Xử lý tạm thời bên FE**: Đã thêm logic mock dữ liệu: Nếu API gọi lỗi, tự động gán tên "KHÁCH HÀNG THỬ NGHIỆM" để luồng chuyển khoản có thể chạy tiếp. Mời BE fix xong thì báo lại để FE xóa đoạn mock này.

## 8. Cập Nhật Từ Backend: Sửa lỗi hiển thị "NGƯỜI DÙNG XXXX" (Persisting fullName)

Backend đã xử lý triệt để lỗi mất dữ liệu tên người dùng sau khi khởi động lại server.

### 8.1 Database Migration
- Bổ sung file `V7__add_full_name_to_users.sql` để thêm cột `full_name` vào bảng `users`.
- Lệnh: `ALTER TABLE users ADD COLUMN full_name VARCHAR(255);`

### 8.2 Domain & Infrastructure
- Cập nhật `User.java` và `UserJpaEntity.java` để map trường `fullName`.
- Bổ sung cấu hình trong `UserMapper` để đồng bộ dữ liệu giữa Domain model và JPA entity.

### 8.3 Service Layer (Lớp Nghiệp Vụ)
- **AuthService**: Đã hỗ trợ nhận tham số `fullName` qua `register` và đẩy trực tiếp xuống Database qua `UserPersistencePort`. Dữ liệu Tên người dùng sẽ không còn bị mất khi khởi động lại ứng dụng.
- **ProfileService**: `getProfile(userId)` được cập nhật để query trực tiếp `user.getFullName()`. Nhờ đó, API `/api/v1/wallets/recipient-info` và `/api/v1/transactions` luôn trả về tên thật chính xác và đồng nhất cho Frontend hiển thị.
- **Lưu ý cho Frontend**: FE đã có thể gỡ bỏ toàn bộ code Interceptor/Mock name ảo. Gọi trực tiếp dữ liệu từ `res.data.maskedName` một cách an toàn!

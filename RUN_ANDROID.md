# HƯỚNG DẪN CÀI ĐẶT VÀ KHỞI CHẠY DỰ ÁN (RUN ANDROID)

> **Dự án**: Sen Hồng E-Wallet / Ngân hàng số SenBank Mobile App  
> **Framework**: React Native (Expo SDK 52)  
> **Ngôn ngữ**: TypeScript  

---

## 1. YÊU CẦU MÔI TRƯỜNG TIÊN QUYẾT (PREREQUISITES)

Trước khi khởi chạy lệnh `npx expo run:android`, máy tính của bạn cần được cài đặt đầy đủ các công cụ sau:

### 1.1. Node.js & Package Manager
- **Node.js**: Phiên bản LTS khuyến nghị từ `v18.x` trở lên (tốt nhất là Node 20 hoặc Node 22).
- Kiểm tra phiên bản bằng terminal:
  ```bash
  node -v
  npm -v
  ```

### 1.2. Java Development Kit (JDK 17)
- React Native và Android Gradle plugin yêu cầu **JDK 17** (Microsoft OpenJDK 17 hoặc Eclipse Temurin 17).
- Kiểm tra phiên bản Java:
  ```bash
  javac -version
  java -version
  ```
- **Cấu hình biến môi trường**:
  - `JAVA_HOME`: Trỏ đến thư mục cài đặt JDK (Ví dụ: `C:\Program Files\Eclipse Adoptium\jdk-17.0.x-hotspot`).
  - Thêm `%JAVA_HOME%\bin` vào biến môi trường `PATH`.

### 1.3. Android Studio & Android SDK
- Cài đặt **Android Studio** mới nhất.
- Mở **Android Studio** ➔ **Settings (Preferences)** ➔ **Languages & Frameworks** ➔ **Android SDK**:
  - **SDK Platforms**: Tích chọn `Android 14.0 ("UpsideDownCake")` (API Level 34) hoặc Android 15.
  - **SDK Tools**: Tích chọn:
    - `Android SDK Build-Tools`
    - `Android SDK Command-line Tools (latest)`
    - `Android SDK Platform-Tools`
    - `Android Emulator`
- **Cấu hình biến môi trường Android (Bắt buộc)**:
  - Tạo biến người dùng `ANDROID_HOME`: Trỏ đến thư mục SDK (mặc định Windows: `C:\Users\<Tên_User>\AppData\Local\Android\Sdk`).
  - Thêm các đường dẫn sau vào biến `PATH`:
    - `%ANDROID_HOME%\platform-tools` (chứa lệnh `adb`)
    - `%ANDROID_HOME%\emulator`
    - `%ANDROID_HOME%\tools`

---

## 2. CHUẨN BỊ THIẾT BỊ CHẠY (ĐIỆN THOẠI THẬT HOẶC MÁY ẢO)

Bạn có thể chọn 1 trong 2 cách sau:

### Cách 1: Sử dụng Điện thoại Android thật (Khuyến nghị - Nhanh & Mượt nhất)
1. Trên điện thoại: Vào **Cài đặt** ➔ **Thông tin điện thoại** ➔ Nhấp liên tục 7 lần vào **Số bản dựng (Build Number)** để kích hoạt chế độ nhà phát triển.
2. Vào **Cài đặt cho người phát triển** ➔ Bật **Gỡ lỗi USB (USB Debugging)**.
3. Cắm cáp USB nối điện thoại với máy tính, trên điện thoại chọn *"Luôn cho phép gỡ lỗi từ máy tính này"*.
4. Kiểm tra kết nối trong Terminal:
   ```bash
   adb devices
   ```
   *(Kết quả hiện mã thiết bị kèm chữ `device` là đã sẵn sàng).*

### Cách 2: Sử dụng Máy ảo Android (Android Emulator)
1. Mở Android Studio ➔ **Device Manager**.
2. Tạo 1 máy ảo mới (VD: Pixel 7 Pro, System Image: API 34).
3. Nhấn nút **Play** để khởi động máy ảo trước khi chạy lệnh.

---

## 3. CÁC BƯỚC CÀI ĐẶT & KHỞI CHẠY ỨNG DỤNG

### Bước 1: Di chuyển vào thư mục dự án
Mở Terminal (PowerShell / Command Prompt) tại thư mục nguồn của dự án:
```bash
cd c:\dev\app
```

### Bước 2: Cài đặt các thư viện phụ thuộc (Dependencies)
```bash
npm install
```
*(Nếu gặp xung đột phiên bản phụ thuộc cũ, chạy: `npm install --legacy-peer-deps`)*

### Bước 3: Cấu hình kết nối Backend (Localhost / IP LAN)

Ứng dụng kết nối với Backend Spring Boot tại cổng `8080`.

- **Mẹo khi dùng Điện thoại thật cắm cáp USB**: Chạy lệnh ánh xạ cổng (Reverse Port) để điện thoại gọi được `localhost:8080` của máy tính:
  ```bash
  adb reverse tcp:8080 tcp:8080
  ```
- **Khi dùng Máy ảo Android Emulator**: Địa chỉ `localhost` của máy tính trên máy ảo tự động là: `http://10.0.2.2:8080`.
- **Nếu chạy qua mạng WiFi chung**: Mở file [`src/services/api.ts`](file:///c:/dev/app/src/services/api.ts), đổi `BASE_URL` thành IP LAN máy tính của bạn (VD: `http://192.168.1.15:8080`).

---

### Bước 4: Khởi chạy ứng dụng lên Android

Chạy lệnh build và cài đặt trực tiếp lên thiết bị:

```bash
npx expo run:android
```

> **Ghi chú tiến trình**:
> - Lần đầu tiên chạy, hệ thống sẽ tải Gradle wrapper và biên dịch thư viện Native (mất khoảng 3 - 7 phút tùy tốc độ máy tính).
> - Những lần chạy sau (Fast Refresh) sẽ khởi động ngay lập tức chỉ trong vài giây.
> - Nếu có nhiều thiết bị/máy ảo cùng kết nối, bạn có thể chọn chỉ định thiết bị:
>   ```bash
>   npx expo run:android --device
>   ```

---

## 4. CÁC LỆNH HỖ TRỢ THƯỜNG DÙNG TRONG QUÁ TRÌNH PHÁT TRIỂN

| Mục đích | Lệnh thực thi |
|---|---|
| Khởi động lại Metro Bundler xóa sạch cache | `npx expo start -c` |
| Mở menu phát triển (Dev Menu) trên máy ảo/điện thoại | Lắc điện thoại hoặc nhấn phím `m` trong terminal Metro |
| Reload lại toàn bộ giao diện | Nhấn phím `r` trong terminal Metro |
| Kiểm tra lỗi TypeScript tĩnh | `npx tsc --noEmit` |
| Xem danh sách thiết bị Android đang kết nối | `adb devices` |
| Chụp ảnh màn hình từ điện thoại lưu vào máy tính | `adb shell screencap -p /sdcard/screen.png && adb pull /sdcard/screen.png` |

---

## 5. XỬ LÝ SỰ CỐ THƯỜNG GẶP (TROUBLESHOOTING)

### 1. Lỗi: `ANDROID_HOME is not set and no SDK was found`
- **Khắc phục**: Tạo biến môi trường hệ thống `ANDROID_HOME` chỉ đúng đến thư mục `AppData\Local\Android\Sdk`. Sau đó khởi động lại Terminal / VS Code.

### 2. Lỗi: `Port 8081 already in use`
- Cổng Metro bundler đang bị chiếm dụng bởi tiến trình khác.
- **Khắc phục (Windows PowerShell)**:
  ```powershell
  Stop-Process -Id (Get-NetTCPConnection -LocalPort 8081).OwningProcess -Force
  ```

### 3. Lỗi: `Gradle build failed`
- Xóa thư mục build cũ và build lại:
  ```bash
  cd android
  ./gradlew clean
  cd ..
  npx expo run:android
  ```

### 4. Ứng dụng báo lỗi không tải được dữ liệu (Network Error / 401)
- Đảm bảo Backend Spring Boot đã bật và đang lắng nghe ở cổng `8080`.
- Chạy lệnh `adb reverse tcp:8080 tcp:8080` nếu đang cắm cáp điện thoại thật.

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface VietQrBank {
  id: number | string;
  name: string;
  code: string;
  bin: string;
  shortName: string;
  logo: string;
  transferSupported?: number;
  lookupSupported?: number;
}

export interface BankItem {
  id: string;
  name: string;          // Tên đầy đủ
  shortName: string;     // Tên ngắn gọn (hiển thị chính)
  code: string;          // Mã ngân hàng (VCB, MB, BIDV, etc.)
  bin: string;           // Mã BIN
  logo?: string;         // URL logo ngân hàng từ VietQR CDN
  isInternal?: boolean;  // true cho SenBank nội bộ
}

// Ngân hàng nội bộ SenBank luôn ở ĐẦU danh sách
export const SENHONG_BANK: BankItem = {
  id: 'senbank',
  code: 'SENHONG',
  bin: 'SENHONG',
  shortName: 'SenBank (Nội bộ)',
  name: 'Ngân hàng Thương mại Cổ phần Sen Hồng',
  isInternal: true,
};

const CACHE_KEY = '@vietqr_banks_cache_v1';
const CACHE_TIMESTAMP_KEY = '@vietqr_banks_timestamp_v1';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 giờ

// In-memory cache để không cần đọc AsyncStorage nhiều lần trong cùng một phiên app
let cachedBanks: BankItem[] | null = null;

/**
 * Xóa dấu tiếng Việt, chuyển chữ thường để tìm kiếm linh hoạt không dấu
 */
export function removeVietnameseTones(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

/**
 * Lấy danh sách ngân hàng Việt Nam từ VietQR API (kèm logo) với cơ chế Cache 24h & Fallback an toàn
 */
export async function getVietQrBanks(): Promise<BankItem[]> {
  if (cachedBanks && cachedBanks.length > 1) {
    return cachedBanks;
  }

  // 1. Kiểm tra Local Cache trong AsyncStorage
  try {
    const stored = await AsyncStorage.getItem(CACHE_KEY);
    const storedTime = await AsyncStorage.getItem(CACHE_TIMESTAMP_KEY);
    if (stored && storedTime) {
      const age = Date.now() - parseInt(storedTime, 10);
      if (age < CACHE_TTL) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          cachedBanks = [SENHONG_BANK, ...parsed];
          return cachedBanks;
        }
      }
    }
  } catch (e) {
    // Bỏ qua lỗi đọc bộ nhớ cục bộ
  }

  // 2. Gọi VietQR API công khai (Public, không cần API Key)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000); // 7s timeout an toàn

    const response = await fetch('https://api.vietqr.io/v2/banks', {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const json = await response.json();
      if (json.data && Array.isArray(json.data)) {
        const mapped: BankItem[] = json.data.map((b: VietQrBank) => ({
          id: String(b.id),
          name: b.name || '',
          shortName: b.shortName || b.code || '',
          code: b.code || '',
          bin: b.bin || '',
          logo: b.logo || '',
          isInternal: false,
        }));

        // Lưu cache nền vào AsyncStorage
        AsyncStorage.setItem(CACHE_KEY, JSON.stringify(mapped)).catch(() => {});
        AsyncStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString()).catch(() => {});

        cachedBanks = [SENHONG_BANK, ...mapped];
        return cachedBanks;
      }
    }
  } catch (error) {
    console.warn('[BankService] Không thể tải danh sách VietQR:', error);
  }

  // 3. Fallback: Nếu lỗi mạng, trả về ít nhất là Sen Hồng Bank
  if (cachedBanks && cachedBanks.length > 0) return cachedBanks;
  cachedBanks = [SENHONG_BANK];
  return cachedBanks;
}

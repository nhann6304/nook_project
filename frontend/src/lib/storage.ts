/**
 * Nhớ giữa các lần mở app.
 *
 * Một cửa duy nhất cho việc "ghi xuống đĩa". Lý do gom về một chỗ: mỗi thư
 * viện lưu trữ có một cách hỏng riêng (đĩa đầy, người dùng xoá dữ liệu app,
 * iOS dọn thư mục cache), và nếu mỗi nơi tự gọi thẳng thì mỗi nơi phải tự nhớ
 * bọc try/catch. Ở đây bọc một lần, bên ngoài không bao giờ phải nghĩ tới.
 *
 * KHÔNG để mật khẩu / token đăng nhập vào đây — AsyncStorage là tệp thường,
 * đọc được nếu máy đã root. Bí mật đi qua `expo-secure-store` (Keychain /
 * Keystore), sẽ có cửa riêng khi nối backend.
 *
 * Vì sao AsyncStorage chứ không phải MMKV: MMKV đọc ĐỒNG BỘ (không cần await,
 * không có nhấp nháy lúc khởi động) và nhanh hơn nhiều, nhưng nó là mã gốc
 * không có sẵn trong Expo Go. Đổi sang MMKV là bắt buộc phải dựng development
 * build. Khi nào chốt chuyển thì chỉ file này đổi ruột.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

/** Tiền tố để dữ liệu của Nook không đụng dữ liệu thư viện khác cùng máy. */
const NS = 'nook:';

export async function readText(key: string): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(NS + key);
  } catch {
    // Đọc hỏng thì coi như chưa từng ghi. Không có gì để báo cho người dùng:
    // họ chỉ thấy app quay về mặc định, chứ không thấy một hộp lỗi vô nghĩa.
    return null;
  }
}

export async function writeText(key: string, value: string): Promise<void> {
  try {
    await AsyncStorage.setItem(NS + key, value);
  } catch {
    // Ghi hỏng thì lần mở sau về mặc định. Chấp nhận được với thứ ghi ở đây
    // (lựa chọn hiển thị), KHÔNG chấp nhận được với thứ phải chắc chắn — thứ
    // đó không thuộc về file này.
  }
}

export async function remove(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(NS + key);
  } catch {
    /* xoá hụt thì lần sau xoá tiếp, không ảnh hưởng gì đang chạy */
  }
}

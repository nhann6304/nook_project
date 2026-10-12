/**
 * Máy này là máy nào — gắn vào header của MỌI lệnh gọi server (`HEADER` bên
 * `@nook/shared`). Server dùng để nhận ra máy lạ / nước lạ khi đăng nhập và
 * gửi thư cảnh báo; KHÔNG dùng để cấp quyền.
 *
 * Mã máy là UUID tự sinh một lần, cất trong SecureStore. Không dùng mã phần
 * cứng: iOS không cho, Android thì đọc được là lộ danh tính người dùng.
 * Dựng MỘT lần rồi giữ trong bộ nhớ — không đọc SecureStore mỗi lệnh gọi.
 */
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { DEVICE_HEADER_MAX, HEADER } from '@nook/shared/common/constant';

const ID_KEY = 'device.id.v1';

let cached: Promise<Record<string, string>> | null = null;

export function deviceHeaders(): Promise<Record<string, string>> {
  cached ??= build().catch(() => {
    // SecureStore hỏng (hiếm) thì vẫn gửi phần còn lại; lần sau thử lại.
    cached = null;
    return info();
  });
  return cached;
}

async function build(): Promise<Record<string, string>> {
  let id = await SecureStore.getItemAsync(ID_KEY);
  if (!id) {
    id = Crypto.randomUUID();
    await SecureStore.setItemAsync(ID_KEY, id);
  }
  return { [HEADER.deviceId]: id, ...info() };
}

function info(): Record<string, string> {
  return {
    [HEADER.deviceModel]: clean(Device.modelName ?? Device.deviceName ?? Platform.OS),
    [HEADER.deviceOs]: clean(`${Platform.OS} ${Device.osVersion ?? ''}`),
    [HEADER.appVersion]: clean(Constants.expoConfig?.version ?? '0'),
  };
}

/** Header chỉ chở được ASCII in được — tên máy có dấu thì rơi dấu. */
function clean(v: string): string {
  return v
    .normalize('NFD')
    .replace(/[^\x20-\x7E]/g, '')
    .trim()
    .slice(0, DEVICE_HEADER_MAX);
}

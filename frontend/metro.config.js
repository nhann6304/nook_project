/**
 * `@nook/shared` là gói nằm NGOÀI thư mục app (`../shared`, nối bằng `file:`).
 * Metro chỉ thấy tệp trong `watchFolders` — thiếu dòng dưới là "Unable to
 * resolve @nook/shared" dù tsc vẫn xanh. App đọc bản đã dịch `shared/dist`,
 * dựng bằng `npm run shared` (tự chạy trước `dev` và `typecheck`).
 */
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
config.watchFolders = [...(config.watchFolders ?? []), path.resolve(__dirname, '../shared')];

module.exports = config;

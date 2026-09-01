/**
 * Nguồn dữ liệu cho BỘ LỆNH TypeORM (`npm run migration:run`).
 *
 * Lúc server chạy thì Nest tự dựng kết nối riêng qua `database.module.ts` —
 * file này chỉ để chạy migration ngoài dòng lệnh. Hai chỗ đọc cùng một mảng
 * `ENTITIES` nên không lệch nhau được.
 *
 * Chỉ được xuất ra ĐÚNG MỘT thứ ở file này. Bộ lệnh TypeORM đọc file rồi tìm
 * DataSource; thấy hai thứ là nó không đoán, nó từ chối.
 */
import 'dotenv/config';
import { DataSource } from 'typeorm';
import { ENTITIES } from '../entity/index.js';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5433),
  username: process.env.DB_USER ?? 'nook',
  password: process.env.DB_PASSWORD ?? 'nook',
  database: process.env.DB_NAME ?? 'nook',
  entities: ENTITIES,
  // ESM không có `__dirname`. `import.meta.dirname` cần Node 20.11 trở lên —
  // xem `engines` trong package.json.
  // `..` vì tệp này nằm ở `database/data-source/`, còn migration ở `database/migration/`.
  migrations: [`${import.meta.dirname}/../migration/*.{ts,js}`],
  // KHÔNG BAO GIỜ bật. Bảng thay đổi qua migration viết tay, không qua đoán mò.
  synchronize: false,
  logging: process.env.DB_LOGGING === 'true',
});

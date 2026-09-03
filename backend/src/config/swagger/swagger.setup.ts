import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { DOCS_PATH } from '@nook/shared/common/constant';

/**
 * Trang Swagger. Chỉ mở ở máy dev — `validateEnv` chặn không cho bật ở bản thật.
 *
 * Luật ghi mô tả: NGẮN. "Gửi mã đăng nhập", "Sửa hồ sơ". Ai cần biết vì sao thì
 * đọc mã nguồn, không đọc Swagger.
 *
 * Một chỗ trông lạ so với dự án Nest thường: phần **Responses** không hiện
 * thẳng DTO mà hiện một khối `allOf` — vì mọi câu trả lời đều nằm trong vỏ
 * chung `{ ok, code, data, requestId }`, và `data` mới là DTO. Bấm mở ra là
 * thấy đủ. Đó là cái giá của việc app chỉ phải viết một lớp đọc câu trả lời.
 */
export function setupSwagger(app: INestApplication): void {
  const doc = new DocumentBuilder()
    .setTitle('Nook API')
    .setDescription(
      'Camera-first. Góc 10 người. Ký ức thay cho điểm.\n\n' +
        'Mọi câu trả lời đều có cùng một vỏ: `{ ok, code, data, requestId }` khi ' +
        'trót lọt, `{ ok, code, status, requestId }` khi hỏng. `code` luôn là ' +
        'khoá tra chữ, không bao giờ là câu tiếng Việt.',
    )
    .setVersion('0.1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      // Tên này được nhắc lại trong @ApiBearerAuth() ở controller.
      'access-token',
    )
    // Thứ tự khai ở đây CHÍNH LÀ thứ tự hiện ra. Không sắp theo bảng chữ cái:
    // đăng nhập phải nằm trên cùng vì đó là thứ ai cũng đụng trước.
    .addTag('Đăng nhập', 'Gửi mã, kiểm mã, phát và thu thẻ phiên')
    .addTag('Người dùng', 'Hồ sơ của chính mình')
    .addTag('Thành tích', 'Thứ mở thêm chỗ trong góc')
    .addTag('Hệ thống', 'Dò sống chết')
    .build();

  const document = SwaggerModule.createDocument(app, doc);

  SwaggerModule.setup(DOCS_PATH.replace(/^\//, ''), app, document, {
    // Không có dòng này thì thẻ trình duyệt ghi "Swagger UI" — mở ba dự án là
    // ba thẻ giống hệt nhau, không biết cái nào là cái nào.
    customSiteTitle: 'Nook API',
    swaggerOptions: {
      // Giữ thẻ đã bấm Authorize qua các lần tải lại trang. Không có nó thì mỗi
      // lần sửa mã, server nạp lại, lại phải dán thẻ vào từ đầu.
      persistAuthorization: true,
      // Ô tìm — API còn dài ra nhiều.
      filter: true,
      // Hiện số mili giây của mỗi lần bấm Try it out.
      displayRequestDuration: true,
      // Hiện danh sách đường, chưa mở sẵn thân từng cái.
      docExpansion: 'list',
      // Giữ nguyên thứ tự khai ở trên.
      tagsSorter: undefined,
      operationsSorter: undefined,
    },
  });
}

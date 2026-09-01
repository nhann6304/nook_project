import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { DOCS_PATH } from '@nook/shared';

/**
 * Trang Swagger. Chỉ mở ở máy dev — `validateEnv` chặn không cho bật ở bản thật.
 *
 * Luật ghi mô tả: NGẮN. "Gửi mã đăng nhập", "Sửa hồ sơ". Ai cần biết vì sao
 * thì đọc mã nguồn, không đọc Swagger.
 */
export function setupSwagger(app: INestApplication): void {
  const doc = new DocumentBuilder()
    .setTitle('Nook API')
    .setDescription('Camera-first. Góc 10 người. Ký ức thay cho điểm.')
    .setVersion('0.1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      // Tên này được nhắc lại trong @ApiBearerAuth() ở controller.
      'access-token',
    )
    .addTag('Đăng nhập', 'Gửi mã, kiểm mã, phát và thu thẻ phiên')
    .addTag('Người dùng', 'Hồ sơ của chính mình')
    .addTag('Thành tích', 'Thứ mở thêm chỗ trong góc')
    .build();

  const document = SwaggerModule.createDocument(app, doc);

  SwaggerModule.setup(DOCS_PATH.replace(/^\//, ''), app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      docExpansion: 'list',
    },
  });
}

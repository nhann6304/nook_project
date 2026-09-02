import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../app/user/index.js';
import { AuthController } from './controller/index.js';
import { AuthService, CodeService, SessionService } from './service/index.js';
import { JwtAccessGuard, RolesGuard } from './guard/index.js';

/**
 * `JwtModule.register({})` để trống là cố ý: có HAI chuỗi ký khác nhau (thẻ
 * ngắn hạn và thẻ dài hạn), nên bí mật được truyền theo từng lệnh ký chứ không
 * đặt sẵn ở module. Đặt sẵn một cái là sớm muộn có chỗ ký nhầm bằng cái kia.
 */
@Module({
  imports: [
    JwtModule.register({}),
    UserModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    SessionService,
    CodeService,
    // Hai cổng, đúng thứ tự này. Nest chạy theo thứ tự khai.
    //   1. có phải là ai đó không  -> 401
    //   2. người đó vào được đây không -> 403
    // Gộp làm một thì app không phân biệt được "đăng nhập lại đi" với "tài
    // khoản này không có quyền", mà hai câu đó dẫn đi hai hướng ngược nhau.
    { provide: APP_GUARD, useClass: JwtAccessGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
  exports: [SessionService],
})
export class AuthModule {}

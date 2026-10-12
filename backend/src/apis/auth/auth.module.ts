import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { BullModule } from '@nestjs/bullmq';
import { QUEUE } from '../../queue/constant/index.js';
import { UserModule } from '../app/user/index.js';
import { AuthController } from './auth.controller.js';
import {
  AuthAuditService,
  AuthService,
  CodeService,
  EmailGuardService,
  PasswordService,
  SessionService,
} from './service/index.js';
import { JwtAccessGuard } from './jwt-access.guard.js';
import { RolesGuard } from './roles.guard.js';
import { LoginAlertProcessor } from './login-alert.processor.js';
import { AuthSweepProcessor } from './auth-sweep.processor.js';

/**
 * `JwtModule.register({})` để trống là cố ý: có HAI chuỗi ký khác nhau (thẻ
 * ngắn hạn và thẻ dài hạn), nên bí mật được truyền theo từng lệnh ký chứ không
 * đặt sẵn ở module. Đặt sẵn một cái là sớm muộn có chỗ ký nhầm bằng cái kia.
 */
@Module({
  imports: [
    JwtModule.register({}),
    BullModule.registerQueue({ name: QUEUE.mail }, { name: QUEUE.sweep }),
    UserModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    SessionService,
    CodeService,
    EmailGuardService,
    PasswordService,
    AuthAuditService,
    LoginAlertProcessor,
    AuthSweepProcessor,
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

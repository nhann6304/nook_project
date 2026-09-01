import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from '../../model/user/user.module.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { CodeService } from './code.service.js';
import { CookieService } from './cookie.service.js';
import { SessionService } from './session.service.js';
import { SessionRepository } from './session.repository.js';
import { JwtAccessGuard } from './guard/jwt-access.guard.js';
import { JwtAccessStrategy } from './strategy/jwt-access.strategy.js';

/**
 * `JwtModule.register({})` để trống là cố ý: có HAI chuỗi ký khác nhau (thẻ
 * ngắn hạn và thẻ dài hạn), nên bí mật được truyền theo từng lệnh ký chứ không
 * đặt sẵn ở module. Đặt sẵn một cái là sớm muộn có chỗ ký nhầm bằng cái kia.
 */
@Module({
  imports: [
    PassportModule,
    JwtModule.register({}),
    UserModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    SessionService,
    SessionRepository,
    CodeService,
    CookieService,
    JwtAccessStrategy,
    // Cổng thẻ gắn toàn cục: mọi đường đều đóng cho tới khi dán `@Public()`.
    { provide: APP_GUARD, useClass: JwtAccessGuard },
  ],
  exports: [SessionService, CookieService],
})
export class AuthModule {}

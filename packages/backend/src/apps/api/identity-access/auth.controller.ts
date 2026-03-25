import { Body, Controller, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from '../../../contexts/identity-access/auth/application/auth.service';
import { Public } from '../../../contexts/identity-access/auth/infrastructure/public.decorator';

const JWT_COOKIE_NAME = process.env.JWT_COOKIE_NAME ?? 'access_token';
const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN ?? undefined;

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  // throttle más agresivo configurado desde ThrottlerModule con key 'auth'
  @Post('login')
  async login(
    @Body() body: { username: string; password: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(
      body.username?.trim() ?? '',
      body.password ?? '',
    );

    const isProd = process.env.NODE_ENV === 'production';
    res.cookie(JWT_COOKIE_NAME, result.access_token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'lax' : 'none',
      domain: COOKIE_DOMAIN,
      path: '/',
      maxAge: 2 * 60 * 60 * 1000, // 2h (match with JWT signOptions)
    });

    return result;
  }
}

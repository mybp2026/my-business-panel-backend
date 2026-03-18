import { Post, Controller, Body, Res, UseGuards } from '@nestjs/common';
import { AuthService } from '@/modules/auth/auth.service';
import { LoginDto } from './dto/login.dto';
import { Response } from 'express';
import { AuthenticationGuard } from '@/common/guards/authentication.guard';

@Controller('/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  async login(@Body() loginDto: LoginDto, @Res() response: Response) {
    const { user, token } = await this.authService.login(loginDto);
    response.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      //   sameSite: 'strict',
    });
    return response.json({ message: 'Login successful', user }).status(200);
  }

  @UseGuards(AuthenticationGuard)
  @Post('/logout')
  logout(@Res() response: Response) {
    response.clearCookie('auth_token');
    return response.json({ message: 'Logout successful' }).status(200);
  }
}

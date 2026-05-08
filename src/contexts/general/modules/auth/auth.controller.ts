import { Post, Controller, Body, Res, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from '@/contexts/general/modules/auth/auth.service';
import { LoginDto } from './dto/login.dto';
import { Response } from 'express';
import { AuthenticationGuard } from '@/common/guards/authentication.guard';
import { loginDoc, logoutDoc } from '@/docs/contexts/general/auth';

@ApiTags('Auth')
@Controller('/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation(loginDoc.operation)
  @ApiResponse(loginDoc.responses[200])
  @ApiResponse(loginDoc.responses[401])
  @Post('/login')
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) response: Response) {
    const { user, token } = await this.authService.login(loginDto);
    const isCrossSite = ['production', 'staging'].includes(
      process.env.NODE_ENV ?? '',
    );
    response.cookie('auth_token', token, {
      httpOnly: true,
      secure: isCrossSite,
      sameSite: isCrossSite ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });
    return { message: 'Login successful', user };
  }

  @ApiOperation(logoutDoc.operation)
  @ApiResponse(logoutDoc.responses[200])
  @ApiResponse(logoutDoc.responses[401])
  @UseGuards(AuthenticationGuard)
  @Post('/logout')
  logout(@Res({ passthrough: true }) response: Response) {
    const isCrossSite = ['production', 'staging'].includes(
      process.env.NODE_ENV ?? '',
    );
    response.clearCookie('auth_token', {
      httpOnly: true,
      secure: isCrossSite,
      sameSite: isCrossSite ? 'none' : 'lax',
    });
    return { message: 'Logout successful' };
  }
}

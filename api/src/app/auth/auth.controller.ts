import { Body, Controller, Get, Post } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { AuthService } from './auth.service';
import { RequestUser } from '@secure-task-mgmt/data';
import { LoginDto, RegisterUserDto } from '@secure-task-mgmt/data/backend';
import { CurrentUser } from '@secure-task-mgmt/auth';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  register(@Body() dto: RegisterUserDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('profile')
  getProfile(@CurrentUser() user: RequestUser) {
    return user;
  }
}

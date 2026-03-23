import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOkResponse, ApiBody } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { Public } from '../common/decorators/public.decorator';

import { CreateUserDto } from './dtos/create-user.dto';
import { LoginDto } from './dtos/login.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // --------------------------------------
  // 👉 REGISTER
  // --------------------------------------
  @Public()
  @Post('register')
  @ApiOkResponse({
    description: 'User registered successfully.',
    schema: {
      example: {
        id: 'c1a8c492-5e0a-4f5a-9b89-2ab3f5b1a3e7',
        email: 'user@example.com',
        createdAt: '2025-02-28T10:00:00.000Z',
      },
    },
  })
  async register(@Body() dto: CreateUserDto) {
    return this.authService.register(dto);
  }

  // --------------------------------------
  // 👉 LOGIN
  // --------------------------------------
@Public()
@Post('login')
@ApiBody({ type: LoginDto })
@ApiOkResponse({
  description: 'Login successful. Returns JWT access token.',
  schema: {
    example: {
      access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    },
  },
})
async login(@Body() dto: LoginDto) {
  return this.authService.login(dto);
}


}

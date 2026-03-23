import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from './dtos/create-user.dto';



@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

    // 🔥 REGISTER NEW USER
  async register(dto: CreateUserDto) {
  const { email, password } = dto;

  // 1) Check if email already exists
  const existing = await this.prisma.user.findUnique({
    where: { email },
  });
  if (existing) {
    throw new UnauthorizedException('Email already registered');
  }

  // 2) Hash password
  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(password, salt);

  // 3) Create user
  const user = await this.prisma.user.create({
  data: {
    email,
    password: hashed,
    
  },
});




  // 4) Return JWT
  const payload = { sub: user.id, email: user.email };

  return {
    access_token: await this.jwtService.signAsync(payload),
  };
}


  // 🔥 VALIDATE USER (Login)
  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) throw new UnauthorizedException('Invalid credentials');

    return user;
  }

  // 🔥 LOGIN (used by controller)
  async login(dto: { email: string; password: string }) {
    const { email, password } = dto;

    const user = await this.validateUser(email, password);

   


    const payload = {
      sub: user.id,
      email: user.email,
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}

import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'edi@example.com' })
  email: string;

  @ApiProperty({ example: 'supersecurepassword123' })
  password: string;

  @ApiProperty({ example: 'Edi Vlusha' })
  name: string;
}

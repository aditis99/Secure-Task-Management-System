import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { RoleName } from '../enums/role.enum';

export class RegisterUserDto {
  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsEnum(RoleName)
  role: RoleName = RoleName.VIEWER;

  @IsString()
  @IsOptional()
  organizationId?: string;
}

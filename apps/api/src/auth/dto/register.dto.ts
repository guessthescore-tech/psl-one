import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string = '';

  @IsString()
  @MinLength(8)
  password: string = '';

  @IsDateString()
  dateOfBirth: string = '';

  @IsBoolean()
  consentCoreService: boolean = false;

  @IsOptional()
  @IsString()
  @Matches(/^\+[1-9]\d{1,14}$/, { message: 'phone must be in E.164 format' })
  phone?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{13}$/, { message: 'saId must be 13 digits' })
  saId?: string;

  @IsOptional()
  @IsBoolean()
  consentMarketing?: boolean;

  @IsOptional()
  @IsBoolean()
  consentAnalytics?: boolean;
}

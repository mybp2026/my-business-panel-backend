import {
  IsBoolean,
  IsOptional,
  IsNumber,
  IsString,
  IsNotEmpty,
  IsEmail,
  IsIn,
  IsBase64,
  IsDateString,
  MaxLength,
  Matches,
  ValidateNested,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

// ── Onboarding nested DTOs ──────────────────────────────────────────────────

export class OnboardingBranchDto {
  @IsOptional()
  @IsString()
  branch_name?: string;

  @IsOptional()
  @IsString()
  branch_number?: string;

  @IsOptional()
  @IsString()
  branch_address?: string;
}

export class OnboardingUserDto {
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @IsString()
  password!: string;

  @IsNotEmpty()
  @IsString()
  first_name!: string;

  @IsNotEmpty()
  @IsString()
  last_name!: string;

  @IsNotEmpty()
  @IsString()
  document_number!: string;

  @IsNotEmpty()
  @IsString()
  phone!: string;
}

export class OnboardingHaciendaDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(256)
  @Matches(/^[a-zA-Z0-9@._\-]+$/, {
    message:
      'hacienda_username solo admite alfanuméricos, @, punto, guion y guion bajo',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  hacienda_username!: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(256)
  hacienda_password!: string;

  @IsNotEmpty()
  @IsString()
  @IsIn(['api-stag', 'api-prod'], {
    message: 'hacienda_client_id debe ser "api-stag" o "api-prod"',
  })
  hacienda_client_id!: string;

  @IsNotEmpty()
  @IsString()
  @IsBase64()
  @MaxLength(131_072)
  p12_base64!: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(256)
  p12_password!: string;
}

export class OnboardingSubscriptionDto {
  @IsNotEmpty()
  @IsString()
  stripe_payment_method_id!: string;

  @IsNotEmpty()
  @IsString()
  plan!: string;

  @IsNotEmpty()
  @IsNumber()
  payment_method_id!: number;

  @IsNotEmpty()
  @IsNumber()
  payment_amount!: number;

  @IsNotEmpty()
  @IsNumber()
  subscription_type_id!: number;

  @IsNotEmpty()
  @IsDateString()
  start_date!: string;

  @IsNotEmpty()
  @IsDateString()
  end_date!: string;
}

// ── Main DTO ────────────────────────────────────────────────────────────────

export class NewTenantDto {
  @IsNotEmpty()
  @IsString()
  tenant_name!: string;

  @IsNotEmpty()
  @IsString()
  contact_email!: string;

  @IsOptional()
  @IsString()
  contact_phone?: string;

  @IsOptional()
  @IsBoolean()
  is_subscribed?: boolean;

  @IsNotEmpty()
  @IsNumber()
  region_id!: number;

  @IsNotEmpty()
  @IsNumber()
  identification_type_id!: number;

  @IsNotEmpty()
  @IsString()
  identification!: string;

  @IsNotEmpty()
  @IsString()
  economic_activity!: string;

  @IsNotEmpty()
  @IsString()
  sign!: string;

  // ── Onboarding fields (present only for full tenant+subscription flow) ──

  @IsOptional()
  @ValidateNested()
  @Type(() => OnboardingBranchDto)
  branch?: OnboardingBranchDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => OnboardingUserDto)
  user?: OnboardingUserDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => OnboardingHaciendaDto)
  hacienda?: OnboardingHaciendaDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => OnboardingSubscriptionDto)
  subscription?: OnboardingSubscriptionDto;
}

import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateSpecialCodeDto {
  /**
   * Código que el invitado introducirá durante el onboarding. Lo
   * normalizamos a mayúsculas y bloqueamos espacios para que la
   * comparación contra `code` (UNIQUE) sea predecible.
   */
  @IsNotEmpty()
  @IsString()
  @MinLength(4, { message: 'El código debe tener al menos 4 caracteres' })
  @MaxLength(64, { message: 'El código no puede exceder 64 caracteres' })
  @Matches(/^[A-Z0-9_-]+$/, {
    message:
      'El código solo admite letras mayúsculas, dígitos, guion y guion bajo',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  code!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  /**
   * ISO date opcional. Si se establece y la fecha pasó, el código no
   * podrá canjearse aunque siga marcado como no usado.
   */
  @IsOptional()
  @IsDateString()
  expires_at?: string;
}

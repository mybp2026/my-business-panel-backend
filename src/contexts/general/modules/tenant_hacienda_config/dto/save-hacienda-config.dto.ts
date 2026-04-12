import { Transform } from 'class-transformer';
import {
  IsBase64,
  IsIn,
  IsNotEmpty,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
} from 'class-validator';

export class SaveHaciendaConfigDto {
  @IsNotEmpty()
  @IsUUID()
  tenant_id!: string;

  /**
   * Usuario de Hacienda ATV (cédula, email o identificador).
   * Se envía como form-urlencoded al IDP de Hacienda —
   * restringir charset previene inyección de campos extra.
   */
  @IsNotEmpty()
  @IsString()
  @MaxLength(256)
  @Matches(/^[a-zA-Z0-9@._\-]+$/, {
    message:
      'hacienda_username solo admite alfanuméricos, @, punto, guion y guion bajo',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  hacienda_username!: string;

  /** Contraseña de Hacienda ATV. Solo server-side, nunca se expone. */
  @IsNotEmpty()
  @IsString()
  @MaxLength(256)
  hacienda_password!: string;

  /**
   * Client ID del OAuth de Hacienda.
   * Solo existen dos valores válidos.
   */
  @IsNotEmpty()
  @IsString()
  @IsIn(['api-stag', 'api-prod'], {
    message: 'hacienda_client_id debe ser "api-stag" o "api-prod"',
  })
  hacienda_client_id!: string;

  /**
   * Certificado P12 en base64.
   * Max ~96 KB decodificado (los P12 de Hacienda no superan 10 KB).
   * Base64 por definición solo contiene A-Za-z0-9+/=.
   */
  @IsNotEmpty()
  @IsString()
  @IsBase64()
  @MaxLength(131_072)
  p12_base64!: string;

  /** Contraseña del P12. Solo server-side, nunca se expone. */
  @IsNotEmpty()
  @IsString()
  @MaxLength(256)
  p12_password!: string;
}

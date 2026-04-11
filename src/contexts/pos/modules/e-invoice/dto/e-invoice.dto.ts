import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, Length, Matches, ValidateNested } from "class-validator";

export class IdentificationDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 2)
  type!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]+$/, { message: "La identificacion solo puede tener numeros." })
  @Length(9, 12)
  number!: string;

}

export class UbicationDto {
  @IsString()
  @Length(1, 1)
  @IsNotEmpty()
  province!: string;

  @IsString()
  @Length(1, 2)
  @IsNotEmpty()
  canton!: string;

  @IsString()
  @Length(1, 2)
  @IsNotEmpty()
  district!: string;

  @IsString()
  @Length(1, 250)
  @IsNotEmpty()
  otrasSenas!: string;
} 

export class LineDetailDto {
  @IsNumber()
  @IsNotEmpty()
  lineNumber!: number;

  @IsString()
  @IsNotEmpty()
  @Length(1, 170)
  detail!: string;

  @IsNumber()
  @IsNotEmpty()
  quantity!: number;

  @IsString()
  @IsOptional()
  measureUnit!: string;
}

export class CreateInvoiceDto {
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  activityCode!: string;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => IdentificationDto)
  issuerIdentification!: IdentificationDto;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => UbicationDto)
  issuerUbication!: UbicationDto;

  @IsNotEmpty()
  @IsString()
  issuerName!: string;

  @IsEmail()
  @IsNotEmpty()
  issuerEmail!: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => IdentificationDto)
  receiverIdentification?: IdentificationDto;

  @IsOptional()
  @IsString()
  receiverName?: string;

  @IsOptional()
  @IsEmail()
  receiverEmail?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => LineDetailDto)
  lines!: LineDetailDto[];

  @IsString()
  @IsNotEmpty()
  @Length(2, 2)
  saleCondition!: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 2)
  paymentMethod!: string;
}
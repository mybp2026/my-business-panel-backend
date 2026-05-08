import { PartialType } from "@nestjs/mapped-types";
import { IsOptional, IsUUID } from "class-validator";
import { NewSingleEmployeeDto } from "./newEmployeeDto.dto";

export class UpdateEmployeeDto extends PartialType(NewSingleEmployeeDto) {
  @IsOptional()
  @IsUUID()
  branch_id?: string;
}

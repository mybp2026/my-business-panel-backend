import { PartialType } from "@nestjs/mapped-types";
import { NewSingleEmployeeDto } from "./newEmployeeDto.dto";

export class UpdateEmployeeDto extends PartialType(NewSingleEmployeeDto) {}
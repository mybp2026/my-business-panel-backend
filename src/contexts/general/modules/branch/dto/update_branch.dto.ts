import { PartialType } from '@nestjs/mapped-types';
import { CreateBranchDto } from '@/contexts/general/modules/branch/dto/create_branch.dto';

export class UpdateBranchDto extends PartialType(CreateBranchDto) {}

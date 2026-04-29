import { SetMetadata } from '@nestjs/common';

export const LEVELS_KEY = 'LEVELS';

export const RequiredLevel = (minimunLevelRequired: number) =>
  SetMetadata(LEVELS_KEY, minimunLevelRequired);

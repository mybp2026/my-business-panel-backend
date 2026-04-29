import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import Database from '@crane-technologies/database';
import { paginate } from '../utilities/paginator';
export type { PaginationResult } from '../utilities/paginator';

export const PAGINATE_METADATA_KEY = 'paginate_config';

export interface PaginateConfig {
  table: string;
  columns: string[];
  pkFields: string[];
  whereFields?: string[];
}

export const PaginatedResult = createParamDecorator(
  async (data: any, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const config: PaginateConfig = Reflect.getMetadata(
      PAGINATE_METADATA_KEY,
      ctx.getHandler(),
    );

    if (!config) {
      throw new Error(
        '@PaginatedResult debe usarse con @Paginate en el mismo método',
      );
    }

    const db = (Database as any).getInstance();

    const where: Record<string, any> = {};
    if (config.whereFields) {
      config.whereFields.forEach((field) => {
        const value = request.params[field] ?? request.query[field];
        if (value) {
          where[field] = value;
        }
      });
    }

    const result = await paginate({
      dbClient: db,
      table: config.table,
      selectColumns: config.columns,
      pkFields: config.pkFields,
      where: Object.keys(where).length > 0 ? where : undefined,
      options: {
        limit: request.query.limit ? parseInt(request.query.limit) : 10,
        offset: request.query.offset ? parseInt(request.query.offset) : 0,
        sortBy: request.query.sortBy || 'created_at',
        order: request.query.order || 'DESC',
      },
    });

    return result;
  },
);

export function Paginate(config: PaginateConfig) {
  return function (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) {
    Reflect.defineMetadata(PAGINATE_METADATA_KEY, config, descriptor.value);
    return descriptor;
  };
}

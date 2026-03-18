export interface PaginationResult<T = any> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

interface PaginateOptions {
  limit?: number;
  offset?: number;
  sortBy?: string;
  order?: 'ASC' | 'DESC';
}

interface PaginateParams {
  dbClient: {
    query: (sql: string, params?: any[]) => Promise<{ rows: any[] }>;
  };
  table: string;
  selectColumns: string[];
  pkFields: string[];
  where?: Record<string, any>;
  options?: PaginateOptions;
}

export async function paginate<T = any>({
  dbClient,
  table,
  selectColumns,
  where,
  options = {},
}: PaginateParams): Promise<PaginationResult<T>> {
  const {
    limit = 10,
    offset = 0,
    sortBy = 'created_at',
    order = 'DESC',
  } = options;

  const params: any[] = [];
  const conditions: string[] = [];

  if (where) {
    for (const [key, value] of Object.entries(where)) {
      params.push(value);
      conditions.push(`${key} = $${params.length}`);
    }
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const countSql = `SELECT COUNT(*) FROM ${table} ${whereClause}`;
  const { rows: countRows } = await dbClient.query(countSql, params);
  const total = parseInt(countRows[0].count, 10);

  params.push(limit);
  params.push(offset);

  const columns = selectColumns.join(', ');
  const sql = `
    SELECT ${columns}
    FROM ${table}
    ${whereClause}
    ORDER BY ${sortBy} ${order}
    LIMIT $${params.length - 1} OFFSET $${params.length}
  `;

  const { rows } = await dbClient.query(sql, params);

  return {
    data: rows as T[],
    total,
    limit,
    offset,
    hasMore: offset + rows.length < total,
  };
}

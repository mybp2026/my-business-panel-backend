import { generalQueries } from '@general/general.queries';

interface QueryRunner {
  query: (text: string, params?: any[]) => Promise<{ rows: any[] }>;
}

const { tenantProductGroup } = generalQueries;

/**
 * Returns the set of descendant group IDs (inclusive of the root) for a given
 * tenant_product_group node. Uses the recursive CTE defined in
 * generalQueries.tenantProductGroup.descendants.
 */
export async function getGroupDescendants(
  db: QueryRunner,
  tenantId: string,
  groupId: string,
): Promise<string[]> {
  const res = await db.query(tenantProductGroup.descendants, [
    tenantId,
    groupId,
  ]);
  return res.rows.map((r) => r.node);
}

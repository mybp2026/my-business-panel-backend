import { generalQueries } from '@general/general.queries';

interface QueryRunner {
  query: (text: string, params?: any[]) => Promise<{ rows: any[] }>;
}

const { productComposition } = generalQueries;

export interface ExplodedLeaf {
  product_variant_id: string;
  quantity: number;
}

/**
 * Recursively expands a (possibly composite) variant into its leaf
 * components for inventory purposes. If the variant is not composite,
 * returns itself with the requested quantity. Composite variants are
 * expanded by their components, multiplying the requested quantity by
 * the component ratio. Multiple levels of nesting are supported (e.g.,
 * a batch of six-packs of bottles).
 *
 * The returned list aggregates duplicate leaves into a single entry.
 */
export async function explodeForInventory(
  db: QueryRunner,
  tenantId: string,
  variantId: string,
  quantity: number,
): Promise<ExplodedLeaf[]> {
  const accumulator = new Map<string, number>();
  await walk(db, tenantId, variantId, quantity, accumulator);
  return Array.from(accumulator.entries()).map(([product_variant_id, qty]) => ({
    product_variant_id,
    quantity: qty,
  }));
}

async function walk(
  db: QueryRunner,
  tenantId: string,
  variantId: string,
  quantity: number,
  acc: Map<string, number>,
): Promise<void> {
  const meta = await db.query(
    `SELECT is_composite FROM general_schema.product_variant
     WHERE tenant_id = $1 AND product_variant_id = $2 LIMIT 1`,
    [tenantId, variantId],
  );
  const isComposite = meta.rows[0]?.is_composite === true;

  if (!isComposite) {
    acc.set(variantId, (acc.get(variantId) ?? 0) + quantity);
    return;
  }

  const components = await db.query(productComposition.byParent, [
    tenantId,
    variantId,
  ]);
  for (const c of components.rows) {
    const childQty = quantity * Number(c.quantity);
    await walk(db, tenantId, c.child_product_variant_id, childQty, acc);
  }
}

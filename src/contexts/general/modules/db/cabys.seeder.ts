import Database from '@crane-technologies/database';
import * as ExcelJS from 'exceljs';
import { join } from 'path';

export async function seedCabysIfNeeded(db: Database): Promise<void> {
  const check = await db.rawQuery<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM general_schema.product_category`,
  );

  if (parseInt(check.rows[0]?.count ?? '0', 10) > 0) {
    console.log('CABYS already seeded. Skipping.');
    return;
  }

  console.log('Seeding CABYS catalog...');

  const filePath = join(__dirname, '../../../../common/utilities/cabys_loader/CABYS.xlsx');
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);

  const worksheet = workbook.getWorksheet(1);
  if (!worksheet) throw new Error('CABYS worksheet not found in CABYS.xlsx');

  const taxRatesRes = await db.rawQuery<{ tax_rate_id: number; rate_percentage: string }>(
    `SELECT tax_rate_id, rate_percentage FROM general_schema.tax_rate`,
  );
  const taxMap = new Map(
    taxRatesRes.rows.map((r) => [parseFloat(r.rate_percentage), r.tax_rate_id]),
  );

  const headerRow = worksheet.getRow(2);
  const colIndices: { categories: number[]; descriptions: number[]; tax: number } = {
    categories: [],
    descriptions: [],
    tax: -1,
  };

  headerRow.eachCell((cell, colNumber) => {
    const val = cell.text.toLowerCase();
    if (val.startsWith('categoría') || val.startsWith('categoria')) colIndices.categories.push(colNumber);
    if (val.startsWith('descripción') || val.startsWith('descripcion')) colIndices.descriptions.push(colNumber);
    if (val.includes('impuesto')) colIndices.tax = colNumber;
  });

  const categoriesMap = new Map<string, any[]>();
  const products: any[][] = [];

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber <= 2) return;
    let lastParentCode: string | null = null;

    for (let i = 0; i < colIndices.categories.length; i++) {
      const code = row.getCell(colIndices.categories[i]).text?.trim();
      const desc = row.getCell(colIndices.descriptions[i]).text?.trim();
      if (!code || !desc) break;

      const nextCatCol = colIndices.categories[i + 1];
      const nextCode = nextCatCol ? row.getCell(nextCatCol).text?.trim() : null;
      const isLeaf = !nextCode || i === colIndices.categories.length - 1;

      if (isLeaf) {
        const rawTax = row.getCell(colIndices.tax).text;
        let taxValue = rawTax.includes('%') ? parseFloat(rawTax.replace('%', '')) : parseFloat(rawTax) || 0;
        products.push([code, desc, taxMap.get(taxValue) ?? taxMap.get(0.0), lastParentCode, taxValue === 0]);
      } else {
        if (!categoriesMap.has(code)) categoriesMap.set(code, [code, desc, i, lastParentCode]);
        lastParentCode = code;
      }
    }
  });

  const txn = await db.transaction();
  try {
    await txn.bulkInsert(
      'general_schema.product_category',
      ['product_category_id', 'category_name', 'hierarchy_level', 'parent_category_id'],
      Array.from(categoriesMap.values()),
    );
    await txn.bulkInsert(
      'general_schema.product',
      ['cabys_code', 'product_name', 'tax_rate_id', 'product_category_id', 'is_exonerated'],
      products,
    );
    await txn.commit();
    console.log(`CABYS seeding completed: ${categoriesMap.size} categories, ${products.length} products.`);
  } catch (err) {
    await txn.rollback();
    throw err;
  }
}

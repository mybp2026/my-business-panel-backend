import Database, { DatabaseConfig } from '@crane-technologies/database';
import * as ExcelJS from 'exceljs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.staging' });

async function bootstrap() {
    console.log('\n🚀 Iniciando cargador ULTRA-RÁPIDO (Modo COPY Nativo)...');

    const config: DatabaseConfig = {
        connectionString: process.env.DB_CONNECTION,
        max: 5,
        ssl: { rejectUnauthorized: false },
    };

    if (!config.connectionString) {
        console.error('❌ Error: DB_CONNECTION no definido.');
        process.exit(1);
    }

    const db = Database.getInstance(config, {});
    const workbook = new ExcelJS.Workbook();
    const filePath = path.join(__dirname, '../src/common/utilities/cabys_loader/CABYS.xlsx');

    try {
        console.log(`📖 Leyendo Excel: ${filePath}...`);
        await workbook.xlsx.readFile(filePath);
        const worksheet = workbook.getWorksheet(1);
        if (!worksheet) throw new Error('No se pudo encontrar la hoja en el Excel.');

        const categoriesMap = new Map<string, any>();
        const products: any[] = [];
        
        console.log('🔎 Mapeando impuestos...');
        const taxRatesRes = await db.query('SELECT tax_rate_id, rate_percentage FROM general_schema.tax_rate');
        const taxMap = new Map(taxRatesRes.rows.map((r: any) => [parseFloat(r.rate_percentage), r.tax_rate_id]));

        const headerRow = worksheet.getRow(2);
        const colIndices: { categories: number[], descriptions: number[], tax: number } = { categories: [], descriptions: [], tax: -1 };

        headerRow.eachCell((cell, colNumber) => {
            const val = cell.text.toLowerCase();
            if (val.startsWith('categoría') || val.startsWith('categoria')) colIndices.categories.push(colNumber);
            if (val.startsWith('descripción') || val.startsWith('descripcion')) colIndices.descriptions.push(colNumber);
            if (val.includes('impuesto')) colIndices.tax = colNumber;
        });

        const totalRows = worksheet.rowCount;
        console.log(`🌳 Procesando ${totalRows} filas en memoria...`);

        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber <= 2) return;
            let lastParentCode: string | null = null;
            for (let i = 0; i < colIndices.categories.length; i++) {
                const currentCatCol = colIndices.categories[i];
                const currentDescCol = colIndices.descriptions[i];
                
                const code = row.getCell(currentCatCol).text?.trim();
                const desc = row.getCell(currentDescCol).text?.trim();

                if (!code || !desc) break;

                // FIX: Validar que el índice existe antes de llamar a getCell
                const nextCatCol = colIndices.categories[i + 1];
                const nextCode = nextCatCol ? row.getCell(nextCatCol).text?.trim() : null;
                const isLeaf = !nextCode || i === colIndices.categories.length - 1;

                if (isLeaf) {
                    const rawTax = row.getCell(colIndices.tax).text;
                    let taxValue = 0;
                    if (rawTax.includes('%')) taxValue = parseFloat(rawTax.replace('%', ''));
                    else taxValue = isNaN(parseFloat(rawTax)) ? 0 : parseFloat(rawTax);

                    products.push([code, desc, taxMap.get(taxValue) || taxMap.get(0.0), lastParentCode, taxValue === 0]);
                } else {
                    if (!categoriesMap.has(code)) {
                        categoriesMap.set(code, [code, desc, i, lastParentCode]);
                    }
                    lastParentCode = code;
                }
            }
        });

        console.log(`\n✅ Preparado: ${categoriesMap.size} categorías y ${products.length} productos.`);
        console.log(`🚄 Iniciando COPY (bulkInsert) masivo...`);

        const txn = await db.transaction();
        try {
            console.log('📂 Transfiriendo categorías...');
            const categories = Array.from(categoriesMap.values());
            await txn.bulkInsert(
                'general_schema.product_category',
                ['product_category_id', 'category_name', 'hierarchy_level', 'parent_category_id'],
                categories
            );
            console.log(`   ✅ ${categories.length} categorías enviadas.`);

            console.log('📦 Transfiriendo productos...');
            await txn.bulkInsert(
                'general_schema.product',
                ['cabys_code', 'product_name', 'tax_rate_id', 'product_category_id', 'is_exonerated'],
                products
            );
            console.log(`   ✅ ${products.length} productos enviados.`);

            console.log('💾 Confirmando cambios (Commit)...');
            await txn.commit();
            console.log('🎊 ¡CARGA EXITOSA! 🎊');
        } catch (e) {
            await txn.rollback();
            throw e;
        }
    } catch (error) {
        console.error('\n❌ ERROR DURANTE LA CARGA:', error);
        console.error('💡 TIP: Si el error es de Duplicate Key, asegúrate de que las tablas estén vacías.');
    } finally {
        process.exit(0);
    }
}

bootstrap();

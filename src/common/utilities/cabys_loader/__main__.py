import argparse
import pathlib
from typing import Dict, List, Optional
import excel_handler
import cabys_parser
from cabys_parser import CabysNode
from db import DatabaseClient
from pprint import PrettyPrinter

def main():
    parser = argparse.ArgumentParser(description="CABYS Loader")
    parser.add_argument("input_file", type=pathlib.Path, help="Path to the input file")
    parser.add_argument("--conn-string", type=str, help="URL for database connection")
    parser.add_argument("--header", type=int, default=0, help="Row number to use as column names (default: 0)")
    parser.add_argument("--last-column", type=int, default=None, help="Last column to include in the data (optional)")
    parser.add_argument("--reload-rates", action="store_true", help="Whether to reload tax rates into the database")
    args = parser.parse_args()

    printer = PrettyPrinter(indent=3, compact=False, underscore_numbers=True)

    input_file: pathlib.Path = args.input_file
    header: int = args.header
    last_column: int = int(args.last_column) if args.last_column else None
    conn_string: str = args.conn_string 

    if not conn_string:
        raise ValueError("Error: --conn-string must be provided for database connection.")

    if not input_file.exists():
        raise ValueError(f"Error: The file {input_file} does not exist.")
    
    print(f"📖 Reading Excel file: {input_file}...")
    dataframe = excel_handler.read_excel(input_file, header=header, last_column=last_column)
    print(f"✅ Excel loaded with {len(dataframe)} rows.")
    
    tax_rates = cabys_parser.list_tax_rates(dataframe)

    supabase = DatabaseClient(conn_string)
    supabase.connect()

    if args.reload_rates:
        print(f"📊 Loading tax rates into the database: {tax_rates}")
        supabase.load_tax_rates(list(tax_rates))
        print("✅ Tax rates loaded successfully.")

    print("🔎 Fetching tax rates from database...")
    fetched_rates = supabase.get_tax_rates()
    print(f"✅ Fetched {len(fetched_rates)} tax rates.")

    print("🌳 Building CABYS tree structure...")
    tree = cabys_parser.build_cabys_tree(dataframe)
    print("✅ Tree structure built.")

    print("📥 Starting bulk data insertion...")
    process_and_insert(tree, supabase)

    supabase.permanent_connection.commit()
    print(f"🎉 Finished loading CABYS data into the database.")
    supabase.disconnect()

def process_and_insert(tree: Dict[str, CabysNode], client: DatabaseClient, batch_size: int = 1000):
    categories_to_insert = []
    products_to_insert = []
    
    def _walk(node: CabysNode, parent_code: Optional[str] = None, depth: int = 0):
        if node is None:
            return
        
        if node.data.tax_rate is not None:
            products_to_insert.append({
                "code": node.data.code,
                "description": node.data.description,
                "tax_rate_value": node.data.tax_rate,
                "category_code": parent_code
            })
        else:
            categories_to_insert.append({
                "product_category_id": node.data.code,
                "category_name": node.data.description,
                "hierarchy_level": depth,
                "parent_category_id": parent_code
            })

        children = getattr(node, "children", None)
        if not children:
            return
        
        iterable = children.values() if isinstance(children, dict) else children
        for child in iterable:
            _walk(child, parent_code=node.data.code, depth=depth + 1)

    print("🔄 Traversing tree to collect records...")
    for root in tree.values():
        _walk(root)
    
    print(f"📝 Collected {len(categories_to_insert)} categories and {len(products_to_insert)} products.")

    # Insertar categorías
    print(f"\n📂 Inserting categories in batches of {batch_size}...")
    for i in range(0, len(categories_to_insert), batch_size):
        batch = categories_to_insert[i:i + batch_size]
        client.bulk_insert_categories(batch)
        print(f"   [+] Categories: {min(i + batch_size, len(categories_to_insert))}/{len(categories_to_insert)} inserted.")

    # Insertar productos
    print(f"\n📦 Inserting products in batches of {batch_size}...")
    for i in range(0, len(products_to_insert), batch_size):
        batch = products_to_insert[i:i + batch_size]
        client.bulk_insert_products(batch)
        print(f"   [+] Products: {min(i + batch_size, len(products_to_insert))}/{len(products_to_insert)} inserted.")

if __name__ == "__main__":
    main()
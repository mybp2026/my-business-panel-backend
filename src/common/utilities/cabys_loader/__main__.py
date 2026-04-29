import argparse
import pathlib
from typing import Dict, List, Optional
import excel_handler
import cabys_parser
from cabys_parser import CabysNode
from db import DatabaseClient
from pprint import pprint, PrettyPrinter

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
    last_column: int = int(args.last_column)
    conn_string: str = args.conn_string 

    if not conn_string:
        raise ValueError("Error: --conn-string must be provided for database connection.")

    if not input_file.exists():
        raise ValueError(f"Error: The file {input_file} does not exist.")
    
    dataframe = excel_handler.read_excel(input_file, header=header, last_column=last_column)
    tax_rates = cabys_parser.list_tax_rates(dataframe)

    supabase = DatabaseClient(conn_string)
    supabase.connect()

    if args.reload_rates:
        print(f"Loading tax rates into the database: {tax_rates}")
        supabase.load_tax_rates(list(tax_rates))
        print("Tax rates loaded successfully.")

    fetched_rates = supabase.get_tax_rates()
    print(f"Fetched tax rates from database:")
    printer.pprint(fetched_rates)

    tree = cabys_parser.build_cabys_tree(dataframe)
    # column_names = cabys_parser.categorize_columns(dataframe)
    
    # pprint(f"Categories Columns: {column_names.categories}")
    # print()
    # pprint(f"Descriptions Columns: {column_names.descriptions}")

    # print(f"Fetched tax rates:")


    move_inside_tree(tree, supabase)

    supabase.permanent_connection.commit()
    print(f"Finished loading CABYS data into the database.")
    supabase.disconnect()
    # cabys_parser.save_tree_to_json(tree, "cabys_tree.json")


global loaded_nodes
loaded_nodes = 0    

def move_inside_tree(tree: Dict[str, CabysNode], client: DatabaseClient) -> Optional[CabysNode]:
    def _walk(node: CabysNode, parent_code: Optional[str] = None, depth: int = 0):
        global loaded_nodes
        if node is None:
            return
        
        if node.data.tax_rate is not None:
            loaded_nodes += 1
            client.insert_product(
                code=node.data.code,
                description=node.data.description,
                tax_rate=node.data.tax_rate,
                category_code=parent_code
            )

        else:
            client.insert_category(
                code=node.data.code,
                description=node.data.description,
                hierarchy_level=depth,
                parent_code=parent_code
            )

        children = getattr(node, "children", None)
        if not children:
            return
        if isinstance(children, dict):
            iterable = children.values()
        else:
            iterable = children
        for child in iterable:
            _walk(child, parent_code=node.data.code, depth=depth + 1)

    for root in tree.values():
        _walk(root)
    return None


    # print(f"Loading category: {node.data.code} - {node.data.description}")

if __name__ == "__main__":
    main()
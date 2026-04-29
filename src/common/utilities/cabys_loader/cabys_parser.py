import pandas as pd
from pandas import DataFrame
from dataclasses import dataclass, field
from typing import Dict, Optional
import json

@dataclass
class ColumnInfo:
    name: str
    index: int

@dataclass
class CabysColumns:
    categories: list[ColumnInfo] = field(default_factory=list)
    descriptions: list[ColumnInfo] = field(default_factory=list)

@dataclass
class CabysCategory:
    code: str
    description: str
    tax_rate: float | None 

@dataclass
class CabysNode:
    data: CabysCategory
    children: Dict[str, 'CabysNode'] = field(default_factory=dict)

    def to_dict(self):
        return {
            "code": self.data.code,
            "description": self.data.description,
            "tax_rate": self.data.tax_rate,
            "children": [child.to_dict() for child in self.children.values()]
        }

def categorize_columns(dataframe: pd.DataFrame) -> CabysColumns:
    columns = dataframe.columns.tolist()
    columns_info = CabysColumns()
    
    for index, column in enumerate(columns):
        column_lower = column.lower()
        if column_lower.startswith("categoría") or column_lower.startswith("categoria"):
            columns_info.categories.append(ColumnInfo(name=column, index=index))
        elif column_lower.startswith("descripción") or column_lower.startswith("descripcion"):
            columns_info.descriptions.append(ColumnInfo(name=column, index=index))
            
    return columns_info

def parse_tax(value) -> float:
    if pd.isna(value): 
        return 0.0
    
    s = str(value).strip().lower()
    
    if s in ('exento', 'nan', 'na', '', 'null'):
        return 0.0
    
    try:
        if '%' in s:
            return float(s.replace('%', ''))
        else:
            return float(s)
    except ValueError:
        return 0.0

def build_cabys_tree(dataframe: DataFrame) -> Dict[str, CabysNode]:
    cols_info = categorize_columns(dataframe)
    
    sorted_cats = sorted(cols_info.categories, key=lambda x: x.index)
    sorted_descs = sorted(cols_info.descriptions, key=lambda x: x.index)
    
    tax_col = next((col for col in dataframe.columns if "impuesto" in col.lower()), None)

    root_nodes: Dict[str, CabysNode] = {}

    print(f"Building tree from {len(dataframe)} rows...")

    for _, row in dataframe.iterrows():
        current_level_nodes = root_nodes

        level_pairs = list(zip(sorted_cats, sorted_descs))
        total_levels = len(level_pairs)

        for depth, (cat_col, desc_col) in enumerate(level_pairs):
            code = row[cat_col.name]
            description = row[desc_col.name]
            
            if pd.isna(code):
                break

            if code not in current_level_nodes:
                is_leaf = (depth == total_levels - 1)
                tax_rate = None
                
                if is_leaf and tax_col:
                    try:
                        tax_rate = parse_tax(row[tax_col])
                    except (ValueError, TypeError):
                        tax_rate = 0.0

                category_data = CabysCategory(
                    code=code,
                    description=description,
                    tax_rate=tax_rate
                )
                
                current_level_nodes[code] = CabysNode(data=category_data)

            current_level_nodes = current_level_nodes[code].children

    return root_nodes

def save_tree_to_json(tree: Dict[str, CabysNode], output_file: str):
    serializable_data = [node.to_dict() for node in tree.values()]
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(serializable_data, f, ensure_ascii=False, indent=2)
    
    print(f"Successfully saved JSON to {output_file}")

def list_tax_rates(dataframe: DataFrame, tax_column_name: str = "impuesto") -> set[float]:
    
    tax_col = next((c for c in dataframe.columns if tax_column_name in c.lower()), None)
    
    if not tax_col:
        raise ValueError(f"Error: Could not find a column with {tax_column_name} in the name.")

    raw_values = dataframe[tax_col].dropna().unique()
    
    cleaned_taxes = set()
    
    for val in raw_values:
        s = str(val).strip().lower()
        if s in ('exento', 'nan', 'na', '', 'null'):
            cleaned_taxes.add(0.0)
        elif '%' in s:
            try:
                cleaned_taxes.add(float(s.replace('%', '')))
            except ValueError:
                pass
        else:
            try:
                cleaned_taxes.add(float(s))
            except ValueError:
                pass
    
    return cleaned_taxes

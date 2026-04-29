from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine, Connection

from typing import Dict, Optional, List

class DatabaseClient:
    tax_rates: Dict[str, float]
    engine: Engine
    permanent_connection: Optional[Connection] = None
    
    def connect(self):
        if self.permanent_connection is None:
            self.permanent_connection = self.engine.connect()
        return self.permanent_connection
    
    def disconnect(self):
        if self.permanent_connection is not None:
            self.permanent_connection.close()
            self.permanent_connection = None

    def __init__(self, url: str):
        self.engine = create_engine(url)
    
    def get_tax_rates(self) -> Dict[float, int]:
        with self.engine.connect() as connection:
            result = connection.execute(
                text("SELECT tax_rate_id, region, rate_percentage FROM general_schema.tax_rate")
            )

            raw_rates = result.mappings().all()
            self.tax_rates = {float(row['rate_percentage']): row['tax_rate_id'] for row in raw_rates}
            return self.tax_rates
    
    def load_tax_rates(self, tax_rates: List[float]) -> None:
        with self.engine.connect() as connection:
            for rate in tax_rates:
                connection.execute(
                    text("""
                        INSERT INTO general_schema.tax_rate (region, rate_percentage)
                        VALUES (:region, :rate)
                        ON CONFLICT (region, rate_percentage) DO NOTHING
                    """),
                    {"region": "Costa Rica", "rate": rate}
                )
            
            connection.commit()
 

    def insert_category(self, code: str, description: str, hierarchy_level: int, parent_code: str | None = None):
        if self.permanent_connection is None:
            raise Exception("Database connection is not established.")
        self.permanent_connection.execute(
            text("""
                 INSERT INTO general_schema.product_category 
                 (product_category_id, category_name, hierarchy_level, parent_category_id) 
                 VALUES (:product_category_id, :category_name, :hierarchy_level, :parent_category_id)
                 ON CONFLICT (product_category_id) DO NOTHING
                """),
            {"product_category_id": code, "category_name": description, "hierarchy_level": hierarchy_level, "parent_category_id": parent_code}
        )

    def insert_product(self, code: str, description: str, tax_rate: float, category_code: str):
        if self.permanent_connection is None:
            raise Exception("Database connection is not established.")
        tax_rate_id = self.tax_rates.get(tax_rate)
        if tax_rate_id is None:
            raise ValueError(f"Tax rate {tax_rate} not found in tax_rates mapping.")
        self.permanent_connection.execute(
            text("""
                 INSERT INTO general_schema.product 
                 (cabys_code, product_name, tax_rate_id, product_category_id, is_exonerated) 
                 VALUES (:code, :description, :tax_rate, :category_code, :is_exonerated)
                 ON CONFLICT (cabys_code) DO NOTHING
                 """),
            {"code": code, "description": description, "tax_rate": tax_rate_id, "category_code": category_code, "is_exonerated": tax_rate == 0.0}
        )
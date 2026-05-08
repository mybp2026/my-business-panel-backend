from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine, Connection

from typing import Dict, Optional, List

class DatabaseClient:
    tax_rates: Dict[float, int]
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

    def bulk_insert_categories(self, categories: List[Dict]):
        """Inserta categorías en bloques."""
        if self.permanent_connection is None:
            raise Exception("Database connection is not established.")
        
        query = text("""
            INSERT INTO general_schema.product_category 
            (product_category_id, category_name, hierarchy_level, parent_category_id) 
            VALUES (:product_category_id, :category_name, :hierarchy_level, :parent_category_id)
            ON CONFLICT (product_category_id) DO NOTHING
        """)
        
        self.permanent_connection.execute(query, categories)

    def bulk_insert_products(self, products: List[Dict]):
        """Inserta productos en bloques."""
        if self.permanent_connection is None:
            raise Exception("Database connection is not established.")
        
        query = text("""
            INSERT INTO general_schema.product 
            (cabys_code, product_name, tax_rate_id, product_category_id, is_exonerated) 
            VALUES (:code, :description, :tax_rate, :category_code, :is_exonerated)
            ON CONFLICT (cabys_code) DO NOTHING
        """)
        
        # Convertimos las tasas de interés a sus IDs correspondientes
        for p in products:
            rate_val = p['tax_rate_value']
            p['tax_rate'] = self.tax_rates.get(rate_val, self.tax_rates.get(0.0))
            p['is_exonerated'] = (rate_val == 0.0)
            del p['tax_rate_value']

        self.permanent_connection.execute(query, products)
import pandas as pd
from pathlib import Path

def read_excel(file_path: Path, header: int = 0, last_column: int = None) -> pd.DataFrame:
    try:
        frame = pd.read_excel(
            file_path, 
            engine='openpyxl', 
            header=header, 
            usecols=list(range(last_column)) if last_column is not None else None,
            dtype=str  
        )
        if frame.empty:
            raise ValueError("The Excel file is empty.")
        
        return frame
    except Exception as e:
        raise ValueError(f"Error reading Excel file: {e}")


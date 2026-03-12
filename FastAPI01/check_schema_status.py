from sqlalchemy import create_engine, text
from database import DATABASE_URL
import sys

try:
    engine = create_engine(DATABASE_URL)
    with engine.connect() as conn:
        res = conn.execute(text("DESCRIBE filings"))
        rows = res.fetchall()
        for row in rows:
            print(row)
except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)

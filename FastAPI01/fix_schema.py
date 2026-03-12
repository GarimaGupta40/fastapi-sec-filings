from sqlalchemy import create_engine, text
from database import DATABASE_URL

engine = create_engine(DATABASE_URL)
with engine.connect() as conn:
    try:
        conn.execute(text("ALTER TABLE filings ADD COLUMN accession_number VARCHAR(30)"))
        conn.commit()
        print("Column accession_number added to filings table.")
    except Exception as e:
        print(f"Error or already exists: {e}")

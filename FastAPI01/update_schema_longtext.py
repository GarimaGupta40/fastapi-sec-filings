from sqlalchemy import create_engine, text
from database import DATABASE_URL

engine = create_engine(DATABASE_URL)
with engine.connect() as conn:
    try:
        conn.execute(text("ALTER TABLE filings MODIFY extracted_text LONGTEXT;"))
        conn.commit()
        print("Table 'filings' successfully updated to LONGTEXT.")
    except Exception as e:
        print(f"Error updating table: {e}")

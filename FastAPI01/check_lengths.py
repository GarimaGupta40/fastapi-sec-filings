from sqlalchemy import create_engine, text
from database import DATABASE_URL

engine = create_engine(DATABASE_URL)
with engine.connect() as connection:
    result = connection.execute(text("SELECT ticker, form_type, filing_date, LENGTH(extracted_text) FROM filings"))
    rows = result.fetchall()
    print(f"Total filings in DB: {len(rows)}")
    for row in rows:
        print(row)

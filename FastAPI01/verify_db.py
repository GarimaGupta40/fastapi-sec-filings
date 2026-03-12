from sqlalchemy import create_engine, text
from database import DATABASE_URL

engine = create_engine(DATABASE_URL)
with engine.connect() as conn:
    res = conn.execute(text("SELECT ticker, form_type, LENGTH(extracted_text) FROM filings")).fetchall()
    print("Filings in DB:")
    for row in res:
        print(row)

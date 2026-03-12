from sqlalchemy import create_engine, text
from database import DATABASE_URL

engine = create_engine(DATABASE_URL)
with engine.connect() as conn:
    # Delete filings that contain the mock text
    result = conn.execute(text("DELETE FROM filings WHERE extracted_text LIKE '%is a global leader in its sector%'"))
    conn.commit()
    print(f"Deleted mock filings.")

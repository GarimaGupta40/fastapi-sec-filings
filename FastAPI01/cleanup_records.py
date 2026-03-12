from sqlalchemy import create_engine, text
from database import DATABASE_URL

engine = create_engine(DATABASE_URL)
with engine.connect() as conn:
    # Delete the record that has the interactive viewer placeholder text
    conn.execute(text("DELETE FROM filings WHERE extracted_text LIKE '%please enable javascript%'"))
    conn.commit()
    print("Deleted placeholder records.")

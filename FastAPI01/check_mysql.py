from sqlalchemy import create_engine, inspect
from database import DATABASE_URL
engine = create_engine(DATABASE_URL)
inspector = inspect(engine)
print(inspector.get_table_names())

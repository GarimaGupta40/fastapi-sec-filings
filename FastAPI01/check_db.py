from sqlalchemy import create_engine, inspect
engine = create_engine("sqlite:///financial_data.db")
inspector = inspect(engine)
print(inspector.get_table_names())

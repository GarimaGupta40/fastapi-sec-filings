from database import engine, Base
import models

def create_tables():
    print("Creating new filing tables...")
    # This will create tables for any models that don't exist yet
    models.Base.metadata.create_all(bind=engine)
    print("Tables created successfully.")

if __name__ == "__main__":
    create_tables()

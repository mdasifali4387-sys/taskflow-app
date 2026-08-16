# backend/database.py
import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Load local environment configuration files smoothly
load_dotenv()

SUPABASE_DATABASE_URL = os.getenv("SUPABASE_URL")

if not SUPABASE_DATABASE_URL:
    raise ValueError("[CRITICAL ERROR] Supabase Connection URI missing from environment variables configuration.")

# Connection pool settings optimized for remote cloud instances
engine = create_engine(
    SUPABASE_DATABASE_URL,
    pool_size=20,       # Connections limit ko 5 se badha kar 20 kiya taaki wait na karna pade
    max_overflow=30,    # Emergency connections allow karega
    pool_timeout=60,    # Timeout duration badha diya taaki query crash na ho
    pool_pre_ping=True  # Har hit se pehle connection active hai ya nahi check karega
)


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Shared Database Session Dependency (FastAPI Depends)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

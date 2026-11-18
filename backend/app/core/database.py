from datetime import datetime, timezone

from sqlalchemy.orm import sessionmaker
from sqlmodel import Session, SQLModel, create_engine

from app.core.config import settings

_connect_args = (
    {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}
)

engine = create_engine(settings.DATABASE_URL, connect_args=_connect_args)

# expire_on_commit=False: los objetos siguen legibles después del commit del Unit of Work.
session_factory = sessionmaker(bind=engine, class_=Session, expire_on_commit=False)


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def create_all_tables() -> None:
    SQLModel.metadata.create_all(engine)
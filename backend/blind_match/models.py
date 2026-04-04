import uuid
from sqlalchemy import create_engine, Column, String, JSON, ForeignKey
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.dialects.postgresql import UUID

Base = declarative_base()

class QuizAnswer(Base):
    __tablename__ = 'quiz_answers'

    answer_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    # Assuming a 'sessions' table exists from MVP-BE-001 implementation
    session_id = Column(UUID(as_uuid=True), ForeignKey('sessions.session_id'), nullable=False)
    # Assuming a 'users' table exists
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.user_id'), nullable=False)
    quiz_id = Column(String, nullable=False)
    answers = Column(JSON, nullable=False) # In a real scenario, this would be an encrypted blob/text field

    def __repr__(self):
        return f"<QuizAnswer(answer_id='{self.answer_id}', user_id='{self.user_id}', quiz_id='{self.quiz_id}')>"

# Example of how this might be connected to a database
# DATABASE_URL = "postgresql://user:password@host/dbname"
# engine = create_engine(DATABASE_URL)
# SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base.metadata.create_all(bind=engine)

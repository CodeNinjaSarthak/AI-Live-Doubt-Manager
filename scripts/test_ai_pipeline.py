"""End-to-end test for the AI pipeline: classification → embedding → clustering → answer."""

import datetime
import os
import sys
import time
import uuid

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from workers.common.queue import QueueManager, QUEUE_CLASSIFICATION
from workers.common.schemas import ClassificationPayload
from backend.app.db.models.teacher import Teacher
from backend.app.db.models.streaming_session import StreamingSession
from backend.app.db.models.comment import Comment
from backend.app.db.models.answer import Answer

DATABASE_URL = os.environ["DATABASE_URL"]
engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)
db = Session()

TIMEOUT = 120  # seconds


def main():
    # Insert test data
    teacher = Teacher(
        email=f"test_{uuid.uuid4()}@test.com",
        name="Test",
        hashed_password="x",
        is_active=True,
    )
    db.add(teacher)
    db.flush()

    session = StreamingSession(
        teacher_id=teacher.id,
        youtube_video_id=f"test_{uuid.uuid4()}",
        is_active=True,
        started_at=datetime.datetime.utcnow(),
    )
    db.add(session)
    db.flush()

    comment = Comment(
        session_id=session.id,
        youtube_comment_id=f"yt_{uuid.uuid4()}",
        author_name="Student",
        text="What is photosynthesis?",
        is_question=False,
        is_answered=False,
    )
    db.add(comment)
    db.commit()

    # Enqueue
    manager = QueueManager()
    manager.enqueue(
        QUEUE_CLASSIFICATION,
        ClassificationPayload(
            comment_id=str(comment.id),
            text=comment.text,
            session_id=str(session.id),
        ).to_dict(),
    )
    print(f"Enqueued comment {comment.id} for classification")

    stages = [
        ("Classification", lambda c: c.is_question is not None),
        ("Embedding", lambda c: c.embedding is not None),
        ("Clustering", lambda c: c.cluster_id is not None),
        (
            "Answer",
            lambda c: db.query(Answer).filter(Answer.cluster_id == c.cluster_id).first() is not None,
        ),
    ]

    start = time.time()
    for name, check in stages:
        print(f"Waiting for {name}...")
        while time.time() - start < TIMEOUT:
            db.refresh(comment)
            if check(comment):
                print(f"  \u2713 {name} complete ({time.time() - start:.1f}s)")
                break
            time.sleep(3)
        else:
            print(f"  \u2717 {name} timed out after {TIMEOUT}s")

    # Cleanup
    db.delete(comment)
    db.delete(session)
    db.delete(teacher)
    db.commit()
    print("Cleanup done")


if __name__ == "__main__":
    main()

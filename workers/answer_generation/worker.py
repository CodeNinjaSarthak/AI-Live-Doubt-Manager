"""Answer generation worker for creating AI answers."""

import logging
import os
import sys
import time

# Ensure project root is on sys.path so 'workers' package resolves
# regardless of whether this file is run as a script or as a module.
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from sqlalchemy import text
from workers.common.queue import QueueManager, QUEUE_ANSWER_GENERATION
from workers.common.db import get_db_session
from backend.app.services.gemini.client import GeminiClient, vector_to_literal
from backend.app.db.models.cluster import Cluster
from backend.app.db.models.answer import Answer

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

POLL_INTERVAL = 1  # seconds


def main() -> None:
    """Main entry point for answer generation worker."""
    logger.info("Starting answer generation worker...")
    gemini_client = GeminiClient()
    manager = QueueManager()
    task = None

    try:
        while True:
            try:
                task = manager.dequeue(QUEUE_ANSWER_GENERATION)
                if task is None:
                    time.sleep(POLL_INTERVAL)
                    continue

                cluster_id = task.get("cluster_id")
                question_texts = task.get("question_texts", [])

                for db in get_db_session():
                    try:
                        cluster = db.query(Cluster).filter(Cluster.id == cluster_id).first()
                        if not cluster:
                            logger.warning(f"Cluster {cluster_id} not found, skipping")
                            break

                        # RAG retrieval via pgvector cosine distance
                        rows = db.execute(
                            text(
                                "SELECT content FROM rag_documents "
                                "ORDER BY embedding <-> CAST(:centroid AS vector) LIMIT 5"
                            ),
                            {"centroid": vector_to_literal(cluster.centroid_embedding)}
                        ).fetchall()
                        context = "\n\n".join(r.content for r in rows) if rows else "No context available."

                        questions_text = "\n".join(f"- {q}" for q in question_texts)
                        answer_text = gemini_client.generate_answer(questions_text, context)

                        answer = Answer(
                            cluster_id=cluster.id,
                            text=answer_text,
                            is_posted=False
                        )
                        db.add(answer)
                        db.commit()
                        logger.info(f"Answer generated for cluster {cluster_id}, answer_id={answer.id}")
                    finally:
                        db.close()
                task = None

            except Exception as e:
                logger.error(f"Worker error: {e}", exc_info=True)
                if task:
                    manager.retry(QUEUE_ANSWER_GENERATION, task)
                    task = None
                time.sleep(POLL_INTERVAL)

    except KeyboardInterrupt:
        logger.info("Answer generation worker shutting down gracefully")


if __name__ == "__main__":
    main()

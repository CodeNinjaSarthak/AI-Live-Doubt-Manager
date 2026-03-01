export function ClusterDetailsModal({ cluster, comments, onClose }) {
  const answers = cluster.answers ?? [];
  const latestAnswer = answers.length > 0 ? answers[answers.length - 1] : null;

  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div className="modal modal-large" onMouseDown={e => e.stopPropagation()}>
        <h3>{cluster.title || 'Untitled Cluster'}</h3>
        <p className="hint">{cluster.comment_count ?? 0} questions in this cluster</p>

        <div className="cluster-comments-list">
          {comments === null ? (
            <p className="hint">Loading questions...</p>
          ) : comments.length === 0 ? (
            <div className="empty-state"><p>No questions assigned yet.</p></div>
          ) : (
            comments.map(c => (
              <div key={c.id} className="cluster-comment-item">
                <div className="cluster-comment-meta">
                  <span className="feed-item-author">{c.author_name || 'Unknown'}</span>
                  <span>{c._time}</span>
                </div>
                <span className="feed-item-text">{c.text}</span>
              </div>
            ))
          )}
        </div>

        {latestAnswer && (
          <div className="cluster-answer-box">
            <strong>Generated Answer</strong>
            <p style={{ marginTop: 6 }}>{latestAnswer.text}</p>
          </div>
        )}

        <div className="modal-actions">
          <button className="btn btn-sm" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

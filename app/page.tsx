'use client';

import { useEffect, useState } from 'react';

type Comment = {
  id?: number | string;
  database?: string;
  databaseName?: string;
  author?: string;
  authorName?: string;
  text?: string;
  commentText?: string;
  likeCount?: number;
  score?: number;
  fetchedAt?: string;
  fetchedAtUtc?: string;
  fetchedAtIst?: string;
  crawled_at?: string;
  publishedAt?: string;
};

export default function HomePage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/top-comments');
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const payload = await response.json();
      if (payload.error) {
        throw new Error(payload.error);
      }

      setComments(Array.isArray(payload.data) ? payload.data : []);
    } catch (err) {
      setError((err as Error).message || 'Unable to load comments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  return (
    <main className="page-shell">
      <section className="hero">
        <div>
          <p className="eyebrow">Health insights</p>
          <h1>Relevant health questions</h1>
          <p className="description">
            Review recent health questions after filtering short posts, spam, rants, and non-health chatter.
          </p>
        </div>
        <button className="refreshButton" onClick={fetchComments} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </section>

      {error ? (
        <div className="errorBox">Error: {error}</div>
      ) : (
        <div className="tableWrapper">
          <table>
            <thead>
              <tr>
                <th>Score</th>
                <th>Source</th>
                <th>Author</th>
                <th>Text</th>
                <th>Collected At</th>
              </tr>
            </thead>
            <tbody>
              {comments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="emptyRow">
                    {loading ? 'Loading insights...' : 'No relevant health questions found for the last day.'}
                  </td>
                </tr>
              ) : (
                comments.map((comment, index) => (
                  <tr key={comment.id ?? index}>
                    <td>{comment.likeCount ?? comment.score ?? 0}</td>
                    <td>{comment.databaseName ?? comment.database ?? 'health'}</td>
                    <td>{comment.authorName ?? comment.author ?? 'Unknown'}</td>
                    <td>{comment.text ?? comment.commentText ?? ''}</td>
                    <td>
                      {formatCollectedAt(
                        comment.fetchedAtIst ?? comment.fetchedAtUtc ?? comment.fetchedAt ?? comment.crawled_at
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

function formatCollectedAt(value?: string) {
  if (!value) {
    return '-';
  }

  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)) {
    return value;
  }

  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata',
  }).format(new Date(value));
}

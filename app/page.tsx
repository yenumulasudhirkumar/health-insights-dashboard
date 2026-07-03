'use client';

import { useEffect, useState } from 'react';

type Comment = {
  id?: number | string;
  commentId?: string;
  database?: string;
  databaseName?: string;
  authorDisplayName?: string;
  author?: string;
  authorName?: string;
  videoTitle?: string;
  videoId?: string;
  channelId?: string;
  channelTitle?: string;
  text?: string;
  commentText?: string;
  detectedLanguage?: string;
  likeCount?: number;
  score?: number;
  fetchedAt?: string;
  fetchedAtUtc?: string;
  fetchedAtIst?: string;
  crawled_at?: string;
  publishedAt?: string;
};

type DatabaseFilter = 'both' | 'main' | 'health';
type LanguageFilter = 'all' | 'english' | 'hindi' | 'telugu' | 'mixed' | 'unknown';
type FeedFilter = 'questions' | 'signals';

export default function HomePage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [selectedDate, setSelectedDate] = useState(() => getIstDateOffset(0));
  const [selectedFeed, setSelectedFeed] = useState<FeedFilter>('questions');
  const [selectedDatabase, setSelectedDatabase] = useState<DatabaseFilter>('both');
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageFilter>('all');
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = async (
    date = selectedDate,
    feed = selectedFeed,
    database = selectedDatabase,
    language = selectedLanguage
  ) => {
    setLoading(true);
    setError(null);
    setSaveStatus(null);

    try {
      const params = new URLSearchParams({ date, feed, database, language });
      const response = await fetch(`/api/top-comments?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const payload = await response.json();
      if (payload.error) {
        throw new Error(payload.error);
      }

      setComments(Array.isArray(payload.data) ? payload.data : []);
      setSelectedRows(new Set());
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
            Review daily question candidates and patient symptom/treatment signals after filtering short posts, spam,
            rants, and non-health chatter.
          </p>
        </div>
        <div className="heroControls" aria-label="Insight date controls">
          <label className="dateField">
            <span>Date</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(event) => {
                const nextDate = event.target.value;
                setSelectedDate(nextDate);
                fetchComments(nextDate, selectedFeed, selectedDatabase, selectedLanguage);
              }}
            />
          </label>
          <label className="dateField">
            <span>View</span>
            <select
              value={selectedFeed}
              onChange={(event) => {
                const nextFeed = event.target.value as FeedFilter;
                setSelectedFeed(nextFeed);
                fetchComments(selectedDate, nextFeed, selectedDatabase, selectedLanguage);
              }}
            >
              <option value="questions">Top questions</option>
              <option value="signals">Symptom / treatment signals</option>
            </select>
          </label>
          <label className="dateField">
            <span>Source</span>
            <select
              value={selectedDatabase}
              onChange={(event) => {
                const nextDatabase = event.target.value as DatabaseFilter;
                setSelectedDatabase(nextDatabase);
                fetchComments(selectedDate, selectedFeed, nextDatabase, selectedLanguage);
              }}
            >
              <option value="both">Both DBs</option>
              <option value="main">YouTube</option>
              <option value="health">Influencers</option>
            </select>
          </label>
          <label className="dateField">
            <span>Language</span>
            <select
              value={selectedLanguage}
              onChange={(event) => {
                const nextLanguage = event.target.value as LanguageFilter;
                setSelectedLanguage(nextLanguage);
                fetchComments(selectedDate, selectedFeed, selectedDatabase, nextLanguage);
              }}
            >
              <option value="all">All</option>
              <option value="english">English</option>
              <option value="hindi">Hindi</option>
              <option value="telugu">Telugu</option>
              <option value="mixed">Mixed</option>
              <option value="unknown">Unknown</option>
            </select>
          </label>
          <div className="quickActions">
            <button type="button" onClick={() => chooseDate(getIstDateOffset(0))} disabled={loading}>
              Today
            </button>
            <button type="button" onClick={() => chooseDate(getIstDateOffset(-1))} disabled={loading}>
              Yesterday
            </button>
          </div>
          <button className="refreshButton" onClick={() => fetchComments()} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            className="refreshButton"
            onClick={saveSelectedComments}
            disabled={loading || selectedRows.size === 0}
          >
            Save selected
          </button>
        </div>
      </section>

      {saveStatus ? <div className="statusBox">{saveStatus}</div> : null}

      {error ? (
        <div className="errorBox">Error: {error}</div>
      ) : (
        <div className="tableWrapper">
          <table>
            <thead>
              <tr>
                <th>Select</th>
                <th>Score</th>
                <th>Source</th>
                <th>Language</th>
                <th>Author</th>
                <th>Video</th>
                <th>Text</th>
                <th>Collected At</th>
              </tr>
            </thead>
            <tbody>
              {comments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="emptyRow">
                    {loading ? 'Loading insights...' : `No ${feedLabel(selectedFeed).toLowerCase()} found for ${selectedDate}.`}
                  </td>
                </tr>
              ) : (
                comments.map((comment, index) => {
                  const rowKey = getCommentKey(comment, index);
                  return (
                    <tr key={rowKey}>
                      <td>
                        <input
                          aria-label="Select comment"
                          type="checkbox"
                          checked={selectedRows.has(rowKey)}
                          onChange={(event) => toggleRow(rowKey, event.target.checked)}
                        />
                      </td>
                      <td>{comment.likeCount ?? comment.score ?? 0}</td>
                      <td>{comment.databaseName ?? comment.database ?? 'health'}</td>
                      <td>{formatLanguage(comment.detectedLanguage)}</td>
                      <td>{comment.authorDisplayName ?? comment.authorName ?? comment.author ?? 'Unknown'}</td>
                      <td className="videoTitle">{comment.videoTitle ?? '-'}</td>
                      <td>{comment.text ?? comment.commentText ?? ''}</td>
                      <td>
                        {formatCollectedAt(
                          comment.fetchedAtIst ?? comment.fetchedAtUtc ?? comment.fetchedAt ?? comment.crawled_at
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );

  function chooseDate(date: string) {
    setSelectedDate(date);
    fetchComments(date, selectedFeed, selectedDatabase, selectedLanguage);
  }

  function toggleRow(rowKey: string, selected: boolean) {
    setSelectedRows((current) => {
      const next = new Set(current);
      if (selected) {
        next.add(rowKey);
      } else {
        next.delete(rowKey);
      }
      return next;
    });
  }

  async function saveSelectedComments() {
    setSaveStatus(null);
    setError(null);

    const selectedComments = comments.filter((comment, index) => selectedRows.has(getCommentKey(comment, index)));
    if (selectedComments.length === 0) {
      return;
    }

    try {
      const response = await fetch('/api/top-comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedBy: 'sudhir',
          intendedUse: selectedFeed === 'questions' ? 'question_candidate' : 'patient_signal',
          qualityLabel: 'manual_selected',
          comments: selectedComments.map((comment) => ({
            databaseName: comment.databaseName ?? comment.database,
            commentId: comment.commentId ?? String(comment.id ?? ''),
            videoId: comment.videoId,
            videoTitle: comment.videoTitle,
            channelId: comment.channelId,
            channelTitle: comment.channelTitle,
            authorDisplayName: comment.authorDisplayName ?? comment.authorName ?? comment.author,
            text: comment.text ?? comment.commentText ?? '',
            likeCount: comment.likeCount ?? comment.score ?? 0,
            publishedAt: comment.publishedAt,
            fetchedAtIst: comment.fetchedAtIst ?? comment.fetchedAtUtc ?? comment.fetchedAt ?? comment.crawled_at,
            detectedLanguage: comment.detectedLanguage,
          })),
        }),
      });

      const payload = await response.json();
      if (!response.ok || payload.error) {
        throw new Error(payload.error ?? `Server responded with ${response.status}`);
      }

      setSaveStatus(`Saved ${payload.saved ?? selectedComments.length} selected comments.`);
      setSelectedRows(new Set());
    } catch (err) {
      setError((err as Error).message || 'Unable to save selected comments');
    }
  }
}

function feedLabel(feed: FeedFilter) {
  return feed === 'questions' ? 'Top questions' : 'Symptom / treatment signals';
}

function getCommentKey(comment: Comment, index: number) {
  return `${comment.databaseName ?? comment.database ?? 'unknown'}:${comment.commentId ?? comment.id ?? index}`;
}

function formatLanguage(value?: string) {
  if (!value) {
    return '-';
  }
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

function getIstDateOffset(offsetDays: number) {
  const date = new Date(Date.now() + offsetDays * 24 * 60 * 60 * 1000);
  return date.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
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

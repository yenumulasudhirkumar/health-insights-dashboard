'use client';

import { useEffect, useState } from 'react';

type Comment = {
  id?: number | string;
  commentId?: string;
  sourceCommentId?: string;
  sourceDb?: string;
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
  matchedRuleGroups?: string[];
  symptoms?: string[];
  possibleConditions?: string[];
  medicalSpecialty?: string;
  urgencyLevel?: string;
  causalityConfidence?: string;
  quality?: string;
  reviewNote?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  fetchedAt?: string;
  fetchedAtUtc?: string;
  fetchedAtIst?: string;
  crawled_at?: string;
  publishedAt?: string;
};

type DatabaseFilter = 'both' | 'main' | 'health';
type LanguageFilter = 'all' | 'english' | 'hindi' | 'telugu' | 'mixed' | 'unknown';
type FeedFilter = 'questions' | 'signals' | 'reviewed';
type ReviewForm = {
  symptoms: string[];
  symptomInput: string;
  possibleConditions: string[];
  conditionInput: string;
  medicalSpecialty: string;
  urgencyLevel: string;
  supportingTags: string[];
  causalityConfidence: string;
  reviewNote: string;
  quality: string;
};

const SYMPTOM_OPTIONS = [
  'pain',
  'burning',
  'nausea',
  'dizziness',
  'fatigue',
  'weakness',
  'hair fall',
  'chest pain',
  'infection',
  'kidney stones',
];

const CONDITION_OPTIONS = [
  'acid reflux',
  'diabetes',
  'hypertension',
  'thyroid disorder',
  'pcos',
  'migraine',
  'kidney stone',
  'drug side effect',
  'fungal infection',
  'low bone density',
];

const SPECIALTY_OPTIONS = [
  'primary_care',
  'gastroenterology',
  'endocrinology',
  'cardiology',
  'dermatology',
  'ent',
  'neurology',
  'gynecology',
  'orthopedics',
  'psychiatry',
  'pediatrics',
  'emergency_medicine',
];

const SUPPORTING_TAGS = [
  'PATIENT_EXPERIENCE',
  'HEALTH_QUESTION',
  'TREATMENT_OUTCOME',
  'SIDE_EFFECT_OR_WARNING',
  'MYTH_OR_MISINFORMATION',
  'LIFESTYLE_OR_HOME_REMEDY',
  'OTHER',
];

const DEFAULT_REVIEW_FORM: ReviewForm = {
  symptoms: [],
  symptomInput: '',
  possibleConditions: [],
  conditionInput: '',
  medicalSpecialty: 'primary_care',
  urgencyLevel: 'low',
  supportingTags: [],
  causalityConfidence: 'unknown',
  reviewNote: '',
  quality: 'medium',
};

export default function HomePage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [selectedDate, setSelectedDate] = useState(() => getIstDateOffset(0));
  const [selectedFeed, setSelectedFeed] = useState<FeedFilter>('questions');
  const [selectedDatabase, setSelectedDatabase] = useState<DatabaseFilter>('both');
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageFilter>('all');
  const [minScore, setMinScore] = useState(6);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [reviewIndex, setReviewIndex] = useState<number | null>(null);
  const [reviewForm, setReviewForm] = useState<ReviewForm>(DEFAULT_REVIEW_FORM);
  const [reviewSaving, setReviewSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = async (
    date = selectedDate,
    feed = selectedFeed,
    database = selectedDatabase,
    language = selectedLanguage,
    score = minScore
  ) => {
    setLoading(true);
    setError(null);
    setSaveStatus(null);

    try {
      const params =
        feed === 'reviewed'
          ? new URLSearchParams({ date, database, language, limit: '100' })
          : new URLSearchParams({ date, feed, database, language, minScore: String(score) });
      const response = await fetch(
        feed === 'reviewed' ? `/api/reviewed-comments?${params.toString()}` : `/api/top-comments?${params.toString()}`
      );
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
              <option value="reviewed">Reviewed records</option>
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
          {selectedFeed === 'signals' ? (
          <label className="dateField compactField">
            <span>Min score</span>
            <select
              value={minScore}
              onChange={(event) => {
                const nextMinScore = Number(event.target.value);
                setMinScore(nextMinScore);
                fetchComments(selectedDate, selectedFeed, selectedDatabase, selectedLanguage, nextMinScore);
              }}
            >
              <option value={4}>4</option>
              <option value={6}>6</option>
              <option value={8}>8</option>
            </select>
          </label>
          ) : null}
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
            disabled={loading || selectedFeed === 'reviewed' || selectedRows.size === 0}
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
                <th>{selectedFeed === 'reviewed' ? 'Quality' : 'Score'}</th>
                <th>{selectedFeed === 'reviewed' ? 'Urgency' : 'Likes'}</th>
                <th>Source</th>
                <th>Language</th>
                <th>Author</th>
                <th>Video</th>
                <th>{selectedFeed === 'reviewed' ? 'Review summary' : 'Matched rules'}</th>
                <th>Text</th>
                <th>{selectedFeed === 'reviewed' ? 'Reviewed At' : 'Collected At'}</th>
              </tr>
            </thead>
            <tbody>
              {comments.length === 0 ? (
                <tr>
                  <td colSpan={10} className="emptyRow">
                    {loading ? 'Loading insights...' : `No ${feedLabel(selectedFeed).toLowerCase()} found for ${selectedDate}.`}
                  </td>
                </tr>
              ) : (
                comments.map((comment, index) => {
                  const rowKey = getCommentKey(comment, index);
                  return (
                    <tr
                      key={rowKey}
                      className={selectedFeed === 'reviewed' ? undefined : 'reviewableRow'}
                      onClick={() => selectedFeed !== 'reviewed' && openReview(index)}
                    >
                      <td>
                        {selectedFeed === 'reviewed' ? (
                          '-'
                        ) : (
                          <input
                            aria-label="Select comment"
                            type="checkbox"
                            checked={selectedRows.has(rowKey)}
                            onClick={(event) => event.stopPropagation()}
                            onChange={(event) => toggleRow(rowKey, event.target.checked)}
                          />
                        )}
                      </td>
                      <td>{selectedFeed === 'reviewed' ? formatOption(comment.quality ?? '-') : selectedFeed === 'signals' ? comment.score ?? '-' : '-'}</td>
                      <td>{selectedFeed === 'reviewed' ? formatOption(comment.urgencyLevel ?? '-') : comment.likeCount ?? 0}</td>
                      <td>{comment.sourceDb ?? comment.databaseName ?? comment.database ?? 'health'}</td>
                      <td>{formatLanguage(comment.detectedLanguage)}</td>
                      <td>{comment.authorDisplayName ?? comment.authorName ?? comment.author ?? 'Unknown'}</td>
                      <td className="videoTitle">{comment.videoTitle ?? '-'}</td>
                      <td className="matchedRules">
                        {selectedFeed === 'reviewed' ? formatReviewSummary(comment) : formatMatchedRules(comment.matchedRuleGroups)}
                      </td>
                      <td>{comment.text ?? comment.commentText ?? ''}</td>
                      <td>
                        {selectedFeed === 'reviewed'
                          ? formatCollectedAt(comment.reviewedAt)
                          : formatCollectedAt(
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

      {reviewIndex !== null && comments[reviewIndex] ? (
        <ReviewModal
          comment={comments[reviewIndex]}
          form={reviewForm}
          saving={reviewSaving}
          onChange={setReviewForm}
          onCancel={closeReview}
          onSave={() => saveReview(false)}
          onSaveNext={() => saveReview(true)}
        />
      ) : null}
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

  function openReview(index: number) {
    if (selectedFeed === 'reviewed') {
      return;
    }
    setReviewIndex(index);
    setReviewForm({
      ...DEFAULT_REVIEW_FORM,
      supportingTags: selectedFeed === 'signals' ? ['PATIENT_EXPERIENCE'] : ['HEALTH_QUESTION'],
    });
    setSaveStatus(null);
    setError(null);
  }

  function closeReview() {
    setReviewIndex(null);
    setReviewForm(DEFAULT_REVIEW_FORM);
    setReviewSaving(false);
  }

  async function saveReview(moveNext: boolean) {
    if (reviewIndex === null || !comments[reviewIndex]) {
      return;
    }

    const comment = comments[reviewIndex];
    setReviewSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/reviewed-comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewedBy: 'sudhir',
          comments: [
            {
              databaseName: comment.databaseName ?? comment.database,
              sourceCommentId: comment.commentId ?? comment.sourceCommentId ?? String(comment.id ?? ''),
              videoId: comment.videoId,
              videoTitle: comment.videoTitle,
              channelTitle: comment.channelTitle,
              commentText: comment.text ?? comment.commentText ?? '',
              detectedLanguage: comment.detectedLanguage,
              symptoms: reviewForm.symptoms,
              possibleConditions: reviewForm.possibleConditions,
              medicalSpecialty: reviewForm.medicalSpecialty,
              urgencyLevel: reviewForm.urgencyLevel,
              supportingTags: reviewForm.supportingTags,
              causalityConfidence: reviewForm.causalityConfidence,
              labels: reviewForm.supportingTags,
              quality: reviewForm.quality,
              reviewNote: reviewForm.reviewNote,
            },
          ],
        }),
      });

      const payload = await response.json();
      if (!response.ok || payload.error) {
        throw new Error(payload.error ?? `Server responded with ${response.status}`);
      }

      setSaveStatus('Reviewed comment saved.');
      if (moveNext) {
        const nextIndex = reviewIndex + 1;
        if (nextIndex < comments.length) {
          openReview(nextIndex);
        } else {
          closeReview();
        }
      } else {
        closeReview();
      }
    } catch (err) {
      setError((err as Error).message || 'Unable to save reviewed comment');
    } finally {
      setReviewSaving(false);
    }
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
            likeCount: comment.likeCount ?? 0,
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

function formatMatchedRules(groups?: string[]) {
  if (!groups || groups.length === 0) {
    return '-';
  }
  return groups.map((group) => group.toLowerCase().replace(/_/g, ' ')).join(', ');
}

function formatReviewSummary(comment: Comment) {
  const parts = [
    comment.medicalSpecialty ? `specialty: ${formatOption(comment.medicalSpecialty)}` : null,
    comment.causalityConfidence ? `causality: ${formatOption(comment.causalityConfidence)}` : null,
    comment.symptoms && comment.symptoms.length > 0 ? `symptoms: ${comment.symptoms.join(', ')}` : null,
    comment.possibleConditions && comment.possibleConditions.length > 0
      ? `conditions: ${comment.possibleConditions.join(', ')}`
      : null,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(' | ') : '-';
}

function ReviewModal({
  comment,
  form,
  saving,
  onChange,
  onCancel,
  onSave,
  onSaveNext,
}: {
  comment: Comment;
  form: ReviewForm;
  saving: boolean;
  onChange: (form: ReviewForm) => void;
  onCancel: () => void;
  onSave: () => void;
  onSaveNext: () => void;
}) {
  const commentText = comment.text ?? comment.commentText ?? '';

  return (
    <div className="modalBackdrop" role="presentation" onMouseDown={onCancel}>
      <section className="reviewModal" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
        <header className="modalHeader">
          <div>
            <p className="eyebrow">Review comment</p>
            <h2>Structured health review</h2>
          </div>
          <button type="button" className="iconButton" onClick={onCancel} aria-label="Close review dialog">
            ×
          </button>
        </header>

        <div className="sourcePanel">
          <div>
            <strong>Source</strong>
            <span>{comment.databaseName ?? comment.database ?? 'unknown'}</span>
          </div>
          <div>
            <strong>Video</strong>
            <span>{comment.videoTitle ?? '-'}</span>
          </div>
          <div>
            <strong>Channel</strong>
            <span>{comment.channelTitle ?? '-'}</span>
          </div>
          <div>
            <strong>Comment ID</strong>
            <span>{comment.commentId ?? comment.id ?? '-'}</span>
          </div>
        </div>

        <blockquote className="commentQuote">{commentText}</blockquote>

        <div className="formGrid">
          <ChipEditor
            label="Symptoms"
            options={SYMPTOM_OPTIONS}
            values={form.symptoms}
            inputValue={form.symptomInput}
            onInputChange={(value) => onChange({ ...form, symptomInput: value })}
            onAdd={(value) =>
              onChange({ ...form, symptoms: addUnique(form.symptoms, value), symptomInput: '' })
            }
            onRemove={(value) => onChange({ ...form, symptoms: form.symptoms.filter((item) => item !== value) })}
          />

          <ChipEditor
            label="Possible Conditions"
            options={CONDITION_OPTIONS}
            values={form.possibleConditions}
            inputValue={form.conditionInput}
            onInputChange={(value) => onChange({ ...form, conditionInput: value })}
            onAdd={(value) =>
              onChange({
                ...form,
                possibleConditions: addUnique(form.possibleConditions, value),
                conditionInput: '',
              })
            }
            onRemove={(value) =>
              onChange({
                ...form,
                possibleConditions: form.possibleConditions.filter((item) => item !== value),
              })
            }
          />

          <label className="reviewField">
            <span>Medical Specialty</span>
            <select
              value={form.medicalSpecialty}
              onChange={(event) => onChange({ ...form, medicalSpecialty: event.target.value })}
            >
              {SPECIALTY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {formatOption(option)}
                </option>
              ))}
            </select>
          </label>

          <label className="reviewField">
            <span>Urgency</span>
            <select
              value={form.urgencyLevel}
              onChange={(event) => onChange({ ...form, urgencyLevel: event.target.value })}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="emergency">Emergency</option>
            </select>
          </label>

          <label className="reviewField">
            <span>Causality Confidence</span>
            <select
              value={form.causalityConfidence}
              onChange={(event) => onChange({ ...form, causalityConfidence: event.target.value })}
            >
              <option value="confirmed">Confirmed</option>
              <option value="likely">Likely</option>
              <option value="possible">Possible</option>
              <option value="unknown">Unknown</option>
            </select>
          </label>

          <label className="reviewField">
            <span>Quality</span>
            <select value={form.quality} onChange={(event) => onChange({ ...form, quality: event.target.value })}>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </label>
        </div>

        <fieldset className="tagFieldset">
          <legend>Supporting Tags</legend>
          <div className="tagGrid">
            {SUPPORTING_TAGS.map((tag) => (
              <label key={tag} className="tagOption">
                <input
                  type="checkbox"
                  checked={form.supportingTags.includes(tag)}
                  onChange={(event) =>
                    onChange({
                      ...form,
                      supportingTags: event.target.checked
                        ? addUnique(form.supportingTags, tag)
                        : form.supportingTags.filter((item) => item !== tag),
                    })
                  }
                />
                <span>{formatOption(tag)}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <label className="reviewField fullWidth">
          <span>Review Note</span>
          <textarea
            value={form.reviewNote}
            rows={4}
            onChange={(event) => onChange({ ...form, reviewNote: event.target.value })}
          />
        </label>

        <footer className="modalActions">
          <button type="button" className="secondaryButton" onClick={onCancel} disabled={saving}>
            Cancel
          </button>
          <button type="button" className="secondaryButton" onClick={onSaveNext} disabled={saving}>
            Save & Next
          </button>
          <button type="button" className="refreshButton" onClick={onSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Review'}
          </button>
        </footer>
      </section>
    </div>
  );
}

function ChipEditor({
  label,
  options,
  values,
  inputValue,
  onInputChange,
  onAdd,
  onRemove,
}: {
  label: string;
  options: string[];
  values: string[];
  inputValue: string;
  onInputChange: (value: string) => void;
  onAdd: (value: string) => void;
  onRemove: (value: string) => void;
}) {
  return (
    <div className="chipEditor">
      <label className="reviewField">
        <span>{label}</span>
        <select defaultValue="" onChange={(event) => event.target.value && onAdd(event.target.value)}>
          <option value="">Add preset...</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
      <div className="chipInputRow">
        <input
          value={inputValue}
          placeholder={`Add ${label.toLowerCase()}`}
          onChange={(event) => onInputChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              onAdd(inputValue);
            }
          }}
        />
        <button type="button" className="secondaryButton" onClick={() => onAdd(inputValue)}>
          Add
        </button>
      </div>
      <div className="chipList">
        {values.map((value) => (
          <button key={value} type="button" className="chip" onClick={() => onRemove(value)}>
            {value} ×
          </button>
        ))}
      </div>
    </div>
  );
}

function addUnique(values: string[], value: string) {
  const normalized = value.trim();
  if (!normalized || values.includes(normalized)) {
    return values;
  }
  return [...values, normalized];
}

function formatOption(value: string) {
  return value.toLowerCase().replace(/_/g, ' ');
}

function feedLabel(feed: FeedFilter) {
  if (feed === 'questions') {
    return 'Top questions';
  }
  if (feed === 'signals') {
    return 'Symptom / treatment signals';
  }
  return 'Reviewed records';
}

function getCommentKey(comment: Comment, index: number) {
  return `${comment.sourceDb ?? comment.databaseName ?? comment.database ?? 'unknown'}:${
    comment.sourceCommentId ?? comment.commentId ?? comment.id ?? index
  }`;
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

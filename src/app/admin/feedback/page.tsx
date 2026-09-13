'use client';

import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';

/** Mirrors public.sorlio_feedback in supabase/migrations/0005_feedback_and_research.sql. */
interface FeedbackRow {
  id: string;
  user_id: string | null;
  anonymous_id: string | null;
  session_id: string | null;
  category: string;
  sentiment: string | null;
  page: string | null;
  feature: string | null;
  article_id: string | null;
  affected_term: string | null;
  comment: string | null;
  app_version: string;
  deployment_environment: string;
  created_at: string;
}

export default function FeedbackDashboard() {
  const [feedback, setFeedback] = useState<FeedbackRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadFeedback() {
      try {
        const supabase = getSupabaseClient();
        if (!supabase) {
          setError('Supabase is not configured.');
          return;
        }
        const { data, error: err } = await supabase
          .from('sorlio_feedback')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);

        if (err) {
          setError(err.message);
          return;
        }

        setFeedback(data || []);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load feedback');
      } finally {
        setLoading(false);
      }
    }

    loadFeedback();
  }, []);

  if (loading) return <div className="p-6">Loading feedback...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Feedback ({feedback.length})</h1>

      <div className="space-y-4">
        {feedback.map((item) => (
          <div key={item.id} className="border rounded-lg p-4 bg-cream-card">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-semibold text-lg">{item.category}</p>
                <p className="text-sm text-gray-600">
                  {new Date(item.created_at).toLocaleString()} • {item.app_version}
                </p>
              </div>
              <div className="flex gap-2">
                {item.sentiment && (
                  <span
                    className={`px-3 py-1 rounded text-sm font-medium ${
                      item.sentiment === 'positive'
                        ? 'bg-green-100 text-green-700'
                        : item.sentiment === 'negative'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {item.sentiment}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              {item.page && (
                <div>
                  <p className="text-gray-600">Page:</p>
                  <p className="font-mono text-xs">{item.page}</p>
                </div>
              )}
              {item.feature && (
                <div>
                  <p className="text-gray-600">Feature:</p>
                  <p>{item.feature}</p>
                </div>
              )}
              {item.affected_term && (
                <div>
                  <p className="text-gray-600">Affected Term:</p>
                  <p className="font-mono">{item.affected_term}</p>
                </div>
              )}
              {item.article_id && (
                <div>
                  <p className="text-gray-600">Article:</p>
                  <p className="font-mono text-xs">{item.article_id}</p>
                </div>
              )}
            </div>

            {item.comment && (
              <div className="bg-gray-50 p-3 rounded mb-3">
                <p className="text-sm text-gray-600 mb-1">Comment:</p>
                <p className="whitespace-pre-wrap">{item.comment}</p>
              </div>
            )}

            <div className="text-xs text-gray-500 flex gap-4">
              {item.user_id && <span>User: {item.user_id}</span>}
              {item.anonymous_id && <span>Anon: {item.anonymous_id}</span>}
              {item.session_id && <span>Session: {item.session_id}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

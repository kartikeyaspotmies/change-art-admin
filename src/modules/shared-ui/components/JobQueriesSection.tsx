import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useJobQueries, useRaiseQuery } from '@modules/admin-panel/hooks/use-job-queries';
import { useJobRoom } from '@lib/use-job-room';

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface JobQueriesSectionProps {
  jobId: string | null | undefined;
  compact?: boolean;
}

export function JobQueriesSection({ jobId, compact = false }: JobQueriesSectionProps) {
  useJobRoom(jobId);
  const [text, setText] = useState('');
  const [showAll, setShowAll] = useState(false);
  const { data: queries, isLoading } = useJobQueries(jobId);
  const raiseQuery = useRaiseQuery(jobId);
  const threadRef = useRef<HTMLDivElement>(null);

  const handleSubmit = () => {
    const msg = text.trim();
    if (!msg || !jobId || raiseQuery.isPending) return;
    raiseQuery.mutate(msg, {
      onSuccess: () => {
        setText('');
        toast.success('Query sent to client.');
        setShowAll(true);
        setTimeout(() => {
          if (threadRef.current) {
            threadRef.current.scrollTop = threadRef.current.scrollHeight;
          }
        }, 100);
      },
      onError: () => toast.error('Failed to send query. Please try again.'),
    });
  };

  const prevLengthRef = useRef(queries?.length);

  useEffect(() => {
    if (threadRef.current) {
      const lengthChanged = queries?.length !== prevLengthRef.current;
      prevLengthRef.current = queries?.length;

      if (showAll || lengthChanged) {
        threadRef.current.scrollTop = threadRef.current.scrollHeight;
      } else {
        threadRef.current.scrollTop = 0;
      }
    }
  }, [queries?.length, showAll]);

  const displayedQueries = queries
    ? (showAll ? queries : queries.slice(-3))
    : [];

  return (
    <div className={`flex flex-col ${compact ? 'h-[200px]' : 'h-[440px]'} bg-slate-50/50 rounded-lg border border-slate-200/80 overflow-hidden`}>
      {/* Header (shown when not compact) */}
      {!compact && (
        <div className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-slate-200/80 shrink-0">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-purple-600" />
            <span className="text-[12px] font-bold text-slate-700 uppercase tracking-wider">
              Queries &amp; Messages
            </span>
          </div>
          {queries && queries.length > 0 && (
            <span className="text-[10.5px] font-bold bg-purple-100 text-purple-700 rounded-full px-2.5 py-0.5">
              {queries.length} {queries.length === 1 ? 'Message' : 'Messages'}
            </span>
          )}
        </div>
      )}

      {/* Chat Messages List */}
      <div
        ref={threadRef}
        className="flex-1 p-2.5 overflow-y-auto space-y-2 bg-slate-50/40"
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-slate-400 gap-2 text-xs">
            <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
            <span>Loading messages…</span>
          </div>
        ) : queries && queries.length > 0 ? (
          <>
            {queries.length > 3 && !showAll && (
              <div className="text-center py-1">
                <button
                  type="button"
                  onClick={() => setShowAll(true)}
                  className="text-[11px] font-semibold text-purple-600 hover:text-purple-700 bg-white border border-purple-100 px-3 py-1 rounded-full shadow-xs transition"
                >
                  View older messages ({queries.length - 3} hidden)
                </button>
              </div>
            )}
            {displayedQueries.map((q) => {
              const isAdmin = q.raised_by_role === 'ADMIN';
              return (
                <div
                  key={q.id}
                  className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl px-3 py-1.5 text-[11.5px] shadow-xs ${
                      isAdmin
                        ? 'bg-purple-700 text-white rounded-br-xs'
                        : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
                    }`}
                  >
                    <div className={`flex items-center gap-1.5 text-[9px] font-bold mb-0.5 ${isAdmin ? 'text-purple-200' : 'text-purple-700'}`}>
                      <span>{q.raised_by_name ?? (isAdmin ? 'CS / Admin' : 'Client')}</span>
                      <span>•</span>
                      <span>{formatTime(q.created_at as unknown as string)}</span>
                    </div>
                    <div className="whitespace-pre-wrap leading-normal break-words">{q.message}</div>
                  </div>
                </div>
              );
            })}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 py-2 px-2">
            <div className="w-7 h-7 rounded-full bg-purple-50 flex items-center justify-center mb-1">
              <MessageSquare className="w-3.5 h-3.5 text-purple-500" />
            </div>
            <p className="text-[11.5px] font-semibold text-slate-700">No messages yet</p>
            <p className="text-[10.5px] text-slate-400 mt-0.5 max-w-[200px]">Send a query directly to the client below.</p>
          </div>
        )}
      </div>

      {/* WhatsApp-style Compose Input Bar */}
      <div className="p-2.5 bg-white border-t border-slate-200/80 shrink-0">
        <div className="flex items-center gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={1}
            placeholder="Enter query to client..."
            disabled={raiseQuery.isPending}
            className="flex-1 rounded-xl border border-slate-200/90 px-3 py-2 text-[12px] text-slate-800 placeholder:text-slate-400 outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 resize-none max-h-20 transition bg-slate-50/50 focus:bg-white"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!text.trim() || raiseQuery.isPending}
            className="p-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 disabled:bg-slate-200 text-white disabled:text-slate-400 transition shrink-0 shadow-xs flex items-center justify-center"
            title="Send to Client"
          >
            {raiseQuery.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
        <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1 px-1">
          <span>Press Enter to send, Shift+Enter for new line</span>
        </div>
      </div>
    </div>
  );
}

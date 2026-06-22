import { ContradictionIcon, AlertIcon, QuestionIcon } from './Icons';
import type { ContradictionEntry, EscalationItem } from '../types';

interface ContradictionModuleProps {
  contradictions: ContradictionEntry[];
  escalations: EscalationItem[];
}

export default function ContradictionModule({ contradictions, escalations }: ContradictionModuleProps) {
  const severityStyles = {
    low: 'border-white/[0.06] bg-white/[0.02]',
    medium: 'border-amber-500/20 bg-amber-500/[0.05]',
    high: 'border-red-500/20 bg-red-500/[0.05]',
  };

  const severityBadge = {
    low: 'bg-white/[0.08] text-zinc-200',
    medium: 'bg-amber-500/20 text-amber-300',
    high: 'bg-red-500/20 text-red-300',
  };

  const statusBadge = {
    unresolved: 'bg-red-500/20 text-red-300',
    partially_resolved: 'bg-amber-500/20 text-amber-300',
    resolved: 'bg-white/[0.08] text-zinc-200',
  };

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <ContradictionIcon className="h-5 w-5 text-zinc-300" />
        <div className="flex-1">
          <h2 className="text-lg font-bold text-white">Contradiction Tracker</h2>
          <p className="text-xs text-zinc-400">Cross-article claim conflicts</p>
        </div>
        <span className="rounded-md bg-white/[0.08] px-2.5 py-1 text-xs font-semibold text-zinc-200">
          {contradictions.length} active
        </span>
      </div>

      {contradictions.length === 0 ? (
        <div className="rounded-lg border border-white/[0.07] bg-[#141418] p-12 text-center">
          <ContradictionIcon className="mx-auto h-8 w-8 text-zinc-500" />
          <p className="mt-4 text-sm text-zinc-300">No contradictions detected.</p>
        </div>
      ) : (
        <div className="space-y-4 mb-10">
          {contradictions.map((c) => (
            <div key={c.id} className={`rounded-lg border p-5 ${severityStyles[c.severity]}`}>
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <AlertIcon className="h-4 w-4 text-zinc-400" />
                <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${severityBadge[c.severity]}`}>
                  {c.severity.toUpperCase()}
                </span>
                <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${statusBadge[c.status]}`}>
                  {c.status.replace('_', ' ')}
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-md border border-white/[0.06] bg-[#141418] p-3.5">
                  <p className="mb-1 text-xs text-zinc-400">
                    #{c.claim1.articleRank} · {c.claim1.source}
                  </p>
                  <p className="text-sm text-zinc-200">"{c.claim1.claim}"</p>
                </div>
                <div className="rounded-md border border-white/[0.06] bg-[#141418] p-3.5">
                  <p className="mb-1 text-xs text-zinc-400">
                    #{c.claim2.articleRank} · {c.claim2.source}
                  </p>
                  <p className="text-sm text-zinc-200">"{c.claim2.claim}"</p>
                </div>
              </div>

              {c.followUpQuestions.length > 0 && (
                <div className="mt-4">
                  <p className="mb-2 text-xs font-bold uppercase tracking-widest text-zinc-400">Follow-up</p>
                  {c.followUpQuestions.map((q, i) => (
                    <div key={i} className="flex items-start gap-2 py-1">
                      <QuestionIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-400" />
                      <p className="text-sm text-zinc-300">{q}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {escalations.length > 0 && (
        <div>
          <div className="mb-5 flex items-center gap-2">
            <AlertIcon className="h-5 w-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">Escalations</h3>
          </div>
          <div className="space-y-4">
            {escalations.map((e, i) => (
              <div key={i} className="rounded-lg border border-amber-500/20 bg-amber-500/[0.04] p-5">
                <p className="mb-4 text-sm font-semibold text-amber-200">
                  #{e.articleRank}: {e.articleTitle}
                </p>

                <div className="space-y-5">
                  <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-widest text-zinc-400">Timeline</p>
                    <div className="relative ml-2 border-l border-zinc-600 pl-4">
                      {e.evidenceTimeline.map((t, j) => (
                        <div key={j} className="relative mb-2 last:mb-0">
                          <div className="absolute -left-[13px] top-1.5 h-1.5 w-1.5 rounded-full bg-zinc-400" />
                          <p className="text-sm text-zinc-300">{t}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-widest text-zinc-400">Questions</p>
                    {e.questions.map((q, j) => (
                      <div key={j} className="flex items-start gap-2 py-1">
                        <QuestionIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-400" />
                        <p className="text-sm text-zinc-300">{q}</p>
                      </div>
                    ))}
                  </div>

                  {e.processFailures.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-bold uppercase tracking-widest text-red-400">Process Failures</p>
                      {e.processFailures.map((f, j) => (
                        <div key={j} className="flex items-start gap-2 py-1">
                          <AlertIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-400" />
                          <p className="text-sm text-zinc-300">{f}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="rounded-md border border-white/[0.08] bg-white/[0.03] p-4">
                    <p className="text-xs font-semibold text-zinc-400 mb-1">The Unspoken</p>
                    <p className="text-sm italic text-zinc-200">"{e.unspokenSentence}"</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

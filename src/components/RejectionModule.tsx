import { RejectIcon, ExternalIcon, XIcon } from './Icons';
import type { RejectionEntry } from '../types';

interface RejectionModuleProps {
  rejections: RejectionEntry[];
}

const gateLabels: Record<string, string> = {
  AI_RELEVANCE_GATE: '§06 Relevance',
  LENGTH_GATE: '§08 Length',
  FREE_ACCESS_GATE: '§07 Access',
  SAME_DAY_GATE: '§09 Date',
  DENSITY_SCORER: '§10 Density',
};

export default function RejectionModule({ rejections }: RejectionModuleProps) {
  const gateCounts: Record<string, number> = {};
  rejections.forEach(r => {
    gateCounts[r.gate] = (gateCounts[r.gate] || 0) + 1;
  });

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <RejectIcon className="h-5 w-5 text-zinc-300" />
        <div className="flex-1">
          <h2 className="text-lg font-bold text-white">Rejection Log</h2>
          <p className="text-xs text-zinc-400">Articles that failed quality gates</p>
        </div>
        <span className="rounded-md bg-white/[0.08] px-2.5 py-1 text-xs font-semibold text-zinc-200">
          {rejections.length} rejected
        </span>
      </div>

      {Object.keys(gateCounts).length > 0 && (
        <div className="mb-6 grid grid-cols-2 gap-2.5 sm:grid-cols-5">
          {Object.entries(gateCounts).map(([gate, count]) => (
            <div key={gate} className="rounded-md border border-white/[0.07] bg-[#141418] p-3.5 text-center">
              <p className="text-xl font-bold text-white">{count}</p>
              <p className="text-xs text-zinc-400 mt-0.5">{gateLabels[gate] || gate}</p>
            </div>
          ))}
        </div>
      )}

      {rejections.length === 0 ? (
        <div className="rounded-lg border border-white/[0.07] bg-[#141418] p-12 text-center">
          <RejectIcon className="mx-auto h-8 w-8 text-zinc-500" />
          <p className="mt-4 text-sm text-zinc-300">No rejections. All articles passed.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {rejections.map((r, i) => (
            <div key={i} className="rounded-md border border-white/[0.07] bg-[#141418] p-4">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <XIcon className="h-3.5 w-3.5 text-zinc-400" />
                <span className="rounded-md bg-white/[0.06] px-2 py-0.5 text-xs font-medium text-zinc-300">
                  {gateLabels[r.gate] || r.gate}
                </span>
                <span className="text-xs text-zinc-400">{r.source}</span>
                <span className="text-xs text-zinc-500">
                  {new Date(r.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                </span>
              </div>
              <h4 className="mb-1.5 text-sm font-semibold text-zinc-200">{r.title}</h4>
              <p className="mb-2 text-xs text-zinc-400 leading-relaxed">{r.reason}</p>
              <a
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-zinc-400 transition-colors hover:text-zinc-200"
              >
                <ExternalIcon className="h-3 w-3" />
                {r.url.length > 50 ? r.url.substring(0, 50) + '...' : r.url}
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { SourceIcon, CheckIcon, AlertIcon, XIcon } from './Icons';
import type { SourceHealthEntry } from '../types';

interface SourceHealthModuleProps {
  sources: SourceHealthEntry[];
}

export default function SourceHealthModule({ sources }: SourceHealthModuleProps) {
  const primarySources = sources.filter(s => s.isPrimary);
  const fallbackSources = sources.filter(s => !s.isPrimary);

  const totalArticlesFound = sources.reduce((a, s) => a + s.articlesFound, 0);
  const totalArticlesPassed = sources.reduce((a, s) => a + s.articlesPassed, 0);
  const onlineCount = sources.filter(s => s.status === 'online').length;
  const passRate = totalArticlesFound > 0 ? Math.round((totalArticlesPassed / totalArticlesFound) * 100) : 0;

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <SourceIcon className="h-5 w-5 text-zinc-300" />
        <div>
          <h2 className="text-lg font-bold text-white">Source Health</h2>
          <p className="text-xs text-zinc-400">RSS feed status and statistics</p>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <StatCard label="Online" value={`${onlineCount}/${sources.length}`} />
        <StatCard label="Found" value={totalArticlesFound.toString()} />
        <StatCard label="Passed" value={totalArticlesPassed.toString()} />
        <StatCard label="Pass Rate" value={`${passRate}%`} />
      </div>

      <div className="mb-8">
        <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-zinc-400">
          Primary ({primarySources.length})
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {primarySources.map((s) => (
            <SourceCard key={s.name} source={s} />
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-zinc-400">
          Fallback ({fallbackSources.length})
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {fallbackSources.map((s) => (
            <SourceCard key={s.name} source={s} />
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/[0.07] bg-[#141418] p-4">
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-zinc-400 mt-1">{label}</p>
    </div>
  );
}

function SourceCard({ source }: { source: SourceHealthEntry }) {
  const statusConfig = {
    online: { icon: <CheckIcon className="h-4 w-4 text-emerald-400" />, label: 'Online', style: 'border-emerald-500/20' },
    degraded: { icon: <AlertIcon className="h-4 w-4 text-amber-400" />, label: 'Degraded', style: 'border-amber-500/20' },
    offline: { icon: <XIcon className="h-4 w-4 text-red-400" />, label: 'Offline', style: 'border-red-500/20' },
    paywall: { icon: <XIcon className="h-4 w-4 text-zinc-400" />, label: 'Paywall', style: 'border-white/[0.06]' },
  };

  const config = statusConfig[source.status];
  const passRate = source.articlesFound > 0
    ? Math.round((source.articlesPassed / source.articlesFound) * 100)
    : 0;

  return (
    <div className={`rounded-md border bg-[#141418] p-4 ${config.style}`}>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {config.icon}
          <span className="text-sm font-semibold text-white">{source.name}</span>
        </div>
        <span className="text-xs font-medium text-zinc-400">{config.label}</span>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-lg font-bold text-white">{source.articlesFound}</p>
          <p className="text-xs text-zinc-500">Found</p>
        </div>
        <div>
          <p className="text-lg font-bold text-white">{source.articlesPassed}</p>
          <p className="text-xs text-zinc-500">Passed</p>
        </div>
        <div>
          <p className="text-lg font-bold text-white">{passRate}%</p>
          <p className="text-xs text-zinc-500">Rate</p>
        </div>
      </div>
      <div className="mt-3 h-1 w-full rounded-full bg-white/[0.06]">
        <div
          className="h-1 rounded-full bg-zinc-300 transition-all duration-500"
          style={{ width: `${passRate}%` }}
        />
      </div>
    </div>
  );
}

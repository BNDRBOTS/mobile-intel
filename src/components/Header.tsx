import { LogoIcon, ClockIcon, DocumentIcon, SourceIcon } from './Icons';

interface HeaderProps {
  date: string;
  timezone: string;
  articleCount: number;
  sourceCount: number;
}

export default function Header({ date, timezone, articleCount, sourceCount }: HeaderProps) {
  return (
    <header className="border-b border-white/[0.06] bg-[#101014]">
      <div className="mx-auto max-w-7xl px-5 py-6 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <LogoIcon className="h-10 w-10 text-white" />
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white sm:text-xl">
                ARROW-CHAIN
              </h1>
              <p className="text-xs font-medium tracking-widest text-zinc-400 uppercase">
                AI Intelligence Dashboard
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2 rounded-md border border-white/[0.08] bg-white/[0.04] px-3 py-2">
              <ClockIcon className="h-3.5 w-3.5 text-zinc-400" />
              <span className="text-xs font-medium text-zinc-200">{date}</span>
              <span className="text-xs text-zinc-500">({timezone})</span>
            </div>
            <div className="flex items-center gap-2 rounded-md border border-white/[0.08] bg-white/[0.04] px-3 py-2">
              <DocumentIcon className="h-3.5 w-3.5 text-zinc-400" />
              <span className="text-xs font-semibold text-white">{articleCount}</span>
              <span className="text-xs text-zinc-400">articles</span>
            </div>
            <div className="flex items-center gap-2 rounded-md border border-white/[0.08] bg-white/[0.04] px-3 py-2">
              <SourceIcon className="h-3.5 w-3.5 text-zinc-400" />
              <span className="text-xs font-semibold text-white">{sourceCount}</span>
              <span className="text-xs text-zinc-400">sources</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

import { useState, useMemo } from 'react';
import Header from './components/Header';
import Navigation from './components/Navigation';
import TopTenModule from './components/TopTenModule';
import CategoryModule from './components/CategoryModule';
import ContradictionModule from './components/ContradictionModule';
import RejectionModule from './components/RejectionModule';
import SourceHealthModule from './components/SourceHealthModule';
import GateControls from './components/GateControls';
import { useDashboardData } from './hooks/useDashboardData';
import type { DashboardModule, DashboardCard, SourceHealthEntry, GateSettings } from './types';
import { DEFAULT_GATE_SETTINGS } from './types';
import {
  LogoIcon, RefreshIcon, LoadingIcon, AlertIcon, ChartIcon,
  CheckIcon, ClockIcon, DocumentIcon, GateIcon, FilterIcon
} from './components/Icons';

const TIMEZONE = 'Pacific/Auckland';

function getLocalDate(tz: string): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: tz });
}

function getFormattedDate(tz: string): string {
  return new Date().toLocaleDateString('en-US', {
    timeZone: tz,
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export default function App() {
  const [activeModule, setActiveModule] = useState<DashboardModule>('top10');
  const [gateSettings, setGateSettings] = useState<GateSettings>(DEFAULT_GATE_SETTINGS);

  const {
    cards,
    rejections,
    sourceHealth,
    contradictions,
    escalations,
    isLoading,
    error,
    refresh,
  } = useDashboardData(TIMEZONE, gateSettings);

  const dateStr = useMemo(() => getFormattedDate(TIMEZONE), []);
  const dateISO = useMemo(() => getLocalDate(TIMEZONE), []);

  const sourceCount = sourceHealth.filter((s: SourceHealthEntry) => s.status === 'online' || s.status === 'degraded').length;

  const renderModule = () => {
    switch (activeModule) {
      case 'top10':
        return <TopTenModule cards={cards} />;
      case 'models':
        return <CategoryModule cards={cards} moduleId="models" />;
      case 'research':
        return <CategoryModule cards={cards} moduleId="research" />;
      case 'regulation':
        return <CategoryModule cards={cards} moduleId="regulation" />;
      case 'safety':
        return <CategoryModule cards={cards} moduleId="safety" />;
      case 'enterprise':
        return <CategoryModule cards={cards} moduleId="enterprise" />;
      case 'infrastructure':
        return <CategoryModule cards={cards} moduleId="infrastructure" />;
      case 'security':
        return <CategoryModule cards={cards} moduleId="security" />;
      case 'contradictions':
        return <ContradictionModule contradictions={contradictions} escalations={escalations} />;
      case 'rejections':
        return <RejectionModule rejections={rejections} />;
      case 'sourceHealth':
        return <SourceHealthModule sources={sourceHealth} />;
      default:
        return <TopTenModule cards={cards} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0c10]">
      <Header
        date={dateStr}
        timezone={TIMEZONE}
        articleCount={cards.length}
        sourceCount={sourceCount}
      />
      <Navigation activeModule={activeModule} onModuleChange={setActiveModule} />

      <div className="border-b border-white/[0.06] bg-[#101014]">
        <div className="mx-auto max-w-7xl px-5 py-3.5 sm:px-8 lg:px-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-5 text-xs">
              <span className="flex items-center gap-1.5">
                <CheckIcon className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-zinc-300 font-medium">Gates active</span>
              </span>
              <span className="flex items-center gap-1.5">
                <ClockIcon className="h-3.5 w-3.5 text-zinc-400" />
                <span className="text-zinc-300">{dateISO}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <DocumentIcon className="h-3.5 w-3.5 text-zinc-400" />
                <span className="text-zinc-300">Min {gateSettings.minWordCount} words</span>
              </span>
              <span className="flex items-center gap-1.5">
                <ChartIcon className="h-3.5 w-3.5 text-zinc-400" />
                <span className="text-zinc-300">Min {gateSettings.minDensityScore} density</span>
              </span>
              <span className="flex items-center gap-1.5">
                <FilterIcon className="h-3.5 w-3.5 text-zinc-400" />
                <span className="text-zinc-300">{rejections.length} rejected</span>
              </span>
            </div>
            <button
              onClick={refresh}
              disabled={isLoading}
              className="flex items-center gap-2 rounded-md border border-white/[0.08] bg-white/[0.04] px-3.5 py-2 text-xs font-semibold text-zinc-200 transition-colors hover:bg-white/[0.08] hover:text-white disabled:opacity-50"
            >
              {isLoading ? (
                <LoadingIcon className="h-3.5 w-3.5" />
              ) : (
                <RefreshIcon className="h-3.5 w-3.5" />
              )}
              {isLoading ? 'Loading' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
        {error && (
          <div className="mb-8 rounded-lg border border-red-500/20 bg-red-500/[0.07] p-5">
            <div className="flex items-center gap-2">
              <AlertIcon className="h-4 w-4 text-red-400" />
              <p className="text-sm font-semibold text-red-300">Error loading data</p>
            </div>
            <p className="mt-1.5 text-sm text-red-200/80">{error}</p>
          </div>
        )}

        {isLoading && cards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <LoadingIcon className="h-10 w-10 text-zinc-400" />
            <p className="mt-5 text-sm font-medium text-zinc-300">Fetching from sources</p>
            <p className="mt-1 text-xs text-zinc-500">Applying quality gates</p>
          </div>
        ) : (
          <>
            {activeModule === 'top10' && (
              <div className="mb-10 space-y-5">
                <GateControls
                  settings={gateSettings}
                  onSettingsChange={setGateSettings}
                  rejectedCount={rejections.length}
                />

                {cards.length > 0 && (
                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-7">
                    {[
                      { label: 'Models', cat: 'Model Releases' },
                      { label: 'Research', cat: 'Research Breakthroughs' },
                      { label: 'Policy', cat: 'Regulation / Policy' },
                      { label: 'Safety', cat: 'Safety / Alignment' },
                      { label: 'Enterprise', cat: 'Enterprise / Market Impact' },
                      { label: 'Infra', cat: 'Infrastructure / Chips' },
                      { label: 'Security', cat: 'Security / Misuse' },
                    ].map((item) => {
                      const count = cards.filter((c: DashboardCard) => c.category === item.cat).length;
                      return (
                        <div key={item.label} className="rounded-md border border-white/[0.07] bg-[#141418] p-4">
                          <p className="text-2xl font-bold text-white">{count}</p>
                          <p className="text-xs text-zinc-400 mt-1">{item.label}</p>
                        </div>
                      );
                    })}
                  </div>
                )}

                {cards.length > 0 && (
                  <div className="rounded-lg border border-white/[0.07] bg-[#141418] p-5">
                    <div className="mb-4 flex items-center gap-2">
                      <ChartIcon className="h-4 w-4 text-zinc-400" />
                      <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-300">
                        Density Distribution
                      </h3>
                    </div>
                    <div className="space-y-2">
                      {cards.map((card: DashboardCard) => (
                        <div key={card.rank} className="flex items-center gap-3">
                          <span className="w-5 text-right font-mono text-xs font-semibold text-zinc-400">{card.rank}</span>
                          <div className="flex-1">
                            <div className="h-5 w-full rounded bg-white/[0.04]">
                              <div
                                className="flex h-5 items-center rounded bg-white/[0.15] px-2.5 transition-all duration-500"
                                style={{ width: `${card.densityScore}%` }}
                              >
                                <span className="text-xs font-bold text-white">{card.densityScore}</span>
                              </div>
                            </div>
                          </div>
                          <span className="hidden w-40 truncate text-xs text-zinc-400 sm:block">{card.source}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="rounded-lg border border-white/[0.06] bg-[#141418]/50 p-5">
                  <div className="flex items-start gap-3">
                    <GateIcon className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
                    <div>
                      <h3 className="mb-2.5 text-xs font-bold uppercase tracking-widest text-zinc-300">
                        Protocol Chain
                      </h3>
                      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                        {[
                          '§01 Date', '§02 Sources', '§03 Scoring', '§04 Fetch',
                          '§05 Discovery', '§06 Relevance', '§07 Access', '§08 Length',
                          '§09 Same-Day', '§10 Density', '§11 Selector', '§12 Delivery',
                          '§13 Amplifier', '§14 Forensic'
                        ].map((step) => (
                          <span key={step} className="text-xs text-zinc-400">{step}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {renderModule()}
          </>
        )}
      </main>

      <footer className="border-t border-white/[0.06] bg-[#101014]">
        <div className="mx-auto max-w-7xl px-5 py-6 sm:px-8 lg:px-10">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-3">
              <LogoIcon className="h-6 w-6 text-zinc-500" />
              <div>
                <p className="text-xs font-semibold text-zinc-300">Arrow-Chain</p>
                <p className="text-xs text-zinc-500">Source-faithful intelligence</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
              <span>{TIMEZONE}</span>
              <span className="text-zinc-700">·</span>
              <span>{dateISO}</span>
              <span className="text-zinc-700">·</span>
              <span>{cards.length} / {rejections.length}</span>
              <span className="text-zinc-700">·</span>
              <span>v1.0</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

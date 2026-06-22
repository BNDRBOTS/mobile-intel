import { useState } from 'react';
import {
  ChevronIcon, ExternalIcon, ClockIcon, DocumentIcon, ChartIcon,
  UserIcon, EyeIcon, EyeOffIcon, HashIcon, BeakerIcon, CheckIcon,
  XIcon, QuestionIcon, AlertIcon, EnterpriseIcon, RegulationIcon
} from './Icons';
import type { DashboardCard } from '../types';

interface ArticleCardProps {
  card: DashboardCard;
}

export default function ArticleCard({ card }: ArticleCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'forensic' | 'evidence' | 'claims' | 'meta'>('forensic');

  const densityLevel = card.densityScore >= 80 ? 'high' : card.densityScore >= 60 ? 'medium' : 'low';

  const publishedTime = new Date(card.publishedAt).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  return (
    <article className="rounded-lg border border-white/[0.07] bg-[#141418] transition-colors hover:border-white/[0.12]">
      <div className="p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-white/[0.08] text-xs font-bold text-white">
            {card.rank}
          </span>
          <span className="rounded-md bg-white/[0.06] px-2.5 py-0.5 text-xs font-medium text-zinc-300">
            {card.category}
          </span>
          <span className={`flex items-center gap-1 rounded-md px-2.5 py-0.5 text-xs font-bold ${
            densityLevel === 'high' ? 'bg-white text-zinc-900' :
            densityLevel === 'medium' ? 'bg-white/[0.15] text-zinc-100' :
            'bg-white/[0.06] text-zinc-300'
          }`}>
            <ChartIcon className="h-3 w-3" />
            {card.densityScore}
          </span>
          <div className="flex-1" />
          <span className="flex items-center gap-1 text-xs text-zinc-400">
            <ClockIcon className="h-3 w-3" />
            {publishedTime}
          </span>
        </div>

        <h3 className="mb-3 text-base font-semibold leading-snug text-white">
          {card.title}
        </h3>

        <div className="mb-4 flex flex-wrap items-center gap-3 text-xs">
          <span className="font-medium text-zinc-300">{card.source}</span>
          <span className="text-zinc-600">·</span>
          <span className="text-zinc-400">{card.author}</span>
          <span className="text-zinc-600">·</span>
          <span className="flex items-center gap-1 text-zinc-400">
            <DocumentIcon className="h-3 w-3" />
            {card.wordCount.toLocaleString()}
          </span>
          <a
            href={card.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-zinc-300 transition-colors hover:text-white"
          >
            <ExternalIcon className="h-3 w-3" />
            Source
          </a>
        </div>

        <div className="mb-4 flex flex-wrap gap-1.5">
          {card.whySelected.map((reason, i) => (
            <span key={i} className="rounded-md bg-white/[0.05] px-2 py-0.5 text-xs text-zinc-300">
              {reason}
            </span>
          ))}
        </div>

        <div className="space-y-1.5">
          {card.forensicSummary.slice(0, expanded ? undefined : 2).map((item, i) => (
            <p key={i} className="text-sm leading-relaxed text-zinc-300">
              {item}
            </p>
          ))}
          {!expanded && card.forensicSummary.length > 2 && (
            <p className="text-xs text-zinc-500">+{card.forensicSummary.length - 2} more</p>
          )}
        </div>

        {card.contradictions.length > 0 && (
          <div className="mt-4 flex items-start gap-2.5 rounded-md border border-amber-500/20 bg-amber-500/[0.07] p-3.5">
            <AlertIcon className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
            <div>
              <p className="text-xs font-semibold text-amber-300">Contradiction</p>
              <p className="text-xs text-amber-200/80 mt-0.5">{card.contradictions[0]}</p>
            </div>
          </div>
        )}

        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-md border border-white/[0.08] bg-white/[0.03] py-2.5 text-xs font-semibold text-zinc-300 transition-colors hover:bg-white/[0.06] hover:text-white"
        >
          <ChevronIcon direction={expanded ? 'up' : 'down'} className="h-3.5 w-3.5" />
          {expanded ? 'Collapse' : 'Expand Analysis'}
        </button>
      </div>

      {expanded && (
        <div className="border-t border-white/[0.06] animate-fade-in">
          <div className="flex border-b border-white/[0.06]">
            {[
              { id: 'forensic' as const, label: 'Forensic', icon: <EyeIcon className="h-3.5 w-3.5" /> },
              { id: 'evidence' as const, label: 'Evidence', icon: <HashIcon className="h-3.5 w-3.5" /> },
              { id: 'claims' as const, label: 'Claims', icon: <BeakerIcon className="h-3.5 w-3.5" /> },
              { id: 'meta' as const, label: 'Meta', icon: <EyeOffIcon className="h-3.5 w-3.5" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-1 items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-b-2 border-white text-white'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="p-5 sm:p-6">
            {activeTab === 'forensic' && (
              <div className="space-y-6">
                {card.keyEvidence.length > 0 && (
                  <Section title="Key Evidence" icon={<HashIcon className="h-4 w-4 text-zinc-400" />}>
                    <ul className="space-y-2">
                      {card.keyEvidence.map((e, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-zinc-300">
                          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-zinc-500" />
                          {e}
                        </li>
                      ))}
                    </ul>
                  </Section>
                )}

                {card.timeline.length > 0 && (
                  <Section title="Timeline" icon={<ClockIcon className="h-4 w-4 text-zinc-400" />}>
                    <div className="relative ml-2 border-l border-zinc-700 pl-4">
                      {card.timeline.map((t, i) => (
                        <div key={i} className="relative mb-3 last:mb-0">
                          <div className="absolute -left-[17px] top-1.5 h-2 w-2 rounded-full border border-zinc-500 bg-[#141418]" />
                          <p className="text-sm text-zinc-300">{t}</p>
                        </div>
                      ))}
                    </div>
                  </Section>
                )}

                {card.actors.length > 0 && (
                  <Section title="Key Actors" icon={<UserIcon className="h-4 w-4 text-zinc-400" />}>
                    <div className="flex flex-wrap gap-2">
                      {card.actors.map((a, i) => (
                        <span key={i} className="rounded-md bg-white/[0.06] px-2.5 py-1 text-xs font-medium text-zinc-300">
                          {a}
                        </span>
                      ))}
                    </div>
                  </Section>
                )}
              </div>
            )}

            {activeTab === 'evidence' && (
              <div className="space-y-6">
                <Section title="Forensic Summary" icon={<DocumentIcon className="h-4 w-4 text-zinc-400" />}>
                  <ol className="space-y-2.5">
                    {card.forensicSummary.map((s, i) => (
                      <li key={i} className="flex gap-3 text-sm text-zinc-300">
                        <span className="shrink-0 font-mono text-xs text-zinc-500">{(i + 1).toString().padStart(2, '0')}</span>
                        {s}
                      </li>
                    ))}
                  </ol>
                </Section>

                {card.contradictions.length > 0 && (
                  <Section title="Contradictions" icon={<AlertIcon className="h-4 w-4 text-amber-400" />}>
                    {card.contradictions.map((c, i) => (
                      <div key={i} className="rounded-md border border-amber-500/20 bg-amber-500/[0.05] p-3.5">
                        <p className="text-sm text-amber-200/90">{c}</p>
                      </div>
                    ))}
                  </Section>
                )}
              </div>
            )}

            {activeTab === 'claims' && (
              <div className="space-y-6">
                {card.technicalClaims.length > 0 && (
                  <Section title="Technical" icon={<BeakerIcon className="h-4 w-4 text-zinc-400" />}>
                    <ClaimList items={card.technicalClaims} />
                  </Section>
                )}
                {card.businessClaims.length > 0 && (
                  <Section title="Business" icon={<EnterpriseIcon className="h-4 w-4 text-zinc-400" />}>
                    <ClaimList items={card.businessClaims} />
                  </Section>
                )}
                {card.policyClaims.length > 0 && (
                  <Section title="Policy" icon={<RegulationIcon className="h-4 w-4 text-zinc-400" />}>
                    <ClaimList items={card.policyClaims} />
                  </Section>
                )}
                {card.technicalClaims.length === 0 && card.businessClaims.length === 0 && card.policyClaims.length === 0 && (
                  <p className="text-sm text-zinc-400">No claims extracted from excerpt.</p>
                )}
              </div>
            )}

            {activeTab === 'meta' && (
              <div className="space-y-6">
                {card.suppressedAssumptions.length > 0 && (
                  <Section title="Suppressed Assumptions" icon={<EyeOffIcon className="h-4 w-4 text-zinc-400" />}>
                    {card.suppressedAssumptions.map((a, i) => (
                      <div key={i} className="mb-2 flex items-start gap-2.5 rounded-md border border-white/[0.06] bg-white/[0.02] p-3 last:mb-0">
                        <EyeOffIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-400" />
                        <p className="text-sm text-zinc-300">{a}</p>
                      </div>
                    ))}
                  </Section>
                )}

                {card.institutionalBlindSpots.length > 0 && (
                  <Section title="Institutional Blind Spots" icon={<EyeIcon className="h-4 w-4 text-zinc-400" />}>
                    {card.institutionalBlindSpots.map((b, i) => (
                      <div key={i} className="mb-2 flex items-start gap-2.5 rounded-md border border-white/[0.06] bg-white/[0.02] p-3 last:mb-0">
                        <EyeIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-400" />
                        <p className="text-sm text-zinc-300">{b}</p>
                      </div>
                    ))}
                  </Section>
                )}

                {card.unspokenSentence && (
                  <Section title="The Unspoken" icon={<AlertIcon className="h-4 w-4 text-zinc-400" />}>
                    <div className="rounded-md border border-white/[0.08] bg-white/[0.03] p-4">
                      <p className="text-sm italic text-zinc-200">"{card.unspokenSentence}"</p>
                    </div>
                  </Section>
                )}

                <Section title="Source Faithfulness" icon={<CheckIcon className="h-4 w-4 text-zinc-400" />}>
                  <div className="space-y-4">
                    {card.sourceFaithfulnessLog.supportedClaims.length > 0 && (
                      <div>
                        <p className="mb-1.5 text-xs font-bold uppercase tracking-widest text-zinc-400">Supported</p>
                        {card.sourceFaithfulnessLog.supportedClaims.map((c, i) => (
                          <div key={i} className="flex items-start gap-2 py-1">
                            <CheckIcon className="mt-0.5 h-3 w-3 shrink-0 text-zinc-400" />
                            <p className="text-xs text-zinc-300">{c}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    {card.sourceFaithfulnessLog.rejectedClaims.length > 0 && (
                      <div>
                        <p className="mb-1.5 text-xs font-bold uppercase tracking-widest text-zinc-400">Rejected</p>
                        {card.sourceFaithfulnessLog.rejectedClaims.map((c, i) => (
                          <div key={i} className="flex items-start gap-2 py-1">
                            <XIcon className="mt-0.5 h-3 w-3 shrink-0 text-zinc-400" />
                            <p className="text-xs text-zinc-300">{c}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    {card.sourceFaithfulnessLog.uncertainties.length > 0 && (
                      <div>
                        <p className="mb-1.5 text-xs font-bold uppercase tracking-widest text-zinc-400">Uncertain</p>
                        {card.sourceFaithfulnessLog.uncertainties.map((c, i) => (
                          <div key={i} className="flex items-start gap-2 py-1">
                            <QuestionIcon className="mt-0.5 h-3 w-3 shrink-0 text-zinc-400" />
                            <p className="text-xs text-zinc-300">{c}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="rounded bg-white/[0.04] px-3 py-1.5">
                      <p className="font-mono text-xs text-zinc-500">
                        hash: {card.sourceFaithfulnessLog.transformationHash}
                      </p>
                    </div>
                  </div>
                </Section>
              </div>
            )}
          </div>
        </div>
      )}
    </article>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        {icon}
        <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-300">{title}</h4>
      </div>
      {children}
    </div>
  );
}

function ClaimList({ items }: { items: string[] }) {
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="rounded-md border border-white/[0.06] bg-white/[0.02] p-3">
          <p className="text-sm text-zinc-300">{item}</p>
        </div>
      ))}
    </div>
  );
}

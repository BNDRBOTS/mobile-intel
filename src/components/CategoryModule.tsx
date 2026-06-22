import type { DashboardCard } from '../types';
import ArticleCard from './ArticleCard';
import { ModelIcon, ResearchIcon, RegulationIcon, SafetyIcon, EnterpriseIcon, InfraIcon, SecurityIcon } from './Icons';

interface CategoryModuleProps {
  cards: DashboardCard[];
  moduleId: string;
}

const moduleConfig: Record<string, { icon: React.ReactNode; title: string; description: string; category: string }> = {
  models: {
    icon: <ModelIcon className="h-5 w-5 text-zinc-300" />,
    title: 'Model Releases',
    description: 'New AI model announcements',
    category: 'Model Releases'
  },
  research: {
    icon: <ResearchIcon className="h-5 w-5 text-zinc-300" />,
    title: 'Research',
    description: 'AI research publications',
    category: 'Research Breakthroughs'
  },
  regulation: {
    icon: <RegulationIcon className="h-5 w-5 text-zinc-300" />,
    title: 'Policy',
    description: 'AI governance and legislation',
    category: 'Regulation / Policy'
  },
  safety: {
    icon: <SafetyIcon className="h-5 w-5 text-zinc-300" />,
    title: 'Safety',
    description: 'AI safety and alignment',
    category: 'Safety / Alignment'
  },
  enterprise: {
    icon: <EnterpriseIcon className="h-5 w-5 text-zinc-300" />,
    title: 'Enterprise',
    description: 'Business and market impact',
    category: 'Enterprise / Market Impact'
  },
  infrastructure: {
    icon: <InfraIcon className="h-5 w-5 text-zinc-300" />,
    title: 'Infrastructure',
    description: 'AI compute and hardware',
    category: 'Infrastructure / Chips'
  },
  security: {
    icon: <SecurityIcon className="h-5 w-5 text-zinc-300" />,
    title: 'Security',
    description: 'AI threats and misuse',
    category: 'Security / Misuse'
  },
};

export default function CategoryModule({ cards, moduleId }: CategoryModuleProps) {
  const config = moduleConfig[moduleId];
  if (!config) return null;
  
  const filtered = cards.filter(c => c.category === config.category);

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        {config.icon}
        <div className="flex-1">
          <h2 className="text-lg font-bold text-white">{config.title}</h2>
          <p className="text-xs text-zinc-400">{config.description}</p>
        </div>
        <span className="rounded-md bg-white/[0.08] px-2.5 py-1 text-xs font-semibold text-zinc-200">
          {filtered.length}
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-white/[0.07] bg-[#141418] p-12 text-center">
          <p className="text-sm text-zinc-300">No articles in this category today.</p>
          <p className="mt-1.5 text-xs text-zinc-500">Check rejections or loosen gates.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((card) => (
            <ArticleCard key={card.rank} card={card} />
          ))}
        </div>
      )}
    </div>
  );
}

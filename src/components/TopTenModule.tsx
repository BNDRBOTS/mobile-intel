import type { DashboardCard } from '../types';
import ArticleCard from './ArticleCard';
import { DashboardIcon } from './Icons';

interface TopTenModuleProps {
  cards: DashboardCard[];
}

export default function TopTenModule({ cards }: TopTenModuleProps) {
  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <DashboardIcon className="h-5 w-5 text-zinc-300" />
        <div>
          <h2 className="text-lg font-bold text-white">Daily Top {cards.length}</h2>
          <p className="text-xs text-zinc-400">Ranked by density score · Gates applied</p>
        </div>
      </div>
      {cards.length === 0 ? (
        <div className="rounded-lg border border-white/[0.07] bg-[#141418] p-12 text-center">
          <p className="text-sm text-zinc-300">No articles passed all quality gates.</p>
          <p className="mt-1.5 text-xs text-zinc-500">Try loosening gate strictness or check source health.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {cards.map((card) => (
            <ArticleCard key={card.rank} card={card} />
          ))}
        </div>
      )}
    </div>
  );
}

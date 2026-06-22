import {
  DashboardIcon, ModelIcon, ResearchIcon, RegulationIcon, SafetyIcon,
  EnterpriseIcon, InfraIcon, SecurityIcon, ContradictionIcon, RejectIcon, SourceIcon
} from './Icons';
import type { DashboardModule } from '../types';

interface NavItem {
  id: DashboardModule;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { id: 'top10', label: 'Top 10', icon: <DashboardIcon /> },
  { id: 'models', label: 'Models', icon: <ModelIcon /> },
  { id: 'research', label: 'Research', icon: <ResearchIcon /> },
  { id: 'regulation', label: 'Policy', icon: <RegulationIcon /> },
  { id: 'safety', label: 'Safety', icon: <SafetyIcon /> },
  { id: 'enterprise', label: 'Enterprise', icon: <EnterpriseIcon /> },
  { id: 'infrastructure', label: 'Infra', icon: <InfraIcon /> },
  { id: 'security', label: 'Security', icon: <SecurityIcon /> },
  { id: 'contradictions', label: 'Conflicts', icon: <ContradictionIcon /> },
  { id: 'rejections', label: 'Rejected', icon: <RejectIcon /> },
  { id: 'sourceHealth', label: 'Sources', icon: <SourceIcon /> },
];

interface NavigationProps {
  activeModule: DashboardModule;
  onModuleChange: (mod: DashboardModule) => void;
}

export default function Navigation({ activeModule, onModuleChange }: NavigationProps) {
  return (
    <nav className="border-b border-white/[0.06] bg-[#101014]">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="flex gap-1 overflow-x-auto py-2 scrollbar-thin">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onModuleChange(item.id)}
              className={`flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition-colors ${
                activeModule === item.id
                  ? 'bg-white text-zinc-900'
                  : 'text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-200'
              }`}
            >
              <span className={activeModule === item.id ? 'text-zinc-600' : 'text-zinc-500'}>
                {item.icon}
              </span>
              <span className="hidden sm:inline">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}

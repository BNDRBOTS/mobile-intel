export interface SourceFaithfulnessLog {
  supportedClaims: string[];
  rejectedClaims: string[];
  uncertainties: string[];
  transformationHash: string;
}

export interface DashboardCard {
  rank: number;
  title: string;
  source: string;
  author: string;
  publishedAt: string;
  url: string;
  category: string;
  wordCount: number;
  densityScore: number;
  whySelected: string[];
  forensicSummary: string[];
  keyEvidence: string[];
  timeline: string[];
  actors: string[];
  technicalClaims: string[];
  businessClaims: string[];
  policyClaims: string[];
  contradictions: string[];
  suppressedAssumptions: string[];
  institutionalBlindSpots: string[];
  unspokenSentence: string;
  sourceFaithfulnessLog: SourceFaithfulnessLog;
}

export interface RejectionEntry {
  title: string;
  source: string;
  url: string;
  reason: string;
  gate: string;
  timestamp: string;
}

export interface SourceHealthEntry {
  name: string;
  status: 'online' | 'degraded' | 'offline' | 'paywall';
  lastChecked: string;
  articlesFound: number;
  articlesPassed: number;
  isPrimary: boolean;
}

export interface ContradictionEntry {
  id: string;
  claim1: { source: string; claim: string; articleRank: number };
  claim2: { source: string; claim: string; articleRank: number };
  severity: 'low' | 'medium' | 'high';
  status: 'unresolved' | 'partially_resolved' | 'resolved';
  followUpQuestions: string[];
}

export type DashboardModule =
  | 'top10'
  | 'models'
  | 'research'
  | 'regulation'
  | 'safety'
  | 'enterprise'
  | 'infrastructure'
  | 'security'
  | 'contradictions'
  | 'rejections'
  | 'sourceHealth';

export interface EscalationItem {
  articleRank: number;
  articleTitle: string;
  questions: string[];
  evidenceTimeline: string[];
  relatedArticles: number[];
  processFailures: string[];
  unspokenSentence: string;
}

export interface GateSettings {
  minWordCount: number;
  minDensityScore: number;
  sameDayOnly: boolean;
  maxArticles: number;
  dateLookbackDays: number;
}

export const DEFAULT_GATE_SETTINGS: GateSettings = {
  minWordCount: 300,
  minDensityScore: 40,
  sameDayOnly: true,
  maxArticles: 10,
  dateLookbackDays: 0,
};

export const GATE_LIMITS = {
  minWordCount: { min: 50, max: 900, step: 50 },
  minDensityScore: { min: 10, max: 80, step: 5 },
  maxArticles: { min: 5, max: 50, step: 5 },
  dateLookbackDays: { min: 0, max: 7, step: 1 },
};

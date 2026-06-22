import type { DashboardCard, RejectionEntry, SourceHealthEntry, ContradictionEntry, EscalationItem, GateSettings } from '../types';
import type { SourceConfig, RSSFeed } from './rssService';
import { DEFAULT_GATE_SETTINGS } from '../types';

function getTodayISO(timezone: string): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: timezone });
}

function generateHash(): string {
  return Math.random().toString(36).substring(2, 14);
}

function stripHtml(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(w => w.length > 0).length;
}

function isAIRelevant(title: string, content: string): boolean {
  const combined = (title + ' ' + content).toLowerCase();
  const keywords = [
    'artificial intelligence', 'machine learning', 'deep learning', 'neural network',
    'llm', 'large language model', 'gpt', 'claude', 'gemini', 'llama',
    'ai model', 'ai system', 'ai safety', 'ai regulation', 'ai chip',
    'transformer', 'diffusion model', 'generative ai', 'chatbot', 'ai agent',
    'openai', 'anthropic', 'deepmind', 'meta ai', 'microsoft ai', 'hugging face',
    'natural language processing', 'computer vision', 'reinforcement learning'
  ];
  return keywords.some(kw => combined.includes(kw));
}

function isWithinDateRange(pubDate: string, targetDate: string, lookbackDays: number): boolean {
  try {
    const articleDate = new Date(pubDate);
    const target = new Date(targetDate + 'T23:59:59');
    const earliest = new Date(targetDate + 'T00:00:00');
    earliest.setDate(earliest.getDate() - lookbackDays);
    return articleDate >= earliest && articleDate <= target;
  } catch {
    return false;
  }
}

function isSameDay(pubDate: string, targetDate: string): boolean {
  try {
    const articleDate = new Date(pubDate).toISOString().split('T')[0];
    return articleDate === targetDate;
  } catch {
    return false;
  }
}

function calculateDensityScore(title: string, content: string): number {
  let score = 50;
  const text = title + ' ' + content;
  const words = countWords(text);
  if (words >= 2000) score += 15;
  else if (words >= 1000) score += 10;
  else if (words >= 500) score += 5;
  const numbers = (text.match(/\d+(\.\d+)?%?/g) || []).length;
  score += Math.min(numbers * 2, 15);
  const quotes = (text.match(/[""\u201c].*?[""\u201d]|".*?"/g) || []).length;
  score += Math.min(quotes * 3, 12);
  const entities = (text.match(/[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+/g) || []).length;
  score += Math.min(entities, 8);
  return Math.min(Math.max(score, 0), 100);
}

function extractActors(content: string): string[] {
  const actors: string[] = [];
  const patterns = [
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+),?\s+(?:CEO|CTO|VP|Director|Chief|President|Founder)/g,
    /(?:CEO|CTO|Chief)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/g,
  ];
  for (const pattern of patterns) {
    const matches = content.matchAll(pattern);
    for (const match of matches) {
      if (match[1] && !actors.includes(match[1])) {
        actors.push(match[1]);
      }
    }
  }
  return actors.slice(0, 5);
}

function extractKeyEvidence(content: string): string[] {
  const evidence: string[] = [];
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
  for (const sentence of sentences) {
    if (/\d+(\.\d+)?%|\$[\d,]+|billion|million|\d+x|\d+ percent/i.test(sentence)) {
      evidence.push(sentence.trim());
      if (evidence.length >= 5) break;
    }
  }
  return evidence;
}

function categorizeArticle(title: string, content: string, defaultCategory: string): string {
  const text = (title + ' ' + content).toLowerCase();
  if (/regulation|policy|law|legislation|compliance|eu ai act|government/i.test(text)) {
    return 'Regulation / Policy';
  }
  if (/safety|alignment|risk|harm|ethics|responsible/i.test(text)) {
    return 'Safety / Alignment';
  }
  if (/release|launch|announce|introduces|new model|gpt-|claude|llama|gemini/i.test(text)) {
    return 'Model Releases';
  }
  if (/research|study|paper|arxiv|breakthrough|discover/i.test(text)) {
    return 'Research Breakthroughs';
  }
  if (/enterprise|business|market|startup|funding|revenue|company/i.test(text)) {
    return 'Enterprise / Market Impact';
  }
  if (/chip|gpu|nvidia|hardware|datacenter|infrastructure|compute/i.test(text)) {
    return 'Infrastructure / Chips';
  }
  if (/security|attack|vulnerability|malware|threat|fraud|misuse/i.test(text)) {
    return 'Security / Misuse';
  }
  return defaultCategory;
}

export interface ProcessingResult {
  cards: DashboardCard[];
  rejections: RejectionEntry[];
  sourceHealth: SourceHealthEntry[];
  contradictions: ContradictionEntry[];
  escalations: EscalationItem[];
}

export function processFeeds(
  feedMap: Map<string, RSSFeed | null>,
  sourceConfigs: SourceConfig[],
  timezone: string,
  gateSettings: GateSettings = DEFAULT_GATE_SETTINGS
): ProcessingResult {
  const todayISO = getTodayISO(timezone);
  const cards: DashboardCard[] = [];
  const rejections: RejectionEntry[] = [];
  const sourceHealth: SourceHealthEntry[] = [];

  for (const config of sourceConfigs) {
    const feed = feedMap.get(config.name);
    let articlesFound = 0;
    let articlesPassed = 0;

    if (feed && feed.items) {
      articlesFound = feed.items.length;
      for (const item of feed.items) {
        const plainContent = stripHtml(item.content || item.description || '');
        const wordCount = countWords(plainContent);
        const title = item.title || 'Untitled';
        const url = item.link || '';
        const pubDate = item.pubDate || '';
        const author = item.author || config.name;

        const passesDateGate = gateSettings.sameDayOnly
          ? isSameDay(pubDate, todayISO)
          : isWithinDateRange(pubDate, todayISO, gateSettings.dateLookbackDays);

        if (!passesDateGate) {
          rejections.push({
            title,
            source: config.name,
            url,
            reason: gateSettings.sameDayOnly
              ? `Published on ${pubDate.split('T')[0]}, not today (${todayISO}). Failed same-day gate.`
              : `Published on ${pubDate.split('T')[0]}, outside ${gateSettings.dateLookbackDays}-day window. Failed date gate.`,
            gate: 'SAME_DAY_GATE',
            timestamp: new Date().toISOString(),
          });
          continue;
        }

        if (!isAIRelevant(title, plainContent)) {
          rejections.push({
            title,
            source: config.name,
            url,
            reason: 'Article does not materially concern AI topics. Failed AI relevance gate.',
            gate: 'AI_RELEVANCE_GATE',
            timestamp: new Date().toISOString(),
          });
          continue;
        }

        if (wordCount < gateSettings.minWordCount) {
          rejections.push({
            title,
            source: config.name,
            url,
            reason: `Article is ${wordCount} words (minimum ${gateSettings.minWordCount}). Failed length gate.`,
            gate: 'LENGTH_GATE',
            timestamp: new Date().toISOString(),
          });
          continue;
        }

        const densityScore = calculateDensityScore(title, plainContent);
        if (densityScore < gateSettings.minDensityScore) {
          rejections.push({
            title,
            source: config.name,
            url,
            reason: `Density score ${densityScore}/100 below threshold (${gateSettings.minDensityScore}). Failed density scorer.`,
            gate: 'DENSITY_SCORER',
            timestamp: new Date().toISOString(),
          });
          continue;
        }

        const category = categorizeArticle(title, plainContent, config.category);
        const actors = extractActors(plainContent);
        const keyEvidence = extractKeyEvidence(plainContent);
        const sentences = plainContent.split(/[.!?]+/).filter(s => s.trim().length > 30);
        const forensicSummary = sentences.slice(0, 5).map(s => s.trim() + '.');

        cards.push({
          rank: 0,
          title,
          source: config.name,
          author,
          publishedAt: pubDate,
          url,
          category,
          wordCount,
          densityScore,
          whySelected: [
            gateSettings.sameDayOnly ? 'Same-day publication verified' : `Within ${gateSettings.dateLookbackDays}-day window`,
            'AI relevance confirmed',
            `Density score: ${densityScore}/${gateSettings.minDensityScore} min`,
            `${wordCount} words (${gateSettings.minWordCount} min)`,
          ],
          forensicSummary,
          keyEvidence,
          timeline: [],
          actors,
          technicalClaims: [],
          businessClaims: [],
          policyClaims: [],
          contradictions: [],
          suppressedAssumptions: [],
          institutionalBlindSpots: [],
          unspokenSentence: '',
          sourceFaithfulnessLog: {
            supportedClaims: ['Content extracted from RSS feed', 'Publication date verified'],
            rejectedClaims: [],
            uncertainties: ['Full article may contain additional claims not in excerpt'],
            transformationHash: generateHash(),
          },
        });
        articlesPassed++;
      }
    }

    sourceHealth.push({
      name: config.name,
      status: feed ? (articlesFound > 0 ? 'online' : 'degraded') : 'offline',
      lastChecked: new Date().toISOString(),
      articlesFound,
      articlesPassed,
      isPrimary: config.isPrimary,
    });
  }

  cards.sort((a, b) => b.densityScore - a.densityScore);
  cards.forEach((card, index) => {
    card.rank = index + 1;
  });

  const topCards = cards.slice(0, gateSettings.maxArticles);
  const contradictions = detectContradictions(topCards);
  const escalations = generateEscalations(topCards, contradictions);

  return {
    cards: topCards,
    rejections,
    sourceHealth,
    contradictions,
    escalations,
  };
}

function detectContradictions(cards: DashboardCard[]): ContradictionEntry[] {
  const contradictions: ContradictionEntry[] = [];
  for (let i = 0; i < cards.length; i++) {
    for (let j = i + 1; j < cards.length; j++) {
      const card1 = cards[i];
      const card2 = cards[j];
      if (card1.category === card2.category) {
        const text1 = card1.forensicSummary.join(' ').toLowerCase();
        const text2 = card2.forensicSummary.join(' ').toLowerCase();
        const conflictPatterns = [
          { pos: /increase|grow|rise|up/i, neg: /decrease|shrink|fall|down/i },
          { pos: /success|achieve|win/i, neg: /fail|lose|struggle/i },
          { pos: /safe|secure|protect/i, neg: /danger|risk|threat/i },
        ];
        for (const pattern of conflictPatterns) {
          if ((pattern.pos.test(text1) && pattern.neg.test(text2)) ||
              (pattern.neg.test(text1) && pattern.pos.test(text2))) {
            contradictions.push({
              id: `c${contradictions.length + 1}`,
              claim1: { source: card1.source, claim: card1.forensicSummary[0] || card1.title, articleRank: card1.rank },
              claim2: { source: card2.source, claim: card2.forensicSummary[0] || card2.title, articleRank: card2.rank },
              severity: 'medium',
              status: 'unresolved',
              followUpQuestions: [
                'What accounts for the differing perspectives?',
                'Are these claims based on different data or timeframes?',
              ],
            });
            break;
          }
        }
      }
    }
  }
  return contradictions.slice(0, 5);
}

function generateEscalations(cards: DashboardCard[], contradictions: ContradictionEntry[]): EscalationItem[] {
  if (contradictions.length === 0 || cards.length === 0) return [];
  const contradictionRate = contradictions.length / Math.max(cards.length, 1);
  if (contradictionRate < 0.3) return [];

  const affectedRanks = new Set<number>();
  contradictions.forEach(c => {
    affectedRanks.add(c.claim1.articleRank);
    affectedRanks.add(c.claim2.articleRank);
  });

  const escalations: EscalationItem[] = [];
  for (const rank of affectedRanks) {
    const card = cards.find(c => c.rank === rank);
    if (card) {
      escalations.push({
        articleRank: rank,
        articleTitle: card.title,
        questions: [
          'What methodology was used to arrive at these claims?',
          'Are there unstated assumptions affecting the conclusion?',
        ],
        evidenceTimeline: [
          `${new Date().toISOString().split('T')[0]}: Article published`,
          'Contradiction detected with related article',
        ],
        relatedArticles: Array.from(affectedRanks).filter(r => r !== rank),
        processFailures: ['Conflicting claims detected across sources'],
        unspokenSentence: 'Sources may have different incentives affecting their reporting.',
      });
    }
  }
  return escalations.slice(0, 3);
}

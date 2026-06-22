import { useState, useEffect, useCallback, useRef } from 'react';
import type { DashboardCard, RejectionEntry, SourceHealthEntry, ContradictionEntry, EscalationItem, GateSettings } from '../types';
import { fetchAllFeeds, SOURCE_FEEDS } from '../services/rssService';
import type { RSSFeed } from '../services/rssService';
import { processFeeds } from '../services/articleProcessor';

export interface DashboardData {
  cards: DashboardCard[];
  rejections: RejectionEntry[];
  sourceHealth: SourceHealthEntry[];
  contradictions: ContradictionEntry[];
  escalations: EscalationItem[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

export function useDashboardData(
  timezone: string,
  gateSettings: GateSettings
): DashboardData & { refresh: () => void } {
  const [data, setData] = useState<DashboardData>({
    cards: [],
    rejections: [],
    sourceHealth: SOURCE_FEEDS.map(s => ({
      name: s.name,
      status: 'offline' as const,
      lastChecked: new Date().toISOString(),
      articlesFound: 0,
      articlesPassed: 0,
      isPrimary: s.isPrimary,
    })),
    contradictions: [],
    escalations: [],
    isLoading: true,
    error: null,
    lastUpdated: null,
  });

  const cachedFeeds = useRef<Map<string, RSSFeed | null> | null>(null);
  const settingsKey = JSON.stringify(gateSettings);

  const reprocess = useCallback(() => {
    if (!cachedFeeds.current) return;
    const result = processFeeds(cachedFeeds.current, SOURCE_FEEDS, timezone, gateSettings);
    setData({
      cards: result.cards,
      rejections: result.rejections,
      sourceHealth: result.sourceHealth,
      contradictions: result.contradictions,
      escalations: result.escalations,
      isLoading: false,
      error: null,
      lastUpdated: new Date().toISOString(),
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timezone, settingsKey]);

  useEffect(() => {
    if (cachedFeeds.current) {
      reprocess();
    }
  }, [reprocess]);

  const fetchData = useCallback(async () => {
    setData(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const feedMap = await fetchAllFeeds();
      cachedFeeds.current = feedMap;
      const result = processFeeds(feedMap, SOURCE_FEEDS, timezone, gateSettings);
      setData({
        cards: result.cards,
        rejections: result.rejections,
        sourceHealth: result.sourceHealth,
        contradictions: result.contradictions,
        escalations: result.escalations,
        isLoading: false,
        error: null,
        lastUpdated: new Date().toISOString(),
      });
    } catch (err) {
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to fetch data',
      }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timezone]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { ...data, refresh: fetchData };
}

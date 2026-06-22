const RSS2JSON_API = 'https://api.rss2json.com/v1/api.json';

export interface RSSItem {
  title: string;
  link: string;
  pubDate: string;
  author: string;
  content: string;
  description: string;
  thumbnail: string;
}

export interface RSSFeed {
  status: string;
  feed: {
    title: string;
    link: string;
    description: string;
  };
  items: RSSItem[];
}

export interface SourceConfig {
  name: string;
  feedUrl: string;
  isPrimary: boolean;
  category: string;
}

export const SOURCE_FEEDS: SourceConfig[] = [
  { name: 'MIT Technology Review AI', feedUrl: 'https://www.technologyreview.com/feed/', isPrimary: true, category: 'Research Breakthroughs' },
  { name: 'TechCrunch AI', feedUrl: 'https://techcrunch.com/category/artificial-intelligence/feed/', isPrimary: false, category: 'Enterprise / Market Impact' },
  { name: 'VentureBeat AI', feedUrl: 'https://venturebeat.com/category/ai/feed/', isPrimary: false, category: 'Enterprise / Market Impact' },
  { name: 'The Verge AI', feedUrl: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml', isPrimary: false, category: 'Model Releases' },
  { name: 'Ars Technica AI', feedUrl: 'https://feeds.arstechnica.com/arstechnica/technology-lab', isPrimary: false, category: 'Research Breakthroughs' },
  { name: 'Wired AI', feedUrl: 'https://www.wired.com/feed/tag/ai/latest/rss', isPrimary: false, category: 'Regulation / Policy' },
];

export async function fetchRSSFeed(feedUrl: string): Promise<RSSFeed | null> {
  try {
    const response = await fetch(
      `${RSS2JSON_API}?rss_url=${encodeURIComponent(feedUrl)}&count=20`
    );
    if (!response.ok) return null;
    const data: RSSFeed = await response.json();
    if (data.status !== 'ok') return null;
    return data;
  } catch {
    return null;
  }
}

export async function fetchAllFeeds(): Promise<Map<string, RSSFeed | null>> {
  const results = new Map<string, RSSFeed | null>();
  const promises = SOURCE_FEEDS.map(async (source) => {
    const feed = await fetchRSSFeed(source.feedUrl);
    results.set(source.name, feed);
  });
  await Promise.allSettled(promises);
  return results;
}

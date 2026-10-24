import type { MapInfo, Member, MatchRecord, RadarKey } from '../domain/types';
import { MAPS } from '../data/operators';
import { operatorById } from '../data/operators';

/** 演示基准时间：保证任何时候打开页面，28 场样本都稳定落在统计窗口内 */
export const DEMO_NOW = new Date('2026-10-24T20:00:00+08:00');

export type Range = '7d' | '30d' | 'season';

export const RANGE_LABELS: Record<Range, string> = {
  '7d': '近 7 天',
  '30d': '近 30 天',
  season: '本赛季',
};

const DAY = 86400000;

export interface Aggregate {
  games: number;
  wins: number;
  losses: number;
  winRate: number;
  kd: number;
  kills: number;
  deaths: number;
  totalScore: number;
  avgScore: number;
}

export function inRange(matches: MatchRecord[], range: Range): MatchRecord[] {
  if (range === 'season') return matches;
  const days = range === '7d' ? 7 : 30;
  const start = DEMO_NOW.getTime() - days * DAY;
  return matches.filter((m) => new Date(m.playedAt).getTime() > start);
}

export function aggregate(matches: MatchRecord[]): Aggregate {
  const games = matches.length;
  const wins = matches.filter((m) => m.result === 'win').length;
  const losses = games - wins;
  const kills = matches.reduce((s, m) => s + m.kills, 0);
  const deaths = matches.reduce((s, m) => s + m.deaths, 0);
  const totalScore = matches.reduce((s, m) => s + m.score, 0);
  return {
    games,
    wins,
    losses,
    winRate: games ? Math.round((wins / games) * 1000) / 10 : 0,
    kd: deaths ? Math.round((kills / deaths) * 100) / 100 : 0,
    kills,
    deaths,
    totalScore,
    avgScore: games ? Math.round(totalScore / games) : 0,
  };
}

export interface TrendPoint {
  key: string;
  label: string;
  winRate: number | null;
  kd: number | null;
  games: number;
}

const dayKey = (d: Date) =>
  d.toLocaleDateString('en-CA', { timeZone: 'Asia/Shanghai' });

const dayLabel = (d: Date) =>
  d.toLocaleDateString('zh-CN', { timeZone: 'Asia/Shanghai', month: '2-digit', day: '2-digit' }).replace('/', '.');

export function trend(matches: MatchRecord[], range: Range): TrendPoint[] {
  const days = range === '7d' ? 7 : 30;
  const points: TrendPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(DEMO_NOW.getTime() - i * DAY);
    const key = dayKey(d);
    const dayMatches = matches.filter((m) => dayKey(new Date(m.playedAt)) === key);
    const agg = aggregate(dayMatches);
    points.push({
      key,
      label: dayLabel(d),
      winRate: dayMatches.length ? agg.winRate : null,
      kd: dayMatches.length ? agg.kd : null,
      games: dayMatches.length,
    });
  }
  return points;
}

export function mapPerformance(matches: MatchRecord[]): Array<{ map: MapInfo; games: number; wins: number; rate: number }> {
  return MAPS.map((map) => {
    const list = matches.filter((m) => m.mapId === map.id);
    const wins = list.filter((m) => m.result === 'win').length;
    return { map, games: list.length, wins, rate: list.length ? Math.round((wins / list.length) * 100) : 0 };
  }).filter((x) => x.games > 0);
}

export function roleDistribution(members: Member[]): Array<{ label: string; value: number; color: string }> {
  const colors = ['#22D3EE', '#F8C94A', '#8B8CF0', '#33D6A6', '#FF6675'];
  const buckets = new Map<string, number>();
  for (const m of members) {
    const role = operatorById(m.operatorId)?.role ?? '未分配';
    buckets.set(role, (buckets.get(role) ?? 0) + 1);
  }
  return [...buckets.entries()].map(([label, value], i) => ({ label, value, color: colors[i % colors.length] }));
}

export const RADAR_AXES: Array<{ key: RadarKey; label: string }> = [
  { key: 'attack', label: '进攻' },
  { key: 'control', label: '地图控制' },
  { key: 'intel', label: '信息' },
  { key: 'survival', label: '生存' },
  { key: 'support', label: '配合' },
];

export function teamRadar(members: Member[], compare = false): Array<{ key: RadarKey; label: string; value: number }> {
  return RADAR_AXES.map(({ key, label }) => {
    const vals = members.map((m) => operatorById(m.operatorId)?.radar[key] ?? 60);
    const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
    const base = compare ? 68 : avg;
    const jitter = compare ? (key.charCodeAt(0) % 7) - 3 : 0;
    return { key, label, value: Math.round(base + jitter) };
  });
}

export function formatTime(iso: string): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString('zh-CN', { timeZone: 'Asia/Shanghai', month: '2-digit', day: '2-digit' }).replace('/', '.');
  const time = d.toLocaleTimeString('zh-CN', { timeZone: 'Asia/Shanghai', hour: '2-digit', minute: '2-digit', hour12: false });
  return `${date} ${time}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('zh-CN', { timeZone: 'Asia/Shanghai', month: '2-digit', day: '2-digit' }).replace('/', '.');
}

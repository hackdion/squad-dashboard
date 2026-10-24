export type Side = 'attack' | 'defense';
export type RadarKey = 'attack' | 'control' | 'intel' | 'survival' | 'support';

export interface Operator {
  id: string;
  name: string;
  cn: string;
  side: Side;
  role: string;
  ability: string;
  tags: string[];
  radar: Record<RadarKey, number>;
}

export interface Member {
  id: string;
  nickname: string;
  operatorId: string;
  duty: string;
  online: boolean;
  isLeader?: boolean;
  color: string;
}

export interface MatchRecord {
  id: string;
  mapId: string;
  playedAt: string;
  result: 'win' | 'loss';
  scoreline: string;
  kills: number;
  deaths: number;
  score: number;
}

export interface MapInfo {
  id: string;
  cn: string;
  en: string;
  image: string;
  floors: number;
  sites: string[];
}

export type AccentKey = 'cyan' | 'gold' | 'green';

export interface Preferences {
  teamName: string;
  slogan: string;
  accent: AccentKey;
  hidden: string[];
  order: string[];
}

export interface AppState {
  schemaVersion: 1;
  teamName: string;
  slogan: string;
  accent: AccentKey;
  members: Member[];
  matches: MatchRecord[];
  widgets: { order: string[]; hidden: string[] };
}

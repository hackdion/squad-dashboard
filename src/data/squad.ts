import type { Member } from '../domain/types';

export const DEFAULT_MEMBERS: Member[] = [
  { id: 'm1', nickname: '我', operatorId: 'sledge', duty: '突破手 · 垂直压制', online: true, isLeader: true, color: '#22D3EE' },
  { id: 'm2', nickname: 'Cloudy', operatorId: 'thermite', duty: '硬突破 · 外墙爆破', online: true, color: '#F8C94A' },
  { id: 'm3', nickname: 'Momo', operatorId: 'thatcher', duty: '电子压制 · 反道具', online: true, color: '#8B8CF0' },
  { id: 'm4', nickname: 'Kira', operatorId: 'ash', duty: '突破手 · 快速突入', online: true, color: '#FF6675' },
  { id: 'm5', nickname: 'Lemon', operatorId: 'dokkaebi', duty: '信息支援 · 情报接入', online: true, color: '#33D6A6' },
];

export const DEFAULT_TEAM = {
  name: '夜猫子突击队',
  slogan: '五个人，才是彩虹六号。',
};

/** 首页可自定义卡片的顺序与标题 */
export const WIDGETS = [
  { id: 'kpi', label: '核心指标' },
  { id: 'trend', label: '状态趋势' },
  { id: 'roles', label: '干员定位' },
  { id: 'radar', label: '能力雷达' },
  { id: 'maps', label: '地图表现' },
  { id: 'recent', label: '最近对局' },
] as const;

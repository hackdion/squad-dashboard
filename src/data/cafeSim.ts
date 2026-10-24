/**
 * Bank · 银行：以官方蓝图俯视图为底，坐标统一归一化到 0-1。
 * 底图为公开赛/观战模式常用的俯视平面图风格，仅用于演示。
 */
export type FloorId = 'B1' | '1F' | '2F';

export interface Room {
  id: string;
  floorId: FloorId;
  name: string;
  x: number;
  y: number;
  kind?: 'room' | 'corridor' | 'stair' | 'site' | 'open';
}

export interface NavNode {
  id: string;
  floorId: FloorId;
  x: number;
  y: number;
  roomId: string;
}

export type EdgeType = 'walk' | 'door' | 'stair' | 'hatch' | 'breach';

export interface Edge {
  id: string;
  from: string;
  to: string;
  type: EdgeType;
  enabled: boolean;
  requiresAbility?: string;
}

export interface Floor {
  id: FloorId;
  label: string;
  name: string;
  image: string;
  rooms: Room[];
  nodes: NavNode[];
}

export interface SiteMark {
  id: 'A' | 'B';
  floorId: FloorId;
  x: number;
  y: number;
}

export const MAP_META = {
  name: '银行',
  en: 'BANK',
  subtitle: '公开赛常用图 · 观战俯视视角',
};

export const SITES: SiteMark[] = [
  { id: 'A', floorId: 'B1', x: 0.417, y: 0.294 },
  { id: 'B', floorId: '1F', x: 0.45, y: 0.542 },
];

export const FLOORS: Floor[] = [
  {
    id: 'B1',
    label: 'B1',
    name: '地下层 · 金库',
    image: 'tactical/bank-b1.jpg',
    rooms: [
      { id: 'b1-vault', floorId: 'B1', name: '金库', x: 0.417, y: 0.294, kind: 'site' },
      { id: 'b1-server', floorId: 'B1', name: '服务器房', x: 0.6, y: 0.368 },
      { id: 'b1-garage', floorId: 'B1', name: '车库', x: 0.4, y: 0.559 },
      { id: 'b1-hall', floorId: 'B1', name: '安全通道', x: 0.533, y: 0.515, kind: 'corridor' },
      { id: 'b1-utility', floorId: 'B1', name: '设备间', x: 0.467, y: 0.706 },
      { id: 'b1-elevator', floorId: 'B1', name: '电梯厅', x: 0.633, y: 0.676 },
      { id: 'b1-entry', floorId: 'B1', name: '地下入口', x: 0.133, y: 0.765, kind: 'open' },
      { id: 'b1-stair', floorId: 'B1', name: '主楼梯', x: 0.533, y: 0.735, kind: 'stair' },
    ],
    nodes: [
      { id: 'b1-n-vault', floorId: 'B1', x: 0.417, y: 0.294, roomId: 'b1-vault' },
      { id: 'b1-n-server', floorId: 'B1', x: 0.6, y: 0.368, roomId: 'b1-server' },
      { id: 'b1-n-garage', floorId: 'B1', x: 0.4, y: 0.559, roomId: 'b1-garage' },
      { id: 'b1-n-hall', floorId: 'B1', x: 0.533, y: 0.515, roomId: 'b1-hall' },
      { id: 'b1-n-utility', floorId: 'B1', x: 0.467, y: 0.706, roomId: 'b1-utility' },
      { id: 'b1-n-elevator', floorId: 'B1', x: 0.633, y: 0.676, roomId: 'b1-elevator' },
      { id: 'b1-n-entry', floorId: 'B1', x: 0.22, y: 0.78, roomId: 'b1-entry' },
      { id: 'b1-n-stair', floorId: 'B1', x: 0.533, y: 0.735, roomId: 'b1-stair' },
    ],
  },
  {
    id: '1F',
    label: '1F',
    name: '一层 · 营业厅',
    image: 'tactical/bank-1f.jpg',
    rooms: [
      { id: '1f-hall', floorId: '1F', name: '营业大厅', x: 0.283, y: 0.514, kind: 'open' },
      { id: '1f-tellers', floorId: '1F', name: '出纳台', x: 0.45, y: 0.542, kind: 'site' },
      { id: '1f-north', floorId: '1F', name: '北侧天井', x: 0.25, y: 0.25 },
      { id: '1f-office', floorId: '1F', name: '开放办公区', x: 0.7, y: 0.542 },
      { id: '1f-security', floorId: '1F', name: '安保监控', x: 0.717, y: 0.375 },
      { id: '1f-staff', floorId: '1F', name: '员工区', x: 0.717, y: 0.889 },
      { id: '1f-lobby', floorId: '1F', name: '前厅', x: 0.217, y: 0.889 },
      { id: '1f-eastdoor', floorId: '1F', name: '东侧门', x: 0.9, y: 0.653, kind: 'corridor' },
      { id: '1f-corr', floorId: '1F', name: '主走廊', x: 0.583, y: 0.722, kind: 'corridor' },
      { id: '1f-stair', floorId: '1F', name: '主楼梯', x: 0.45, y: 0.903, kind: 'stair' },
    ],
    nodes: [
      { id: '1f-n-lobby', floorId: '1F', x: 0.25, y: 0.86, roomId: '1f-lobby' },
      { id: '1f-n-hall', floorId: '1F', x: 0.3, y: 0.62, roomId: '1f-hall' },
      { id: '1f-n-north', floorId: '1F', x: 0.3, y: 0.32, roomId: '1f-north' },
      { id: '1f-n-tellers', floorId: '1F', x: 0.45, y: 0.542, roomId: '1f-tellers' },
      { id: '1f-n-security', floorId: '1F', x: 0.7, y: 0.4, roomId: '1f-security' },
      { id: '1f-n-office', floorId: '1F', x: 0.7, y: 0.56, roomId: '1f-office' },
      { id: '1f-n-corrw', floorId: '1F', x: 0.55, y: 0.7, roomId: '1f-corr' },
      { id: '1f-n-corre', floorId: '1F', x: 0.72, y: 0.72, roomId: '1f-corr' },
      { id: '1f-n-eastdoor', floorId: '1F', x: 0.88, y: 0.65, roomId: '1f-eastdoor' },
      { id: '1f-n-staff', floorId: '1F', x: 0.7, y: 0.86, roomId: '1f-staff' },
      { id: '1f-n-stair', floorId: '1F', x: 0.47, y: 0.88, roomId: '1f-stair' },
    ],
  },
  {
    id: '2F',
    label: '2F',
    name: '二层 · 办公区',
    image: 'tactical/bank-2f.jpg',
    rooms: [
      { id: '2f-open', floorId: '2F', name: '开放办公区', x: 0.267, y: 0.278, kind: 'open' },
      { id: '2f-archive', floorId: '2F', name: '档案室', x: 0.267, y: 0.736 },
      { id: '2f-atrium', floorId: '2F', name: '中庭', x: 0.45, y: 0.611, kind: 'open' },
      { id: '2f-meeting', floorId: '2F', name: '会议室', x: 0.617, y: 0.403 },
      { id: '2f-ceo', floorId: '2F', name: '行长办公室', x: 0.617, y: 0.556 },
      { id: '2f-terrace', floorId: '2F', name: '天台', x: 0.833, y: 0.542, kind: 'open' },
      { id: '2f-server', floorId: '2F', name: '机房', x: 0.633, y: 0.875 },
      { id: '2f-corr', floorId: '2F', name: '主走廊', x: 0.5, y: 0.681, kind: 'corridor' },
      { id: '2f-stair', floorId: '2F', name: '主楼梯', x: 0.45, y: 0.847, kind: 'stair' },
    ],
    nodes: [
      { id: '2f-n-entry', floorId: '2F', x: 0.34, y: 0.7, roomId: '2f-corr' },
      { id: '2f-n-c1', floorId: '2F', x: 0.45, y: 0.68, roomId: '2f-corr' },
      { id: '2f-n-c2', floorId: '2F', x: 0.55, y: 0.68, roomId: '2f-corr' },
      { id: '2f-n-c3', floorId: '2F', x: 0.65, y: 0.68, roomId: '2f-corr' },
      { id: '2f-n-open', floorId: '2F', x: 0.3, y: 0.3, roomId: '2f-open' },
      { id: '2f-n-archive', floorId: '2F', x: 0.3, y: 0.72, roomId: '2f-archive' },
      { id: '2f-n-atrium', floorId: '2F', x: 0.45, y: 0.6, roomId: '2f-atrium' },
      { id: '2f-n-meeting', floorId: '2F', x: 0.6, y: 0.42, roomId: '2f-meeting' },
      { id: '2f-n-ceo', floorId: '2F', x: 0.6, y: 0.58, roomId: '2f-ceo' },
      { id: '2f-n-terrace', floorId: '2F', x: 0.8, y: 0.55, roomId: '2f-terrace' },
      { id: '2f-n-server', floorId: '2F', x: 0.63, y: 0.85, roomId: '2f-server' },
      { id: '2f-n-stair', floorId: '2F', x: 0.47, y: 0.84, roomId: '2f-stair' },
    ],
  },
];

export const EDGES: Edge[] = [
  { id: 'e-b1-1', from: 'b1-n-vault', to: 'b1-n-hall', type: 'door', enabled: true },
  { id: 'e-b1-2', from: 'b1-n-server', to: 'b1-n-hall', type: 'door', enabled: true },
  { id: 'e-b1-3', from: 'b1-n-vault', to: 'b1-n-server', type: 'breach', enabled: true, requiresAbility: 'sledge' },
  { id: 'e-b1-4', from: 'b1-n-hall', to: 'b1-n-garage', type: 'door', enabled: true },
  { id: 'e-b1-5', from: 'b1-n-garage', to: 'b1-n-entry', type: 'walk', enabled: true },
  { id: 'e-b1-6', from: 'b1-n-hall', to: 'b1-n-utility', type: 'door', enabled: true },
  { id: 'e-b1-7', from: 'b1-n-hall', to: 'b1-n-elevator', type: 'walk', enabled: true },
  { id: 'e-b1-8', from: 'b1-n-elevator', to: 'b1-n-stair', type: 'stair', enabled: true },
  { id: 'e-1f-1', from: '1f-n-lobby', to: '1f-n-hall', type: 'door', enabled: true },
  { id: 'e-1f-2', from: '1f-n-hall', to: '1f-n-north', type: 'door', enabled: true },
  { id: 'e-1f-3', from: '1f-n-hall', to: '1f-n-tellers', type: 'walk', enabled: true },
  { id: 'e-1f-4', from: '1f-n-tellers', to: '1f-n-corrw', type: 'door', enabled: true },
  { id: 'e-1f-5', from: '1f-n-corrw', to: '1f-n-corre', type: 'walk', enabled: true },
  { id: 'e-1f-6', from: '1f-n-corrw', to: '1f-n-stair', type: 'door', enabled: true },
  { id: 'e-1f-7', from: '1f-n-corrw', to: '1f-n-staff', type: 'door', enabled: true },
  { id: 'e-1f-8', from: '1f-n-corre', to: '1f-n-office', type: 'door', enabled: true },
  { id: 'e-1f-9', from: '1f-n-corre', to: '1f-n-security', type: 'door', enabled: true },
  { id: 'e-1f-10', from: '1f-n-corre', to: '1f-n-eastdoor', type: 'door', enabled: true },
  { id: 'e-1f-11', from: '1f-n-tellers', to: '1f-n-office', type: 'walk', enabled: true },
  { id: 'e-2f-1', from: '2f-n-entry', to: '2f-n-c1', type: 'walk', enabled: true },
  { id: 'e-2f-2', from: '2f-n-c1', to: '2f-n-c2', type: 'walk', enabled: true },
  { id: 'e-2f-3', from: '2f-n-c2', to: '2f-n-c3', type: 'walk', enabled: true },
  { id: 'e-2f-4', from: '2f-n-entry', to: '2f-n-archive', type: 'door', enabled: true },
  { id: 'e-2f-5', from: '2f-n-entry', to: '2f-n-open', type: 'door', enabled: true },
  { id: 'e-2f-6', from: '2f-n-open', to: '2f-n-atrium', type: 'door', enabled: true },
  { id: 'e-2f-7', from: '2f-n-c1', to: '2f-n-atrium', type: 'door', enabled: true },
  { id: 'e-2f-8', from: '2f-n-c2', to: '2f-n-meeting', type: 'door', enabled: true },
  { id: 'e-2f-9', from: '2f-n-c2', to: '2f-n-ceo', type: 'door', enabled: true },
  { id: 'e-2f-10', from: '2f-n-c3', to: '2f-n-ceo', type: 'walk', enabled: true },
  { id: 'e-2f-11', from: '2f-n-c3', to: '2f-n-terrace', type: 'door', enabled: true },
  { id: 'e-2f-12', from: '2f-n-c1', to: '2f-n-stair', type: 'stair', enabled: true },
  { id: 'e-2f-13', from: '2f-n-meeting', to: '2f-n-terrace', type: 'breach', enabled: true, requiresAbility: 'thermite' },
  // 跨层
  { id: 'e-x-1', from: '1f-n-stair', to: '2f-n-stair', type: 'stair', enabled: true },
  { id: 'e-x-2', from: 'b1-n-stair', to: '1f-n-stair', type: 'stair', enabled: true },
  // 垂直破拆：1F 出纳台 -> B1 金库
  { id: 'e-x-3', from: '1f-n-tellers', to: 'b1-n-vault', type: 'hatch', enabled: true, requiresAbility: 'sledge' },
];

export interface Phase {
  id: 'recon' | 'deploy' | 'breach' | 'control' | 'rotate';
  label: string;
  start: number;
  end: number;
  hint: string;
}

export const PHASES: Phase[] = [
  { id: 'recon', label: '侦察', start: 0, end: 20, hint: '无人机确认东侧门与北侧天井' },
  { id: 'deploy', label: '部署', start: 20, end: 45, hint: '五人于 1F 前厅外侧集结' },
  { id: 'breach', label: '突破', start: 45, end: 65, hint: '从出纳台地板垂直破拆进入 B1 金库' },
  { id: 'control', label: '控点', start: 65, end: 80, hint: '占据 A 点并封住服务器房通道' },
  { id: 'rotate', label: '回防', start: 80, end: 88, hint: '沿安全通道撤向地下入口' },
];

export const ROUND_LENGTH = 88;

export interface IntelEvent {
  id: string;
  t: number;
  speaker: string;
  speakerId: string;
  text: string;
  floorId?: FloorId;
  roomId?: string;
  kind: 'enemy' | 'blocked' | 'order' | 'clear';
  status: 'pending' | 'confirmed';
  source: 'demo' | 'manual';
}

export const PRESET_INTEL: IntelEvent[] = [
  { id: 'i1', t: 12, speaker: 'Kira', speakerId: 'm4', text: 'B1 金库侧有人，脚步很轻', floorId: 'B1', roomId: 'b1-vault', kind: 'enemy', status: 'pending', source: 'demo' },
  { id: 'i2', t: 22, speaker: 'Cloudy', speakerId: 'm2', text: '东侧门被封住了，得换条路', floorId: '1F', roomId: '1f-eastdoor', kind: 'blocked', status: 'confirmed', source: 'demo' },
  { id: 'i3', t: 34, speaker: '我', speakerId: 'm1', text: '先用无人机确认，再从主楼梯下 B1', floorId: '1F', roomId: '1f-stair', kind: 'order', status: 'confirmed', source: 'demo' },
  { id: 'i4', t: 46, speaker: 'Momo', speakerId: 'm3', text: 'A 点至少两名守方，服务器房还有一个', floorId: 'B1', roomId: 'b1-server', kind: 'enemy', status: 'pending', source: 'demo' },
  { id: 'i5', t: 58, speaker: 'Lemon', speakerId: 'm5', text: '金库外墙已打开，可以进', floorId: 'B1', roomId: 'b1-vault', kind: 'clear', status: 'confirmed', source: 'demo' },
];

export type RouteKind = 'attack' | 'intel' | 'rotate' | 'defend';

export interface RouteSeg {
  id: string;
  planId: string;
  floorId: FloorId;
  phaseId: Phase['id'];
  memberIds: string[];
  points: Array<[number, number]>;
  kind: RouteKind;
}

export interface Anchor {
  id: string;
  floorId: FloorId;
  x: number;
  y: number;
  label: string;
}

export interface TacticalPlan {
  id: string;
  name: string;
  tag: string;
  summary: string;
  mode: 'attack' | 'defend';
  priority: number;
  duration: string;
  requirements: string[];
  evidenceIds: string[];
  routes: RouteSeg[];
  anchors: Anchor[];
  staging: Record<string, [number, number]>;
}

const A_ROUTES: RouteSeg[] = [
  { id: 'a-recon', planId: 'plan-a', floorId: '1F', phaseId: 'recon', memberIds: ['m5'], kind: 'intel', points: [[0.2, 0.83], [0.32, 0.68], [0.45, 0.55], [0.63, 0.5], [0.86, 0.62]] },
  { id: 'a-deploy', planId: 'plan-a', floorId: '1F', phaseId: 'deploy', memberIds: ['m1', 'm2', 'm3', 'm4'], kind: 'attack', points: [[0.2, 0.85], [0.3, 0.68], [0.4, 0.6]] },
  { id: 'a-breach', planId: 'plan-a', floorId: 'B1', phaseId: 'breach', memberIds: ['m1', 'm2', 'm3', 'm4'], kind: 'attack', points: [[0.44, 0.55], [0.43, 0.42], [0.417, 0.32]] },
  { id: 'a-control', planId: 'plan-a', floorId: 'B1', phaseId: 'control', memberIds: ['m1', 'm2'], kind: 'attack', points: [[0.417, 0.32], [0.48, 0.3], [0.55, 0.34]] },
  { id: 'a-control-2', planId: 'plan-a', floorId: 'B1', phaseId: 'control', memberIds: ['m3', 'm4'], kind: 'attack', points: [[0.417, 0.32], [0.5, 0.4], [0.6, 0.38]] },
  { id: 'a-rotate', planId: 'plan-a', floorId: 'B1', phaseId: 'rotate', memberIds: ['m1', 'm2', 'm3', 'm4'], kind: 'rotate', points: [[0.45, 0.34], [0.53, 0.5], [0.6, 0.66], [0.52, 0.72]] },
];

const B_ROUTES: RouteSeg[] = [
  { id: 'b-recon', planId: 'plan-b', floorId: '1F', phaseId: 'recon', memberIds: ['m5'], kind: 'intel', points: [[0.2, 0.83], [0.6, 0.83], [0.86, 0.62], [0.7, 0.5]] },
  { id: 'b-deploy', planId: 'plan-b', floorId: '1F', phaseId: 'deploy', memberIds: ['m1', 'm2', 'm4'], kind: 'attack', points: [[0.2, 0.85], [0.55, 0.8], [0.72, 0.72], [0.72, 0.6]] },
  { id: 'b-breach', planId: 'plan-b', floorId: '1F', phaseId: 'breach', memberIds: ['m1', 'm2', 'm4'], kind: 'attack', points: [[0.72, 0.6], [0.62, 0.52], [0.52, 0.54]] },
  { id: 'b-control', planId: 'plan-b', floorId: '1F', phaseId: 'control', memberIds: ['m1'], kind: 'attack', points: [[0.52, 0.54], [0.45, 0.54], [0.42, 0.52]] },
  { id: 'b-control-2', planId: 'plan-b', floorId: '1F', phaseId: 'control', memberIds: ['m2', 'm4'], kind: 'attack', points: [[0.52, 0.54], [0.62, 0.44], [0.7, 0.4]] },
  { id: 'b-rotate', planId: 'plan-b', floorId: '1F', phaseId: 'rotate', memberIds: ['m1', 'm2', 'm4'], kind: 'rotate', points: [[0.45, 0.54], [0.47, 0.7], [0.47, 0.86]] },
];

const DEF_ROUTES: RouteSeg[] = [
  { id: 'd-deploy', planId: 'plan-d', floorId: '1F', phaseId: 'deploy', memberIds: ['m2', 'm4'], kind: 'defend', points: [[0.45, 0.54], [0.55, 0.6], [0.6, 0.72]] },
  { id: 'd-hold', planId: 'plan-d', floorId: 'B1', phaseId: 'control', memberIds: ['m1', 'm3'], kind: 'defend', points: [[0.47, 0.86], [0.53, 0.72], [0.5, 0.5], [0.417, 0.32]] },
  { id: 'd-rotate', planId: 'plan-d', floorId: 'B1', phaseId: 'rotate', memberIds: ['m1', 'm3'], kind: 'rotate', points: [[0.417, 0.32], [0.55, 0.42], [0.6, 0.6], [0.53, 0.72]] },
  { id: 'd-rotate-1f', planId: 'plan-d', floorId: '1F', phaseId: 'rotate', memberIds: ['m1', 'm3'], kind: 'rotate', points: [[0.47, 0.86], [0.45, 0.7], [0.45, 0.54]] },
];

export const PLANS: TacticalPlan[] = [
  {
    id: 'plan-a',
    name: '方案 A · 西侧主攻',
    tag: '垂直破拆',
    summary: '从 1F 出纳台垂直打开地板，直接落入 B1 金库 A 点，避开东侧封锁门。',
    mode: 'attack',
    priority: 1,
    duration: '约 88 秒',
    requirements: ['Sledge 破拆锤', '无人机确认北侧天井', '两人交叉封服务器房通道'],
    evidenceIds: ['i1', 'i2', 'i3', 'i5'],
    routes: A_ROUTES,
    anchors: [{ id: 'A', floorId: 'B1', x: 0.417, y: 0.294, label: 'A 目标点' }],
    staging: { m1: [0.2, 0.85], m2: [0.2, 0.85], m3: [0.2, 0.85], m4: [0.2, 0.85], m5: [0.2, 0.85] },
  },
  {
    id: 'plan-b',
    name: '方案 B · 东侧牵制',
    tag: '快速突入',
    summary: '两人在东侧门制造压力，主力经员工区与主走廊夹击 1F 出纳台 B 点。',
    mode: 'attack',
    priority: 2,
    duration: '约 92 秒',
    requirements: ['Thermite 外墙爆破', '主走廊控制', '服务器房烟雾掩护'],
    evidenceIds: ['i1', 'i4'],
    routes: B_ROUTES,
    anchors: [{ id: 'B', floorId: '1F', x: 0.45, y: 0.542, label: 'B 目标点' }],
    staging: { m1: [0.2, 0.85], m2: [0.2, 0.85], m3: [0.2, 0.85], m4: [0.2, 0.85], m5: [0.2, 0.85] },
  },
  {
    id: 'plan-d',
    name: '防守 · 双点收缩',
    tag: '守点轮转',
    summary: '以 1F 出纳台 B 点为主守，B1 金库 A 点放两人迟滞；听到东侧突破即刻沿主楼梯回防。',
    mode: 'defend',
    priority: 1,
    duration: '约 88 秒',
    requirements: ['出纳台加固墙', '主楼梯信息位', '回防窗口 8 秒'],
    evidenceIds: ['i1', 'i2'],
    routes: DEF_ROUTES,
    anchors: [
      { id: 'B', floorId: '1F', x: 0.45, y: 0.542, label: 'B 防守点' },
      { id: 'A', floorId: 'B1', x: 0.417, y: 0.294, label: 'A 迟滞点' },
    ],
    staging: { m1: [0.53, 0.74], m2: [0.47, 0.86], m3: [0.53, 0.74], m4: [0.47, 0.86], m5: [0.45, 0.55] },
  },
];

export interface EnemyPin {
  id: string;
  floorId: FloorId;
  x: number;
  y: number;
  label: string;
  evidenceId: string;
  certainty: '已观察' | '待确认';
}

export const ENEMY_PINS: EnemyPin[] = [
  { id: 'e1', floorId: 'B1', x: 0.55, y: 0.38, label: 'B1 金库侧 · 1 人', evidenceId: 'i1', certainty: '待确认' },
  { id: 'e2', floorId: '1F', x: 0.86, y: 0.62, label: '东侧门 · 已封堵', evidenceId: 'i2', certainty: '已观察' },
  { id: 'e3', floorId: 'B1', x: 0.6, y: 0.368, label: '服务器房 · 至少 1 人', evidenceId: 'i4', certainty: '待确认' },
];

export const OPERATOR_SUGGESTIONS = [
  { operatorId: 'hibana', gap: '远程破拆', reason: '可隔层打开金库顶板，减少贴脸破拆风险。' },
  { operatorId: 'twitch', gap: '情报验证', reason: '无人机可先验证金库侧与服务器房两条待确认情报。' },
  { operatorId: 'thatcher', gap: '反道具掩护', reason: '压制守方摄像头与电子陷阱，配合主攻窗口。' },
];

export const RISKS = [
  { level: '高', text: '跨层回防窗口仅 8 秒，主楼梯被控即断线', evidence: 'i3' },
  { level: '中', text: '金库侧人数未确认，可能为双人前压', evidence: 'i1' },
  { level: '低', text: '破拆资源集中在 Sledge，倒地后无备用入口', evidence: 'i5' },
];

/** 简单规则：从原始语句中解析楼层与房间（仅用于演示） */
export function parseIntel(text: string): { floorId?: FloorId; roomId?: string } {
  const map: Array<[RegExp, FloorId, string]> = [
    [/金库|vault/i, 'B1', 'b1-vault'],
    [/服务器|机房|server/i, 'B1', 'b1-server'],
    [/车库|地下入口/, 'B1', 'b1-garage'],
    [/东侧|员工|办公|安保/, '1F', /东侧/.test(text) ? '1f-eastdoor' : '1f-office'],
    [/出纳|B\s*点/i, '1F', '1f-tellers'],
    [/楼梯/, /B1/i.test(text) ? 'B1' : /2F/i.test(text) ? '2F' : '1F', /B1/i.test(text) ? 'b1-stair' : /2F/i.test(text) ? '2f-stair' : '1f-stair'],
    [/天台|行长|会议/, '2F', /天台/.test(text) ? '2f-terrace' : /会议/.test(text) ? '2f-meeting' : '2f-ceo'],
    [/A\s*点/i, 'B1', 'b1-vault'],
  ];
  for (const [re, floorId, roomId] of map) {
    if (re.test(text)) return { floorId, roomId };
  }
  return {};
}

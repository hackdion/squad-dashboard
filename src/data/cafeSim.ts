/** Café-Sim：自绘示意场景（非真实关卡结构），坐标统一归一化到 0-1 */
export type FloorId = 'B1' | '1F' | '2F';

export interface Room {
  id: string;
  floorId: FloorId;
  name: string;
  rect: [number, number, number, number];
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
  rooms: Room[];
  nodes: NavNode[];
}

export interface SiteMark {
  id: 'A' | 'B';
  floorId: FloorId;
  x: number;
  y: number;
}

export const SITES: SiteMark[] = [
  { id: 'A', floorId: '2F', x: 0.28, y: 0.36 },
  { id: 'B', floorId: '1F', x: 0.59, y: 0.24 },
];

export const FLOORS: Floor[] = [
  {
    id: 'B1',
    label: 'B1',
    name: '地下层',
    rooms: [
      { id: 'b1-wine', floorId: 'B1', name: '酒窖', rect: [0.14, 0.1, 0.34, 0.24] },
      { id: 'b1-service', floorId: 'B1', name: '服务通道', rect: [0.48, 0.1, 0.38, 0.24], kind: 'corridor' },
      { id: 'b1-storage', floorId: 'B1', name: '储藏间', rect: [0.14, 0.34, 0.28, 0.22] },
      { id: 'b1-cold', floorId: 'B1', name: '冷库', rect: [0.42, 0.34, 0.24, 0.22] },
      { id: 'b1-utility', floorId: 'B1', name: '设备间', rect: [0.14, 0.56, 0.28, 0.26] },
      { id: 'b1-ramp', floorId: 'B1', name: '车库坡道', rect: [0.42, 0.56, 0.24, 0.26] },
      { id: 'b1-hall', floorId: 'B1', name: '地下走廊', rect: [0.66, 0.34, 0.2, 0.24], kind: 'corridor' },
      { id: 'b1-stair', floorId: 'B1', name: '主楼梯', rect: [0.66, 0.58, 0.2, 0.24], kind: 'stair' },
    ],
    nodes: [
      { id: 'b1-n-wine', floorId: 'B1', x: 0.3, y: 0.24, roomId: 'b1-wine' },
      { id: 'b1-n-service', floorId: 'B1', x: 0.6, y: 0.22, roomId: 'b1-service' },
      { id: 'b1-n-storage', floorId: 'B1', x: 0.28, y: 0.44, roomId: 'b1-storage' },
      { id: 'b1-n-cold', floorId: 'B1', x: 0.54, y: 0.44, roomId: 'b1-cold' },
      { id: 'b1-n-utility', floorId: 'B1', x: 0.28, y: 0.68, roomId: 'b1-utility' },
      { id: 'b1-n-ramp', floorId: 'B1', x: 0.54, y: 0.68, roomId: 'b1-ramp' },
      { id: 'b1-n-hall', floorId: 'B1', x: 0.76, y: 0.44, roomId: 'b1-hall' },
      { id: 'b1-n-stair', floorId: 'B1', x: 0.76, y: 0.7, roomId: 'b1-stair' },
    ],
  },
  {
    id: '1F',
    label: '1F',
    name: '一层',
    rooms: [
      { id: '1f-cafe', floorId: '1F', name: '咖啡厅', rect: [0.14, 0.1, 0.34, 0.24] },
      { id: '1f-kitchen', floorId: '1F', name: '厨房 / B 点', rect: [0.48, 0.1, 0.22, 0.24], kind: 'site' },
      { id: '1f-back', floorId: '1F', name: '后厅', rect: [0.7, 0.1, 0.16, 0.24] },
      { id: '1f-atrium', floorId: '1F', name: '中庭', rect: [0.14, 0.34, 0.34, 0.14], kind: 'open' },
      { id: '1f-corr', floorId: '1F', name: '主走廊', rect: [0.48, 0.34, 0.38, 0.14], kind: 'corridor' },
      { id: '1f-entrance', floorId: '1F', name: '入口大厅', rect: [0.14, 0.48, 0.28, 0.34] },
      { id: '1f-lounge', floorId: '1F', name: '休息室', rect: [0.42, 0.48, 0.24, 0.34] },
      { id: '1f-eastdoor', floorId: '1F', name: '东侧门', rect: [0.66, 0.48, 0.2, 0.1], kind: 'corridor' },
      { id: '1f-stair', floorId: '1F', name: '主楼梯', rect: [0.66, 0.58, 0.2, 0.24], kind: 'stair' },
    ],
    nodes: [
      { id: '1f-n-entrance', floorId: '1F', x: 0.28, y: 0.66, roomId: '1f-entrance' },
      { id: '1f-n-atrium', floorId: '1F', x: 0.3, y: 0.41, roomId: '1f-atrium' },
      { id: '1f-n-cafe', floorId: '1F', x: 0.3, y: 0.28, roomId: '1f-cafe' },
      { id: '1f-n-kitchen', floorId: '1F', x: 0.59, y: 0.24, roomId: '1f-kitchen' },
      { id: '1f-n-back', floorId: '1F', x: 0.78, y: 0.22, roomId: '1f-back' },
      { id: '1f-n-corrw', floorId: '1F', x: 0.55, y: 0.41, roomId: '1f-corr' },
      { id: '1f-n-corre', floorId: '1F', x: 0.72, y: 0.41, roomId: '1f-corr' },
      { id: '1f-n-eastdoor', floorId: '1F', x: 0.78, y: 0.53, roomId: '1f-eastdoor' },
      { id: '1f-n-lounge', floorId: '1F', x: 0.54, y: 0.66, roomId: '1f-lounge' },
      { id: '1f-n-stair', floorId: '1F', x: 0.76, y: 0.7, roomId: '1f-stair' },
    ],
  },
  {
    id: '2F',
    label: '2F',
    name: '二层',
    rooms: [
      { id: '2f-balcony', floorId: '2F', name: '北侧阳台', rect: [0.14, 0.1, 0.3, 0.14] },
      { id: '2f-piano', floorId: '2F', name: '钢琴房', rect: [0.44, 0.1, 0.26, 0.24] },
      { id: '2f-study', floorId: '2F', name: '书房', rect: [0.7, 0.1, 0.16, 0.38] },
      { id: '2f-bar', floorId: '2F', name: '鸡尾酒廊 / A 点', rect: [0.14, 0.24, 0.3, 0.24], kind: 'site' },
      { id: '2f-atrium', floorId: '2F', name: '中庭', rect: [0.44, 0.34, 0.26, 0.14], kind: 'open' },
      { id: '2f-corr', floorId: '2F', name: '主走廊', rect: [0.14, 0.48, 0.72, 0.1], kind: 'corridor' },
      { id: '2f-rest', floorId: '2F', name: '休息室', rect: [0.14, 0.58, 0.26, 0.24] },
      { id: '2f-display', floorId: '2F', name: '展柜室', rect: [0.4, 0.58, 0.26, 0.24] },
      { id: '2f-stair', floorId: '2F', name: '主楼梯', rect: [0.66, 0.58, 0.2, 0.24], kind: 'stair' },
    ],
    nodes: [
      { id: '2f-n-entry', floorId: '2F', x: 0.18, y: 0.53, roomId: '2f-corr' },
      { id: '2f-n-c1', floorId: '2F', x: 0.34, y: 0.53, roomId: '2f-corr' },
      { id: '2f-n-c2', floorId: '2F', x: 0.52, y: 0.53, roomId: '2f-corr' },
      { id: '2f-n-c3', floorId: '2F', x: 0.72, y: 0.53, roomId: '2f-corr' },
      { id: '2f-n-balcony', floorId: '2F', x: 0.3, y: 0.18, roomId: '2f-balcony' },
      { id: '2f-n-piano', floorId: '2F', x: 0.57, y: 0.2, roomId: '2f-piano' },
      { id: '2f-n-bar', floorId: '2F', x: 0.28, y: 0.36, roomId: '2f-bar' },
      { id: '2f-n-study', floorId: '2F', x: 0.78, y: 0.3, roomId: '2f-study' },
      { id: '2f-n-halls', floorId: '2F', x: 0.46, y: 0.7, roomId: '2f-corr' },
      { id: '2f-n-rest', floorId: '2F', x: 0.27, y: 0.7, roomId: '2f-rest' },
      { id: '2f-n-display', floorId: '2F', x: 0.57, y: 0.7, roomId: '2f-display' },
      { id: '2f-n-stair', floorId: '2F', x: 0.76, y: 0.7, roomId: '2f-stair' },
    ],
  },
];

export const EDGES: Edge[] = [
  { id: 'e-b1-1', from: 'b1-n-wine', to: 'b1-n-storage', type: 'door', enabled: true },
  { id: 'e-b1-2', from: 'b1-n-service', to: 'b1-n-cold', type: 'door', enabled: true },
  { id: 'e-b1-3', from: 'b1-n-storage', to: 'b1-n-cold', type: 'walk', enabled: true },
  { id: 'e-b1-4', from: 'b1-n-storage', to: 'b1-n-utility', type: 'door', enabled: true },
  { id: 'e-b1-5', from: 'b1-n-cold', to: 'b1-n-ramp', type: 'door', enabled: true },
  { id: 'e-b1-6', from: 'b1-n-utility', to: 'b1-n-ramp', type: 'walk', enabled: true },
  { id: 'e-b1-7', from: 'b1-n-service', to: 'b1-n-hall', type: 'door', enabled: true },
  { id: 'e-b1-8', from: 'b1-n-cold', to: 'b1-n-hall', type: 'walk', enabled: false },
  { id: 'e-b1-9', from: 'b1-n-hall', to: 'b1-n-stair', type: 'stair', enabled: true },
  { id: 'e-1f-1', from: '1f-n-entrance', to: '1f-n-atrium', type: 'door', enabled: true },
  { id: 'e-1f-2', from: '1f-n-atrium', to: '1f-n-cafe', type: 'door', enabled: true },
  { id: 'e-1f-3', from: '1f-n-atrium', to: '1f-n-corrw', type: 'walk', enabled: true },
  { id: 'e-1f-4', from: '1f-n-cafe', to: '1f-n-kitchen', type: 'door', enabled: true },
  { id: 'e-1f-5', from: '1f-n-kitchen', to: '1f-n-corrw', type: 'door', enabled: true },
  { id: 'e-1f-6', from: '1f-n-corrw', to: '1f-n-corre', type: 'walk', enabled: true },
  { id: 'e-1f-7', from: '1f-n-kitchen', to: '1f-n-back', type: 'door', enabled: true },
  { id: 'e-1f-8', from: '1f-n-corre', to: '1f-n-back', type: 'door', enabled: true },
  { id: 'e-1f-9', from: '1f-n-corre', to: '1f-n-eastdoor', type: 'door', enabled: true },
  { id: 'e-1f-10', from: '1f-n-corrw', to: '1f-n-lounge', type: 'door', enabled: true },
  { id: 'e-1f-11', from: '1f-n-corre', to: '1f-n-stair', type: 'stair', enabled: true },
  { id: 'e-1f-12', from: '1f-n-eastdoor', to: '1f-n-stair', type: 'walk', enabled: true },
  { id: 'e-2f-1', from: '2f-n-entry', to: '2f-n-c1', type: 'door', enabled: true },
  { id: 'e-2f-2', from: '2f-n-c1', to: '2f-n-c2', type: 'walk', enabled: true },
  { id: 'e-2f-3', from: '2f-n-c2', to: '2f-n-c3', type: 'walk', enabled: true },
  { id: 'e-2f-4', from: '2f-n-c1', to: '2f-n-balcony', type: 'door', enabled: true },
  { id: 'e-2f-5', from: '2f-n-balcony', to: '2f-n-piano', type: 'door', enabled: true },
  { id: 'e-2f-6', from: '2f-n-c2', to: '2f-n-piano', type: 'door', enabled: true },
  { id: 'e-2f-7', from: '2f-n-c1', to: '2f-n-bar', type: 'door', enabled: true },
  { id: 'e-2f-8', from: '2f-n-c3', to: '2f-n-study', type: 'door', enabled: true },
  { id: 'e-2f-9', from: '2f-n-c2', to: '2f-n-halls', type: 'walk', enabled: true },
  { id: 'e-2f-10', from: '2f-n-halls', to: '2f-n-rest', type: 'door', enabled: true },
  { id: 'e-2f-11', from: '2f-n-halls', to: '2f-n-display', type: 'door', enabled: true },
  { id: 'e-2f-12', from: '2f-n-c3', to: '2f-n-stair', type: 'stair', enabled: true },
  { id: 'e-2f-13', from: '2f-n-bar', to: '2f-n-study', type: 'breach', enabled: true, requiresAbility: 'sledge' },
  // 跨层：主楼梯
  { id: 'e-x-1', from: '1f-n-stair', to: '2f-n-stair', type: 'stair', enabled: true },
  { id: 'e-x-2', from: 'b1-n-stair', to: '1f-n-stair', type: 'stair', enabled: true },
  // 垂直破拆：1F 咖啡厅 -> 2F 酒廊
  { id: 'e-x-3', from: '1f-n-cafe', to: '2f-n-bar', type: 'hatch', enabled: true, requiresAbility: 'sledge' },
];

export interface Phase {
  id: 'recon' | 'deploy' | 'breach' | 'control' | 'rotate';
  label: string;
  start: number;
  end: number;
  hint: string;
}

export const PHASES: Phase[] = [
  { id: 'recon', label: '侦察', start: 0, end: 20, hint: '无人机确认西侧与东侧入口' },
  { id: 'deploy', label: '部署', start: 20, end: 45, hint: '五人于 1F 咖啡厅外侧集结' },
  { id: 'breach', label: '突破', start: 45, end: 65, hint: '垂直破拆进入 2F 鸡尾酒廊' },
  { id: 'control', label: '控点', start: 65, end: 80, hint: '占据 A 点并封住钢琴房门' },
  { id: 'rotate', label: '回防', start: 80, end: 88, hint: '沿主走廊撤向主楼梯' },
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
  { id: 'i1', t: 12, speaker: 'Kira', speakerId: 'm4', text: '2F 西侧入口有人，脚步很轻', floorId: '2F', roomId: '2f-bar', kind: 'enemy', status: 'pending', source: 'demo' },
  { id: 'i2', t: 22, speaker: 'Cloudy', speakerId: 'm2', text: '东侧门被封住了，得换条路', floorId: '1F', roomId: '1f-eastdoor', kind: 'blocked', status: 'confirmed', source: 'demo' },
  { id: 'i3', t: 34, speaker: '我', speakerId: 'm1', text: '先用无人机确认，再走西梯上去', floorId: '2F', roomId: '2f-corr', kind: 'order', status: 'confirmed', source: 'demo' },
  { id: 'i4', t: 46, speaker: 'Momo', speakerId: 'm3', text: 'A 点至少两名守方，钢琴房还有一个', floorId: '2F', roomId: '2f-piano', kind: 'enemy', status: 'pending', source: 'demo' },
  { id: 'i5', t: 58, speaker: 'Lemon', speakerId: 'm5', text: '西侧可破坏墙已打开，可以进', floorId: '2F', roomId: '2f-bar', kind: 'clear', status: 'confirmed', source: 'demo' },
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
  { id: 'a-recon', planId: 'plan-a', floorId: '1F', phaseId: 'recon', memberIds: ['m5'], kind: 'intel', points: [[0.28, 0.66], [0.3, 0.41], [0.3, 0.28], [0.55, 0.41], [0.72, 0.41]] },
  { id: 'a-deploy', planId: 'plan-a', floorId: '1F', phaseId: 'deploy', memberIds: ['m1', 'm2', 'm3', 'm4'], kind: 'attack', points: [[0.28, 0.66], [0.3, 0.45], [0.31, 0.32]] },
  { id: 'a-breach', planId: 'plan-a', floorId: '2F', phaseId: 'breach', memberIds: ['m1', 'm2', 'm3', 'm4'], kind: 'attack', points: [[0.24, 0.44], [0.28, 0.38], [0.36, 0.37]] },
  { id: 'a-control', planId: 'plan-a', floorId: '2F', phaseId: 'control', memberIds: ['m1', 'm2'], kind: 'attack', points: [[0.36, 0.37], [0.3, 0.36], [0.34, 0.42]] },
  { id: 'a-control-2', planId: 'plan-a', floorId: '2F', phaseId: 'control', memberIds: ['m3', 'm4'], kind: 'attack', points: [[0.36, 0.37], [0.48, 0.4], [0.55, 0.38]] },
  { id: 'a-rotate', planId: 'plan-a', floorId: '2F', phaseId: 'rotate', memberIds: ['m1', 'm2', 'm3', 'm4'], kind: 'rotate', points: [[0.32, 0.38], [0.46, 0.47], [0.52, 0.53], [0.72, 0.53], [0.76, 0.7]] },
];

const B_ROUTES: RouteSeg[] = [
  { id: 'b-recon', planId: 'plan-b', floorId: '1F', phaseId: 'recon', memberIds: ['m5'], kind: 'intel', points: [[0.28, 0.66], [0.54, 0.66], [0.55, 0.41], [0.72, 0.41], [0.78, 0.53]] },
  { id: 'b-deploy', planId: 'plan-b', floorId: '1F', phaseId: 'deploy', memberIds: ['m1', 'm2', 'm4'], kind: 'attack', points: [[0.28, 0.66], [0.54, 0.66], [0.55, 0.41], [0.72, 0.41]] },
  { id: 'b-breach', planId: 'plan-b', floorId: '2F', phaseId: 'breach', memberIds: ['m1', 'm2', 'm4'], kind: 'attack', points: [[0.76, 0.7], [0.72, 0.53], [0.78, 0.34]] },
  { id: 'b-control', planId: 'plan-b', floorId: '2F', phaseId: 'control', memberIds: ['m1'], kind: 'attack', points: [[0.78, 0.34], [0.66, 0.36], [0.56, 0.38]] },
  { id: 'b-control-2', planId: 'plan-b', floorId: '2F', phaseId: 'control', memberIds: ['m2', 'm4'], kind: 'attack', points: [[0.78, 0.34], [0.72, 0.3], [0.58, 0.3]] },
  { id: 'b-rotate', planId: 'plan-b', floorId: '2F', phaseId: 'rotate', memberIds: ['m1', 'm2', 'm4'], kind: 'rotate', points: [[0.6, 0.36], [0.72, 0.5], [0.76, 0.7]] },
];

const DEF_ROUTES: RouteSeg[] = [
  { id: 'd-deploy', planId: 'plan-d', floorId: '1F', phaseId: 'deploy', memberIds: ['m2', 'm4'], kind: 'defend', points: [[0.54, 0.66], [0.55, 0.41], [0.59, 0.28]] },
  { id: 'd-hold', planId: 'plan-d', floorId: '2F', phaseId: 'control', memberIds: ['m1', 'm3'], kind: 'defend', points: [[0.76, 0.7], [0.72, 0.53], [0.32, 0.42]] },
  { id: 'd-rotate', planId: 'plan-d', floorId: '2F', phaseId: 'rotate', memberIds: ['m1', 'm3'], kind: 'rotate', points: [[0.32, 0.42], [0.48, 0.5], [0.7, 0.53], [0.76, 0.7]] },
  { id: 'd-rotate-1f', planId: 'plan-d', floorId: '1F', phaseId: 'rotate', memberIds: ['m1', 'm3'], kind: 'rotate', points: [[0.76, 0.7], [0.72, 0.41], [0.59, 0.28]] },
];

export const PLANS: TacticalPlan[] = [
  {
    id: 'plan-a',
    name: '方案 A · 西侧主攻',
    tag: '垂直破拆',
    summary: '从 1F 咖啡厅垂直作业打开地板，直接进入 2F 鸡尾酒廊 A 点，避开东侧封锁门。',
    mode: 'attack',
    priority: 1,
    duration: '约 88 秒',
    requirements: ['Sledge 破拆锤', '无人机确认西侧', '两人交叉封钢琴房门'],
    evidenceIds: ['i1', 'i2', 'i3', 'i5'],
    routes: A_ROUTES,
    anchors: [
      { id: 'A', floorId: '2F', x: 0.28, y: 0.36, label: 'A 目标点' },
    ],
    staging: { m1: [0.28, 0.66], m2: [0.28, 0.66], m3: [0.28, 0.66], m4: [0.28, 0.66], m5: [0.28, 0.66] },
  },
  {
    id: 'plan-b',
    name: '方案 B · 东侧牵制',
    tag: '快速突入',
    summary: '两人在东侧门制造压力，主力经主楼梯上 2F，从书房与钢琴房夹击 A 点。',
    mode: 'attack',
    priority: 2,
    duration: '约 92 秒',
    requirements: ['Thermite 外墙爆破', '主楼梯控制', '钢琴房烟雾掩护'],
    evidenceIds: ['i1', 'i4'],
    routes: B_ROUTES,
    anchors: [
      { id: 'A', floorId: '2F', x: 0.28, y: 0.36, label: 'A 目标点' },
    ],
    staging: { m1: [0.28, 0.66], m2: [0.28, 0.66], m3: [0.28, 0.66], m4: [0.28, 0.66], m5: [0.28, 0.66] },
  },
  {
    id: 'plan-d',
    name: '防守 · 双点收缩',
    tag: '守点轮转',
    summary: '以 1F 厨房 B 点为主守，2F A 点放两人迟滞；听到东侧突破即刻沿主楼梯回防。',
    mode: 'defend',
    priority: 1,
    duration: '约 88 秒',
    requirements: ['厨房加固墙', '主楼梯信息位', '回防窗口 8 秒'],
    evidenceIds: ['i1', 'i2'],
    routes: DEF_ROUTES,
    anchors: [
      { id: 'B', floorId: '1F', x: 0.59, y: 0.24, label: 'B 防守点' },
      { id: 'A', floorId: '2F', x: 0.28, y: 0.36, label: 'A 迟滞点' },
    ],
    staging: { m1: [0.76, 0.7], m2: [0.54, 0.66], m3: [0.76, 0.7], m4: [0.54, 0.66], m5: [0.28, 0.66] },
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
  { id: 'e1', floorId: '2F', x: 0.24, y: 0.42, label: '2F 西侧入口 · 1 人', evidenceId: 'i1', certainty: '待确认' },
  { id: 'e2', floorId: '1F', x: 0.78, y: 0.53, label: '东侧门 · 已封堵', evidenceId: 'i2', certainty: '已观察' },
  { id: 'e3', floorId: '2F', x: 0.56, y: 0.3, label: '钢琴房 · 至少 1 人', evidenceId: 'i4', certainty: '待确认' },
];

export const OPERATOR_SUGGESTIONS = [
  { operatorId: 'hibana', gap: '远程破拆', reason: '可隔层打开 A 点地板，减少贴脸破拆风险。' },
  { operatorId: 'twitch', gap: '情报验证', reason: '无人机可先验证西侧入口与钢琴房的两条待确认情报。' },
  { operatorId: 'thatcher', gap: '反道具掩护', reason: '压制守方摄像头与电子陷阱，配合主攻窗口。' },
];

export const RISKS = [
  { level: '高', text: '跨层回防窗口仅 8 秒，主楼梯被控即断线', evidence: 'i3' },
  { level: '中', text: '西侧入口人数未确认，可能为双人前压', evidence: 'i1' },
  { level: '低', text: '破拆资源集中在 Sledge，倒地后无备用入口', evidence: 'i5' },
];

/** 简单规则：从原始语句中解析楼层与房间（仅用于演示） */
export function parseIntel(text: string): { floorId?: FloorId; roomId?: string } {
  const map: Array<[RegExp, FloorId, string]> = [
    [/西侧|酒廊|阳台/, '2F', '2f-bar'],
    [/钢琴|东侧|书房/, /钢琴/.test(text) ? '2F' : '1F', /钢琴/.test(text) ? '2f-piano' : '1f-eastdoor'],
    [/厨房|B\s*点/i, '1F', '1f-kitchen'],
    [/楼梯/, /2F/i.test(text) ? '2F' : '1F', /2F/i.test(text) ? '2f-stair' : '1f-stair'],
    [/入口|大厅/, '1F', '1f-entrance'],
    [/A\s*点/i, '2F', '2f-bar'],
  ];
  for (const [re, floorId, roomId] of map) {
    if (re.test(text)) return { floorId, roomId };
  }
  return {};
}

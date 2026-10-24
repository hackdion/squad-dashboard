import type { MapInfo, Operator } from '../domain/types';

export const OPERATORS: Operator[] = [
  // 进攻方
  { id: 'sledge', name: 'Sledge', cn: '大锤', side: 'attack', role: '突破手', ability: '战术突破锤', tags: ['破拆', '垂直压制'], radar: { attack: 88, control: 72, intel: 58, survival: 80, support: 66 } },
  { id: 'thermite', name: 'Thermite', cn: '高热', side: 'attack', role: '硬突破', ability: '铝热爆破', tags: ['破拆', '外墙'], radar: { attack: 90, control: 78, intel: 52, survival: 62, support: 74 } },
  { id: 'thatcher', name: 'Thatcher', cn: '撒切尔', side: 'attack', role: '电子压制', ability: 'EMP 手雷', tags: ['反道具', '掩护'], radar: { attack: 66, control: 74, intel: 86, survival: 70, support: 88 } },
  { id: 'ash', name: 'Ash', cn: '灰烬', side: 'attack', role: '快速突入', ability: '爆破弹', tags: ['突入', '破拆'], radar: { attack: 92, control: 64, intel: 60, survival: 78, support: 58 } },
  { id: 'dokkaebi', name: 'Dokkaebi', cn: '女鬼', side: 'attack', role: '信息支援', ability: '逻辑炸弹', tags: ['情报', '干扰'], radar: { attack: 60, control: 68, intel: 94, survival: 62, support: 82 } },
  { id: 'twitch', name: 'Twitch', cn: '电爪', side: 'attack', role: '电子压制', ability: '电击无人机', tags: ['情报', '反道具'], radar: { attack: 70, control: 72, intel: 90, survival: 66, support: 76 } },
  { id: 'hibana', name: 'Hibana', cn: '火花', side: 'attack', role: '硬突破', ability: 'X-KAIROS', tags: ['破拆', '远程'], radar: { attack: 84, control: 76, intel: 64, survival: 68, support: 72 } },
  // 防守方
  { id: 'castle', name: 'Castle', cn: '堡垒', side: 'defense', role: '区域封锁', ability: '防弹装甲板', tags: ['封锁', '守点'], radar: { attack: 56, control: 90, intel: 62, survival: 82, support: 70 } },
  { id: 'doc', name: 'Doc', cn: '医生', side: 'defense', role: '支援', ability: '激素手枪', tags: ['治疗', '续航'], radar: { attack: 58, control: 62, intel: 66, survival: 94, support: 88 } },
  { id: 'mute', name: 'Mute', cn: '静音', side: 'defense', role: '电子压制', ability: '信号干扰器', tags: ['反情报', '封锁'], radar: { attack: 54, control: 86, intel: 88, survival: 72, support: 76 } },
  { id: 'smoke', name: 'Smoke', cn: '烟雾', side: 'defense', role: '区域封锁', ability: '毒气手雷', tags: ['封锁', '拖延'], radar: { attack: 62, control: 92, intel: 60, survival: 78, support: 68 } },
  { id: 'pulse', name: 'Pulse', cn: '脉冲', side: 'defense', role: '情报', ability: '心跳传感器', tags: ['情报', '预警'], radar: { attack: 60, control: 66, intel: 96, survival: 70, support: 72 } },
  { id: 'rook', name: 'Rook', cn: '车臣', side: 'defense', role: '支援', ability: '装甲板', tags: ['护甲', '守点'], radar: { attack: 58, control: 78, intel: 58, survival: 92, support: 84 } },
];

export const operatorById = (id: string) => OPERATORS.find((o) => o.id === id);

export const MAPS: MapInfo[] = [
  { id: 'oregon', cn: '奥勒冈乡间屋宅', en: 'OREGON', image: 'maps/oregon.jpg', floors: 2, sites: ['A', 'B'] },
  { id: 'bank', cn: '银行', en: 'BANK', image: 'maps/bank.jpg', floors: 3, sites: ['A', 'B'] },
  { id: 'consulate', cn: '领事馆', en: 'CONSULATE', image: 'maps/consulate.jpg', floors: 3, sites: ['A', 'B'] },
  { id: 'chalet', cn: '木屋', en: 'CHALET', image: 'maps/chalet.jpg', floors: 3, sites: ['A', 'B'] },
];

export const mapById = (id: string) => MAPS.find((m) => m.id === id);

export const mapName = (id: string) => mapById(id)?.cn ?? id;

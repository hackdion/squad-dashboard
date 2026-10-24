import { useMemo, useRef, useState } from 'react';
import { Crosshair, Minus, Plus, RotateCcw } from 'lucide-react';
import type { Floor, IntelEvent, RouteSeg, TacticalPlan } from '../../data/cafeSim';
import { ENEMY_PINS, PHASES, SITES } from '../../data/cafeSim';
import type { Member } from '../../domain/types';

const W = 1000;
const H = 620;
const sx = (x: number) => x * W;
const sy = (y: number) => y * H;

function pointAlong(points: Array<[number, number]>, progress: number): [number, number] {
  if (points.length === 0) return [0, 0];
  if (points.length === 1) return points[0];
  const segs = points.slice(1).map((p, i) => {
    const a = points[i];
    const len = Math.hypot(p[0] - a[0], p[1] - a[1]);
    return { a, b: p, len };
  });
  const total = segs.reduce((s, x) => s + x.len, 0);
  let dist = Math.max(0, Math.min(1, progress)) * total;
  for (const seg of segs) {
    if (dist <= seg.len) {
      const r = seg.len ? dist / seg.len : 0;
      return [seg.a[0] + (seg.b[0] - seg.a[0]) * r, seg.a[1] + (seg.b[1] - seg.a[1]) * r];
    }
    dist -= seg.len;
  }
  return points[points.length - 1];
}

function pathOf(points: Array<[number, number]>): string {
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'}${sx(p[0]).toFixed(1)},${sy(p[1]).toFixed(1)}`).join(' ');
}

function phaseIndex(phaseId: string) {
  return PHASES.findIndex((p) => p.id === phaseId);
}

function routeColor(kind: RouteSeg['kind']) {
  switch (kind) {
    case 'rotate':
      return '#F8C94A';
    case 'defend':
      return '#33D6A6';
    case 'intel':
      return '#7DD3FC';
    default:
      return '#22D3EE';
  }
}

interface Props {
  floor: Floor;
  plan: TacticalPlan | null;
  phaseId: string;
  t: number;
  members: Member[];
  showRoutes: boolean;
  showPins: boolean;
  showMembers: boolean;
  showLabels: boolean;
  intel: IntelEvent[];
  highlightMember?: string | null;
}

export default function TacticalMap(props: Props) {
  const { floor, plan, phaseId, t, members, showRoutes, showPins, showMembers, showLabels, intel, highlightMember } = props;
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const clampScale = (v: number) => Math.min(3.2, Math.max(1, v));
  const currentPhase = PHASES.find((p) => p.id === phaseId) ?? PHASES[0];
  const phaseNo = phaseIndex(phaseId);

  const floorRoutes = useMemo(
    () => (plan ? plan.routes.filter((r) => r.floorId === floor.id) : []),
    [plan, floor.id],
  );

  const markerInfo = useMemo(() => {
    if (!showMembers || !plan) return { markers: [], offFloor: 0 };
    const markers: Array<{ m: Member; pos: [number, number]; active: boolean }> = [];
    let offFloor = 0;
    for (const m of members) {
      const own = plan.routes
        .filter((r) => r.memberIds.includes(m.id))
        .sort((a, b) => phaseIndex(a.phaseId) - phaseIndex(b.phaseId));
      const passed = own.filter((r) => phaseIndex(r.phaseId) <= phaseNo);
      const active = passed[passed.length - 1];
      if (active && active.floorId !== floor.id) {
        offFloor += 1;
        continue;
      }
      let pos: [number, number];
      let isActive = false;
      if (active) {
        const ph = PHASES.find((p) => p.id === active.phaseId)!;
        const p = Math.max(0, Math.min(1, (t - ph.start) / (ph.end - ph.start)));
        pos = pointAlong(active.points, p);
        isActive = active.phaseId === phaseId;
      } else {
        pos = plan.staging[m.id] ?? [0.28, 0.66];
      }
      markers.push({ m, pos, active: isActive });
    }
    return { markers, offFloor };
  }, [plan, members, floor.id, phaseNo, phaseId, t, showMembers]);

  const pendingIntel = intel.filter((i) => i.status === 'pending');

  return (
    <div className="tac-map">
      <div className="tac-map__canvas">
        <div
          className="tac-map__stage"
          style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})` }}
          onPointerDown={(e) => {
            drag.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
            (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
          }}
          onPointerMove={(e) => {
            if (!drag.current) return;
            setOffset({ x: drag.current.ox + e.clientX - drag.current.x, y: drag.current.oy + e.clientY - drag.current.y });
          }}
          onPointerUp={() => {
            drag.current = null;
          }}
          onPointerCancel={() => {
            drag.current = null;
          }}
          onWheel={(e) => {
            setScale(clampScale(scale + (e.deltaY > 0 ? -0.12 : 0.12)));
          }}
        >
          <svg viewBox={`0 0 ${W} ${H}`} className="tac-map__svg" role="img" aria-label={`Café-Sim ${floor.label} 楼层战术地图`}>
            <defs>
              <pattern id="blueprint" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M40 0H0V40" fill="none" stroke="rgba(120,170,220,0.055)" strokeWidth="1" />
              </pattern>
              <pattern id="stairs" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="10" stroke="rgba(248,201,74,0.35)" strokeWidth="2" />
              </pattern>
              <filter id="glowCyan" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="6" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <marker id="arrowCyan" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
                <path d="M0,0 L7,3.5 L0,7 Z" fill="#22D3EE" />
              </marker>
              <marker id="arrowGold" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
                <path d="M0,0 L7,3.5 L0,7 Z" fill="#F8C94A" />
              </marker>
            </defs>

            <rect x="0" y="0" width={W} height={H} fill="#08131D" />
            <rect x="0" y="0" width={W} height={H} fill="url(#blueprint)" />

            {/* 楼层外轮廓 */}
            <rect x={sx(0.12)} y={sy(0.08)} width={sx(0.76)} height={sy(0.78)} fill="rgba(12,26,38,0.55)" stroke="rgba(148,196,226,0.22)" strokeWidth="2.5" />
            <rect x={sx(0.14)} y={sy(0.1)} width={sx(0.72)} height={sy(0.72)} fill="none" stroke="rgba(148,196,226,0.1)" strokeWidth="1" />

            {/* 房间 */}
            {floor.rooms.map((room) => {
              const [x, y, w, h] = room.rect;
              const isSite = room.kind === 'site';
              const isStair = room.kind === 'stair';
              const isOpen = room.kind === 'open' || room.kind === 'corridor';
              const active = hover === room.id || selected === room.id;
              return (
                <g
                  key={room.id}
                  onPointerEnter={() => setHover(room.id)}
                  onPointerLeave={() => setHover(null)}
                  onClick={() => setSelected(room.id === selected ? null : room.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <rect
                    x={sx(x)}
                    y={sy(y)}
                    width={sx(w)}
                    height={sy(h)}
                    fill={isStair ? 'url(#stairs)' : active ? 'rgba(34,211,238,0.13)' : isSite ? 'rgba(248,201,74,0.07)' : isOpen ? 'rgba(120,170,220,0.035)' : 'rgba(20,38,54,0.42)'}
                    stroke={active ? 'rgba(34,211,238,0.7)' : isSite ? 'rgba(248,201,74,0.4)' : 'rgba(148,196,226,0.26)'}
                    strokeWidth={active ? 2 : 1.2}
                  />
                  {showLabels && (
                    <text x={sx(x + w / 2)} y={sy(y + h / 2) + 4} textAnchor="middle" fontSize={isStair ? 12 : 13} fill={isSite ? '#F8C94A' : '#9CB0C6'} style={{ letterSpacing: '0.06em' }}>
                      {room.name}
                    </text>
                  )}
                </g>
              );
            })}

            {/* 目标点 */}
            {SITES.filter((s) => s.floorId === floor.id).map((site) => (
              <g key={site.id} transform={`translate(${sx(site.x)},${sy(site.y)})`}>
                <circle r="19" fill="rgba(248,201,74,0.12)" stroke="rgba(248,201,74,0.55)" strokeWidth="1.4" />
                <text textAnchor="middle" y="6" fontSize="17" fontFamily="Rajdhani, sans-serif" fontWeight="700" fill="#F8C94A">
                  {site.id}
                </text>
                <text textAnchor="middle" y="31" fontSize="10.5" fill="#9CB0C6">
                  {site.id === 'A' ? '目标点 · 2F' : '目标点 · 1F'}
                </text>
              </g>
            ))}

            {/* 防守锚点（防御方案） */}
            {plan?.mode === 'defend' &&
              plan.anchors
                .filter((a) => a.floorId === floor.id)
                .map((a) => (
                  <g key={a.id} transform={`translate(${sx(a.x)},${sy(a.y)})`}>
                    <path d="M0,-20 L17,-12 L17,6 C17,16 8,22 0,25 C-8,22 -17,16 -17,6 L-17,-12 Z" fill="rgba(51,214,166,0.16)" stroke="#33D6A6" strokeWidth="1.6" />
                    <text textAnchor="middle" y="4" fontSize="12" fontWeight="700" fill="#33D6A6" fontFamily="Rajdhani, sans-serif">
                      D
                    </text>
                    <text textAnchor="middle" y="40" fontSize="10" fill="#9CB0C6">
                      {a.label}
                    </text>
                  </g>
                ))}

            {/* 路线 */}
            {showRoutes &&
              plan &&
              floorRoutes.map((route) => {
                const idx = phaseIndex(route.phaseId);
                const isCurrent = route.phaseId === phaseId;
                const isPast = idx < phaseNo;
                const color = routeColor(route.kind);
                const marker = route.kind === 'rotate' ? 'url(#arrowGold)' : route.kind === 'defend' ? undefined : 'url(#arrowCyan)';
                const progress = Math.max(0, Math.min(1, (t - currentPhase.start) / (currentPhase.end - currentPhase.start)));
                const head = pointAlong(route.points, progress);
                return (
                  <g key={route.id} opacity={highlightMember && !route.memberIds.includes(highlightMember) ? 0.14 : isCurrent ? 1 : isPast ? 0.16 : 0.3}>
                    <path
                      d={pathOf(route.points)}
                      fill="none"
                      stroke={color}
                      strokeWidth={isCurrent ? 3.4 : 2.2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeDasharray={route.kind === 'rotate' || route.kind === 'intel' || !isCurrent ? '8 7' : undefined}
                      markerEnd={marker}
                      filter={isCurrent ? 'url(#glowCyan)' : undefined}
                    />
                    {isCurrent && (
                      <circle
                        cx={sx(head[0])}
                        cy={sy(head[1])}
                        r="4"
                        fill={color}
                      />
                    )}
                  </g>
                );
              })}

            {/* 敌情图钉 */}
            {showPins &&
              ENEMY_PINS.filter((p) => p.floorId === floor.id && intel.some((i) => i.id === p.evidenceId)).map((pin) => {
                const pending = pendingIntel.some((i) => i.id === pin.evidenceId);
                return (
                  <g key={pin.id} transform={`translate(${sx(pin.x)},${sy(pin.y)})`}>
                    <circle r="14" fill="rgba(255,102,117,0.14)" stroke="rgba(255,102,117,0.7)" strokeWidth="1.3" strokeDasharray={pending ? '4 3' : undefined} />
                    <path d="M0,-5 C4.5,-5 8,-1.5 8,3 C8,8 0,14 0,14 C0,14 -8,8 -8,3 C-8,-1.5 -4.5,-5 0,-5 Z" transform="translate(0,-2) scale(0.8)" fill="#FF6675" />
                    <circle cy="0.5" r="2" fill="#0B1622" />
                    <text x="18" y="-2" fontSize="10" fill={pending ? '#FF6675' : '#9CB0C6'}>
                      {pin.label}
                    </text>
                    <text x="18" y="10" fontSize="9" fill={pending ? '#FF6675' : '#33D6A6'} opacity="0.8">
                      {pending ? '待确认 · 演示' : '已观察 · 演示'}
                    </text>
                  </g>
                );
              })}

            {/* 队员位置 */}
            {markerInfo.markers.map(({ m, pos, active }) => (
              <g key={m.id} transform={`translate(${sx(pos[0])},${sy(pos[1])})`} opacity={highlightMember && highlightMember !== m.id ? 0.35 : 1}>
                {active && <circle r="15" fill={m.color} opacity="0.12" />}
                <circle r="9" fill="#08131D" stroke={m.color} strokeWidth="2" />
                <text textAnchor="middle" y="3.5" fontSize="8.5" fill={m.color} fontWeight="700">
                  {m.nickname.slice(0, 1).toUpperCase()}
                </text>
                <text textAnchor="middle" y="-13" fontSize="9.5" fill="#ECF4FD" opacity="0.85">
                  {m.nickname}
                </text>
              </g>
            ))}

            {/* 楼层标识 */}
            <text x={sx(0.14)} y={sy(0.075)} fontSize="13" fill="#61758C" fontFamily="Rajdhani, sans-serif" letterSpacing="2">
              CAFÉ-SIM · {floor.label} · {floor.name}
            </text>
            <text x={sx(0.86)} y={sy(0.075)} textAnchor="end" fontSize="10" fill="#61758C">
              北 ↑ · 示意底图
            </text>
          </svg>
        </div>

        {markerInfo.offFloor > 0 && (
          <div className="tac-map__offfloor">
            <Crosshair size={12} /> {markerInfo.offFloor} 人在其他楼层 · 切层查看
          </div>
        )}

        <div className="tac-map__legend" aria-label="地图图例">
          <div><span className="lg-line lg-attack" /> A · 己方进攻路线</div>
          <div><span className="lg-shield">D</span> 己方防守点</div>
          <div><span className="lg-line lg-rotate" /> R · 回防路线</div>
          <div><span className="lg-pin">E</span> 有来源的敌情</div>
          <div><span className="lg-site">A</span> 目标点</div>
        </div>

        <div className="tac-map__zoom">
          <button className="btn btn-sm btn-ghost" aria-label="放大" onClick={() => setScale(clampScale(scale + 0.2))}>
            <Plus size={14} />
          </button>
          <button className="btn btn-sm btn-ghost" aria-label="缩小" onClick={() => setScale(clampScale(scale - 0.2))}>
            <Minus size={14} />
          </button>
          <button
            className="btn btn-sm btn-ghost"
            aria-label="重置视角"
            onClick={() => {
              setScale(1);
              setOffset({ x: 0, y: 0 });
            }}
          >
            <RotateCcw size={13} />
          </button>
        </div>

        <div className="tac-map__scale">{Math.round(scale * 100)}%</div>
      </div>
    </div>
  );
}

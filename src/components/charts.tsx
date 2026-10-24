import type { TrendPoint } from '../domain/metrics';

export function TrendChart({ points, height = 150 }: { points: TrendPoint[]; height?: number }) {
  const W = 560;
  const H = 180;
  const padL = 34;
  const padR = 32;
  const padT = 14;
  const padB = 24;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const n = Math.max(points.length, 2);
  const x = (i: number) => padL + (i / (n - 1)) * innerW;
  const yLeft = (v: number) => padT + (1 - v / 100) * innerH;
  const yRight = (v: number) => padT + (1 - Math.min(v, 3) / 3) * innerH;

  const valid = (key: 'winRate' | 'kd') =>
    points.map((p, i) => ({ i, v: p[key] })).filter((p): p is { i: number; v: number } => p.v !== null);

  const linePath = (key: 'winRate' | 'kd', scale: (v: number) => number) => {
    const pts = valid(key);
    return pts.map((p, idx) => `${idx === 0 ? 'M' : 'L'}${x(p.i).toFixed(2)},${scale(p.v).toFixed(2)}`).join(' ');
  };

  const wrPts = valid('winRate');
  const area = wrPts.length
    ? `M${x(wrPts[0].i)},${padT + innerH} ` +
      wrPts.map((p) => `L${x(p.i)},${yLeft(p.v)}`).join(' ') +
      ` L${x(wrPts[wrPts.length - 1].i)},${padT + innerH} Z`
    : '';

  const labelStep = Math.max(1, Math.ceil(points.length / 6));
  const last = points.length - 1;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height }} role="img" aria-label="胜率与 K/D 双轴趋势图">
      <defs>
        <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#22D3EE" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 25, 50, 75, 100].map((v) => (
        <g key={v}>
          <line x1={padL} x2={W - padR} y1={yLeft(v)} y2={yLeft(v)} stroke="rgba(255,255,255,0.055)" strokeWidth="1" />
          <text x={padL - 6} y={yLeft(v) + 3} textAnchor="end" fill="#61758C" fontSize="8" fontFamily="Rajdhani, sans-serif">
            {v}
          </text>
        </g>
      ))}
      {[0, 1.5, 3].map((v) => (
        <text key={v} x={W - padR + 6} y={yRight(v) + 3} fill="#61758C" fontSize="8" fontFamily="Rajdhani, sans-serif">
          {v}
        </text>
      ))}
      {area && <path d={area} fill="url(#trendFill)" />}
      <path d={linePath('winRate', yLeft)} fill="none" stroke="#22D3EE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d={linePath('kd', yRight)} fill="none" stroke="#F8C94A" strokeWidth="1.6" strokeDasharray="4 4" strokeLinecap="round" opacity="0.9" />
      {wrPts.map((p) => (
        <circle key={`w${p.i}`} cx={x(p.i)} cy={yLeft(p.v)} r={p.i === last ? 3.2 : 2} fill="#0B1622" stroke="#22D3EE" strokeWidth="1.4">
          <title>{`${points[p.i].label} 胜率 ${p.v}% · ${points[p.i].games} 场`}</title>
        </circle>
      ))}
      {valid('kd').map((p) => (
        <circle key={`k${p.i}`} cx={x(p.i)} cy={yRight(p.v)} r={p.i === last ? 2.8 : 1.6} fill="#F8C94A">
          <title>{`${points[p.i].label} K/D ${p.v}`}</title>
        </circle>
      ))}
      {points.map((p, i) =>
        i % labelStep === 0 || i === last ? (
          <text key={p.key} x={x(i)} y={H - 6} textAnchor="middle" fill="#61758C" fontSize="8" fontFamily="Rajdhani, sans-serif">
            {p.label}
          </text>
        ) : null,
      )}
    </svg>
  );
}

export function DonutChart({
  items,
  centerLabel,
  centerSub,
  size = 172,
}: {
  items: Array<{ label: string; value: number; color: string }>;
  centerLabel: string;
  centerSub: string;
  size?: number;
}) {
  const total = items.reduce((s, i) => s + i.value, 0) || 1;
  const r = 64;
  const C = 2 * Math.PI * r;
  let offset = 0;

  return (
    <svg viewBox="0 0 200 200" style={{ width: size, height: size }} role="img" aria-label={`定位分布，共 ${total} 人`}>
      <circle cx="100" cy="100" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="17" />
      {items.map((item) => {
        const len = (item.value / total) * C;
        const dash = `${Math.max(len - 4, 0)} ${C - Math.max(len - 4, 0)}`;
        const el = (
          <circle
            key={item.label}
            cx="100"
            cy="100"
            r={r}
            fill="none"
            stroke={item.color}
            strokeWidth="17"
            strokeDasharray={dash}
            strokeDashoffset={-offset}
            strokeLinecap="butt"
            transform="rotate(-90 100 100)"
          >
            <title>{`${item.label} ${item.value} 人`}</title>
          </circle>
        );
        offset += len;
        return el;
      })}
      <text x="100" y="96" textAnchor="middle" fill="#ECF4FD" fontSize="27" fontFamily="Rajdhani, sans-serif" fontWeight="700">
        {centerLabel}
      </text>
      <text x="100" y="114" textAnchor="middle" fill="#61758C" fontSize="10">
        {centerSub}
      </text>
    </svg>
  );
}

export function RadarChart({
  data,
  compareData,
  size = 250,
}: {
  data: Array<{ label: string; value: number }>;
  compareData?: Array<{ label: string; value: number }>;
  size?: number;
}) {
  const cx = 128;
  const cy = 122;
  const R = 74;
  const n = data.length;
  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const pt = (i: number, v: number) => [cx + Math.cos(angle(i)) * R * (v / 100), cy + Math.sin(angle(i)) * R * (v / 100)];
  const poly = (values: number[]) => values.map((v, i) => pt(i, v).join(',')).join(' ');
  const rings = [25, 50, 75, 100];

  return (
    <svg viewBox="0 0 256 244" style={{ width: '100%', height: size }} role="img" aria-label="小队五维能力示例评分">
      {rings.map((ring) => (
        <polygon key={ring} points={poly(Array(n).fill(ring))} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      ))}
      {data.map((_, i) => {
        const [x, y] = pt(i, 100);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />;
      })}
      {compareData && (
        <polygon points={poly(compareData.map((d) => d.value))} fill="none" stroke="rgba(156,176,198,0.55)" strokeWidth="1.2" strokeDasharray="3 3" />
      )}
      <polygon points={poly(data.map((d) => d.value))} fill="rgba(248,201,74,0.16)" stroke="#F8C94A" strokeWidth="1.8" strokeLinejoin="round" />
      {data.map((d, i) => {
        const [x, y] = pt(i, d.value);
        return <circle key={d.label} cx={x} cy={y} r="2.6" fill="#F8C94A" />;
      })}
      {data.map((d, i) => {
        const a = angle(i);
        const lx = cx + Math.cos(a) * (R + 24);
        const ly = cy + Math.sin(a) * (R + 22);
        const anchor = Math.abs(Math.cos(a)) < 0.2 ? 'middle' : Math.cos(a) > 0 ? 'start' : 'end';
        return (
          <g key={d.label}>
            <text x={lx} y={ly - 4} textAnchor={anchor} fill="#9CB0C6" fontSize="9">
              {d.label}
            </text>
            <text x={lx} y={ly + 8} textAnchor={anchor} fill="#ECF4FD" fontSize="10.5" fontFamily="Rajdhani, sans-serif" fontWeight="600">
              {d.value}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

import { useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import {
  ArrowRight,
  ChevronRight,
  Crown,
  Crosshair,
  Pencil,
  Percent,
  Swords,
  Trophy,
} from 'lucide-react';
import type { Member } from '../domain/types';
import {
  RANGE_LABELS,
  aggregate,
  formatTime,
  inRange,
  mapPerformance,
  roleDistribution,
  teamRadar,
  trend,
  type Range,
} from '../domain/metrics';
import { mapName, operatorById } from '../data/operators';
import { WIDGETS } from '../data/squad';
import { DonutChart, RadarChart, TrendChart } from '../components/charts';
import { useNexus } from '../state/nexus';
import { asset, portraitOf } from '../lib/asset';
import './overview.css';

const RANGES: Range[] = ['7d', '30d', 'season'];
const FALLBACK_ORDER = WIDGETS.map((w) => w.id);

const delay = (ms: number) => ({ '--d': `${ms}ms` }) as CSSProperties;

function MemberCard({ member, index }: { member: Member; index: number }) {
  const [broken, setBroken] = useState(false);
  const op = operatorById(member.operatorId);
  const opName = op?.name ?? member.operatorId;
  const opCn = op?.cn ?? opName;

  return (
    <a
      href="#/squad"
      className="ov-member fade-up"
      style={{ ...delay(80 + index * 40), '--member-color': member.color } as CSSProperties}
    >
      {member.isLeader && (
        <span className="ov-member-leader">
          <Crown size={11} aria-hidden />
          队长
        </span>
      )}
      <div className="ov-member-visual">
        {broken ? (
          <span className="ov-member-fallback" role="img" aria-label={`${opCn} 干员立绘（图片未加载）`}>
            {opCn.slice(0, 1)}
          </span>
        ) : (
          <img
            src={portraitOf(member.operatorId)}
            alt={`${opCn}（${opName}）干员立绘`}
            loading="lazy"
            onError={() => setBroken(true)}
          />
        )}
      </div>
      <div className="ov-member-shade" aria-hidden />
      <div className="ov-member-info">
        <span className="ov-member-name">{member.nickname}</span>
        <span className="ov-member-line ellipsis">
          {opName} · {member.duty}
        </span>
        <span className="ov-member-status">
          <span className={member.online ? 'dot dot--live' : 'dot dot--idle'} />
          {member.online ? '在线' : '离线'}
        </span>
      </div>
    </a>
  );
}

export default function Overview() {
  const { state, toggleWidget } = useNexus();
  const [range, setRange] = useState<Range>('season');

  const filtered = useMemo(() => inRange(state.matches, range), [state.matches, range]);
  const agg = useMemo(() => aggregate(filtered), [filtered]);
  const points = useMemo(() => trend(filtered, range), [filtered, range]);
  const maps = useMemo(() => mapPerformance(filtered), [filtered]);
  const roles = useMemo(() => roleDistribution(state.members), [state.members]);
  const radar = useMemo(() => teamRadar(state.members), [state.members]);
  const radarCompare = useMemo(() => teamRadar(state.members, true), [state.members]);
  const recent = useMemo(
    () =>
      [...state.matches]
        .sort((a, b) => new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime())
        .slice(0, 6),
    [state.matches],
  );

  const onlineCount = state.members.filter((m) => m.online).length;
  const order = state.widgets.order.length ? state.widgets.order : FALLBACK_ORDER;
  const hidden = state.widgets.hidden;

  const kpiItems: Array<{ label: string; value: string; unit?: string; sub: string; icon: ReactNode }> = [
    {
      label: '胜率',
      value: agg.winRate.toFixed(1),
      unit: '%',
      sub: `${agg.wins} 胜 ${agg.losses} 负`,
      icon: <Percent size={13} aria-hidden />,
    },
    {
      label: 'K/D',
      value: agg.kd.toFixed(2),
      sub: `${agg.kills} 击杀 · ${agg.deaths} 死亡`,
      icon: <Crosshair size={13} aria-hidden />,
    },
    {
      label: '平均得分',
      value: agg.avgScore.toLocaleString('en-US'),
      sub: `累计 ${agg.totalScore.toLocaleString('en-US')}`,
      icon: <Trophy size={13} aria-hidden />,
    },
    {
      label: '对局数',
      value: String(agg.games),
      unit: '场',
      sub: `${agg.wins} 胜 ${agg.losses} 负`,
      icon: <Swords size={13} aria-hidden />,
    },
  ];

  const blocks: Record<string, ReactNode> = {
    kpi: (
      <section className="panel" aria-labelledby="ov-kpi-title">
        <div className="panel-head ov-kpi-head">
          <h3 id="ov-kpi-title">小队数据总览</h3>
          <span className="chip chip-demo">示例样本</span>
          <div className="grow" />
          <div className="segmented" role="group" aria-label="统计区间">
            {RANGES.map((item) => (
              <button
                key={item}
                type="button"
                className={range === item ? 'is-active accent' : undefined}
                aria-pressed={range === item}
                onClick={() => setRange(item)}
              >
                {RANGE_LABELS[item]}
              </button>
            ))}
          </div>
        </div>
        <div className="ov-kpi-grid">
          {kpiItems.map((item) => (
            <div className="ov-kpi-cell" key={item.label}>
              <div className="ov-kpi-label">
                {item.icon}
                {item.label}
              </div>
              <div className="ov-kpi-value num">
                {item.value}
                {item.unit && <span className="ov-kpi-unit">{item.unit}</span>}
              </div>
              <div className="ov-kpi-sub">{item.sub}</div>
            </div>
          ))}
        </div>
        <div className="ov-kpi-foot tiny faint between">
          <span>
            {RANGE_LABELS[range]} · 共 {agg.games} 场对局
          </span>
          <span>示例样本 · 演示数据</span>
        </div>
      </section>
    ),

    trend: (
      <section className="panel" aria-labelledby="ov-trend-title">
        <div className="panel-head">
          <h3 id="ov-trend-title">状态趋势</h3>
          <span className="chip">{RANGE_LABELS[range]}</span>
          <div className="grow" />
          <div className="ov-legend tiny">
            <span className="ov-legend-item">
              <i className="ov-swatch" aria-hidden />
              胜率 %
            </span>
            <span className="ov-legend-item">
              <i className="ov-swatch ov-swatch--gold" aria-hidden />
              K/D
            </span>
          </div>
        </div>
        <div className="ov-chart-body">
          <TrendChart points={points} height={176} />
        </div>
        <div className="ov-chart-foot tiny faint">青色实线为每日胜率，金色虚线为每日 K/D；无对局日留空。</div>
      </section>
    ),

    roles: (
      <section className="panel" aria-labelledby="ov-roles-title">
        <div className="panel-head">
          <h3 id="ov-roles-title">干员定位</h3>
        </div>
        <div className="ov-roles">
          <DonutChart
            items={roles}
            centerLabel={`${onlineCount}/${state.members.length}`}
            centerSub="在线"
            size={138}
          />
          <ul className="ov-role-list">
            {roles.map((role) => (
              <li key={role.label} className="ov-role-item">
                <span className="ov-role-dot" style={{ background: role.color }} aria-hidden />
                <span className="grow ellipsis">{role.label}</span>
                <span className="num ov-role-count">{role.value}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="ov-chart-foot tiny faint">按干员职责统计，共 {state.members.length} 名干员。</div>
      </section>
    ),

    radar: (
      <section className="panel" aria-labelledby="ov-radar-title">
        <div className="panel-head">
          <h3 id="ov-radar-title">小队能力雷达</h3>
        </div>
        <div className="ov-radar-body">
          <RadarChart data={radar} compareData={radarCompare} size={210} />
        </div>
        <div className="ov-legend ov-legend--center tiny">
          <span className="ov-legend-item">
            <i className="ov-swatch ov-swatch--solid-gold" aria-hidden />
            我的小队
          </span>
          <span className="ov-legend-item">
            <i className="ov-swatch ov-swatch--gray" aria-hidden />
            全员平均
          </span>
        </div>
        <div className="ov-chart-foot tiny faint">示例评分 · 按阵容能力标签平均</div>
      </section>
    ),

    maps: (
      <section className="panel" aria-labelledby="ov-maps-title">
        <div className="panel-head">
          <h3 id="ov-maps-title">地图表现</h3>
          <span className="chip">{maps.length} 张</span>
          <div className="grow" />
          <a className="ov-panel-link tiny" href="#/maps">
            查看分析
            <ChevronRight size={12} aria-hidden />
          </a>
        </div>
        {maps.length ? (
          <div className="ov-map-grid">
            {maps.map(({ map, games, wins, rate }, i) => (
              <a
                key={map.id}
                href="#/maps"
                className="ov-map fade-up"
                style={delay((i + 3) * 40)}
              >
                <div className="ov-map-thumb">
                  <img src={asset(map.image)} alt={`${map.cn}（${map.en}）地图实景`} loading="lazy" />
                </div>
                <div className="ov-map-info">
                  <div className="ov-map-name">{map.cn}</div>
                  <div className="ov-map-meta">
                    <span className="ov-map-rate num">{rate}%</span>
                    <span className="ov-map-record num">
                      {games} 场 · {wins} 胜
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="panel-body muted small">该区间暂无地图对局记录。</div>
        )}
      </section>
    ),

    recent: (
      <section className="panel" aria-labelledby="ov-recent-title">
        <div className="panel-head">
          <h3 id="ov-recent-title">最近对局</h3>
          <span className="chip">最近 6 场</span>
          <div className="grow" />
          <a className="ov-panel-link tiny" href="#/stats">
            查看全部
            <ChevronRight size={12} aria-hidden />
          </a>
        </div>
        {recent.length ? (
          <div className="ov-recent-list">
            <div className="ov-recent-head" aria-hidden>
              <span>结果</span>
              <span>比分</span>
              <span>地图</span>
              <span className="ov-num-right">K/D</span>
              <span className="ov-num-right">得分</span>
              <span className="ov-col-time">时间</span>
            </div>
            {recent.map((match) => {
              const win = match.result === 'win';
              return (
                <a
                  key={match.id}
                  href="#/tactical"
                  className="ov-recent-row"
                  aria-label={`${mapName(match.mapId)} ${match.scoreline.replace('-', ' : ')} ${
                    win ? '胜利' : '失败'
                  }，查看战术详情`}
                >
                  <span>
                    <span className={`chip ${win ? 'chip-green' : 'chip-red'}`}>{win ? '胜' : '负'}</span>
                  </span>
                  <span className="num">{match.scoreline.replace('-', ' : ')}</span>
                  <span className="ellipsis">{mapName(match.mapId)}</span>
                  <span className="num ov-num-right">{(match.kills / Math.max(match.deaths, 1)).toFixed(2)}</span>
                  <span className="num ov-num-right">{match.score.toLocaleString('en-US')}</span>
                  <span className="num ov-col-time faint">{formatTime(match.playedAt)}</span>
                </a>
              );
            })}
          </div>
        ) : (
          <div className="panel-body muted small">暂无对局记录。</div>
        )}
      </section>
    ),
  };

  const visible = order.filter((id) => blocks[id] !== undefined && !hidden.includes(id));

  const restoreWidgets = () => {
    for (const id of [...hidden]) toggleWidget(id);
  };

  return (
    <div className="ov-page">
      <section className="ov-hero fade-up" style={delay(0)} aria-label="小队作战横幅">
        <img className="ov-hero-bg" src={asset('hero_bg.jpg')} alt="五人小队作战背景" />
        <div className="ov-hero-scrim" aria-hidden />
        <div className="ov-hero-content">
          <span className="eyebrow">SQUAD OVERVIEW</span>
          <h1 className="ov-hero-title">
            <a href="#/squad" aria-label={`${state.teamName}，前往我的小队`}>
              {state.teamName}
              <Pencil size={15} aria-hidden />
            </a>
          </h1>
          <p className="ov-hero-slogan">{state.slogan}</p>
        </div>
        <time className="ov-hero-date" dateTime="2026-10-24">
          <span className="ov-hero-day num">10.24</span>
          <span className="ov-hero-meta num">
            <span>TUE</span>
            <span>2026</span>
          </span>
        </time>
        <a className="btn btn-primary ov-hero-cta" href="#/tactical">
          开始行动
          <ArrowRight aria-hidden />
        </a>
      </section>

      <section className="ov-squad" aria-labelledby="ov-squad-title">
        <div className="ov-squad-head fade-up" style={delay(40)}>
          <span className="eyebrow">当前小队</span>
          <h2 id="ov-squad-title" className="ov-squad-title">
            {state.teamName}
          </h2>
          <span className="chip chip-green">
            <span className="dot dot--live" />
            {onlineCount}/{state.members.length} 在线 · 模拟
          </span>
          <div className="grow" />
          <a className="btn btn-sm" href="#/squad">
            小队详情
            <ChevronRight size={13} aria-hidden />
          </a>
        </div>
        <div className="ov-members">
          {state.members.map((member, i) => (
            <MemberCard key={member.id} member={member} index={i} />
          ))}
        </div>
      </section>

      <div className="ov-grid">
        {visible.map((id, i) => (
          <div key={id} className={`ov-blk ov-blk--${id} fade-up`} style={delay((i + 2) * 40)}>
            {blocks[id]}
          </div>
        ))}
      </div>

      {visible.length === 0 && (
        <div className="panel ov-empty fade-up" style={delay(80)}>
          <div className="grow">
            <div className="strong">看板模块已全部隐藏</div>
            <div className="tiny faint">可在自定义页面重新开启，或直接恢复全部模块。</div>
          </div>
          <button type="button" className="btn btn-primary" onClick={restoreWidgets}>
            恢复全部模块
          </button>
        </div>
      )}
    </div>
  );
}


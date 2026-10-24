import { useMemo, useState, type CSSProperties } from 'react';
import { ArrowUpRight, Compass, Layers, MapPin } from 'lucide-react';
import { MAPS } from '../data/operators';
import { inRange, mapPerformance, RANGE_LABELS, type Range } from '../domain/metrics';
import { useNexus } from '../state/nexus';
import { asset } from '../lib/asset';
import './secondary.css';

const FLOORS = [
  { floor: 'B1', note: '地下点位 · 车库与仓储' },
  { floor: '1F', note: '首层大厅 · 主入口' },
  { floor: '2F', note: '上层办公区 · 垂直连通' },
];

const RANGES: Range[] = ['7d', '30d', 'season'];

export default function MapsPage() {
  const { state } = useNexus();
  const [range, setRange] = useState<Range>('season');

  const performance = useMemo(() => {
    const list = mapPerformance(inRange(state.matches, range));
    return new Map(list.map((item) => [item.map.id, item]));
  }, [state.matches, range]);

  return (
    <>
      <header className="sec-page-head fade-up">
        <div>
          <div className="eyebrow">MAP INTEL · CAFÉ-SIM</div>
          <h1>地图分析</h1>
          <p className="sec-page-sub">
            四张地图的楼层、点位与区间战绩一览；从任意地图卡进入战术指挥中心，直接布置五人站位。
          </p>
        </div>
        <div className="sec-head-actions">
          <a className="btn btn-primary btn-sm" href="#/tactical">
            进入战术指挥 <ArrowUpRight size={14} aria-hidden />
          </a>
        </div>
      </header>

      <section className="panel mp-cafe fade-up" aria-label="Café-Sim 示意场景">
        <div className="panel-head">
          <h3>Café-Sim 示意场景</h3>
          <span className="chip chip-demo">自绘示意底图</span>
          <div className="grow" />
          <span className="tiny faint">非真实关卡结构</span>
        </div>
        <div className="panel-body mp-cafe-body">
          <div className="mp-schematic">
            <div className="mp-schematic-head">
              <span className="sec-label">CAFÉ-SIM / SCHEMATIC</span>
              <span className="chip chip-cyan">B1 · 1F · 2F</span>
            </div>
            {FLOORS.map((item) => (
              <div className="mp-floor-row" key={item.floor}>
                <span className="mp-floor-tag">{item.floor}</span>
                <span className="mp-floor-plan">
                  <span className="mp-floor-label">{item.note}</span>
                  <span className="row">
                    <span className="mp-site mp-site--a">A</span>
                    <span className="mp-site mp-site--b">B</span>
                  </span>
                </span>
              </div>
            ))}
            <span className="tiny faint">
              演示用分层示意：三个楼层、A / B 两个点位，不代表任何官方关卡平面。
            </span>
          </div>

          <div className="mp-cafe-notes">
            <p className="small muted">
              本区为 <strong className="strong">Café-Sim 自绘示意底图</strong>，仅用于演示战术分层与点位关系，
              <strong className="strong">并非真实关卡结构</strong>，也不代表官方素材。
            </p>
            <ul className="mp-points">
              <li>
                <Layers aria-hidden /> 三个楼层：B1 / 1F / 2F
              </li>
              <li>
                <MapPin aria-hidden /> 两个炸弹点位：A / B
              </li>
              <li>
                <Compass aria-hidden /> 可从下方任意地图卡进入战术指挥中心
              </li>
            </ul>
            <div className="row wrap">
              <a className="btn btn-sm btn-primary" href="#/tactical">
                进入战术指挥中心 <ArrowUpRight size={13} aria-hidden />
              </a>
              <span className="chip chip-demo">演示模式</span>
            </div>
          </div>
        </div>
      </section>

      <div className="mp-toolbar">
        <div className="row">
          <span className="sec-label">统计区间</span>
          <div className="segmented" role="group" aria-label="地图战绩统计区间">
            {RANGES.map((item) => (
              <button
                key={item}
                type="button"
                className={range === item ? 'is-active accent' : ''}
                aria-pressed={range === item}
                onClick={() => setRange(item)}
              >
                {RANGE_LABELS[item]}
              </button>
            ))}
          </div>
        </div>
        <span className="tiny faint">区间内战绩由本地对局样本实时计算</span>
      </div>

      <section className="mp-grid" aria-label="地图列表">
        {MAPS.map((map, index) => {
          const stat = performance.get(map.id) ?? {
            games: 0,
            wins: 0,
            rate: 0,
          };
          return (
            <a
              key={map.id}
              className="panel mp-card fade-up"
              href="#/tactical"
              aria-label={`${map.cn} ${map.en}，${RANGE_LABELS[range]} ${stat.games} 场 ${stat.wins} 胜，进入战术指挥`}
              style={{ '--d': `${index * 60}ms` } as CSSProperties}
            >
              <div className="mp-thumb">
                <img src={asset(map.image)} alt={`${map.cn} 地图预览`} />
                <span className="mp-thumb-top">
                  <span className={`chip ${stat.games ? 'chip-gold' : ''}`}>
                    {stat.games ? `${stat.rate}% 胜率` : '暂无对局'}
                  </span>
                </span>
                <span className="mp-thumb-en">{map.en}</span>
              </div>
              <div className="mp-card-body">
                <div className="between">
                  <span className="mp-card-title">{map.cn}</span>
                  <span className="eyebrow">{map.en}</span>
                </div>
                <div className="mp-meta">
                  <span className="chip">
                    <Layers size={11} aria-hidden /> {map.floors} 层
                  </span>
                  {map.sites.map((site) => (
                    <span className="chip chip-cyan" key={site}>
                      <MapPin size={11} aria-hidden /> 点位 {site}
                    </span>
                  ))}
                </div>
                <div className="mp-perf">
                  <span className="mp-perf-cell">
                    <span className="num">{stat.games}</span>
                    <span className="tiny">场</span>
                  </span>
                  <span className="mp-perf-cell">
                    <span className="num">{stat.wins}</span>
                    <span className="tiny">胜</span>
                  </span>
                  <span className="mp-perf-cell">
                    <span className="num">{stat.rate}%</span>
                    <span className="tiny">胜率</span>
                  </span>
                </div>
                <div className="mp-track" aria-hidden>
                  <span className="mp-fill" style={{ width: `${stat.rate}%` }} />
                </div>
                <div className="between">
                  <span className="tiny faint">区间内 {RANGE_LABELS[range]}</span>
                  <span className="mp-cta">
                    进入战术 <ArrowUpRight size={12} aria-hidden />
                  </span>
                </div>
              </div>
            </a>
          );
        })}
      </section>

      <section className="panel mp-boundary fade-up" aria-label="素材与数据边界">
        <div className="panel-head">
          <h3>素材与数据边界</h3>
          <span className="chip chip-demo">演示模式</span>
        </div>
        <div className="panel-body mp-boundary-grid">
          <div>
            <span className="sec-label">CAFÉ-SIM</span>
            <p className="muted">
              Café-Sim 底图由 CSS 与自绘图形构成，仅用于分层与点位示意，非真实关卡结构。
            </p>
          </div>
          <div>
            <span className="sec-label">MAP ASSETS</span>
            <p className="muted">
              地图缩略图为本地演示图片，仅用于界面展示，不包含可下载的官方地图数据。
            </p>
          </div>
          <div>
            <span className="sec-label">MATCH DATA</span>
            <p className="muted">
              区间战绩基于浏览器本地对局样本计算，不连接游戏接口，也不代表真实排位数据。
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

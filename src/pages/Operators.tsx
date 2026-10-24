import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { ArrowRight, Search, Users, X } from 'lucide-react';
import type { Side } from '../domain/types';
import { RADAR_AXES } from '../domain/metrics';
import { OPERATORS, operatorById } from '../data/operators';
import { useNexus } from '../state/nexus';
import { iconOf } from '../lib/asset';
import './secondary.css';

type SideFilter = 'all' | Side;

const sideLabel = (side: Side) => (side === 'attack' ? '进攻' : '防守');
const sideClass = (side: Side) => (side === 'attack' ? 'op-side-attack' : 'op-side-defense');

export default function Operators() {
  const { state, updateMember } = useNexus();

  const [query, setQuery] = useState('');
  const [side, setSide] = useState<SideFilter>('all');
  const [role, setRole] = useState('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [seatId, setSeatId] = useState(state.members[0]?.id ?? '');
  const [assigned, setAssigned] = useState('');

  const selected = selectedId ? operatorById(selectedId) : undefined;

  const roles = useMemo(() => [...new Set(OPERATORS.map((op) => op.role))], []);

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return OPERATORS.filter((op) => {
      if (side !== 'all' && op.side !== side) return false;
      if (role !== 'all' && op.role !== role) return false;
      if (!keyword) return true;
      return [op.cn, op.name, op.role, op.ability, ...op.tags].some((text) =>
        text.toLowerCase().includes(keyword),
      );
    });
  }, [query, side, role]);

  useEffect(() => {
    if (!selectedId) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedId(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedId]);

  const openDetail = (id: string) => {
    setSelectedId(id);
    setSeatId(state.members[0]?.id ?? '');
    setAssigned('');
  };

  const assignToSeat = () => {
    if (!selected || !seatId) return;
    const member = state.members.find((m) => m.id === seatId);
    if (!member) return;
    updateMember(seatId, {
      operatorId: selected.id,
      duty: `${selected.role} · ${selected.ability}`,
    });
    setAssigned(`已将 ${selected.cn} 加入 ${member.nickname || '未命名'} 的席位`);
  };

  const resetFilters = () => {
    setQuery('');
    setSide('all');
    setRole('all');
  };

  return (
    <>
      <header className="sec-page-head fade-up">
        <div>
          <div className="eyebrow">OPERATOR ARCHIVE · {OPERATORS.length} UNITS</div>
          <h1>干员库</h1>
          <p className="sec-page-sub">
            按阵营、定位与关键词检索干员，查看五维能力与核心道具，再把他们补进你的五人阵容。
          </p>
        </div>
        <div className="sec-head-actions">
          <a className="btn btn-sm" href="#/squad">
            <Users size={14} aria-hidden /> 管理我的小队
          </a>
        </div>
      </header>

      <section className="panel op-toolbar fade-up" aria-label="干员筛选">
        <div className="op-search">
          <Search aria-hidden />
          <label className="sr-only" htmlFor="op-search">
            搜索干员（支持中英文）
          </label>
          <input
            id="op-search"
            className="field"
            type="search"
            value={query}
            placeholder="搜索干员 / 定位 / 能力，如 Sledge、破拆、情报"
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <div className="segmented" role="group" aria-label="阵营筛选">
          {(
            [
              { value: 'all', label: '全部' },
              { value: 'attack', label: '进攻' },
              { value: 'defense', label: '防守' },
            ] as const
          ).map((item) => (
            <button
              key={item.value}
              type="button"
              className={side === item.value ? 'is-active accent' : ''}
              aria-pressed={side === item.value}
              onClick={() => setSide(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="op-filter-role">
          <label className="sec-label" htmlFor="op-role">
            定位
          </label>
          <select
            id="op-role"
            className="field field--sm"
            value={role}
            onChange={(event) => setRole(event.target.value)}
          >
            <option value="all">全部定位</option>
            {roles.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
        <span className="chip chip-cyan op-count">
          {filtered.length} / {OPERATORS.length} 名干员
        </span>
      </section>

      {filtered.length === 0 ? (
        <section className="panel sec-empty fade-up" aria-live="polite">
          <Search aria-hidden />
          <p>没有匹配的干员</p>
          <p className="tiny faint">试试中文名、英文名、定位或能力关键词，或清空筛选条件。</p>
          <button type="button" className="btn btn-sm" onClick={resetFilters}>
            清空搜索与筛选
          </button>
        </section>
      ) : (
        <section className="op-grid" aria-label="干员列表">
          {filtered.map((op, index) => (
            <article
              key={op.id}
              className="panel op-card fade-up"
              role="button"
              tabIndex={0}
              aria-label={`查看 ${op.cn} ${op.name} 详情`}
              style={{ '--d': `${index * 28}ms` } as CSSProperties}
              onClick={() => openDetail(op.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  openDetail(op.id);
                }
              }}
            >
              <div className="op-card-top">
                <span className="op-icon">
                  <img src={iconOf(op.id)} alt="" aria-hidden />
                </span>
                <div className="grow">
                  <div className="between">
                    <span className="op-name">{op.cn}</span>
                    <span className={`chip ${sideClass(op.side)}`}>{sideLabel(op.side)}</span>
                  </div>
                  <div className="op-en">{op.name.toUpperCase()}</div>
                  <div className="op-role">{op.role}</div>
                  <div className="op-ability">{op.ability}</div>
                </div>
              </div>
              <div className="op-tags">
                {op.tags.map((tag) => (
                  <span className="chip" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
              <div className="op-foot">
                <span>五维能力 · {op.tags.length} 个标签</span>
                <span className="row arrow">
                  查看详情 <ArrowRight size={12} aria-hidden />
                </span>
              </div>
            </article>
          ))}
        </section>
      )}

      {selected && (
        <>
          <div className="op-scrim" aria-hidden onClick={() => setSelectedId(null)} />
          <aside
            className="op-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="op-detail-title"
          >
            <div className="op-drawer-head">
              <span className="sec-label">OPERATOR DOSSIER</span>
              <div className="grow" />
              <button
                type="button"
                className="btn btn-sm btn-ghost"
                onClick={() => setSelectedId(null)}
                aria-label="关闭干员详情"
              >
                <X size={14} aria-hidden />
              </button>
            </div>
            <div className="op-drawer-body">
              <div className="op-hero">
                <span className="op-hero-icon">
                  <img src={iconOf(selected.id)} alt={`${selected.cn} 图标`} />
                </span>
                <div className="op-hero-meta">
                  <h2 id="op-detail-title">{selected.cn}</h2>
                  <span className="op-en">{selected.name.toUpperCase()}</span>
                  <div className="row wrap">
                    <span className={`chip ${sideClass(selected.side)}`}>
                      {sideLabel(selected.side)}
                    </span>
                    <span className="chip">{selected.role}</span>
                  </div>
                </div>
              </div>

              <div className="op-ability-block">
                <span className="op-section-title">核心能力</span>
                <p className="small muted">
                  {selected.ability} · {selected.role}。{selected.tags.join(' / ')}。
                </p>
              </div>

              <div>
                <span className="op-section-title">五维能力</span>
                <div className="op-radar">
                  {RADAR_AXES.map((axis) => (
                    <div className="op-radar-row" key={axis.key}>
                      <span className="tiny muted">{axis.label}</span>
                      <span className="op-radar-track">
                        <span
                          className="op-radar-fill"
                          style={{ width: `${selected.radar[axis.key]}%` }}
                        />
                      </span>
                      <span className="num small">{selected.radar[axis.key]}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="op-tags">
                {selected.tags.map((tag) => (
                  <span className="chip chip-cyan" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>

              <div className="op-assign">
                <span className="op-section-title">加入阵容</span>
                <div className="row">
                  <label className="sr-only" htmlFor="op-seat">
                    选择加入的席位
                  </label>
                  <select
                    id="op-seat"
                    className="field"
                    value={seatId}
                    onChange={(event) => {
                      setSeatId(event.target.value);
                      setAssigned('');
                    }}
                  >
                    {state.members.map((member, index) => (
                      <option key={member.id} value={member.id}>
                        席位 {index + 1} · {member.nickname || '未命名'}（当前{' '}
                        {operatorById(member.operatorId)?.cn ?? '—'}）
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={assignToSeat}
                    disabled={!seatId}
                  >
                    加入阵容
                  </button>
                </div>
                {assigned && (
                  <span className="op-feedback" role="status">
                    {assigned}
                  </span>
                )}
              </div>
            </div>
          </aside>
        </>
      )}
    </>
  );
}

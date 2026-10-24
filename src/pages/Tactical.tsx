import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle, Check, Eye, Layers, Mic, Pause, Play, Radio, RefreshCw,
  RotateCcw, Shield, Sparkles, Trash2, Users,
} from 'lucide-react';
import TacticalMap from './tactical/TacticalMap';
import { useNexus } from '../state/nexus';
import { iconOf } from '../lib/asset';
import { operatorById } from '../data/operators';
import {
  ENEMY_PINS, FLOORS, OPERATOR_SUGGESTIONS, PHASES, PLANS, PRESET_INTEL,
  ROUND_LENGTH, RISKS, parseIntel,
  type FloorId, type IntelEvent, type TacticalPlan,
} from '../data/cafeSim';
import './tactical/tactical.css';

const fmt = (sec: number) => `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(Math.floor(sec % 60)).padStart(2, '0')}`;

const TASKS: Record<string, string> = {
  m1: '垂直破拆 · 主攻',
  m2: '外墙/门爆破 · 掩护',
  m3: '反道具 · 信息压制',
  m4: '首入 · 侧翼压制',
  m5: '无人机侦察 · 情报确认',
};

type PlanStatus = 'ready' | 'generating' | 'applied' | 'stale';

export default function Tactical() {
  const { state } = useNexus();
  const [pane, setPane] = useState<'intel' | 'map' | 'plan'>('map');
  const [mode, setMode] = useState<'attack' | 'defend'>('attack');
  const [site, setSite] = useState<'A' | 'B'>('A');
  const [floorId, setFloorId] = useState<FloorId>('2F');
  const [tab, setTab] = useState<'summary' | 'ops' | 'plans' | 'risks'>('summary');
  const [planId, setPlanId] = useState('plan-a');
  const [appliedId, setAppliedId] = useState<string | null>('plan-a');
  const [status, setStatus] = useState<PlanStatus>('applied');
  const [intelDirty, setIntelDirty] = useState(false);
  const [intel, setIntel] = useState<IntelEvent[]>(PRESET_INTEL.slice(0, 3));
  const [presetPlaying, setPresetPlaying] = useState(false);
  const [draft, setDraft] = useState('');
  const [speakerId, setSpeakerId] = useState('m4');
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [layers, setLayers] = useState({ routes: true, pins: true, members: true, labels: true });
  const [t, setT] = useState(48);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const timers = useRef<number[]>([]);
  const generateTimer = useRef<number | null>(null);

  const floor = FLOORS.find((f) => f.id === floorId) ?? FLOORS[1];
  const phase = PHASES.find((p) => t >= p.start && t < p.end) ?? PHASES[PHASES.length - 1];
  const phaseNo = PHASES.findIndex((p) => p.id === phase.id);
  const selectedPlan = PLANS.find((p) => p.id === planId) ?? PLANS[0];
  const appliedPlan = appliedId ? PLANS.find((p) => p.id === appliedId) ?? null : null;
  const attackPlans = useMemo(() => PLANS.filter((p) => p.mode === 'attack'), []);

  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = ((now - last) / 1000) * speed;
      last = now;
      setT((prev) => Math.min(ROUND_LENGTH, prev + dt));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, speed]);

  useEffect(() => {
    if (playing && t >= ROUND_LENGTH) setPlaying(false);
  }, [t, playing]);

  // 回放阶段变化时，自动切到该阶段路线所在楼层
  useEffect(() => {
    if (!appliedPlan || !playing) return;
    const routes = appliedPlan.routes.filter((r) => r.phaseId === phase.id);
    if (routes[0]) setFloorId(routes[0].floorId);
  }, [phase.id, appliedPlan, playing]);

  useEffect(
    () => () => {
      timers.current.forEach((id) => window.clearTimeout(id));
      if (generateTimer.current) window.clearTimeout(generateTimer.current);
    },
    [],
  );

  const invalidate = useCallback(() => {
    setStatus((prev) => (prev === 'applied' || prev === 'ready' ? 'stale' : prev));
    setAppliedId(null);
    setT(0);
    setPlaying(false);
  }, []);

  const changeMode = (next: 'attack' | 'defend') => {
    if (next === mode) return;
    setMode(next);
    setPlanId(next === 'defend' ? 'plan-d' : 'plan-a');
    invalidate();
  };

  const changeSite = (next: 'A' | 'B') => {
    if (next === site) return;
    setSite(next);
    invalidate();
  };

  const generate = () => {
    setStatus('generating');
    setAppliedId(null);
    setPlaying(false);
    setT(0);
    if (generateTimer.current) window.clearTimeout(generateTimer.current);
    generateTimer.current = window.setTimeout(() => {
      setStatus('ready');
      setIntelDirty(false);
    }, 900);
  };

  const applyPlan = (plan: TacticalPlan) => {
    setPlanId(plan.id);
    setAppliedId(plan.id);
    setStatus('applied');
    setIntelDirty(false);
    setT(0);
    setPlaying(true);
    setPane('map');
  };

  const playPreset = () => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
    setIntel([]);
    setIntelDirty(true);
    setPresetPlaying(true);
    PRESET_INTEL.forEach((ev, i) => {
      const id = window.setTimeout(() => {
        setIntel((prev) => [...prev, ev]);
        if (i === PRESET_INTEL.length - 1) setPresetPlaying(false);
      }, i * 650);
      timers.current.push(id);
    });
  };

  const addManual = () => {
    const text = draft.trim();
    if (!text) return;
    const parsed = parseIntel(text);
    const speaker = state.members.find((m) => m.id === speakerId);
    const ev: IntelEvent = {
      id: `manual-${Date.now()}`,
      t: Math.round(t),
      speaker: speaker?.nickname ?? '我',
      speakerId,
      text,
      floorId: parsed.floorId,
      roomId: parsed.roomId,
      kind: /封|堵|不能|不可/.test(text) ? 'blocked' : /确认|安全|没有/.test(text) ? 'clear' : 'enemy',
      status: 'pending',
      source: 'manual',
    };
    setIntel((prev) => [...prev, ev].sort((a, b) => a.t - b.t));
    setIntelDirty(true);
    setDraft('');
  };

  const toggleConfirm = (id: string) => {
    setIntel((prev) => prev.map((ev) => (ev.id === id ? { ...ev, status: ev.status === 'pending' ? 'confirmed' : 'pending' } : ev)));
    setIntelDirty(true);
  };

  const removeIntel = (id: string) => {
    setIntel((prev) => prev.filter((ev) => ev.id !== id));
    setIntelDirty(true);
  };

  const seek = (value: number) => {
    setT(value);
    setPlaying(false);
  };

  const statusChip = {
    ready: <span className="chip chip-gold">可应用</span>,
    generating: <span className="chip chip-cyan"><Sparkles size={11} /> 生成中</span>,
    applied: <span className="chip chip-green"><Check size={11} /> 已应用</span>,
    stale: <span className="chip chip-red">方案已过期</span>,
  }[status];

  return (
    <div className="tac">
      <div className="tac-mobile-tabs" role="tablist" aria-label="战术指挥分区">
        {([['intel', '情报'], ['map', '地图'], ['plan', '方案']] as const).map(([id, label]) => (
          <button key={id} role="tab" aria-selected={pane === id} className={pane === id ? 'is-active' : ''} onClick={() => setPane(id)}>
            {label}
          </button>
        ))}
      </div>

      <div className={`tac-cols pane-${pane}`}>
        {/* ================= 左：情报与小队 ================= */}
        <aside className="tac-left">
          <section className="panel tac-intel">
            <div className="panel-head">
              <Radio size={15} className="muted" />
              <h3>语音情报</h3>
              <span className="eyebrow">VOICE INTEL</span>
              <div className="grow" />
              <span className={`dot ${presetPlaying ? 'dot--live' : 'dot--idle'}`} />
            </div>
            <div className="tac-intel__input">
              <div className="tac-mic">
                <button className="tac-mic__btn" aria-label="麦克风（演示模式不可用）" title="演示模式未接入麦克风">
                  <Mic size={18} />
                </button>
                <div className={`tac-wave${presetPlaying ? ' is-live' : ''}`} aria-hidden>
                  {Array.from({ length: 24 }).map((_, i) => (
                    <i key={i} style={{ animationDelay: `${i * 45}ms`, height: `${20 + ((i * 37) % 60)}%` }} />
                  ))}
                </div>
              </div>
              <div className="row">
                <button className="btn btn-sm btn-primary" onClick={playPreset}>
                  <Sparkles size={13} /> 播放预设情报
                </button>
                <span className="tiny faint">模拟输入 · 无麦克风</span>
              </div>
              <div className="tac-manual">
                <input
                  className="field"
                  placeholder="手动输入情报，如：2F 钢琴房有人"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addManual()}
                  aria-label="手动情报文本"
                />
                <select className="field" value={speakerId} onChange={(e) => setSpeakerId(e.target.value)} aria-label="说话人">
                  {state.members.map((m) => (
                    <option key={m.id} value={m.id}>{m.nickname}</option>
                  ))}
                </select>
                <button className="btn btn-sm" onClick={addManual} aria-label="添加情报">添加</button>
              </div>
            </div>

            <div className="tac-intel__stream">
              {intel.length === 0 && <div className="tac-empty">暂无情报。播放预设，或手动输入一条。</div>}
              {intel.map((ev) => {
                const speaker = state.members.find((m) => m.id === ev.speakerId);
                const room = ev.roomId ? FLOORS.flatMap((f) => f.rooms).find((r) => r.id === ev.roomId) : undefined;
                return (
                  <article key={ev.id} className={`intel-ev${ev.status === 'pending' ? ' is-pending' : ''}`}>
                    <div className="intel-ev__top">
                      <span className="num intel-ev__time">{fmt(ev.t)}</span>
                      <span className="dot" style={{ background: speaker?.color ?? '#33D6A6', boxShadow: 'none' }} />
                      <span className="intel-ev__who">{ev.speaker}</span>
                      <div className="grow" />
                      <span className={`chip ${ev.status === 'pending' ? 'chip-gold' : 'chip-green'}`}>{ev.status === 'pending' ? '待确认' : '已确认'}</span>
                    </div>
                    <p className="intel-ev__text">{ev.text}</p>
                    <div className="intel-ev__meta">
                      {room ? <span className="chip chip-cyan">{ev.floorId} · {room.name}</span> : <span className="chip">未定位</span>}
                      <span className="tiny faint">{ev.source === 'demo' ? '演示情报' : '手动输入'}</span>
                      <div className="grow" />
                      <button className="icon-btn" onClick={() => toggleConfirm(ev.id)} aria-label={ev.status === 'pending' ? '确认位置' : '取消确认'} title={ev.status === 'pending' ? '确认位置' : '取消确认'}>
                        <Check size={14} />
                      </button>
                      <button className="icon-btn icon-btn--danger" onClick={() => removeIntel(ev.id)} aria-label="删除这条情报" title="删除">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="panel tac-members">
            <div className="panel-head">
              <Users size={15} className="muted" />
              <h3>小队成员</h3>
              <span className="chip chip-green">5/5 · 演示</span>
            </div>
            <div className="tac-members__list">
              {state.members.map((m) => {
                const op = operatorById(m.operatorId);
                const active = selectedMember === m.id;
                return (
                  <button
                    key={m.id}
                    className={`tac-member${active ? ' is-active' : ''}`}
                    onClick={() => setSelectedMember(active ? null : m.id)}
                    aria-pressed={active}
                  >
                    <img src={iconOf(m.operatorId)} alt="" className="tac-member__icon" />
                    <div className="grow">
                      <div className="row" style={{ gap: 6 }}>
                        <span className="strong small">{m.nickname}</span>
                        {m.isLeader && <span className="chip chip-gold">队长</span>}
                        <span className="dot" style={{ background: m.color, boxShadow: 'none' }} />
                      </div>
                      <div className="tiny faint ellipsis">{op?.name} · {TASKS[m.id]}</div>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="tac-members__foot tiny faint">
              选中成员高亮其路线 · 全员状态为演示数据
            </div>
          </section>
        </aside>

        {/* ================= 中：地图与回放 ================= */}
        <section className="tac-center">
          <div className="panel tac-map-panel">
            <div className="tac-map-head">
              <div className="row" style={{ gap: 8 }}>
                <CrosshairGlyph />
                <div>
                  <div className="row" style={{ gap: 6 }}>
                    <h3 className="tac-map-title">咖啡馆 · Café-Sim</h3>
                    <span className="chip">示意场景</span>
                  </div>
                  <div className="tiny faint">自绘底图 · 非真实关卡结构 · 演示模式</div>
                </div>
              </div>
              <div className="grow" />
              <div className="segmented" role="group" aria-label="楼层">
                {FLOORS.map((f) => (
                  <button key={f.id} className={floorId === f.id ? 'is-active accent' : ''} onClick={() => setFloorId(f.id)}>
                    {f.label}
                  </button>
                ))}
              </div>
              <div className="segmented" role="group" aria-label="攻防">
                <button className={mode === 'attack' ? 'is-active' : ''} onClick={() => changeMode('attack')}>进攻</button>
                <button className={mode === 'defend' ? 'is-active' : ''} onClick={() => changeMode('defend')}>防守</button>
              </div>
              <div className="segmented" role="group" aria-label="目标点">
                {(['A', 'B'] as const).map((s) => (
                  <button key={s} className={site === s ? 'is-active' : ''} onClick={() => changeSite(s)}>{s} 点</button>
                ))}
              </div>
              <div className="tac-timer">
                <span className="eyebrow">剩余</span>
                <span className="num">02:35</span>
              </div>
            </div>

            {status === 'stale' && (
              <div className="tac-banner tac-banner--warn">
                <AlertTriangle size={13} />
                攻防 / 目标已变更，旧方案已失效，需重新生成后再应用。
                <button className="btn btn-sm btn-ghost" onClick={() => setPane('plan')}>去生成</button>
              </div>
            )}
            {intelDirty && appliedId && (
              <div className="tac-banner">
                <Radio size={13} /> 情报已更新，当前方案标记为“待复核”（路线仍保留，应用前建议重新生成）。
              </div>
            )}

            <div className="tac-layerbar">
              <span className="eyebrow">图层</span>
              <button className={`chip ${layers.routes ? 'chip-cyan' : ''}`} onClick={() => setLayers({ ...layers, routes: !layers.routes })} aria-pressed={layers.routes}>
                <Layers size={11} /> 路线
              </button>
              <button className={`chip ${layers.pins ? 'chip-red' : ''}`} onClick={() => setLayers({ ...layers, pins: !layers.pins })} aria-pressed={layers.pins}>
                <AlertTriangle size={11} /> 敌情
              </button>
              <button className={`chip ${layers.members ? 'chip-green' : ''}`} onClick={() => setLayers({ ...layers, members: !layers.members })} aria-pressed={layers.members}>
                <Users size={11} /> 队员
              </button>
              <button className={`chip ${layers.labels ? 'chip-gold' : ''}`} onClick={() => setLayers({ ...layers, labels: !layers.labels })} aria-pressed={layers.labels}>
                <Eye size={11} /> 标注
              </button>
              <div className="grow" />
              <span className="tiny faint">{appliedPlan ? `已应用：${appliedPlan.name}` : '未应用方案（仅情报图层）'}</span>
            </div>

            <TacticalMap
              floor={floor}
              plan={appliedPlan}
              phaseId={phase.id}
              t={t}
              members={state.members}
              showRoutes={layers.routes}
              showPins={layers.pins}
              showMembers={layers.members}
              showLabels={layers.labels}
              intel={intel}
              highlightMember={selectedMember}
            />
          </div>

          <div className="panel tac-replay">
            <div className="tac-replay__head">
              <div className="row" style={{ gap: 8 }}>
                <button className="tac-play" onClick={() => setPlaying((p) => !p)} aria-label={playing ? '暂停回放' : '播放回放'}>
                  {playing ? <Pause size={17} /> : <Play size={17} style={{ marginLeft: 2 }} />}
                </button>
                <div>
                  <div className="num tac-replay__time">{fmt(t)} <span className="faint">/ {fmt(ROUND_LENGTH)}</span></div>
                  <div className="tiny faint">阶段 · {phase.label} · {phase.hint}</div>
                </div>
              </div>
              <div className="grow" />
              <div className="segmented" role="group" aria-label="回放速度">
                {[0.5, 1, 2].map((s) => (
                  <button key={s} className={speed === s ? 'is-active' : ''} onClick={() => setSpeed(s)}>{s}x</button>
                ))}
              </div>
              <button className="btn btn-sm btn-ghost" onClick={() => { setT(0); setPlaying(false); }} aria-label="回到开头">
                <RotateCcw size={13} /> 重置
              </button>
            </div>

            <div className="tac-timeline">
              <div className="tac-timeline__phases" aria-hidden>
                {PHASES.map((p, i) => (
                  <div key={p.id} className={`tl-seg${i === phaseNo ? ' is-current' : ''}`} style={{ flex: p.end - p.start }}>
                    <span>{p.label}</span>
                    <span className="num">{fmt(p.start)}</span>
                  </div>
                ))}
              </div>
              <div className="tac-timeline__track">
                <div className="tac-timeline__fill" style={{ width: `${(t / ROUND_LENGTH) * 100}%` }} />
                <div className="tac-timeline__head" style={{ left: `${(t / ROUND_LENGTH) * 100}%` }} />
                <input
                  type="range"
                  min={0}
                  max={ROUND_LENGTH}
                  step={0.5}
                  value={t}
                  onChange={(e) => seek(Number(e.target.value))}
                  aria-label="回放时间轴"
                />
              </div>
            </div>

            <div className="tac-phase-tiles">
              {PHASES.map((p, i) => (
                <button
                  key={p.id}
                  className={`phase-tile${i === phaseNo ? ' is-active' : ''}${i < phaseNo ? ' is-past' : ''}`}
                  onClick={() => { seek(p.start + 0.5); setPane('map'); }}
                >
                  <span className="phase-tile__no num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="phase-tile__name">{p.label}</span>
                  <span className="phase-tile__time num">{fmt(p.start)} - {fmt(p.end)}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ================= 右：分析与方案 ================= */}
        <aside className="tac-right">
          <section className="panel tac-analysis">
            <div className="panel-head">
              <Sparkles size={15} className="muted" />
              <h3>战术分析</h3>
              <div className="grow" />
              {statusChip}
              <button className="btn btn-sm btn-ghost" onClick={generate} disabled={status === 'generating'} aria-label="重新生成方案">
                <RefreshCw size={13} className={status === 'generating' ? 'spin' : ''} />
              </button>
            </div>
            <div className="tac-tabs" role="tablist">
              {([['summary', '综合分析'], ['ops', '干员建议'], ['plans', '路线方案'], ['risks', '风险']] as const).map(([id, label]) => (
                <button key={id} role="tab" aria-selected={tab === id} className={tab === id ? 'is-active' : ''} onClick={() => setTab(id)}>
                  {label}
                </button>
              ))}
            </div>

            <div className="tac-analysis__body">
              {tab === 'summary' && (
                <>
                  <div className="tac-ctx">
                    <div><span className="faint tiny">场景</span><strong>Café-Sim</strong></div>
                    <div><span className="faint tiny">攻防</span><strong>{mode === 'attack' ? '进攻' : '防守'}</strong></div>
                    <div><span className="faint tiny">目标</span><strong>{site} 点 · {site === 'A' ? '2F' : '1F'}</strong></div>
                  </div>
                  <div className="tac-note">
                    <Sparkles size={12} /> 演示规则生成 · 未调用真实模型
                  </div>
                  <div className="tac-block">
                    <div className="tac-block__head"><span>关键情报</span><span className="tiny faint">{intel.filter((i) => i.status === 'confirmed').length} 条已确认</span></div>
                    {intel.filter((i) => selectedPlan.evidenceIds.includes(i.id)).map((ev) => (
                      <div key={ev.id} className="tac-evidence">
                        <span className="num faint">{fmt(ev.t)}</span>
                        <span className="grow">{ev.text}</span>
                        <span className={`chip ${ev.status === 'pending' ? 'chip-gold' : 'chip-green'}`}>{ev.status === 'pending' ? '待确认' : '已确认'}</span>
                      </div>
                    ))}
                    <div className="tac-evidence">
                      <span className="num faint">--:--</span>
                      <span className="grow faint">规则假设：主楼梯可通行、破拆资源可用</span>
                      <span className="chip">规则假设</span>
                    </div>
                  </div>
                  <div className="tac-block">
                    <div className="tac-block__head"><span>演示优先级</span><span className="tiny faint">非胜率</span></div>
                    <div className="tac-priority">
                      <span className="num">{Math.round(selectedPlan.priority === 1 ? 72 : 68)}</span>
                      <div className="tac-priority__bar"><i style={{ width: '72%' }} /></div>
                      <span className="tiny faint">规则评分</span>
                    </div>
                    <p className="tiny faint">该数值由规则模板给出，仅用于比较两套方案的演示优先级，不代表真实胜率。</p>
                  </div>
                </>
              )}

              {tab === 'ops' && (
                <>
                  <p className="tiny faint">依据当前阵容能力缺口与地图需求，给出可替换的干员建议。</p>
                  {OPERATOR_SUGGESTIONS.map((s) => {
                    const op = operatorById(s.operatorId);
                    return (
                      <div key={s.operatorId} className="op-suggest">
                        <img src={iconOf(s.operatorId)} alt="" />
                        <div className="grow">
                          <div className="row" style={{ gap: 6 }}>
                            <strong className="small">{op?.cn}</strong>
                            <span className="tiny faint">{op?.name} · {op?.role}</span>
                          </div>
                          <p className="tiny muted">{s.reason}</p>
                        </div>
                        <span className="chip chip-gold">{s.gap}</span>
                      </div>
                    );
                  })}
                  <div className="tac-block">
                    <div className="tac-block__head"><span>当前阵容</span><span className="tiny faint">5/5</span></div>
                    <div className="tac-squad-mini">
                      {state.members.map((m) => (
                        <div key={m.id} className="tac-squad-mini__item" title={`${m.nickname} · ${operatorById(m.operatorId)?.name}`}>
                          <img src={iconOf(m.operatorId)} alt="" />
                          <span>{m.nickname}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {tab === 'plans' && (
                <>
                  <div className="row between">
                    <span className="tiny faint">应用后路线才会落到地图</span>
                    <button className="btn btn-sm btn-ghost" onClick={generate} disabled={status === 'generating'}>
                      <RefreshCw size={12} className={status === 'generating' ? 'spin' : ''} /> 重新生成
                    </button>
                  </div>
                  {(mode === 'attack' ? attackPlans : PLANS.filter((p) => p.mode === 'defend')).map((plan) => (
                    <article
                      key={plan.id}
                      className={`plan-card${planId === plan.id ? ' is-selected' : ''}${appliedId === plan.id ? ' is-applied' : ''}`}
                      onClick={() => setPlanId(plan.id)}
                    >
                      <div className="plan-card__head">
                        <span className={`radio-dot${planId === plan.id ? ' is-on' : ''}`} />
                        <strong>{plan.name}</strong>
                        <div className="grow" />
                        <span className="chip">{plan.tag}</span>
                      </div>
                      <p className="small muted">{plan.summary}</p>
                      <div className="plan-card__meta">
                        {plan.requirements.map((r) => <span key={r} className="chip chip-cyan">{r}</span>)}
                        <span className="chip">{plan.duration}</span>
                        <span className="chip">引用 {plan.evidenceIds.length} 条情报</span>
                      </div>
                      <div className="plan-card__foot">
                        <span className="tiny faint">{appliedId === plan.id ? '当前已应用 · 地图可见' : '选中后可应用'}</span>
                        <button
                          className={`btn btn-sm ${appliedId === plan.id ? 'btn-ghost' : 'btn-primary'}`}
                          disabled={status === 'generating' || status === 'stale'}
                          onClick={(e) => { e.stopPropagation(); applyPlan(plan); }}
                        >
                          {appliedId === plan.id ? '重新播放' : '应用此方案'}
                        </button>
                      </div>
                    </article>
                  ))}
                  {status === 'stale' && <div className="tac-note tac-note--warn"><AlertTriangle size={12} /> 上下文已变化，请先重新生成。</div>}
                  {status === 'generating' && <div className="tac-note"><Sparkles size={12} /> 正在按演示规则计算可行路线…</div>}
                </>
              )}

              {tab === 'risks' && (
                <>
                  <p className="tiny faint">风险来自已确认情报与规则假设；不确定信息单独标注。</p>
                  {RISKS.map((r) => (
                    <div key={r.text} className="risk-item">
                      <span className={`chip ${r.level === '高' ? 'chip-red' : r.level === '中' ? 'chip-gold' : ''}`}>{r.level}</span>
                      <div className="grow">
                        <p className="small">{r.text}</p>
                        <span className="tiny faint">依据 {r.evidence} · {intel.find((i) => i.id === r.evidence)?.text.slice(0, 16) ?? '规则假设'}…</span>
                      </div>
                    </div>
                  ))}
                  <div className="tac-block">
                    <div className="tac-block__head"><span>待确认敌情</span><span className="tiny faint">{intel.filter((i) => i.status === 'pending').length} 条</span></div>
                    {ENEMY_PINS.filter((p) => intel.some((i) => i.id === p.evidenceId)).map((p) => (
                      <div key={p.id} className="tac-evidence">
                        <span className="chip chip-red">E</span>
                        <span className="grow">{p.label}</span>
                        <span className="tiny faint">{p.certainty}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </section>
        </aside>
      </div>

      <div className="tac-footnote">
        <Shield size={12} /> 演示模式 · 数据为固定样本，语音与 AI 均为规则模拟，不读取任何游戏进程或队友语音。
      </div>
    </div>
  );
}

function CrosshairGlyph() {
  return (
    <span className="tac-cross" aria-hidden>
      <span />
    </span>
  );
}

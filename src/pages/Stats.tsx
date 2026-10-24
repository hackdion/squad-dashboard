import { useMemo, useState, type FormEvent } from 'react';
import { Plus, Trash2, Undo2, X } from 'lucide-react';
import type { MatchRecord } from '../domain/types';
import { aggregate, formatTime, inRange, RANGE_LABELS, type Range } from '../domain/metrics';
import { MAPS, mapName } from '../data/operators';
import { useNexus } from '../state/nexus';
import './secondary.css';

type ResultFilter = 'all' | 'win' | 'loss';

interface FormState {
  mapId: string;
  result: 'win' | 'loss';
  scoreline: string;
  kills: string;
  deaths: string;
  score: string;
  playedAt: string;
}

const RANGES: Range[] = ['7d', '30d', 'season'];

function toLocalInput(date: Date): string {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function initialForm(): FormState {
  return {
    mapId: MAPS[0].id,
    result: 'win',
    scoreline: '',
    kills: '',
    deaths: '',
    score: '',
    playedAt: toLocalInput(new Date()),
  };
}

export default function Stats() {
  const { state, addMatch, removeMatch } = useNexus();

  const [range, setRange] = useState<Range>('30d');
  const [mapFilter, setMapFilter] = useState('all');
  const [resultFilter, setResultFilter] = useState<ResultFilter>('all');
  const [lastDeleted, setLastDeleted] = useState<MatchRecord | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const rangeMatches = useMemo(() => inRange(state.matches, range), [state.matches, range]);

  const filtered = useMemo(
    () =>
      rangeMatches
        .filter((match) => mapFilter === 'all' || match.mapId === mapFilter)
        .filter((match) => resultFilter === 'all' || match.result === resultFilter)
        .sort((a, b) => new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime()),
    [rangeMatches, mapFilter, resultFilter],
  );

  const summary = useMemo(() => aggregate(filtered), [filtered]);

  const toggleForm = () => {
    if (!formOpen) {
      setForm((prev) => ({ ...prev, playedAt: toLocalInput(new Date()) }));
      setErrors({});
    }
    setFormOpen(!formOpen);
  };

  const handleDelete = (record: MatchRecord) => {
    removeMatch(record.id);
    setLastDeleted(record);
  };

  const undoDelete = () => {
    if (!lastDeleted) return;
    addMatch(lastDeleted);
    setLastDeleted(null);
  };

  const buildRecord = (): { record?: MatchRecord; errors: Record<string, string> } => {
    const next: Record<string, string> = {};

    if (!form.mapId) next.mapId = '请选择地图';
    if (!form.playedAt) next.playedAt = '请选择对局时间';
    else if (Number.isNaN(new Date(form.playedAt).getTime())) next.playedAt = '对局时间无效';

    const scoreMatch = form.scoreline.trim().match(/^(\d{1,2})\s*[-:]\s*(\d{1,2})$/);
    let normalized = form.scoreline.trim();
    if (!scoreMatch) {
      next.scoreline = '比分格式应为“我方-对手”，如 4-2';
    } else {
      const ours = Number(scoreMatch[1]);
      const theirs = Number(scoreMatch[2]);
      normalized = `${ours}-${theirs}`;
      if (ours === theirs) {
        next.scoreline = '比分不能为平局';
      } else if (form.result === 'win' && ours < theirs) {
        next.scoreline = '结果为胜时，我方比分需高于对手';
      } else if (form.result === 'loss' && ours > theirs) {
        next.scoreline = '结果为负时，我方比分需低于对手';
      }
    }

    const kills = Number(form.kills);
    const deaths = Number(form.deaths);
    const score = Number(form.score);

    if (!form.kills.trim() || !Number.isInteger(kills) || kills < 0 || kills > 99) {
      next.kills = '击杀需为 0–99 的整数';
    }
    if (!form.deaths.trim() || !Number.isInteger(deaths) || deaths < 0 || deaths > 99) {
      next.deaths = '死亡需为 0–99 的整数';
    }
    if (!form.score.trim() || !Number.isInteger(score) || score < 0 || score > 99999) {
      next.score = '得分需为 0–99999 的整数';
    }

    if (Object.keys(next).length > 0) return { errors: next };

    return {
      errors: next,
      record: {
        id: `manual-${Date.now()}`,
        mapId: form.mapId,
        playedAt: new Date(form.playedAt).toISOString(),
        result: form.result,
        scoreline: normalized,
        kills,
        deaths,
        score,
      },
    };
  };

  const submitForm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { record, errors: nextErrors } = buildRecord();
    setErrors(nextErrors);
    if (!record) return;
    addMatch(record);
    setFormOpen(false);
    setForm((prev) => ({
      ...prev,
      scoreline: '',
      kills: '',
      deaths: '',
      score: '',
      playedAt: toLocalInput(new Date()),
    }));
  };

  return (
    <>
      <header className="sec-page-head fade-up">
        <div>
          <div className="eyebrow">MATCH LOG · LOCAL SAMPLE</div>
          <h1>战绩数据</h1>
          <p className="sec-page-sub">
            按时间窗、地图与结果筛选对局，实时查看胜率与 K/D；手动补录的战绩只保存在本地。
          </p>
        </div>
        <div className="sec-head-actions">
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={toggleForm}
            aria-expanded={formOpen}
            aria-controls="add-match-form"
          >
            {formOpen ? <X size={14} aria-hidden /> : <Plus size={14} aria-hidden />}
            {formOpen ? '收起表单' : '添加对局'}
          </button>
        </div>
      </header>

      {lastDeleted && (
        <div className="st-undo fade-in" role="status" aria-live="polite">
          <Trash2 size={14} aria-hidden />
          <span className="st-undo-text">
            已删除 1 场 · {mapName(lastDeleted.mapId)} {formatTime(lastDeleted.playedAt)}
          </span>
          <button type="button" className="btn btn-sm" onClick={undoDelete}>
            <Undo2 size={13} aria-hidden /> 撤销
          </button>
          <button
            type="button"
            className="btn btn-sm btn-ghost"
            onClick={() => setLastDeleted(null)}
            aria-label="关闭删除提示"
          >
            <X size={13} aria-hidden />
          </button>
        </div>
      )}

      {formOpen && (
        <section className="panel fade-up" id="add-match-form" aria-label="添加对局表单">
          <div className="panel-head">
            <h3>添加对局</h3>
            <span className="chip chip-demo">手动录入</span>
            <div className="grow" />
            <span className="tiny faint">保存后写入本地战绩样本</span>
          </div>
          <form className="panel-body st-form" onSubmit={submitForm} noValidate>
            <div className="st-field">
              <label htmlFor="f-map">地图</label>
              <select
                id="f-map"
                className="field"
                value={form.mapId}
                onChange={(event) => setForm((prev) => ({ ...prev, mapId: event.target.value }))}
                aria-invalid={Boolean(errors.mapId)}
                aria-describedby={errors.mapId ? 'f-map-error' : undefined}
              >
                {MAPS.map((map) => (
                  <option key={map.id} value={map.id}>
                    {map.cn} · {map.en}
                  </option>
                ))}
              </select>
              <span id="f-map-error" className="sec-field-error">
                {errors.mapId}
              </span>
            </div>

            <div className="st-field">
              <label htmlFor="f-result">结果</label>
              <select
                id="f-result"
                className="field"
                value={form.result}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    result: event.target.value === 'loss' ? 'loss' : 'win',
                  }))
                }
              >
                <option value="win">胜</option>
                <option value="loss">负</option>
              </select>
              <span className="sec-field-error" />
            </div>

            <div className="st-field">
              <label htmlFor="f-scoreline">比分（我方-对手）</label>
              <input
                id="f-scoreline"
                className={`field${errors.scoreline ? ' sec-input-invalid' : ''}`}
                value={form.scoreline}
                placeholder="4-2"
                inputMode="numeric"
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, scoreline: event.target.value }))
                }
                aria-invalid={Boolean(errors.scoreline)}
                aria-describedby={errors.scoreline ? 'f-scoreline-error' : undefined}
              />
              <span id="f-scoreline-error" className="sec-field-error">
                {errors.scoreline}
              </span>
            </div>

            <div className="st-field">
              <label htmlFor="f-kills">击杀</label>
              <input
                id="f-kills"
                className={`field${errors.kills ? ' sec-input-invalid' : ''}`}
                type="number"
                min={0}
                max={99}
                step={1}
                value={form.kills}
                onChange={(event) => setForm((prev) => ({ ...prev, kills: event.target.value }))}
                aria-invalid={Boolean(errors.kills)}
                aria-describedby={errors.kills ? 'f-kills-error' : undefined}
              />
              <span id="f-kills-error" className="sec-field-error">
                {errors.kills}
              </span>
            </div>

            <div className="st-field">
              <label htmlFor="f-deaths">死亡</label>
              <input
                id="f-deaths"
                className={`field${errors.deaths ? ' sec-input-invalid' : ''}`}
                type="number"
                min={0}
                max={99}
                step={1}
                value={form.deaths}
                onChange={(event) => setForm((prev) => ({ ...prev, deaths: event.target.value }))}
                aria-invalid={Boolean(errors.deaths)}
                aria-describedby={errors.deaths ? 'f-deaths-error' : undefined}
              />
              <span id="f-deaths-error" className="sec-field-error">
                {errors.deaths}
              </span>
            </div>

            <div className="st-field">
              <label htmlFor="f-score">得分</label>
              <input
                id="f-score"
                className={`field${errors.score ? ' sec-input-invalid' : ''}`}
                type="number"
                min={0}
                max={99999}
                step={1}
                value={form.score}
                onChange={(event) => setForm((prev) => ({ ...prev, score: event.target.value }))}
                aria-invalid={Boolean(errors.score)}
                aria-describedby={errors.score ? 'f-score-error' : undefined}
              />
              <span id="f-score-error" className="sec-field-error">
                {errors.score}
              </span>
            </div>

            <div className="st-field">
              <label htmlFor="f-time">时间</label>
              <input
                id="f-time"
                className={`field${errors.playedAt ? ' sec-input-invalid' : ''}`}
                type="datetime-local"
                value={form.playedAt}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, playedAt: event.target.value }))
                }
                aria-invalid={Boolean(errors.playedAt)}
                aria-describedby={errors.playedAt ? 'f-time-error' : undefined}
              />
              <span id="f-time-error" className="sec-field-error">
                {errors.playedAt}
              </span>
            </div>

            <div className="st-actions">
              <button type="button" className="btn" onClick={() => setFormOpen(false)}>
                取消
              </button>
              <button type="submit" className="btn btn-primary">
                保存对局
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="panel st-toolbar fade-up" aria-label="战绩筛选">
        <div className="panel-body st-filter-bar">
          <div className="st-filter-group">
            <span className="sec-label">时间窗</span>
            <div className="segmented" role="group" aria-label="时间窗筛选">
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
          <div className="st-filter-group">
            <label htmlFor="filter-map">地图</label>
            <select
              id="filter-map"
              className="field field--sm"
              value={mapFilter}
              onChange={(event) => setMapFilter(event.target.value)}
            >
              <option value="all">全部地图</option>
              {MAPS.map((map) => (
                <option key={map.id} value={map.id}>
                  {map.cn}
                </option>
              ))}
            </select>
          </div>
          <div className="st-filter-group">
            <label htmlFor="filter-result">结果</label>
            <select
              id="filter-result"
              className="field field--sm"
              value={resultFilter}
              onChange={(event) =>
                setResultFilter(
                  event.target.value === 'win'
                    ? 'win'
                    : event.target.value === 'loss'
                      ? 'loss'
                      : 'all',
                )
              }
            >
              <option value="all">全部结果</option>
              <option value="win">胜</option>
              <option value="loss">负</option>
            </select>
          </div>
          <span className="chip chip-cyan">{filtered.length} 场命中</span>
        </div>
      </section>

      <div className="sec-stat-grid st-summary">
        <div className="sec-stat-tile">
          <span className="sec-label">场次</span>
          <span className="sec-stat-value num">{summary.games}</span>
          <span className="tiny faint">
            {summary.wins} 胜 · {summary.losses} 负
          </span>
        </div>
        <div className="sec-stat-tile sec-stat-tile--green">
          <span className="sec-label">胜率</span>
          <span className="sec-stat-value num">{summary.winRate}%</span>
          <span className="tiny faint">
            {summary.wins} / {summary.games} 场
          </span>
        </div>
        <div className="sec-stat-tile sec-stat-tile--gold">
          <span className="sec-label">K / D</span>
          <span className="sec-stat-value num">{summary.kd.toFixed(2)}</span>
          <span className="tiny faint">
            {summary.kills} 击杀 / {summary.deaths} 死亡
          </span>
        </div>
        <div className="sec-stat-tile sec-stat-tile--red">
          <span className="sec-label">平均得分</span>
          <span className="sec-stat-value num">{summary.avgScore.toLocaleString('zh-CN')}</span>
          <span className="tiny faint">总分 {summary.totalScore.toLocaleString('zh-CN')}</span>
        </div>
      </div>

      <section className="panel fade-up" aria-label="对局记录">
        <div className="panel-head">
          <h3>对局记录</h3>
          <span className="chip chip-cyan">{filtered.length} 场</span>
          <div className="grow" />
          <span className="tiny faint">按时间倒序 · 删除后可撤销</span>
        </div>
        <div className="st-table-wrap">
          <table className="table st-table">
            <caption className="sr-only">对局记录，按时间倒序</caption>
            <thead>
              <tr>
                <th scope="col">时间</th>
                <th scope="col">地图</th>
                <th scope="col">结果</th>
                <th scope="col">比分</th>
                <th scope="col">击杀</th>
                <th scope="col">死亡</th>
                <th scope="col">K/D</th>
                <th scope="col">得分</th>
                <th scope="col">
                  <span className="sr-only">操作</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <div className="st-empty">当前筛选条件下没有对局</div>
                  </td>
                </tr>
              ) : (
                filtered.map((record) => (
                  <tr key={record.id}>
                    <td className="num">{formatTime(record.playedAt)}</td>
                    <td>{mapName(record.mapId)}</td>
                    <td>
                      <span className={`chip st-result st-result--${record.result}`}>
                        {record.result === 'win' ? '胜' : '负'}
                      </span>
                    </td>
                    <td className="st-score">{record.scoreline}</td>
                    <td className="num">{record.kills}</td>
                    <td className="num">{record.deaths}</td>
                    <td className="num st-kd">
                      {record.deaths ? (record.kills / record.deaths).toFixed(2) : '—'}
                    </td>
                    <td className="num">{record.score.toLocaleString('zh-CN')}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-sm btn-ghost st-delete"
                        onClick={() => handleDelete(record)}
                        aria-label={`删除 ${mapName(record.mapId)} ${formatTime(record.playedAt)} 的对局`}
                      >
                        <Trash2 size={13} aria-hidden />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <p className="small faint st-note">
          统计口径：胜率 = 胜场 / 已结束场次；K/D = 击杀 / 死亡；平均得分 = 总分 / 场次。筛选条件实时作用于上方汇总与下表。
        </p>
      </section>
    </>
  );
}

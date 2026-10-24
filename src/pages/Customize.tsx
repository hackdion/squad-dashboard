import { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Download,
  Eye,
  EyeOff,
  RotateCcw,
  Upload,
} from 'lucide-react';
import { useNexus } from '../state/nexus';
import { WIDGETS } from '../data/squad';
import type { AccentKey, AppState } from '../domain/types';
import './customize.css';

const ACCENTS: Array<{ key: AccentKey; label: string; color: string; note: string }> = [
  { key: 'cyan', label: '战术青', color: '#22D3EE', note: '默认 · 情报与路线高亮' },
  { key: 'gold', label: '警示金', color: '#F8C94A', note: '强调目标与主操作' },
  { key: 'green', label: '信号绿', color: '#33D6A6', note: '偏防守与稳定读数' },
];

const WIDGET_LABEL = new Map<string, string>(WIDGETS.map((w) => [w.id, w.label]));

function validateImport(raw: unknown): AppState | string {
  if (!raw || typeof raw !== 'object') return '文件内容不是有效的 JSON 对象';
  const data = raw as Partial<AppState>;
  if (data.schemaVersion !== 1) return '版本不匹配：需要 schemaVersion 1';
  if (typeof data.teamName !== 'string' || !data.teamName.trim()) return '缺少有效的队名';
  if (!Array.isArray(data.members) || data.members.length !== 5) return '成员数据必须为 5 人';
  if (!Array.isArray(data.matches)) return '缺少对局数据';
  if (!data.widgets || !Array.isArray(data.widgets.order)) return '缺少模块顺序配置';
  return data as AppState;
}

export default function Customize() {
  const { state, setState, setAccent, toggleWidget, moveWidget, reset, storageBlocked } = useNexus();

  const [nameDraft, setNameDraft] = useState(state.teamName);
  const [sloganDraft, setSloganDraft] = useState(state.slogan);
  const [confirmReset, setConfirmReset] = useState(false);
  const [notice, setNotice] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => setNameDraft(state.teamName), [state.teamName]);
  useEffect(() => setSloganDraft(state.slogan), [state.slogan]);

  const commitName = () => {
    const value = nameDraft.trim();
    if (value.length < 2 || value.length > 20) {
      setNameDraft(state.teamName);
      setNotice({ kind: 'error', text: '队名需为 2–20 字，已还原' });
      return;
    }
    if (value !== state.teamName) setState({ teamName: value });
    setNotice(null);
  };

  const commitSlogan = () => {
    const value = sloganDraft.trim();
    if (value !== state.slogan) setState({ slogan: value });
  };

  const resetOrder = () => {
    setState({ widgets: { order: WIDGETS.map((w) => w.id), hidden: [] } });
    setNotice({ kind: 'ok', text: '首页模块已恢复默认顺序与显示' });
  };

  const exportConfig = () => {
    const payload = JSON.stringify({ ...state, exportedAt: new Date().toISOString() }, null, 2);
    const url = URL.createObjectURL(new Blob([payload], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexus-ai-${state.teamName || 'squad'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setNotice({ kind: 'ok', text: '配置已导出为 JSON 文件' });
  };

  const importConfig = async (file: File) => {
    try {
      const parsed: unknown = JSON.parse(await file.text());
      const result = validateImport(parsed);
      if (typeof result === 'string') {
        setNotice({ kind: 'error', text: `导入失败：${result}` });
        return;
      }
      setState(result);
      setConfirmReset(false);
      setNotice({ kind: 'ok', text: '配置已导入，页面数据已更新' });
    } catch {
      setNotice({ kind: 'error', text: '导入失败：文件不是合法 JSON' });
    }
  };

  const doReset = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    reset();
    setConfirmReset(false);
    setNotice({ kind: 'ok', text: '已恢复演示默认配置（28 场战绩）' });
  };

  return (
    <div className="cz">
      <header className="cz-head fade-up">
        <div>
          <div className="eyebrow">SETTINGS · 可自定义</div>
          <h2 className="cz-title">自定义工作台</h2>
          <p className="cz-sub">修改后立即生效并保存在本地浏览器，不会上传任何数据。</p>
        </div>
        <span className="chip chip-demo">演示模式 · 仅本地存储</span>
      </header>

      {storageBlocked && (
        <div className="cz-alert">
          <AlertTriangle size={14} aria-hidden />
          浏览器禁用了本地存储，本次修改仅在当前页面生效，刷新后会还原。
        </div>
      )}

      {notice && (
        <div className={`cz-note ${notice.kind === 'error' ? 'is-error' : 'is-ok'}`} role="status">
          {notice.text}
        </div>
      )}

      <div className="cz-grid">
        <section className="panel fade-up">
          <div className="panel-head">
            <h3>队伍身份</h3>
            <span className="faint tiny">实时写入顶栏与首页</span>
          </div>
          <div className="panel-body cz-body">
            <label className="cz-field">
              <span>队名</span>
              <input
                className="field"
                value={nameDraft}
                maxLength={20}
                onChange={(e) => setNameDraft(e.target.value)}
                onBlur={commitName}
                onKeyDown={(e) => e.key === 'Enter' && commitName()}
              />
              <em>{nameDraft.length}/20</em>
            </label>
            <label className="cz-field">
              <span>标语</span>
              <input
                className="field"
                value={sloganDraft}
                maxLength={40}
                onChange={(e) => setSloganDraft(e.target.value)}
                onBlur={commitSlogan}
                onKeyDown={(e) => e.key === 'Enter' && commitSlogan()}
              />
              <em>{sloganDraft.length}/40</em>
            </label>
          </div>
        </section>

        <section className="panel fade-up">
          <div className="panel-head">
            <h3>强调色</h3>
            <span className="faint tiny">全局高亮与按钮</span>
          </div>
          <div className="panel-body cz-body">
            <div className="cz-accents">
              {ACCENTS.map((a) => (
                <button
                  key={a.key}
                  type="button"
                  className={`cz-accent ${state.accent === a.key ? 'is-active' : ''}`}
                  onClick={() => setAccent(a.key)}
                  aria-pressed={state.accent === a.key}
                >
                  <i style={{ background: a.color }} aria-hidden />
                  <strong>{a.label}</strong>
                  <span>{a.note}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="panel cz-widgets fade-up">
          <div className="panel-head">
            <h3>首页模块</h3>
            <div className="row" style={{ marginLeft: 'auto' }}>
              <button type="button" className="btn btn-sm btn-ghost" onClick={resetOrder}>
                <RotateCcw size={13} aria-hidden />
                恢复顺序
              </button>
            </div>
          </div>
          <div className="cz-widget-list">
            {state.widgets.order.map((id, index) => {
              const hidden = state.widgets.hidden.includes(id);
              return (
                <div key={id} className={`cz-widget ${hidden ? 'is-hidden' : ''}`}>
                  <span className="cz-widget__idx">{String(index + 1).padStart(2, '0')}</span>
                  <span className="cz-widget__label">{WIDGET_LABEL.get(id) ?? id}</span>
                  <div className="cz-widget__ops">
                    <button
                      type="button"
                      className="icon-btn"
                      disabled={index === 0}
                      onClick={() => moveWidget(id, -1)}
                      aria-label={`上移 ${WIDGET_LABEL.get(id) ?? id}`}
                    >
                      <ArrowUp size={14} aria-hidden />
                    </button>
                    <button
                      type="button"
                      className="icon-btn"
                      disabled={index === state.widgets.order.length - 1}
                      onClick={() => moveWidget(id, 1)}
                      aria-label={`下移 ${WIDGET_LABEL.get(id) ?? id}`}
                    >
                      <ArrowDown size={14} aria-hidden />
                    </button>
                    <button
                      type="button"
                      className="icon-btn"
                      onClick={() => toggleWidget(id)}
                      aria-label={`${hidden ? '显示' : '隐藏'} ${WIDGET_LABEL.get(id) ?? id}`}
                    >
                      {hidden ? <EyeOff size={14} aria-hidden /> : <Eye size={14} aria-hidden />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="panel fade-up">
          <div className="panel-head">
            <h3>数据与备份</h3>
            <span className="faint tiny">{state.matches.length} 场对局</span>
          </div>
          <div className="panel-body cz-body">
            <div className="cz-actions">
              <button type="button" className="btn" onClick={exportConfig}>
                <Download size={14} aria-hidden />
                导出配置
              </button>
              <button type="button" className="btn" onClick={() => fileRef.current?.click()}>
                <Upload size={14} aria-hidden />
                导入配置
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="application/json,.json"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void importConfig(file);
                  e.target.value = '';
                }}
              />
            </div>
            <div className={`cz-reset ${confirmReset ? 'is-confirming' : ''}`}>
              <div>
                <strong>恢复默认配置</strong>
                <span>重置队名、成员、模块与 28 场演示战绩，不可撤销。</span>
              </div>
              <div className="row">
                {confirmReset && (
                  <button type="button" className="btn btn-sm btn-ghost" onClick={() => setConfirmReset(false)}>
                    取消
                  </button>
                )}
                <button type="button" className="btn btn-sm btn-danger" onClick={doReset}>
                  {confirmReset ? '确认重置' : '恢复默认'}
                </button>
              </div>
            </div>
            <p className="cz-hint">导出文件包含 schemaVersion，可直接在另一台设备导入还原整套看板配置。</p>
          </div>
        </section>
      </div>

      <footer className="cz-foot">
        所有数据为演示样本，语音转写与 AI 建议均为本地模拟，未调用真实模型。
      </footer>
    </div>
  );
}

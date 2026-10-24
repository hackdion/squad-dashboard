import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { AlertTriangle, CheckCircle2, Crown, RotateCcw, Shield } from 'lucide-react';
import { useNexus } from '../state/nexus';
import { OPERATORS, operatorById } from '../data/operators';
import { DEFAULT_MEMBERS } from '../data/squad';
import { iconOf, portraitOf } from '../lib/asset';
import './secondary.css';

const BREACH_IDS = ['sledge', 'thermite', 'hibana'];

export default function Squad() {
  const { state, setState, updateMember } = useNexus();

  const [nameDraft, setNameDraft] = useState(state.teamName);
  const [sloganDraft, setSloganDraft] = useState(state.slogan);
  const [nameError, setNameError] = useState('');
  const [nickDrafts, setNickDrafts] = useState<Record<string, string>>(() =>
    Object.fromEntries(state.members.map((m) => [m.id, m.nickname])),
  );

  useEffect(() => {
    setNameDraft(state.teamName);
    setNameError('');
  }, [state.teamName]);

  useEffect(() => {
    setSloganDraft(state.slogan);
  }, [state.slogan]);

  const saveTeamName = () => {
    const value = nameDraft.trim();
    if (!value) {
      setNameError('队名不能为空（2–20 字）');
      return;
    }
    if (value.length < 2 || value.length > 20) {
      setNameError('队名需为 2–20 字');
      return;
    }
    setNameError('');
    setNameDraft(value);
    if (value !== state.teamName) setState({ teamName: value });
  };

  const saveSlogan = () => {
    const value = sloganDraft.trim();
    setSloganDraft(value);
    if (value !== state.slogan) setState({ slogan: value });
  };

  const commitNickname = (id: string) => {
    const value = (nickDrafts[id] ?? '').trim();
    if (!value) return;
    setNickDrafts((prev) => ({ ...prev, [id]: value }));
    const member = state.members.find((m) => m.id === id);
    if (member && member.nickname !== value) updateMember(id, { nickname: value });
  };

  const changeOperator = (memberId: string, operatorId: string) => {
    const op = operatorById(operatorId);
    if (!op) return;
    updateMember(memberId, { operatorId: op.id, duty: `${op.role} · ${op.ability}` });
  };

  const restoreDefaults = () => {
    const fresh = DEFAULT_MEMBERS.map((m) => ({ ...m }));
    setState({ members: fresh });
    setNickDrafts(Object.fromEntries(fresh.map((m) => [m.id, m.nickname])));
  };

  const analysis = useMemo(() => {
    const counts = new Map<string, number>();
    for (const member of state.members) {
      counts.set(member.operatorId, (counts.get(member.operatorId) ?? 0) + 1);
    }
    const duplicates = [...counts.entries()]
      .filter(([, count]) => count > 1)
      .map(([id, count]) => `${operatorById(id)?.cn ?? id} × ${count}`);

    const filled = state.members.filter((m) => Boolean(m.operatorId)).length;
    const attackCount = state.members.filter(
      (m) => operatorById(m.operatorId)?.side === 'attack',
    ).length;
    const defenseCount = state.members.filter(
      (m) => operatorById(m.operatorId)?.side === 'defense',
    ).length;
    const breachMembers = state.members.filter((m) => BREACH_IDS.includes(m.operatorId));
    const breachNames = [...new Set(breachMembers.map((m) => operatorById(m.operatorId)?.cn ?? m.operatorId))];
    const hasBreach = breachMembers.length > 0;
    const emptyNicknames = state.members.filter(
      (m) => !(nickDrafts[m.id] ?? m.nickname).trim(),
    ).length;

    const issues: string[] = [];
    if (filled < 5) issues.push(`还有 ${5 - filled} 个席位未配置干员`);
    if (duplicates.length) issues.push(`重复干员：${duplicates.join('、')}`);
    if (!hasBreach) issues.push('缺少破拆资源：Sledge / Thermite / Hibana 至少需要一名');
    if (emptyNicknames) issues.push(`有 ${emptyNicknames} 个席位昵称为空`);

    return {
      filled,
      attackCount,
      defenseCount,
      breachNames,
      breachCount: breachMembers.length,
      hasBreach,
      emptyNicknames,
      duplicates,
      issues,
      ready: issues.length === 0,
    };
  }, [state.members, nickDrafts]);

  const checks = [
    {
      label: '席位配置',
      hint: '五个席位均需选择干员',
      ok: analysis.filled === 5,
      value: `${analysis.filled} / 5`,
    },
    {
      label: '干员唯一性',
      hint: analysis.duplicates.length ? `重复：${analysis.duplicates.join('、')}` : '未检测到重复干员',
      ok: analysis.duplicates.length === 0,
      value: analysis.duplicates.length ? `${analysis.duplicates.length} 组` : '唯一',
    },
    {
      label: '破拆资源',
      hint: analysis.hasBreach ? '已具备外墙 / 加固突破手段' : '建议补入 Sledge / Thermite / Hibana',
      ok: analysis.hasBreach,
      value: analysis.hasBreach ? analysis.breachNames.join(' / ') : '缺失',
    },
    {
      label: '昵称完整性',
      hint: analysis.emptyNicknames ? '空昵称席位不会被误保存' : '五个席位昵称均已填写',
      ok: analysis.emptyNicknames === 0,
      value: analysis.emptyNicknames ? `${analysis.emptyNicknames} 个空` : '完整',
    },
  ];

  const leader = state.members.find((m) => m.isLeader);
  const onlineCount = state.members.filter((m) => m.online).length;

  return (
    <>
      <header className="sec-page-head fade-up">
        <div>
          <div className="eyebrow">SQUAD ROSTER · 5 SEATS</div>
          <h1>我的小队</h1>
          <p className="sec-page-sub">
            五个人，才是彩虹六号。逐席校对昵称、干员与职责，开黑前把阵容短板补齐。
          </p>
        </div>
        <div className="sec-head-actions">
          <a className="btn btn-sm" href="#/operators">
            <Shield size={14} aria-hidden /> 浏览干员库
          </a>
          <button type="button" className="btn btn-primary btn-sm" onClick={restoreDefaults}>
            <RotateCcw size={14} aria-hidden /> 恢复默认阵容
          </button>
        </div>
      </header>

      <section className="panel sq-identity fade-up" aria-label="小队身份编辑">
        <div className="sq-crest" aria-hidden>
          {state.teamName.trim().slice(0, 1) || 'N'}
        </div>
        <div className="sq-team-fields">
          <label className="sec-label" htmlFor="team-name">
            队伍名称
          </label>
          <input
            id="team-name"
            className={`field sq-name-input${nameError ? ' sec-input-invalid' : ''}`}
            value={nameDraft}
            maxLength={20}
            onChange={(event) => setNameDraft(event.target.value)}
            onBlur={saveTeamName}
            onKeyDown={(event) => {
              if (event.key === 'Enter') event.currentTarget.blur();
            }}
            aria-invalid={Boolean(nameError)}
            aria-describedby="team-name-hint"
          />
          <span id="team-name-hint" className={nameError ? 'sec-field-error' : 'sec-hint'}>
            {nameError || '2–20 字，失焦自动保存'}
          </span>
          <label className="sec-label" htmlFor="team-slogan">
            队伍标语
          </label>
          <input
            id="team-slogan"
            className="field sq-slogan-input"
            value={sloganDraft}
            maxLength={40}
            placeholder="给队伍一句开场白"
            onChange={(event) => setSloganDraft(event.target.value)}
            onBlur={saveSlogan}
            onKeyDown={(event) => {
              if (event.key === 'Enter') event.currentTarget.blur();
            }}
          />
          <span className="sec-hint">最多 40 字，失焦自动保存，可留空</span>
        </div>
        <div className="sq-meta">
          <span className="chip chip-cyan">
            <span className="dot dot--live" /> {onlineCount} / 5 在线 · 模拟
          </span>
          <span className="tiny faint">战绩记录 {state.matches.length} 场保留</span>
          <span className="tiny faint">队长：{leader?.nickname || '未指定'}</span>
        </div>
      </section>

      <div className="sq-layout">
        <section className="sq-seats" aria-label="五个小队席位">
          {state.members.map((member, index) => {
            const op = operatorById(member.operatorId);
            const side = op?.side ?? 'attack';
            const nickValue = nickDrafts[member.id] ?? member.nickname;
            const nickEmpty = !nickValue.trim();

            return (
              <article
                key={member.id}
                className="panel sq-seat fade-up"
                style={{ '--d': `${index * 55}ms` } as CSSProperties}
              >
                <div className="sq-portrait">
                  <img className="sq-icon" src={iconOf(member.operatorId)} alt="" aria-hidden />
                  <img
                    className="sq-render"
                    src={portraitOf(member.operatorId)}
                    alt={`${op?.cn ?? '干员'} 立绘`}
                    onError={(event) => {
                      event.currentTarget.style.display = 'none';
                    }}
                  />
                  {member.isLeader && (
                    <span className="sq-crown">
                      <Crown size={11} aria-hidden /> 队长
                    </span>
                  )}
                  <span
                    className={`chip sq-side ${side === 'attack' ? 'op-side-attack' : 'op-side-defense'}`}
                  >
                    {side === 'attack' ? '进攻' : '防守'}
                  </span>
                </div>
                <div className="sq-seat-body">
                  <div className="between">
                    <span className="sec-label">SLOT {String(index + 1).padStart(2, '0')}</span>
                    <span className="tiny faint">{op?.cn ?? '未配置'}</span>
                  </div>
                  <div className="sq-field">
                    <label className="sr-only" htmlFor={`nick-${member.id}`}>
                      席位 {index + 1} 昵称
                    </label>
                    <input
                      id={`nick-${member.id}`}
                      className={`field sq-nick${nickEmpty ? ' sec-input-invalid' : ''}`}
                      value={nickValue}
                      maxLength={16}
                      placeholder="输入昵称"
                      onChange={(event) =>
                        setNickDrafts((prev) => ({ ...prev, [member.id]: event.target.value }))
                      }
                      onBlur={() => commitNickname(member.id)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') event.currentTarget.blur();
                      }}
                      aria-invalid={nickEmpty}
                      aria-describedby={`nick-hint-${member.id}`}
                    />
                    <span
                      id={`nick-hint-${member.id}`}
                      className={nickEmpty ? 'sec-field-error' : 'sec-hint'}
                    >
                      {nickEmpty ? '昵称不能为空（1–16 字）' : '1–16 字，失焦保存'}
                    </span>
                  </div>
                  <div className="sq-field">
                    <label className="sr-only" htmlFor={`op-${member.id}`}>
                      席位 {index + 1} 干员
                    </label>
                    <select
                      id={`op-${member.id}`}
                      className="field sq-op-select"
                      value={member.operatorId}
                      onChange={(event) => changeOperator(member.id, event.target.value)}
                      aria-describedby={`duty-${member.id}`}
                    >
                      {OPERATORS.map((option) => {
                        const usedByOther = state.members.some(
                          (x) => x.id !== member.id && x.operatorId === option.id,
                        );
                        return (
                          <option key={option.id} value={option.id} disabled={usedByOther}>
                            {option.cn} · {option.name}
                            {usedByOther ? '（已选用）' : ''}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <div className="sq-duty" id={`duty-${member.id}`}>
                    <span className="sec-label">DUTY · </span>
                    {member.duty || `${op?.role ?? ''} · ${op?.ability ?? ''}`}
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        <aside className="sq-aside">
          <section className="panel" aria-label="阵容检查">
            <div className="panel-head">
              <h3>阵容检查</h3>
              <div className="grow" />
              <span className={`chip ${analysis.ready ? 'chip-green' : 'chip-red'}`}>
                {analysis.ready ? '通过' : `${analysis.issues.length} 项待修正`}
              </span>
            </div>
            <div className="panel-body stack">
              <div className={`sq-status ${analysis.ready ? 'is-ok' : 'is-bad'}`} role="status">
                {analysis.ready ? (
                  <CheckCircle2 size={15} aria-hidden />
                ) : (
                  <AlertTriangle size={15} aria-hidden />
                )}
                <span>
                  {analysis.ready
                    ? '5 / 5 阵容就绪，可以开黑'
                    : '阵容校验未通过，请修正下列问题'}
                </span>
              </div>

              <ul className="sq-check-list">
                {checks.map((check) => (
                  <li className="sq-check" key={check.label}>
                    {check.ok ? (
                      <CheckCircle2 size={14} className="ok" aria-hidden />
                    ) : (
                      <AlertTriangle size={14} className="bad" aria-hidden />
                    )}
                    <span>
                      <span className="small strong">{check.label}</span>
                      <span className="sq-check-hint">{check.hint}</span>
                    </span>
                    <span className={`sq-check-value${check.ok ? '' : ' is-bad'}`}>
                      {check.value}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="sq-comp">
                <div className="sq-comp-cell">
                  <span className="sec-label">进攻干员</span>
                  <span className="num">{analysis.attackCount}</span>
                </div>
                <div className="sq-comp-cell">
                  <span className="sec-label">防守干员</span>
                  <span className="num">{analysis.defenseCount}</span>
                </div>
              </div>
              <div className="between tiny faint">
                <span>攻防构成按干员阵营统计</span>
                <span>破坏位 {analysis.breachCount} 名</span>
              </div>

              {analysis.issues.length > 0 ? (
                <div className="sq-issues" role="alert">
                  {analysis.issues.map((issue) => (
                    <p key={issue}>· {issue}</p>
                  ))}
                </div>
              ) : (
                <div className="sq-ready">破拆资源齐全，无重复干员，昵称完整。</div>
              )}
            </div>
          </section>
        </aside>
      </div>

      <section className="panel sq-roster fade-up" aria-label="干员与职责一览">
        <div className="panel-head">
          <h3>干员与职责一览</h3>
          <span className="chip chip-cyan">{state.members.length} / 5 席位</span>
          <div className="grow" />
          <span className="tiny faint">恢复默认阵容不会清空战绩</span>
        </div>
        <div className="sq-roster-grid">
          {state.members.map((member) => {
            const op = operatorById(member.operatorId);
            return (
              <div className="sq-roster-row" key={member.id}>
                <span className="sq-roster-icon">
                  <img src={iconOf(member.operatorId)} alt="" aria-hidden />
                </span>
                <span className="grow">
                  <span className="row">
                    <span className="sq-roster-name">{member.nickname || '未命名'}</span>
                    <span className="tiny faint">{op?.cn ?? '—'}</span>
                  </span>
                  <span className="sq-roster-duty ellipsis">{member.duty}</span>
                </span>
                {member.isLeader && <Crown size={12} className="sq-roster-crown" aria-label="队长" />}
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}

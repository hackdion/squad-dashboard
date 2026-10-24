import type { ReactNode } from 'react';
import { LayoutDashboard, Crosshair, Users, Shield, Map as MapIcon, BarChart3, SlidersHorizontal, Wifi } from 'lucide-react';

export const NAV = [
  { path: '/', label: '总览', icon: LayoutDashboard },
  { path: '/tactical', label: '战术指挥', icon: Crosshair },
  { path: '/squad', label: '我的小队', icon: Users },
  { path: '/operators', label: '干员库', icon: Shield },
  { path: '/maps', label: '地图分析', icon: MapIcon },
  { path: '/stats', label: '战绩数据', icon: BarChart3 },
  { path: '/custom', label: '自定义', icon: SlidersHorizontal },
];

export const TITLES: Record<string, string> = {
  '/': '小队作战简报',
  '/tactical': '战术指挥中心',
  '/squad': '我的小队',
  '/operators': '干员库',
  '/maps': '地图分析',
  '/stats': '战绩数据',
  '/custom': '自定义看板',
};

export function Rail({ route }: { route: string }) {
  return (
    <aside className="rail" aria-label="主导航">
      <div className="rail-brand">
        <div className="rail-mark">N</div>
        <div className="rail-word">NEXUS</div>
        <div className="rail-sub">AI</div>
      </div>
      <nav className="rail-nav">
        {NAV.map(({ path, label, icon: Icon }) => {
          const active = route === path;
          return (
            <a key={path} href={`#${path}`} className={`rail-item${active ? ' is-active' : ''}`} aria-current={active ? 'page' : undefined}>
              <Icon aria-hidden />
              <span>{label}</span>
            </a>
          );
        })}
      </nav>
      <div className="rail-foot">
        <Wifi size={14} />
        <span>SQUAD LINK · DEMO</span>
      </div>
    </aside>
  );
}

export function AppShell({
  route,
  title,
  actions,
  children,
  flush = false,
}: {
  route: string;
  title?: string;
  actions?: ReactNode;
  children: ReactNode;
  flush?: boolean;
}) {
  return (
    <div className="app">
      <div className="app-bg" aria-hidden />
      <Rail route={route} />
      <div className="app-main">
        <header className="topbar">
          <div className="topbar-title">{title ?? TITLES[route] ?? 'NEXUS AI'}</div>
          <div className="topbar-sep" />
          <span className="chip chip-demo">演示模式</span>
          <span className="chip chip-green">
            <span className="dot dot--live" />
            5/5 在线 · 模拟
          </span>
          <div className="topbar-spacer" />
          {actions}
          <a className="btn btn-sm" href="#/custom">
            <SlidersHorizontal aria-hidden /> 自定义
          </a>
          <div className="avatar">KD</div>
        </header>
        <main className={flush ? 'page page--flush' : 'page'}>{children}</main>
      </div>
    </div>
  );
}

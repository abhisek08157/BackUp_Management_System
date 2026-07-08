import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import instanceService from '../services/instanceService.js';
import historyService from '../services/historyService.js';
import { DEMO_MODE } from '../config.js';

export default function Header() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({ total: 0, active: 0, failedToday: 0, lastBackup: '—' });

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [instances, history] = await Promise.all([instanceService.list(), historyService.list()]);
        if (!mounted) return;
        const active = instances.filter((i) => i.status === 'ACTIVE').length;
        const failedToday = history.filter((h) => h.status === 'FAILED' && Date.now() - new Date(h.startedAt).getTime() < 86400000).length;
        const completed = history.filter((h) => h.status === 'COMPLETED').sort((a, b) => new Date(b.finishedAt) - new Date(a.finishedAt))[0];
        setStats({
          total: instances.length,
          active,
          failedToday,
          lastBackup: completed ? new Date(completed.finishedAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'
        });
      } catch { /* ignore in header */ }
    };
    load();
    const t = setInterval(load, 10000);
    return () => { mounted = false; clearInterval(t); };
  }, []);

  const initials = (user?.username || 'AD').slice(0, 2).toUpperCase();

  return (
    <header>
      <div className="hdr-top">
        <span>भारतीय रेल · Government of India · Ministry of Railways</span>
        <span>Backup Monitoring Console v2.4 &nbsp;|&nbsp; {DEMO_MODE ? 'Mode: Demo Data (src/config.js)' : 'Mode: Live Backend (http://localhost:8080)'}</span>
      </div>
      <div className="hdr-main">
        <div className="hdr-emblem" aria-hidden="true">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="11" stroke="#0B3D6F" strokeWidth="1.4" />
            {Array.from({ length: 24 }).map((_, i) => (
              <line key={i} x1="12" y1="12" x2={12 + 9 * Math.cos((i * Math.PI) / 12)} y2={12 + 9 * Math.sin((i * Math.PI) / 12)} stroke="#0B3D6F" strokeWidth="0.6" />
            ))}
            <circle cx="12" cy="12" r="2.4" fill="#0B3D6F" />
          </svg>
        </div>
        <div className="hdr-titles">
          <div className="t1">Indian Railways — Backup Monitoring Console</div>
          <div className="t2">East Coast Railway &nbsp;·&nbsp; Database Administration Wing</div>
        </div>
        <div className="hdr-spacer" />
        {user && (
          <div className="hdr-user">
            <div className="avatar">{initials}</div>
            <div>
              <div style={{ fontWeight: 600 }}>{user.username}</div>
              <div style={{ fontSize: 11, color: '#C7DAF0' }}>{user.role} · {user.zone}</div>
            </div>
            <button className="hdr-logout" onClick={logout}>Sign out</button>
          </div>
        )}
      </div>
      <div className="tricolor-strip" />
      {user && (
        <div className="status-board">
          <div className="cell">
            <span className="label">Registered instances</span>
            <span className="value">{stats.total}</span>
          </div>
          <div className="cell green">
            <span className="label">Active now</span>
            <span className="value">{stats.active}</span>
          </div>
          <div className={`cell ${stats.failedToday > 0 ? 'red' : 'green'}`}>
            <span className="label">Failures (24h)</span>
            <span className="value">{stats.failedToday}</span>
          </div>
          <div className="cell amber">
            <span className="label">Last completed backup</span>
            <span className="value">{stats.lastBackup}</span>
          </div>
        </div>
      )}
    </header>
  );
}

import React from 'react';
import { NavLink } from 'react-router-dom';

const items = [
  { to: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { to: '/instances', label: 'Instances', icon: '🗄️' },
  { to: '/backup/run', label: 'Manual Backup', icon: '⚡' },
  { to: '/schedules', label: 'Schedule Backup', icon: '🕒' },
  { to: '/history', label: 'Backup History', icon: '📜' }
];

export default function Sidebar() {
  return (
    <nav className="sidebar">
      <div className="nav-section-label">Operations</div>
      {items.map((it) => (
        <NavLink key={it.to} to={it.to} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
          <span aria-hidden="true">{it.icon}</span>
          <span>{it.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

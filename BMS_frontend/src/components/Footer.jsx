import React from 'react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="links">
        <a href="#!">About CRIS</a>
        <a href="#!">Data Security Policy</a>
        <a href="#!">Backup SOP</a>
        <a href="#!">Support Desk</a>
        <a href="#!">Contact DBA Cell</a>
      </div>
      <div>© {new Date().getFullYear()} Centre for Railway Information Systems (CRIS), Ministry of Railways. All rights reserved.</div>
      <div style={{ marginTop: 2, opacity: 0.75 }}>Backup Monitoring Console is an internal administrative system. Unauthorized access is prohibited.</div>
    </footer>
  );
}

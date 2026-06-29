import { useState, useEffect, useCallback, useMemo } from "react";
import {
  LayoutDashboard,
  Database,
  PlayCircle,
  History,
  CalendarClock,
  LogOut,
  Plus,
  Pencil,
  Trash2,
  Eye,
  Download,
  X,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
  Lock,
  User as UserIcon,
  Server,
} from "lucide-react";

/* =========================================================================
   CONFIG
   ========================================================================= */
const BASE_URL = "http://localhost:8080";

/* =========================================================================
   API LAYER — every call maps 1:1 to the spec. Swap MOCK_MODE off once
   the real backend is reachable from the browser running this app.
   ========================================================================= */
const MOCK_MODE = false;

const mockDb = {
  instances: [
    { instanceId: 1, instanceName: "ICARD_DB", databaseName: "railway_icard", ipAddress: "localhost", port: 3306, dbUsername: "root", dbPassword: "root", status: "ACTIVE" },
    { instanceId: 2, instanceName: "TICKETING_DB", databaseName: "railway_ticketing", ipAddress: "192.168.1.20", port: 3306, dbUsername: "root", dbPassword: "root", status: "ACTIVE" },
    { instanceId: 3, instanceName: "SIGNAL_DB", databaseName: "railway_signal", ipAddress: "192.168.1.21", port: 5432, dbUsername: "postgres", dbPassword: "postgres", status: "INACTIVE" },
  ],
  history: [
    { backupId: 1, instanceId: 1, instanceName: "ICARD_DB", backupDate: "2026-06-11T15:30:00", backupFile: "C:\\RailwayBackups\\icard.sql", backupSize: "15 KB", duration: "1200 ms", status: "SUCCESS", remarks: "Backup completed" },
    { backupId: 2, instanceId: 2, instanceName: "TICKETING_DB", backupDate: "2026-06-12T03:00:00", backupFile: "C:\\RailwayBackups\\ticketing.sql", backupSize: "842 KB", duration: "3400 ms", status: "SUCCESS", remarks: "Backup completed" },
    { backupId: 3, instanceId: 3, instanceName: "SIGNAL_DB", backupDate: "2026-06-12T03:05:00", backupFile: "C:\\RailwayBackups\\signal.sql", backupSize: "—", duration: "210 ms", status: "FAILED", remarks: "Connection refused on port 5432" },
  ],
  schedules: [
    { scheduleId: 1, instance: { instanceId: 1, instanceName: "ICARD_DB" }, backupDateTime: "2026-06-26T10:30:00", backupLocation: "C:\\RailwayBackups", frequency: "DAILY", status: "ACTIVE" },
    { scheduleId: 2, instance: { instanceId: 2, instanceName: "TICKETING_DB" }, backupDateTime: "2026-06-27T03:00:00", backupLocation: "C:\\RailwayBackups", frequency: "WEEKLY", status: "ACTIVE" },
  ],
};
let mockIdCounter = { instance: 4, schedule: 3, backup: 4 };

function delay(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

const api = {
  async login(username, password) {
    if (MOCK_MODE) {
      await delay(500);
      if (username === "admin" && password === "admin123") {
        return { success: true, message: "Login Successful", role: "ADMIN" };
      }
      return { success: false, message: "Invalid username or password", role: null };
    }
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    return res.json();
  },

  async getDashboard() {
    if (MOCK_MODE) {
      await delay(400);
      const totalBackups = mockDb.history.length;
      const successfulBackups = mockDb.history.filter((h) => h.status === "SUCCESS").length;
      const failedBackups = mockDb.history.filter((h) => h.status === "FAILED").length;
      return {
        totalInstances: mockDb.instances.length,
        totalBackups,
        successfulBackups,
        failedBackups,
      };
    }
    const res = await fetch(`${BASE_URL}/api/dashboard`);
    return res.json();
  },

  async getInstances() {
    if (MOCK_MODE) {
      await delay(350);
      return [...mockDb.instances];
    }
    const res = await fetch(`${BASE_URL}/api/instances`);
    return res.json();
  },

  async getInstance(id) {
    if (MOCK_MODE) {
      await delay(200);
      return mockDb.instances.find((i) => i.instanceId === Number(id));
    }
    const res = await fetch(`${BASE_URL}/api/instances/${id}`);
    return res.json();
  },

  async createInstance(payload) {
    if (MOCK_MODE) {
      await delay(400);
      const newInstance = { ...payload, instanceId: mockIdCounter.instance++ };
      mockDb.instances.push(newInstance);
      return newInstance;
    }
    const res = await fetch(`${BASE_URL}/api/instances`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async updateInstance(id, payload) {
    if (MOCK_MODE) {
      await delay(400);
      const idx = mockDb.instances.findIndex((i) => i.instanceId === Number(id));
      if (idx >= 0) mockDb.instances[idx] = { ...mockDb.instances[idx], ...payload };
      return mockDb.instances[idx];
    }
    const res = await fetch(`${BASE_URL}/api/instances/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async deleteInstance(id) {
    if (MOCK_MODE) {
      await delay(300);
      mockDb.instances = mockDb.instances.filter((i) => i.instanceId !== Number(id));
      return { success: true };
    }
    const res = await fetch(`${BASE_URL}/api/instances/${id}`, { method: "DELETE" });
    return res.json();
  },

  async runBackup(instanceId) {
    if (MOCK_MODE) {
      await delay(1100);
      const instance = mockDb.instances.find((i) => i.instanceId === Number(instanceId));
      const willSucceed = instance?.status === "ACTIVE";
      const entry = {
        backupId: mockIdCounter.backup++,
        instanceId: instance?.instanceId,
        instanceName: instance?.instanceName ?? "UNKNOWN",
        backupDate: new Date().toISOString().slice(0, 19),
        backupFile: willSucceed ? `C:\\RailwayBackups\\${instance.databaseName}.sql` : "—",
        backupSize: willSucceed ? `${(Math.random() * 900 + 50).toFixed(0)} KB` : "—",
        duration: `${(Math.random() * 2000 + 400).toFixed(0)} ms`,
        status: willSucceed ? "SUCCESS" : "FAILED",
        remarks: willSucceed ? "Backup completed" : "Instance is INACTIVE — connection refused",
      };
      mockDb.history.unshift(entry);
      return willSucceed ? "SUCCESS" : "FAILED";
    }
    const res = await fetch(`${BASE_URL}/api/backup/run/${instanceId}`, { method: "POST" });
    return res.text();
  },

  async getHistory() {
    if (MOCK_MODE) {
      await delay(350);
      return [...mockDb.history];
    }
    const res = await fetch(`${BASE_URL}/api/history`);
    return res.json();
  },

  async getHistoryById(id) {
    if (MOCK_MODE) {
      await delay(200);
      return mockDb.history.find((h) => h.backupId === Number(id));
    }
    const res = await fetch(`${BASE_URL}/api/history/${id}`);
    return res.json();
  },

  downloadUrl(backupId) {
    return `${BASE_URL}/api/backup/download/${backupId}`;
  },

  async getSchedules() {
    if (MOCK_MODE) {
      await delay(350);
      return [...mockDb.schedules];
    }
    const res = await fetch(`${BASE_URL}/api/schedules`);
    return res.json();
  },

  async createSchedule(payload) {
    if (MOCK_MODE) {
      await delay(400);
      const instance = mockDb.instances.find((i) => i.instanceId === Number(payload.instance.instanceId));
      const newSchedule = {
        scheduleId: mockIdCounter.schedule++,
        instance: { instanceId: instance.instanceId, instanceName: instance.instanceName },
        backupDateTime: payload.backupDateTime,
        backupLocation: payload.backupLocation,
        frequency: payload.frequency,
        status: payload.status,
      };
      mockDb.schedules.push(newSchedule);
      return newSchedule;
    }
    const res = await fetch(`${BASE_URL}/api/schedules`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async deleteSchedule(id) {
    if (MOCK_MODE) {
      await delay(300);
      mockDb.schedules = mockDb.schedules.filter((s) => s.scheduleId !== Number(id));
      return { success: true };
    }
    const res = await fetch(`${BASE_URL}/api/schedules/${id}`, { method: "DELETE" });
    return res.json();
  },
};

/* =========================================================================
   SHARED UI PRIMITIVES
   ========================================================================= */

function SignalDot({ status, pulse = false }) {
  const map = {
    SUCCESS: "var(--ok)",
    COMPLETED: "var(--ok)",
    ACTIVE: "var(--info)",
    PENDING: "var(--warn)",
    FAILED: "var(--err)",
    INACTIVE: "var(--muted)",
  };
  const color = map[status] || "var(--muted)";
  return (
    <span className="signal-dot-wrap">
      <span
        className={`signal-dot ${pulse ? "signal-dot--pulse" : ""}`}
        style={{ "--dot-color": color }}
      />
    </span>
  );
}

function StatusBadge({ status }) {
  return (
    <span className="status-badge" data-status={status}>
      <SignalDot status={status} pulse={status === "PENDING"} />
      <span>{status}</span>
    </span>
  );
}

function Toast({ toasts, onDismiss }) {
  return (
    <div className="toast-stack">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast--${t.type}`}>
          {t.type === "success" && <CheckCircle2 size={16} />}
          {t.type === "error" && <AlertCircle size={16} />}
          {t.type === "info" && <Clock size={16} />}
          <span>{t.message}</span>
          <button onClick={() => onDismiss(t.id)} aria-label="Dismiss">
            <X size={13} />
          </button>
        </div>
      ))}
    </div>
  );
}

function Modal({ title, onClose, children, width = 480 }) {
  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-panel" style={{ maxWidth: width }} role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, title, body }) {
  return (
    <div className="empty-state">
      <Icon size={28} strokeWidth={1.5} />
      <p className="empty-title">{title}</p>
      <p className="empty-body">{body}</p>
    </div>
  );
}

/* =========================================================================
   LOGIN SCREEN
   ========================================================================= */
function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!username || !password) {
      setError("Enter a username and password to continue.");
      return;
    }
    setLoading(true);
    try {
      const res = await api.login(username, password);
      if (res.success) {
        onLogin(res.role);
      } else {
        setError(res.message || "Login failed.");
      }
    } catch (err) {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-screen">
      <div className="login-rail" aria-hidden="true">
        <div className="login-rail-track" />
      </div>
      <div className="login-card">
        <div className="login-brand">
          <div className="login-brand-mark">
            <Server size={20} />
          </div>
          <div>
            <p className="login-brand-title">Railway Backup Console</p>
            <p className="login-brand-sub">Database backup monitoring &amp; control</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <label className="field">
            <span className="field-label">Username</span>
            <div className="input-wrap">
              <UserIcon size={15} className="input-icon" />
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter Username"
                autoComplete="username"
              />
            </div>
          </label>

          <label className="field">
            <span className="field-label">Password</span>
            <div className="input-wrap">
              <Lock size={15} className="input-icon" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Password"
                autoComplete="current-password"
              />
            </div>
          </label>

          {error && (
            <div className="form-error">
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? <Loader2 size={15} className="spin" /> : null}
            {loading ? "Signing in" : "Log in"}
          </button>

          <p className="login-hint"></p>
        </form>
      </div>
    </div>
  );
}

/* =========================================================================
   SIDEBAR / SHELL
   ========================================================================= */
const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "instances", label: "Instances", icon: Database },
  { key: "backup", label: "Manual Backup", icon: PlayCircle },
  { key: "history", label: "Backup History", icon: History },
  { key: "schedules", label: "Schedules", icon: CalendarClock },
];

function Sidebar({ active, onNavigate, onLogout }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">

  <img
    src="/railway-logo.png"
    alt="East Coast Railway"
    className="railway-logo"
  />

  <div>
    <p className="sidebar-brand-title">
      Backup Management
    </p>

    <p className="sidebar-brand-title">
      System
    </p>

    <p className="sidebar-brand-sub">
      East Coast Railway
    </p>
  </div>

</div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.key;
          return (
            <button
              key={item.key}
              className={`sidebar-link ${isActive ? "sidebar-link--active" : ""}`}
              onClick={() => onNavigate(item.key)}
            >
              <Icon size={16} />
              <span>{item.label}</span>
              {isActive && <ChevronRight size={14} className="sidebar-link-chevron" />}
            </button>
          );
        })}
      </nav>

      <button className="sidebar-link sidebar-logout" onClick={onLogout}>
        <LogOut size={16} />
        <span>Logout</span>
      </button>
    </aside>
  );
}

/* =========================================================================
   DASHBOARD MODULE
   ========================================================================= */
function StatCard({ label, value, tone, icon: Icon }) {
  return (
    <div className="stat-card" data-tone={tone}>
      <div className="stat-card-top">
        <span className="stat-card-label">{label}</span>
        <Icon size={15} />
      </div>
      <div className="stat-card-value">{value}</div>
      <div className="stat-card-bar">
        <div className="stat-card-bar-fill" />
      </div>
    </div>
  );
}

function DashboardScreen({ pushToast, refreshKey }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentHistory, setRecentHistory] = useState([]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const [dash, hist] = await Promise.all([api.getDashboard(), api.getHistory()]);
        if (!mounted) return;
        setData(dash);
        setRecentHistory(hist.slice(-5).reverse());
      } catch (e) {
        pushToast("error", "Could not load dashboard data.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [refreshKey]);

  const successRate = data && data.totalBackups > 0
    ? Math.round((data.successfulBackups / data.totalBackups) * 100)
    : null;

  return (
    <div className="screen">
      <ScreenHeader
        title="Dashboard"
        subtitle="System-wide status across all monitored instances"
      />

      {loading ? (
        <SkeletonGrid />
      ) : (
        <>
          <div className="stat-grid">
            <StatCard label="Total Instances" value={data.totalInstances} tone="info" icon={Database} />
            <StatCard label="Total Backups" value={data.totalBackups} tone="neutral" icon={History} />
            <StatCard label="Successful Backups" value={data.successfulBackups} tone="ok" icon={CheckCircle2} />
            <StatCard label="Failed Backups" value={data.failedBackups} tone="err" icon={AlertCircle} />
          </div>

          <div className="panel">
            <div className="panel-head">
              <h3>Success rate</h3>
              {successRate !== null && <span className="panel-head-meta">{successRate}% of all runs</span>}
            </div>
            <div className="success-track">
              <div
                className="success-track-fill"
                style={{ width: `${successRate ?? 0}%` }}
              />
            </div>
          </div>

          <div className="panel">
            <div className="panel-head">
              <h3>Recent activity</h3>
              <span className="panel-head-meta">Last {recentHistory.length} runs</span>
            </div>
            {recentHistory.length === 0 ? (
              <EmptyState
                icon={History}
                title="No backups recorded yet"
                body="Run a manual backup or wait for a schedule to fire — runs will appear here."
              />
            ) : (
              <div className="mini-list">
                {recentHistory.map((h) => (
                  <div className="mini-list-row" key={h.backupId}>
                    <SignalDot status={h.status} />
                    <span className="mini-list-name">{h.instanceName}</span>
                    <span className="mini-list-meta mono">{formatDate(h.backupDate)}</span>
                    <span className="mini-list-meta mono">{h.duration}</span>
                    <StatusBadge status={h.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="stat-grid">
      {[0, 1, 2, 3].map((i) => (
        <div className="stat-card skeleton" key={i}>
          <div className="skel-line skel-line--short" />
          <div className="skel-line skel-line--big" />
        </div>
      ))}
    </div>
  );
}

function ScreenHeader({ title, subtitle, action }) {
  return (
    <div className="screen-header">
      <div>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

function formatDate(iso) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

/* =========================================================================
   INSTANCE MANAGEMENT MODULE
   ========================================================================= */
const EMPTY_INSTANCE = {
  instanceName: "",
  databaseName: "",
  ipAddress: "",
  port: "",
  dbUsername: "",
  dbPassword: "",
  status: "ACTIVE",
};

function InstanceFormModal({ initial, onClose, onSaved, pushToast }) {
  const isEdit = Boolean(initial);
  const [form, setForm] = useState(initial ? { ...initial } : { ...EMPTY_INSTANCE });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function validate() {
    const e = {};
    if (!form.instanceName.trim()) e.instanceName = "Required";
    if (!form.databaseName.trim()) e.databaseName = "Required";
    if (!form.ipAddress.trim()) e.ipAddress = "Required";
    if (!form.port || Number(form.port) <= 0) e.port = "Enter a valid port";
    if (!form.dbUsername.trim()) e.dbUsername = "Required";
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length > 0) return;
    setSaving(true);
    try {
      const payload = { ...form, port: Number(form.port) };
      if (isEdit) {
        await api.updateInstance(initial.instanceId, payload);
        pushToast("success", `${form.instanceName} updated`);
      } else {
        await api.createInstance(payload);
        pushToast("success", `${form.instanceName} added`);
      }
      onSaved();
    } catch (err) {
      pushToast("error", "Could not save instance.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={isEdit ? "Edit instance" : "Add instance"} onClose={onClose} width={520}>
      <form onSubmit={handleSubmit} className="form-grid">
        <label className="field">
          <span className="field-label">Instance name</span>
          <input
            value={form.instanceName}
            onChange={(e) => update("instanceName", e.target.value)}
            placeholder="Enter Instance Name"
          />
          {errors.instanceName && <span className="field-error">{errors.instanceName}</span>}
        </label>

        <label className="field">
          <span className="field-label">Database name</span>
          <input
            value={form.databaseName}
            onChange={(e) => update("databaseName", e.target.value)}
            placeholder="Enter Database Name"
          />
          {errors.databaseName && <span className="field-error">{errors.databaseName}</span>}
        </label>

        <div className="field-row">
          <label className="field">
            <span className="field-label">IP address</span>
            <input
              value={form.ipAddress}
              onChange={(e) => update("ipAddress", e.target.value)}
              placeholder="Enter IP Address"
            />
            {errors.ipAddress && <span className="field-error">{errors.ipAddress}</span>}
          </label>
          <label className="field field--narrow">
            <span className="field-label">Port</span>
            <input
              type="number"
              value={form.port}
              onChange={(e) => update("port", e.target.value)}
              placeholder="Enter Port"
            />
            {errors.port && <span className="field-error">{errors.port}</span>}
          </label>
        </div>

        <div className="field-row">
          <label className="field">
            <span className="field-label">DB username</span>
            <input
              value={form.dbUsername}
              onChange={(e) => update("dbUsername", e.target.value)}
              placeholder="Enter DB Username"
            />
            {errors.dbUsername && <span className="field-error">{errors.dbUsername}</span>}
          </label>
          <label className="field">
            <span className="field-label">DB password</span>
            <input
              type="password"
              value={form.dbPassword}
              onChange={(e) => update("dbPassword", e.target.value)}
              placeholder="Enter DB Password"
            />
          </label>
        </div>

        <label className="field">
          <span className="field-label">Status</span>
          <select value={form.status} onChange={(e) => update("status", e.target.value)}>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
        </label>

        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving && <Loader2 size={14} className="spin" />}
            {isEdit ? "Save changes" : "Add instance"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function InstanceViewModal({ instance, onClose }) {
  return (
    <Modal title={instance.instanceName} onClose={onClose} width={460}>
      <div className="detail-list">
        <DetailRow label="Instance ID" value={`#${instance.instanceId}`} mono />
        <DetailRow label="Database name" value={instance.databaseName} mono />
        <DetailRow label="Host" value={`${instance.ipAddress}:${instance.port}`} mono />
        <DetailRow label="DB username" value={instance.dbUsername} mono />
        <DetailRow label="Status" value={<StatusBadge status={instance.status} />} />
      </div>
    </Modal>
  );
}

function DetailRow({ label, value, mono }) {
  return (
    <div className="detail-row">
      <span className="detail-row-label">{label}</span>
      <span className={`detail-row-value ${mono ? "mono" : ""}`}>{value}</span>
    </div>
  );
}

function ConfirmDeleteModal({ title, body, onCancel, onConfirm, danger = true }) {
  const [busy, setBusy] = useState(false);
  return (
    <Modal title={title} onClose={onCancel} width={420}>
      <p className="confirm-body">{body}</p>
      <div className="modal-actions">
        <button className="btn btn-ghost" onClick={onCancel}>
          Cancel
        </button>
        <button
          className={`btn ${danger ? "btn-danger" : "btn-primary"}`}
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            await onConfirm();
            setBusy(false);
          }}
        >
          {busy && <Loader2 size={14} className="spin" />}
          Delete
        </button>
      </div>
    </Modal>
  );
}

function InstancesScreen({ pushToast }) {
  const [instances, setInstances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formModal, setFormModal] = useState(null); // null | {} | instance
  const [viewModal, setViewModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getInstances();
      setInstances(data);
    } catch (e) {
      pushToast("error", "Could not load instances.");
    } finally {
      setLoading(false);
    }
  }, [pushToast]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete() {
    try {
      await api.deleteInstance(deleteTarget.instanceId);
      pushToast("success", `${deleteTarget.instanceName} deleted`);
      setDeleteTarget(null);
      load();
    } catch (e) {
      pushToast("error", "Could not delete instance.");
    }
  }

  return (
    <div className="screen">
      <ScreenHeader
        title="Instances"
        subtitle="Database connections registered for backup"
        action={
          <button className="btn btn-primary" onClick={() => setFormModal({})}>
            <Plus size={15} /> Add instance
          </button>
        }
      />

      <div className="panel panel--flush">
        {loading ? (
          <TableSkeleton cols={6} />
        ) : instances.length === 0 ? (
          <EmptyState
            icon={Database}
            title="No instances registered"
            body="Add a database instance to start backing it up."
          />
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Instance name</th>
                <th>Database</th>
                <th>Host</th>
                <th>Status</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {instances.map((inst) => (
                <tr key={inst.instanceId}>
                  <td className="mono muted-cell">#{inst.instanceId}</td>
                  <td className="cell-strong">{inst.instanceName}</td>
                  <td className="mono">{inst.databaseName}</td>
                  <td className="mono">
                    {inst.ipAddress}:{inst.port}
                  </td>
                  <td>
                    <StatusBadge status={inst.status} />
                  </td>
                  <td>
                    <div className="row-actions">
                      <button className="icon-btn" title="View" onClick={() => setViewModal(inst)}>
                        <Eye size={14} />
                      </button>
                      <button className="icon-btn" title="Edit" onClick={() => setFormModal(inst)}>
                        <Pencil size={14} />
                      </button>
                      <button
                        className="icon-btn icon-btn--danger"
                        title="Delete"
                        onClick={() => setDeleteTarget(inst)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {formModal !== null && (
        <InstanceFormModal
          initial={formModal.instanceId ? formModal : null}
          onClose={() => setFormModal(null)}
          onSaved={() => {
            setFormModal(null);
            load();
          }}
          pushToast={pushToast}
        />
      )}

      {viewModal && <InstanceViewModal instance={viewModal} onClose={() => setViewModal(null)} />}

      {deleteTarget && (
        <ConfirmDeleteModal
          title="Delete instance"
          body={`This removes "${deleteTarget.instanceName}" from monitoring. Backup history for this instance is kept.`}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}

function TableSkeleton({ cols = 5, rows = 4 }) {
  return (
    <table className="data-table">
      <tbody>
        {Array.from({ length: rows }).map((_, r) => (
          <tr key={r}>
            {Array.from({ length: cols }).map((_, c) => (
              <td key={c}>
                <div className="skel-line skel-line--cell" />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* =========================================================================
   MANUAL BACKUP MODULE
   ========================================================================= */
function ManualBackupScreen({ pushToast, onBackupComplete })  {
  const [instances, setInstances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [runningId, setRunningId] = useState(null);
  const [lastResult, setLastResult] = useState({}); // instanceId -> SUCCESS/FAILED

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setInstances(await api.getInstances());
    } catch (e) {
      pushToast("error", "Could not load instances.");
    } finally {
      setLoading(false);
    }
  }, [pushToast]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleRun(instance) {
    setRunningId(instance.instanceId);

    try {
        const result = await api.runBackup(instance.instanceId);

        setLastResult((m) => ({
            ...m,
            [instance.instanceId]: result
        }));

        // Refresh Dashboard immediately
        if (onBackupComplete) {
            onBackupComplete();
        }

        if (result === "SUCCESS") {
            pushToast("success", `Backup successful — ${instance.instanceName}`);
        } else {
            pushToast("error", `Backup failed — ${instance.instanceName}`);
        }

    } catch (e) {
        pushToast("error", `Backup failed — ${instance.instanceName}`);
    } finally {
        setRunningId(null);
    }
}
  return (
    <div className="screen">
      <ScreenHeader title="Manual Backup" subtitle="Trigger an on-demand backup for any instance" />

      <div className="panel panel--flush">
        {loading ? (
          <TableSkeleton cols={4} />
        ) : instances.length === 0 ? (
          <EmptyState icon={PlayCircle} title="No instances available" body="Add an instance first to run a backup." />
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Instance</th>
                <th>Host</th>
                <th>Status</th>
                <th>Last run</th>
                <th aria-label="Action" />
              </tr>
            </thead>
            <tbody>
              {instances.map((inst) => {
                const isRunning = runningId === inst.instanceId;
                const last = lastResult[inst.instanceId];
                return (
                  <tr key={inst.instanceId}>
                    <td className="cell-strong">{inst.instanceName}</td>
                    <td className="mono">
                      {inst.ipAddress}:{inst.port}
                    </td>
                    <td>
                      <StatusBadge status={inst.status} />
                    </td>
                    <td>{last ? <StatusBadge status={last} /> : <span className="muted-cell">—</span>}</td>
                    <td>
                      <button
                        className="btn btn-secondary btn-sm"
                        disabled={isRunning}
                        onClick={() => handleRun(inst)}
                      >
                        {isRunning ? (
                          <>
                            <Loader2 size={14} className="spin" /> Running
                          </>
                        ) : (
                          <>
                            <PlayCircle size={14} /> Run backup
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* =========================================================================
   BACKUP HISTORY MODULE
   ========================================================================= */
function BackupHistoryScreen({ pushToast }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [detail, setDetail] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setHistory(await api.getHistory());
    } catch (e) {
      pushToast("error", "Could not load backup history.");
    } finally {
      setLoading(false);
    }
  }, [pushToast]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    if (filter === "ALL") return history;
    return history.filter((h) => h.status === filter);
  }, [history, filter]);

  function handleDownload(backupId) {
    window.open(api.downloadUrl(backupId), "_blank");
  }

  return (
    <div className="screen">
      <ScreenHeader
        title="Backup History"
        subtitle="Every backup run, across all instances"
        action={
          <div className="segmented">
            {["ALL", "SUCCESS", "FAILED"].map((f) => (
              <button
                key={f}
                className={`segmented-btn ${filter === f ? "segmented-btn--active" : ""}`}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
        }
      />

      <div className="panel panel--flush">
        {loading ? (
          <TableSkeleton cols={7} />
        ) : filtered.length === 0 ? (
          <EmptyState icon={History} title="No backup runs found" body="Try a different filter, or run a manual backup." />
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Instance</th>
                <th>Date</th>
                <th>Size</th>
                <th>Duration</th>
                <th>Status</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((h) => (
                <tr key={h.backupId}>
                  <td className="mono muted-cell">#{h.backupId}</td>
                  <td className="cell-strong">{h.instanceName}</td>
                  <td className="mono">{formatDate(h.backupDate)}</td>
                  <td className="mono">{h.backupSize}</td>
                  <td className="mono">{h.duration}</td>
                  <td>
                    <StatusBadge status={h.status} />
                  </td>
                  <td>
                    <div className="row-actions">
                      <button className="icon-btn" title="View details" onClick={() => setDetail(h)}>
                        <Eye size={14} />
                      </button>
                      <button
                        className="icon-btn"
                        title="Download SQL"
                        disabled={h.status !== "SUCCESS"}
                        onClick={() => handleDownload(h.backupId)}
                      >
                        <Download size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {detail && (
        <Modal title={`Backup #${detail.backupId}`} onClose={() => setDetail(null)} width={480}>
          <div className="detail-list">
            <DetailRow label="Instance" value={detail.instanceName} />
            <DetailRow label="Date" value={formatDate(detail.backupDate)} mono />
            <DetailRow label="File" value={detail.backupFile} mono />
            <DetailRow label="Size" value={detail.backupSize} mono />
            <DetailRow label="Duration" value={detail.duration} mono />
            <DetailRow label="Status" value={<StatusBadge status={detail.status} />} />
            <DetailRow label="Remarks" value={detail.remarks} />
          </div>
          {detail.status === "SUCCESS" && (
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={() => handleDownload(detail.backupId)}>
                <Download size={14} /> Download SQL
              </button>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}

/* =========================================================================
   SCHEDULE BACKUP MODULE
   ========================================================================= */
function ScheduleFormModal({ instances, onClose, onSaved, pushToast }) {
  const [instanceId, setInstanceId] = useState(instances[0]?.instanceId ?? "");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("C:\\RailwayBackups");
  const [frequency, setFrequency] = useState("ONETIME");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  function validate() {
    const e = {};
    if (!instanceId) e.instanceId = "Select an instance";
    if (!date) e.date = "Required";
    if (!time) e.time = "Required";
    if (!location.trim()) e.location = "Required";
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length > 0) return;
    setSaving(true);
    try {
      await api.createSchedule({
        instance: { instanceId: Number(instanceId) },
        backupDateTime: `${date}T${time}:00`,
        backupLocation: location,
        frequency,
        status: "ACTIVE",
      });
      pushToast("success", "Backup scheduled");
      onSaved();
    } catch (err) {
      pushToast("error", "Could not create schedule.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Schedule backup" onClose={onClose} width={500}>
      <form onSubmit={handleSubmit} className="form-grid">
        <label className="field">
          <span className="field-label">Select instance</span>
          <select value={instanceId} onChange={(e) => setInstanceId(e.target.value)}>
            {instances.map((inst) => (
              <option key={inst.instanceId} value={inst.instanceId}>
                {inst.instanceName}
              </option>
            ))}
          </select>
          {errors.instanceId && <span className="field-error">{errors.instanceId}</span>}
        </label>

        <div className="field-row">
  <label className="field">
    <span className="field-label">Backup Date</span>
    <input
      type="date"
      value={date}
      min={new Date().toISOString().split("T")[0]}
      onChange={(e) => setDate(e.target.value)}
    />
    {errors.date && (
      <span className="field-error">{errors.date}</span>
    )}
  </label>

  <label className="field">
    <span className="field-label">Backup Time</span>
    <input
      type="time"
      value={time}
      min={
        date === new Date().toISOString().split("T")[0]
          ? new Date().toTimeString().slice(0, 5)
          : undefined
      }
      onChange={(e) => setTime(e.target.value)}
    />
    {errors.time && (
      <span className="field-error">{errors.time}</span>
    )}
  </label>
</div>

        <label className="field">
          <span className="field-label">Backup location</span>
          <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="C:\RailwayBackups" />
          {errors.location && <span className="field-error">{errors.location}</span>}
        </label>

        <label className="field">
          <span className="field-label">Frequency</span>
          <select value={frequency} onChange={(e) => setFrequency(e.target.value)}>
            <option value="ONETIME">One-time</option>
            <option value="DAILY">Daily</option>
            <option value="WEEKLY">Weekly</option>
            <option value="MONTHLY">Monthly</option>
          </select>
        </label>

        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving && <Loader2 size={14} className="spin" />}
            Schedule backup
          </button>
        </div>
      </form>
    </Modal>
  );
}

function SchedulesScreen({ pushToast }) {
  const [schedules, setSchedules] = useState([]);
  const [instances, setInstances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [sch, inst] = await Promise.all([api.getSchedules(), api.getInstances()]);
      setSchedules(sch);
      setInstances(inst);
    } catch (e) {
      pushToast("error", "Could not load schedules.");
    } finally {
      setLoading(false);
    }
  }, [pushToast]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete() {
    try {
      await api.deleteSchedule(deleteTarget.scheduleId);
      pushToast("success", "Schedule deleted");
      setDeleteTarget(null);
      load();
    } catch (e) {
      pushToast("error", "Could not delete schedule.");
    }
  }

  return (
    <div className="screen">
      <ScreenHeader
        title="Schedules"
        subtitle="Automatic backups queued for the future"
        action={
          <button
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
            disabled={instances.length === 0}
          >
            <Plus size={15} /> Schedule backup
          </button>
        }
      />

      <div className="panel panel--flush">
        {loading ? (
          <TableSkeleton cols={6} />
        ) : schedules.length === 0 ? (
          <EmptyState
            icon={CalendarClock}
            title="No schedules set"
            body="Schedule a backup so it runs automatically without manual action."
          />
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Instance</th>
                <th>Next run</th>
                <th>Location</th>
                <th>Frequency</th>
                <th>Status</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {schedules.map((s) => (
                <tr key={s.scheduleId}>
                  <td className="mono muted-cell">#{s.scheduleId}</td>
                  <td className="cell-strong">{s.instance?.instanceName ?? "—"}</td>
                  <td className="mono">{formatDate(s.backupDateTime)}</td>
                  <td className="mono truncate">{s.backupLocation}</td>
                  <td>
                    <span className="freq-chip">{s.frequency}</span>
                  </td>
                  <td>
                    <StatusBadge status={s.status} />
                  </td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="icon-btn icon-btn--danger"
                        title="Delete schedule"
                        onClick={() => setDeleteTarget(s)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <ScheduleFormModal
          instances={instances}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            load();
          }}
          pushToast={pushToast}
        />
      )}

      {deleteTarget && (
        <ConfirmDeleteModal
          title="Delete schedule"
          body={`This cancels the ${deleteTarget.frequency.toLowerCase()} backup for "${deleteTarget.instance?.instanceName}".`}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}

/* =========================================================================
   APP ROOT
   ========================================================================= */
export default function App() {
  const [authed, setAuthed] = useState(false);

const [active, setActive] = useState("dashboard");

const [toasts, setToasts] = useState([]);

useEffect(() => {
    if (sessionStorage.getItem("loggedIn") === "true") {
        setAuthed(true);

        const page = sessionStorage.getItem("activePage");
        if (page) {
            setActive(page);
        }
    }
}, []);

  const pushToast = useCallback((type, message) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, type, message }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 3800);
  }, []);

  function dismissToast(id) {
    setToasts((t) => t.filter((x) => x.id !== id));
  }

  if (!authed) {
    return (
      <>
        <GlobalStyles />
        <LoginScreen
    onLogin={() => {

        sessionStorage.setItem("loggedIn", "true");
        sessionStorage.setItem("activePage", "dashboard");

        setAuthed(true);
        setActive("dashboard");
    }}
/>
      </>
    );
  }

  return (
    <>
      <GlobalStyles />
      <div className="shell">
        <Sidebar
    active={active}
    onNavigate={(page) => {
        setActive(page);
        sessionStorage.setItem("activePage", page);
    }}
    onLogout={() => {
        sessionStorage.clear();
        setAuthed(false);
        setActive("dashboard");
    }}
/>
        <main className="main">
          {active === "dashboard" && <DashboardScreen pushToast={pushToast} />}
          {active === "instances" && <InstancesScreen pushToast={pushToast} />}
          {active === "backup" && <ManualBackupScreen pushToast={pushToast} />}
          {active === "history" && <BackupHistoryScreen pushToast={pushToast} />}
          {active === "schedules" && <SchedulesScreen pushToast={pushToast} />}
        </main>
      </div>
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}

/* =========================================================================
   STYLES
   ========================================================================= */
function GlobalStyles() {
  return (
    <style>{`
      :root {
        --bg: #111827;
    --panel: #1F2937;
    --panel-raised: #273449;
    --border: #374151;
    --border-soft: #2B3648;

    --text: #F3F4F6;
    --text-dim: #9CA3AF;
    --text-faint: #6B7280;

    --accent: #3B82F6;
    --info: #60A5FA;
    --ok: #22C55E;
    --warn: #F59E0B;
    --err: #EF4444;
        --radius: 8px;
        --mono: 'JetBrains Mono', 'SFMono-Regular', Consolas, monospace;
        --sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      }

      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

      * { box-sizing: border-box; }
      
       .shell,.login-screen {
        font-family: var(--sans);
        color: var(--text);
       background:
    radial-gradient(circle at top right,
    rgba(59,130,246,.12),
    transparent 35%),

    radial-gradient(circle at bottom left,
    rgba(34,197,94,.08),
    transparent 40%),

    #111827;
        background-image:
          radial-gradient(circle at 0% 0%, rgba(79,163,255,0.05), transparent 40%),
          radial-gradient(circle at 100% 100%, rgba(61,214,140,0.04), transparent 40%);
      }

      button, input, select { font-family: inherit; }

      /* ---------- LOGIN ---------- */
      .login-screen {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        overflow: hidden;
        padding: 24px;
      }
      .login-rail {
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        background-image: repeating-linear-gradient(
          90deg,
          transparent 0,
          transparent 78px,
          var(--border-soft) 78px,
          var(--border-soft) 80px
        );
        opacity: 0.5;
        mask-image: radial-gradient(circle at 50% 30%, black 0%, transparent 70%);
      }
      .login-rail-track {
        position: absolute;
        top: 0; bottom: 0; left: 50%;
        width: 2px;
        background: linear-gradient(180deg, transparent, var(--info) 50%, transparent);
        opacity: 0.25;
        animation: rail-pulse 3.5s ease-in-out infinite;
      }
      @keyframes rail-pulse { 0%, 100% { opacity: 0.1; } 50% { opacity: 0.35; } }

      .login-card {
        position: relative;
        z-index: 1;
        width: 100%;
        max-width: 380px;
        background: var(--panel);
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 32px;
        box-shadow: 0 30px 60px -20px rgba(0,0,0,0.6);
      }
      .login-brand { display: flex; align-items: center; gap: 12px; margin-bottom: 28px; }
      .login-brand-mark {
        width: 38px; height: 38px; border-radius: 8px;
        background: linear-gradient(135deg, rgba(79,163,255,0.18), rgba(79,163,255,0.05));
        border: 1px solid rgba(79,163,255,0.3);
        display: flex; align-items: center; justify-content: center;
        color: var(--info);
        flex-shrink: 0;
      }
      .login-brand-title { font-weight: 600; font-size: 14.5px; margin: 0; letter-spacing: -0.01em; }
      .login-brand-sub { font-size: 12px; color: var(--text-dim); margin: 2px 0 0; }

      .login-form { display: flex; flex-direction: column; gap: 16px; }
      .field { display: flex; flex-direction: column; gap: 6px; }
      .field--narrow { max-width: 110px; }
      .field-row { display: flex; gap: 12px; }
      .field-row .field { flex: 1; }
      .field-label { font-size: 12px; font-weight: 500; color: var(--text-dim); }
      .field-error { font-size: 11.5px; color: var(--err); }

      .input-wrap { position: relative; display: flex; align-items: center; }
      .input-icon { position: absolute; left: 11px; color: var(--text-faint); pointer-events: none; }
      .input-wrap input { padding-left: 32px; }

      input, select {
        width: 100%;
        background: var(--bg);
        border: 1px solid var(--border);
        border-radius: 7px;
        padding: 9px 11px;
        color: var(--text);
        font-size: 13.5px;
        outline: none;
        transition: border-color 0.15s;
      }
      input:focus, select:focus {
        border-color: var(--info);
        box-shadow: 0 0 0 3px rgba(79,163,255,0.12);
      }
      input::placeholder { color: var(--text-faint); }

      .form-error {
        display: flex; align-items: center; gap: 7px;
        font-size: 12.5px; color: var(--err);
        background: rgba(255,92,92,0.08);
        border: 1px solid rgba(255,92,92,0.25);
        border-radius: 7px;
        padding: 8px 10px;
      }

      .btn{

    border-radius:12px;

    transition:.30s;

    font-weight:600;

}

.btn:hover{

    transform:translateY(-2px);

    box-shadow:0 12px 25px rgba(37,99,235,.30);

}
      .btn:active { transform: translateY(1px); }
      .btn:disabled { opacity: 0.55; cursor: not-allowed; }
      .btn-block { width: 100%; }
      .btn-sm { padding: 6px 11px; font-size: 12.5px; }
      .btn-primary{

    background:linear-gradient(
        135deg,
        #3b82f6,
        #2563eb
    );

    color:white;

    border:none;

    border-radius:12px;

    padding:12px 22px;

    font-weight:600;

    font-size:14px;

    transition:.3s;

}
      .btn-primary:hover{

    transform:translateY(-3px);

    box-shadow:0 14px 25px rgba(37,99,235,.45);

}
      .btn-secondary { background: var(--panel-raised); border-color: var(--border); color: var(--text); }
      .btn-secondary:hover:not(:disabled) { background: #1C2230; }
      .btn-ghost { background: transparent; color: var(--text-dim); border-color: var(--border); }
      .btn-ghost:hover { color: var(--text); border-color: var(--text-faint); }
      .btn-danger { background: var(--err); color: #2A0707; }
      .btn-danger:hover:not(:disabled) { filter: brightness(1.08); }

      .login-hint { text-align: center; font-size: 11.5px; color: var(--text-faint); margin: 4px 0 0; }

      .spin { animation: spin 0.8s linear infinite; }
      @keyframes spin { to { transform: rotate(360deg); } }

      /* ---------- SHELL ---------- */
      .shell{
    display:grid;
    grid-template-columns:300px 1fr;
    min-height:100vh;

    background:
        radial-gradient(circle at top left,
        rgba(37,99,235,.12),
        transparent 35%),

        radial-gradient(circle at bottom right,
        rgba(14,165,233,.08),
        transparent 45%),

        linear-gradient(
        180deg,
        #081321,
        #0d1728,
        #111c2f);
}
      .sidebar{

    width:300px;

    background:

    linear-gradient(
    180deg,
    #0b1d36 0%,
    #0f2748 50%,
    #13345d 100%);

    border-right:1px solid rgba(255,255,255,.08);

    padding:30px 26px;

    display:flex;

    flex-direction:column;

    box-shadow:

    10px 0 40px rgba(0,0,0,.45);

    position:relative;

}
      .sidebar-brand{

display:flex;

flex-direction:column;

align-items:center;

justify-content:center;

text-align:center;

margin-bottom:38px;

gap:10px;

}
      .sidebar-brand-mark {
        width: 30px; height: 30px; border-radius: 7px;
        background: rgba(79,163,255,0.1);
        border: 1px solid rgba(79,163,255,0.25);
        color: var(--info);
        display: flex; align-items: center; justify-content: center;
        flex-shrink: 0;
      }
      .sidebar-brand-title{

font-size:20px;

font-weight:700;

line-height:1.3;

color:white;

text-align:center;

}
      .sidebar-brand-sub{

font-size:15px;

color:#59a7ff;

margin-top:4px;

font-weight:500;

}

      .sidebar-nav{

display:flex;

flex-direction:column;

gap:16px;

margin-top:20px;

flex:1;

}
      .sidebar-link{

display:flex;

align-items:center;

gap:14px;

padding:16px 18px;

border-radius:16px;

background:#102544;

border:1px solid rgba(255,255,255,.08);

font-size:16px;

font-weight:500;

color:#d6e4ff;

transition:.35s;

cursor:pointer;

}
      .sidebar-link span:first-of-type { flex: 1; }
      .sidebar-link:hover{

background:#1b4f91;

transform:translateX(6px);

box-shadow:

0 8px 20px rgba(37,99,235,.30);

}
      .sidebar-link--active{

background:

linear-gradient(
90deg,
#3578ff,
#2f5ff8);

color:white;

box-shadow:

0 12px 30px rgba(37,99,235,.45);

}
      .sidebar-link-chevron { color: var(--info); opacity: 0.7; }
      .sidebar-logout{

margin-top:auto;

padding:16px;

border-radius:16px;

background:#112849;

border:1px solid rgba(255,255,255,.08);

}
      .sidebar-logout:hover { color: var(--err); background: rgba(255,92,92,0.07); }

      .main{
    width:100%;
    padding:24px 34px;
    background:transparent;
}
.screen{
    width:100%;
    max-width:1500px;
    margin:auto;
    display:flex;
    flex-direction:column;
    gap:20px;
}

      .screen-header{
    display:flex;
    justify-content:space-between;
    align-items:flex-start;
    margin-bottom:4px;
    padding-bottom:6px;
    border-bottom:1px solid rgba(255,255,255,.06);
}
      .screen-header h2{

font-size:42px;

font-weight:700;

color:white;

margin-bottom:8px;

letter-spacing:-1px;

}
      .screen-header p{

font-size:18px;

color:#97a8c8;

}

      /* ---------- STAT CARDS ---------- */

.stat-grid{
    display:grid;
    grid-template-columns:repeat(4,1fr);
    gap:20px;
    margin:30px 0 38px;
}

.stat-card{
    position:relative;
    background:linear-gradient(145deg,#1c2940,#172236);
    border:1px solid rgba(72,135,255,.18);
    border-radius:22px;
    padding:22px;
    overflow:hidden;
    transition:.35s ease;
    box-shadow:0 18px 45px rgba(0,0,0,.25);
}

.stat-card::before{
    content:"";
    position:absolute;
    top:0;
    left:0;
    width:100%;
    height:4px;
    background:linear-gradient(90deg,#3b82f6,#2dd4bf);
}

.stat-card:hover{
    transform:translateY(-6px);
    border-color:#4b93ff;
    box-shadow:0 20px 45px rgba(0,0,0,.45);
}

.stat-card-top{
    display:flex;
    justify-content:space-between;
    align-items:center;
    margin-bottom:18px;
}

.stat-card-label{
    font-size:13px;
    font-weight:700;
    letter-spacing:2px;
    text-transform:uppercase;
    color:#8db8ff;
}

.stat-card-top svg{
    font-size:22px;
    color:#53a4ff;
}

.stat-card-value{
    font-size:56px;
    font-weight:700;
    color:#ffffff;
    line-height:1;
    margin:8px 0 20px;
    text-align:center;
}

.stat-card-bar{
    width:100%;
    height:6px;
    background:rgba(255,255,255,.08);
    border-radius:50px;
    overflow:hidden;
}

.stat-card-bar-fill{
    height:100%;
    border-radius:50px;
    transition:.5s;
}

.stat-card[data-tone="info"] .stat-card-bar-fill{
    width:65%;
    background:#4aa3ff;
}

.stat-card[data-tone="neutral"] .stat-card-bar-fill{
    width:100%;
    background:#95a3b8;
}

.stat-card[data-tone="ok"] .stat-card-bar-fill{
    width:84%;
    background:#2dd36f;
}

.stat-card[data-tone="err"] .stat-card-bar-fill{
    width:28%;
    background:#ff5f63;
}

.stat-card[data-tone="ok"] .stat-card-top{
    color:#2dd36f;
}

.stat-card[data-tone="err"] .stat-card-top{
    color:#ff5f63;
}

.stat-card[data-tone="info"] .stat-card-top{
    color:#4aa3ff;
}
      /* ---------- PANELS ---------- */
      .panel{

    background:#1E293B;

    border:1px solid rgba(255,255,255,.08);

    box-shadow:0 10px 30px rgba(0,0,0,.25);

    backdrop-filter:blur(8px);

    border-radius:18px;

    border:1px solid rgba(255,255,255,.05);

}
      .panel--flush { padding: 0; overflow: hidden; }
      .panel-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
      .panel-head h3 { font-size: 13.5px; font-weight: 600; margin: 0; }
      .panel-head-meta { font-size: 11.5px; color: var(--text-faint); font-family: var(--mono); }

      .success-track { height: 8px; background: var(--border-soft); border-radius: 5px; overflow: hidden; }
      .success-track-fill { height: 100%; background: linear-gradient(90deg, var(--info), var(--ok)); transition: width 0.5s ease; }

      .mini-list { display: flex; flex-direction: column; }
      .mini-list-row {
        display: grid;
        grid-template-columns: 16px 1.3fr 1.4fr 0.9fr auto;
        align-items: center;
        gap: 12px;
        padding: 9px 4px;
        border-bottom: 1px solid var(--border-soft);
        font-size: 12.5px;
      }
      .mini-list-row:last-child { border-bottom: none; }
      .mini-list-name { font-weight: 600; }
      .mini-list-meta { color: var(--text-dim); }

      /* ---------- TABLES ---------- */
      .data-table { width: 100%; border-collapse: collapse; font-size: 13px; }
      .data-table thead th {
        text-align: left;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--text-faint);
        padding: 13px 16px;
        border-bottom: 1px solid var(--border);
        background: var(--panel-raised);
      }
      .data-table tbody td {
        padding: 12px 16px;
        border-bottom: 1px solid var(--border-soft);
        color: var(--text);
        vertical-align: middle;
      }
      .data-table tbody tr{

    transition:.25s;

}

.data-table tbody tr:hover{

    background:#18283d;

}
      .cell-strong { font-weight: 600; }
      .muted-cell { color: var(--text-faint); }
      .mono { font-family: var(--mono); font-size: 12.5px; }
      .truncate { max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: inline-block; }

      .row-actions { display: flex; gap: 4px; }
      .icon-btn {
        width: 28px; height: 28px;
        display: flex; align-items: center; justify-content: center;
        background: transparent;
        border: 1px solid transparent;
        border-radius: 6px;
        color: var(--text-dim);
        cursor: pointer;
        transition: background 0.12s, color 0.12s, border-color 0.12s;
      }
      .icon-btn:hover:not(:disabled) { background: var(--panel-raised); border-color: var(--border); color: var(--text); }
      .icon-btn:disabled { opacity: 0.3; cursor: not-allowed; }
      .icon-btn--danger:hover:not(:disabled) { color: var(--err); border-color: rgba(255,92,92,0.3); background: rgba(255,92,92,0.07); }

      .freq-chip {
        font-size: 11px; font-weight: 600; font-family: var(--mono);
        color: var(--text-dim);
        background: var(--panel-raised);
        border: 1px solid var(--border);
        padding: 3px 8px;
        border-radius: 5px;
      }

      .segmented { display: flex; background: var(--panel-raised); border: 1px solid var(--border); border-radius: 7px; padding: 3px; gap: 2px; }
      .segmented-btn {
        background: transparent; border: none; color: var(--text-dim);
        font-size: 11.5px; font-weight: 600; padding: 6px 12px; border-radius: 5px; cursor: pointer;
        font-family: var(--mono);
      }
      .segmented-btn--active { background: var(--bg); color: var(--text); }

      /* ---------- STATUS BADGE / SIGNAL DOT ---------- */
      .status-badge {
        display: inline-flex; align-items: center; gap: 6px;
        font-size: 11px; font-weight: 700; letter-spacing: 0.03em;
        font-family: var(--mono);
        padding: 4px 9px 4px 7px;
        border-radius: 20px;
        border: 1px solid var(--border);
        background: var(--panel-raised);
        color: var(--text-dim);
      }
      .status-badge[data-status="SUCCESS"], .status-badge[data-status="COMPLETED"] { color: var(--ok); border-color: rgba(61,214,140,0.3); background: rgba(61,214,140,0.07); }
      .status-badge[data-status="FAILED"] { color: var(--err); border-color: rgba(255,92,92,0.3); background: rgba(255,92,92,0.07); }
      .status-badge[data-status="ACTIVE"] { color: var(--info); border-color: rgba(79,163,255,0.3); background: rgba(79,163,255,0.07); }
      .status-badge[data-status="PENDING"] { color: var(--warn); border-color: rgba(245,166,35,0.3); background: rgba(245,166,35,0.07); }
      .status-badge[data-status="INACTIVE"] { color: var(--text-faint); }

      .signal-dot-wrap { display: inline-flex; }
      .signal-dot {
        width: 7px; height: 7px; border-radius: 50%;
        background: var(--dot-color);
        box-shadow: 0 0 0 2px color-mix(in srgb, var(--dot-color) 25%, transparent);
        display: inline-block;
      }
      .signal-dot--pulse { animation: dot-pulse 1.4s ease-in-out infinite; }
      @keyframes dot-pulse {
        0%, 100% { box-shadow: 0 0 0 2px color-mix(in srgb, var(--dot-color) 25%, transparent); }
        50% { box-shadow: 0 0 0 5px color-mix(in srgb, var(--dot-color) 18%, transparent); }
      }

      /* ---------- EMPTY STATE ---------- */
      .empty-state {
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        gap: 8px; padding: 48px 20px; color: var(--text-faint); text-align: center;
      }
      .empty-title { font-size: 13.5px; font-weight: 600; color: var(--text-dim); margin: 4px 0 0; }
      .empty-body { font-size: 12.5px; max-width: 320px; margin: 0; }

      /* ---------- MODAL ---------- */
      .modal-overlay {
        position: fixed; inset: 0;
        background: rgba(5,7,12,0.7);
        backdrop-filter: blur(2px);
        display: flex; align-items: center; justify-content: center;
        padding: 20px;
        z-index: 100;
      }
      .modal-panel {
        background: var(--panel);
        border: 1px solid var(--border);
        border-radius: 11px;
        width: 100%;
        box-shadow: 0 40px 80px -20px rgba(0,0,0,0.7);
        animation: modal-in 0.15s ease-out;
      }
      @keyframes modal-in { from { opacity: 0; transform: translateY(6px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
      .modal-head { display: flex; align-items: center; justify-content: space-between; padding: 16px 18px; border-bottom: 1px solid var(--border-soft); }
      .modal-head h3 { font-size: 14.5px; font-weight: 600; margin: 0; }
      .modal-body { padding: 18px; }

      .form-grid { display: flex; flex-direction: column; gap: 14px; }
      .modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin: 18px 0 0; }
      .railway-logo{

width:78px;

height:78px;

border-radius:50%;

background:white;

padding:8px;

object-fit:contain;

box-shadow:

0 0 35px rgba(59,130,246,.45);

margin-bottom:10px;

transition:.35s;

}

.railway-logo:hover{

transform:scale(1.08);

}
    .activity-item{

    border-left:4px solid #22c55e;

    padding-left:18px;

    transition:.30s;

}

.activity-item:hover{

    background:#17253b;

    border-radius:12px;

}
    .page-title{

    font-size:34px;

    font-weight:700;

    color:#fff;

    letter-spacing:.5px;

}
    
   
    
   
   


    `}</style>
  );
}
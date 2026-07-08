// Small formatting helpers shared across pages. Kept defensive on purpose:
// once DEMO_MODE is switched off, values come from a real backend response
// and any field can legitimately be missing, null, or spelled differently
// than expected — these helpers make sure a gap in the data shows up as a
// harmless "—" in the UI instead of crashing the whole page.

export function formatStorageType(storageType) {
  if (!storageType || typeof storageType !== 'string') return '—';
  return storageType.replace(/_/g, ' ');
}

export function formatDateTime(value, opts) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-IN', opts || { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN');
}

export function formatSize(sizeMb) {
  if (!sizeMb) return '—';
  return `${sizeMb} MB`;
}

// Real-world Spring/Node backends rarely return a bare JSON array from a
// list endpoint — it's often wrapped ({ data: [...] }, { content: [...] }
// for Spring Data pages, { items: [...] }, etc). This normalizes any of
// those shapes to a plain array so `.filter`/`.map` never blows up the UI,
// regardless of exactly how the real backend responds once DEMO_MODE=false.
export function asArray(value) {
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object') {
    for (const key of ['data', 'content', 'items', 'results', 'records', 'instances', 'history', 'schedules']) {
      if (Array.isArray(value[key])) return value[key];
    }
  }
  return [];
}

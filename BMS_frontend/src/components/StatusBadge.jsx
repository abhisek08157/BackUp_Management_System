import React from 'react';

const LABELS = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  COMPLETED: 'Completed',
   SUCCESS: 'Completed',
  FAILED: 'Failed',
  ONGOING: 'Ongoing',
  UPCOMING: 'Upcoming',
  MANUAL: 'Manual',
  SCHEDULED: 'Scheduled'
};

export default function StatusBadge({ status }) {
  const cls = String(status || '').toLowerCase();
  return (
    <span className={`badge ${cls}`}>
      <span className="dot" />
      {LABELS[status] || status}
    </span>
  );
}

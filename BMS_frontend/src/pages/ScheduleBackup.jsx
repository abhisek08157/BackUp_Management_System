import React, { useState } from 'react';
import instanceService from '../services/instanceService.js';
import scheduleService from '../services/scheduleService.js';
import historyService from '../services/historyService.js';
import StatusBadge from '../components/StatusBadge.jsx';
import { Modal, ConfirmDialog, ErrorDetailModal } from '../components/Modal.jsx';
import LoadError from '../components/LoadError.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useAsyncData, describeError } from '../hooks/useAsyncData.js';
import { formatStorageType, formatDate, asArray } from '../utils/format.js';

const EMPTY = {

    instanceId: "",

    backupDate: "",

    backupTime: "",

    storageType: "LOCAL",

    status: "ACTIVE"

};

async function loadScheduleData() {

    const [

        iRes,

        sRes,

        hRes

    ] = await Promise.allSettled([

        instanceService.list(),

        scheduleService.list(),

        historyService.list()

    ]);

    const instances =
        iRes.status === "fulfilled"
            ? asArray(iRes.value)
            : [];

    const schedules =
        sRes.status === "fulfilled"
            ? asArray(sRes.value)
            : [];

    const history =
        hRes.status === "fulfilled"
            ? asArray(hRes.value)
            : [];

    const failures =

        [iRes, sRes, hRes]

            .filter(r => r.status === "rejected")

            .map(r => describeError(r.reason));

    return {

        instances,

        schedules,

        history,

        partialError: failures[0] || ""

    };

}

export default function ScheduleBackup() {
  const toast = useToast();
  const { data, loading, error, reload } = useAsyncData(loadScheduleData, [], { instances: [], schedules: [], history: [], partialError: '' });
  const { instances, schedules, history, partialError } = data || { instances: [], schedules: [], history: [], partialError: '' };
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [errRecord, setErrRecord] = useState(null);

  const lastRunFor = (instanceId) => {
    const runs = history

    .filter(

        h =>

            Number(h.instanceId)

            ===

            Number(instanceId)

    )

    .sort(

        (a, b) =>

            new Date(b.backupDate)

            -

            new Date(a.backupDate)

    );

return runs[0];
  };

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {

    e.preventDefault();

    console.log("Submit Clicked");

    const errs = scheduleService.validate({
        ...form,
        backupDateTime: `${form.backupDate}T${form.backupTime}:00`
    });

    console.log(errs);

    setErrors(errs);

    if (Object.keys(errs).length) {
        return;
    }

    // Future Date Validation
    const selected = new Date(
        `${form.backupDate}T${form.backupTime}:00`
    );

    const now = new Date();

    console.log(selected);
    console.log(now);

    if (selected <= now) {

        setErrors((old) => ({
            ...old,
            backupTime:
                "Please select a future date and time."
        }));

        return;
    }

    setSaving(true);

    try {

        await scheduleService.create({

            ...form,

            backupDateTime:
                `${form.backupDate}T${form.backupTime}:00`

        });

        toast.push(
            "Backup schedule created.",
            "success"
        );

        setModalOpen(false);

        setForm(EMPTY);

        setErrors({});

        reload();

    } catch (err) {

        console.error(err);

        toast.push(
            describeError(err),
            "error"
        );

    } finally {

        setSaving(false);

    }

};
const confirmDelete = async () => {

    if (!toDelete) return;

    setDeleting(true);
    setDeleteError("");

    try {

        await scheduleService.remove(toDelete.scheduleId);

        toast.push(
            "Schedule deleted successfully.",
            "success"
        );

        setToDelete(null);

        reload();

    } catch (err) {

        setDeleteError(describeError(err));

    } finally {

        setDeleting(false);

    }

};
  const eligibleInstances = instances.filter((i) => i.status === 'ACTIVE');

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="crumb">Home / Schedule Backup</div>
          <h1>Schedule Backup</h1>
          <div className="sub">Automate recurring backups for critical database instances</div>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>+ New Schedule</button>
      </div>

      {error && <LoadError message={error} onRetry={reload} />}
      {!error && partialError && <LoadError message={partialError} onRetry={reload} />}

      <div className="card">
        {loading ? (
          <div className="card-pad">Loading schedules…</div>
        ) : schedules.length === 0 ? (
          <div className="empty-state"><div className="icon">🕒</div>No backup schedules configured yet.</div>
        ) : (
          <table>
           <thead>

<tr>

<th>Instance</th>

<th>Backup Date</th>

<th>Backup Time</th>

<th>Destination</th>

<th>Status</th>

<th></th>

</tr>

</thead>
           <tbody>
  

   {schedules.map((schedule) => {

    const lastRun = lastRunFor(schedule.instanceId);

    const scheduledTime = new Date(schedule.backupDateTime);

    let scheduleStatus = "SCHEDULED";

    if (scheduledTime <= new Date()) {

        if (lastRun?.status === "SUCCESS") {
            scheduleStatus = "COMPLETED";
        }
        else if (lastRun?.status === "FAILED") {
            scheduleStatus = "FAILED";
        }

    }

    return (
      <tr key={schedule.scheduleId}>

        <td style={{ fontWeight: 600 }}>
          {schedule.instanceName}
        </td>

        <td>
          {new Date(schedule.backupDateTime).toLocaleDateString()}
        </td>

        <td>
          {new Date(schedule.backupDateTime).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
          })}
        </td>

        <td>
          <span className="tag-db">
            {formatStorageType(schedule.backupLocation)}
          </span>
        </td>

        <td>
          <StatusBadge status={scheduleStatus} />
        </td>

        <td>
          <button
            className="btn btn-sm btn-danger"
            onClick={() => {
              setDeleteError("");
              setToDelete(schedule);
            }}
          >
            Delete
          </button>

          {lastRun?.status === "FAILED" && (
            <button
              className="btn btn-sm"
              style={{ marginLeft: 8 }}
              onClick={() => setErrRecord(lastRun)}
            >
              View Error
            </button>
          )}
        </td>

      </tr>
    );

  })}
</tbody>
          </table>
        )}
      </div>

      {modalOpen && (
        <Modal title="New Backup Schedule" onClose={() => setModalOpen(false)}
          footer={<><button className="btn" onClick={() => setModalOpen(false)}>Cancel</button><button className="btn btn-primary" form="schedule-form" type="submit" disabled={saving}>{saving ? <span className="spinner" /> : 'Create Schedule'}</button></>}>
          <form id="schedule-form" onSubmit={submit} noValidate>
            <div className="field" style={{ marginBottom: 12 }}>
              <label>Instance <span className="req">*</span></label>
              <select className={errors.instanceId ? 'invalid' : ''} value={form.instanceId} onChange={update('instanceId')}>
                <option value="">— Choose an active instance —</option>
                {eligibleInstances.map((i) => <option key={i.instanceId} value={i.instanceId}>{i.instanceName} ({i.databaseType})</option>)}
              </select>
              {errors.instanceId && <span className="err">{errors.instanceId}</span>}
              {eligibleInstances.length === 0 && <span className="field hint">No active instances available — activate an instance first.</span>}
            </div>
           <div className="form-grid" style={{ marginBottom: 12 }}>

    <div className="field">

        <label>

            Backup Date

            <span className="req">*</span>

        </label>

        <input

            type="date"

            min={new Date().toISOString().split("T")[0]}

            value={form.backupDate}

            onChange={update("backupDate")}

            className={errors.backupDate ? "invalid" : ""}

        />

        {errors.backupDate &&

            <span className="err">

                {errors.backupDate}

            </span>

        }

    </div>

    <div className="field">

        <label>

            Backup Time

            <span className="req">*</span>

        </label>

        <input

            type="time"

            value={form.backupTime}

            onChange={update("backupTime")}

            className={errors.backupTime ? "invalid" : ""}

        />

        {errors.backupTime &&

            <span className="err">

                {errors.backupTime}

            </span>

        }

    </div>

</div>
            <div className="field">
              <label>Storage Destination <span className="req">*</span></label>
              <select className={errors.storageType ? 'invalid' : ''} value={form.storageType} onChange={update('storageType')}>
                <option value="LOCAL">Local Server</option>
                <option value="GOOGLE_DRIVE">Google Drive</option>
                
                <option value="FILE_SERVER">File Server</option>
              </select>
              {errors.storageType && <span className="err">{errors.storageType}</span>}
            </div>
          </form>
        </Modal>
      )}

      {toDelete && (
        <ConfirmDialog title="Delete schedule" danger confirmLabel="Delete" busy={deleting}
          message={<>{deleteError && <div className="alert error" style={{ marginBottom: 12 }}>{deleteError}</div>}Remove the {(toDelete.frequency || '').toLowerCase() || 'configured'} schedule for <strong>{toDelete.instanceName}</strong>? This instance will then be eligible for deletion again.</>}
          onCancel={() => setToDelete(null)} onConfirm={confirmDelete} />
      )}

      <ErrorDetailModal record={errRecord} onClose={() => setErrRecord(null)} />
    </div>
  );
}

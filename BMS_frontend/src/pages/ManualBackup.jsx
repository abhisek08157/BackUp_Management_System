import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import instanceService from '../services/instanceService.js';
import backupService from '../services/backupService.js';
import StatusBadge from '../components/StatusBadge.jsx';
import { Modal, ErrorDetailModal } from '../components/Modal.jsx';
import LoadError from '../components/LoadError.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useAsyncData, describeError } from '../hooks/useAsyncData.js';
import { formatStorageType, formatDateTime, asArray } from '../utils/format.js';

const STORAGE_OPTIONS = [

    {

        value: "LOCAL",

        label: "Local Server",

        icon: "💻",

        desc: "Save backup in local backup folder"

    },

    {

        value: "GOOGLE_DRIVE",

        label: "Google Drive",

        icon: "☁️",

        desc: "Upload backup to Google Drive"

    },

    {

        value: "FILE_SERVER",

        label: "File Server",

        icon: "🗄️",

        desc: "Store backup on Railway File Server"

    }

];

async function loadInstances() {
  return asArray(await instanceService.list());
}

export default function ManualBackup() {
  const location = useLocation();
  const toast = useToast();
  const { data, loading, error, reload } = useAsyncData(loadInstances, [], []);
  const instances = data || [];
  const [selectedId, setSelectedId] = useState(location.state?.instanceId || '');
  const [modalOpen, setModalOpen] = useState(false);
  const [storageType, setStorageType] = useState('LOCAL');
  const [status, setStatus] = useState('idle'); // idle | processing | done | failed
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [errRecord, setErrRecord] = useState(null);
  const [recentRuns, setRecentRuns] = useState([]);

  const selected = instances.find(
    (i) => Number(i.instanceId) === Number(selectedId)
);

  const startBackup = () => {
    if (!selectedId) { toast.push('Select an instance first.', 'warn'); return; }
    setModalOpen(true);
  };

 const runBackup = async () => {

    setStatus("processing");
    setProgress(20);

    try {

        const response =
            await backupService.run(

                {

                    instanceId: Number(selectedId),

                    storageType

                },

                setProgress

            );

        setProgress(100);

        const backupResult = {

            backupId:
                response.backupId,

            instanceId:
                response.instanceId,

            instanceName:
                response.instanceName,

            storageType,

            backupDate:
                response.backupDate,

            backupSize:
                response.backupSize,

            duration:
                response.duration,

            status:
                response.status,

            remarks:
                response.remarks

        };

        setResult(backupResult);

        setRecentRuns(old => [

            backupResult,

            ...old

        ]);

        setStatus("done");
        reload();

        toast.push(

            response.remarks ||

            "Backup completed successfully.",

            "success"

        );

    }

    catch (e) {

        setProgress(100);

        setStatus("failed");

        setResult({

            instanceName:

                selected.instanceName,

            storageType,

            status:

                "FAILED",

            errorMessage:

    e.response?.data?.remarks ||

    describeError(e)

        });

        toast.push(

            describeError(e),

            "error"

        );

    }

};

  const closeModal = () => {
    setModalOpen(false);
    setStatus('idle');
    setProgress(0);
    setResult(null);
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="crumb">Home / Manual Backup</div>
          <h1>Manual Backup</h1>
          <div className="sub">Trigger an on-demand backup for any active database instance</div>
        </div>
      </div>

      {error && <LoadError message={error} onRetry={reload} />}

      <div className="card card-pad" style={{ maxWidth: 720, marginBottom: 20 }}>
        <div className="field" style={{ marginBottom: 14 }}>
          <label>Select Instance <span className="req">*</span></label>
          <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} disabled={loading}>
            <option value="">— Choose an instance —</option>
            {instances.map((i) => (
              <option
    key={i.instanceId}
    value={i.instanceId}
    disabled={i.status !== "ACTIVE"}
>
                {i.instanceName} ({i.databaseType}) {i.status !== 'ACTIVE' ? ' — inactive' : ''}
              </option>
            ))}
          </select>
        </div>

        {selected && (
          <div className="alert info" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{selected.instanceName} · {selected.ipAddress}:{selected.port}</span>
            <StatusBadge status={selected.status} />
          </div>
        )}

        <button className="btn btn-accent" style={{ marginTop: 8 }} onClick={startBackup} disabled={!selectedId || selected?.status !== 'ACTIVE'}>
          ⚡ Run Backup Now
        </button>
        {selected && selected.status !== 'ACTIVE' && <div className="field hint" style={{ marginTop: 8 }}>This instance is inactive and cannot be backed up until it is reactivated.</div>}
      </div>

      {recentRuns.length > 0 && (
        <div className="card">
          <div className="card-head"><h3>Runs in this session</h3></div>
          <table>
            <thead><tr><th>Instance</th><th>Destination</th><th>Status</th><th>Finished</th><th></th></tr></thead>
            <tbody>
              {recentRuns.map((r) => (
                <tr key={r.backupId}>
                  <td style={{ fontWeight: 600 }}>{r.instanceName}</td>
                  <td className="tag-db">{formatStorageType(r.storageType)}</td>
                  <td><StatusBadge status={r.status} /></td>
                  <td>{formatDateTime(r.backupDate, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</td>
                  <td>{r.status === 'FAILED' && <button className="btn btn-sm" onClick={() => setErrRecord(r)}>View error</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <Modal title="Run Manual Backup" onClose={status === 'processing' ? undefined : closeModal}
          footer={status === 'idle' ? (
            <><button className="btn" onClick={closeModal}>Cancel</button><button className="btn btn-primary" onClick={runBackup}>Start Backup</button></>
          ) : status === 'processing' ? null : (
            <button className="btn btn-primary" onClick={closeModal}>Close</button>
          )}>
          {status === 'idle' && (
            <>
              <div style={{ marginBottom: 10, fontSize: 13 }}>Choose where to store the backup for <strong>{selected?.instanceName}</strong>:</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {STORAGE_OPTIONS.map((opt) => (
                  <div key={opt.value} onClick={() => setStorageType(opt.value)}
                    className={`db-choice`} style={{ display: 'block' }}>
                    <div className={`opt${storageType === opt.value ? ' selected' : ''}`} style={{ textAlign: 'left', cursor: 'pointer' }}>
                      <div style={{ fontSize: 18 }}>{opt.icon} {opt.label}</div>
                      <div style={{ fontWeight: 400, fontSize: 11.5, color: 'var(--text-muted)', marginTop: 4 }}>{opt.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {status === 'processing' && (
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <div style={{ marginBottom: 14, fontWeight: 600 }}><span className="spinner dark" /> &nbsp;Processing backup… please wait</div>
              <div className="progress-track"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
              <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>{progress}% complete — do not close this window</div>
            </div>
          )}

          {status === 'done' && (
            <div className="alert success">

<strong>Backup completed successfully.</strong>

<br /><br />

Instance :

<b>{result.instanceName}</b>

<br />

Destination :

<b>{formatStorageType(storageType)}</b>

<br />

Backup ID :

<b>{result.backupId}</b>

<br />

Duration :

<b>{result.duration}</b>

<br />

Size :

<b>{result.backupSize}</b>

</div>
          )}

          {status === 'failed' && (
            <>
              <div className="alert error">The backup run failed. See error details below.</div>
              <div className="error-log">{result?.errorMessage}</div>
            </>
          )}
        </Modal>
      )}

      <ErrorDetailModal record={errRecord} onClose={() => setErrRecord(null)} />
    </div>
  );
}

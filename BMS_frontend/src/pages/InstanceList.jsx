import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import instanceService from '../services/instanceService.js';
import StatusBadge from '../components/StatusBadge.jsx';
import { ConfirmDialog } from '../components/Modal.jsx';
import LoadError from '../components/LoadError.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useAsyncData, describeError } from '../hooks/useAsyncData.js';
import { asArray } from '../utils/format.js';
import scheduleService from "../services/scheduleService.js";
async function loadInstances() {

    const [instances, schedules] = await Promise.all([
        instanceService.list(),
        scheduleService.list()
    ]);

    const scheduleIds = new Set(
        asArray(schedules).map(s => Number(s.instanceId))
    );

    return asArray(instances)
        .map(inst => ({
            ...inst,
            scheduled: scheduleIds.has(Number(inst.instanceId))
        }))
        .sort((a, b) => b.instanceId - a.instanceId);

}
export default function InstanceList() {

  const { data, loading, error, reload } =
    useAsyncData(loadInstances, [], []);

  const instances = data || [];

  const [toDelete, setToDelete] = useState(null);

  const [deleteError, setDeleteError] = useState('');

  const [busy, setBusy] = useState(false);

  const toast = useToast();

  const navigate = useNavigate();

  // Live refresh every 10 seconds
  useEffect(() => {

    reload();

    const interval = setInterval(() => {

      reload();

    }, 10000);

    return () => clearInterval(interval);

  }, [reload]);

  const confirmDelete = async () => {

    setBusy(true);

    setDeleteError('');

    try {

      await instanceService.remove(
        toDelete.instanceId
      );

      toast.push(
        `Instance "${toDelete.instanceName}" was deleted.`,
        "success"
      );

      setToDelete(null);

      reload();

    } catch (e) {

      setDeleteError(
        describeError(e)
      );

    } finally {

      setBusy(false);

    }

  };

  return (

    <div>

      <div className="page-head">

        <div>

          <div className="crumb">

            Home / Instances

          </div>

          <h1>

            Database Instances

          </h1>

          <div className="sub">

            MySQL &amp; Oracle production instances registered for backup monitoring

          </div>

        </div>

        <Link
          to="/instances/new"
          className="btn btn-primary"
        >

          + Add Instance

        </Link>

      </div>

      {

        error &&

        <LoadError

          message={error}

          onRetry={reload}

        />

      }

      <div className="card">

        {

          loading ?

            (

              <div className="card-pad">

                Loading instances…

              </div>

            )

            :

            instances.length === 0 ?

              (

                error ?

                  null

                  :

                  <div className="empty-state">

                    <div className="icon">

                      🗄️

                    </div>

                    No instances registered yet.

                    <Link to="/instances/new">

                      Add your first instance

                    </Link>

                  </div>

              )

              :

              (

                <table>

                  <thead>

                    <tr>

                      <th>ID</th>

                      <th>Instance Name</th>

                      <th>DB Type</th>

                      <th>Host</th>

                      <th>Status</th>

                      <th>Created On</th>

                      <th></th>

                    </tr>

                  </thead>

                  <tbody>

                    {

                      instances.map((inst) => (

                        <tr key={inst.instanceId}>

                          <td
                            style={{
                              color: 'var(--text-faint)'
                            }}
                          >

                            #{inst.instanceId}

                          </td>

                          <td>

                            <Link
                              to={`/instances/${inst.instanceId}`}
                              style={{
                                fontWeight: 600
                              }}
                            >

                              {inst.instanceName}

                            </Link>

                          </td>

                          <td>

                            <span className="tag-db">

                              {inst.databaseType}

                            </span>

                          </td>

                          <td>

                            {inst.ipAddress}:{inst.port}

                          </td>

                          <td>

                            <StatusBadge
                              status={inst.status}
                            />

                          </td>

                          {/* Backend does not return createdAt */}

                          <td>

                            -

                          </td>

                          <td
                            style={{
                              whiteSpace: 'nowrap'
                            }}
                          >

                            <button
                              className="btn btn-sm"
                              onClick={() =>
                                navigate(
                                  `/instances/${inst.instanceId}/edit`
                                )
                              }
                            >

                              Edit

                            </button>

                            {' '}

                           {
    inst.scheduled ? (

        <button
            className="btn btn-sm"
            disabled
            title="Instance is used in a backup schedule"
        >
            Scheduled
        </button>

    ) : (

        <button
            className="btn btn-sm btn-danger"
            disabled={busy}
            onClick={() => {

                setDeleteError("");

                setToDelete(inst);

            }}
        >
            Delete
        </button>

    )
}

                          </td>

                        </tr>

                      ))

                    }

                  </tbody>

                </table>

              )

        }

      </div>

      {

        toDelete &&

        <ConfirmDialog

          title="Delete instance"

          danger

          busy={busy}

          confirmLabel="Delete"

          message={

            <>

              {

                deleteError &&

                <div
                  className="alert error"
                  style={{
                    marginBottom: 12
                  }}
                >

                  {deleteError}

                </div>

              }

              Are you sure you want to delete

              <strong>

                {" "}
                {toDelete.instanceName}
                {" "}

              </strong>

              ?

              This action cannot be undone.

            </>

          }

          onCancel={() =>
            setToDelete(null)
          }

          onConfirm={confirmDelete}

        />

      }

    </div>

  );

}
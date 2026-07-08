import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import instanceService from "../services/instanceService.js";
import historyService from "../services/historyService.js";

import StatusBadge from "../components/StatusBadge.jsx";
import { ErrorDetailModal } from "../components/Modal.jsx";
import LoadError from "../components/LoadError.jsx";

import { useAsyncData } from "../hooks/useAsyncData.js";

import {
    formatStorageType,
    formatDateTime,
    asArray
} from "../utils/format.js";

export default function InstanceDetails() {

    const { id } = useParams();

    const navigate = useNavigate();

    const [errRecord, setErrRecord] = useState(null);

    const loader = React.useCallback(async () => {

        const [instance, history] =
            await Promise.all([

                instanceService.get(id),

                historyService.byInstance(id)

            ]);

        return {

            instance,

            history: asArray(history)

        };

    }, [id]);

    const {

        data,

        loading,

        error,

        reload

    } = useAsyncData(

        loader,

        [id],

        null

    );

    useEffect(() => {

        reload();

        const interval =

            setInterval(

                reload,

                10000

            );

        return () =>

            clearInterval(interval);

    }, [reload]);

    const {

        instance,

        history

    } = data || {

        instance: null,

        history: []

    };

    if (loading)

        return (

            <div className="card card-pad">

                Loading instance details...

            </div>

        );

    if (error)

        return (

            <LoadError

                message={error}

                onRetry={reload}

            />

        );

    if (!instance)

        return (

            <div className="alert error">

                Instance not found.

            </div>

        );

    return (

        <div>

            <div className="page-head">

                <div>

                    <div className="crumb">

                        Home / Instances /

                        {instance.instanceName}

                    </div>

                    <h1>

                        {instance.instanceName}

                    </h1>

                    <div className="sub">

                        Instance #

                        {instance.instanceId}

                    </div>

                </div>

                <div

                    style={{

                        display: "flex",

                        gap: 8

                    }}

                >

                    <button

                        className="btn"

                        onClick={() =>

                            navigate(

                                `/instances/${id}/edit`

                            )

                        }

                    >

                        Edit Instance

                    </button>

                    <Link

                        className="btn btn-accent"

                        to="/backup/run"

                        state={{

                            instanceId:

                                instance.instanceId

                        }}

                    >

                        ⚡ Run Backup

                    </Link>

                </div>

            </div>

            <div className="kpi-grid">

                <div className="kpi">

                    <div className="kpi-label">

                        Database Type

                    </div>

                    <div

                        className="kpi-value"

                        style={{

                            fontSize: 20

                        }}

                    >

                        {instance.databaseType}

                    </div>

                </div>

                <div className="kpi">

                    <div className="kpi-label">

                        Host

                    </div>

                    <div

                        className="kpi-value"

                        style={{

                            fontSize: 18

                        }}

                    >

                        {instance.ipAddress}

                        :

                        {instance.port}

                    </div>

                </div>

                <div className="kpi">

                    <div className="kpi-label">

                        Status

                    </div>

                    <div

                        style={{

                            marginTop: 6

                        }}

                    >

                        <StatusBadge

                            status={instance.status}

                        />

                    </div>

                </div>

                <div className="kpi">

                    <div className="kpi-label">

                        Schedule

                    </div>

                    <div

                        style={{

                            marginTop: 6

                        }}

                    >

                        {

                            instance.usedInSchedule

                                ?

                                <span className="badge scheduled">

                                    <span className="dot" />

                                    Scheduled

                                </span>

                                :

                                <span className="badge inactive">

                                    <span className="dot" />

                                    None

                                </span>

                        }

                    </div>

                </div>

            </div>

            <div className="card">

                <div className="card-head">

                    <h3>

                        Backup History

                    </h3>

                </div>

                {

                    history.length === 0 ?

                        (

                            <div className="empty-state">

                                <div className="icon">

                                    📭

                                </div>

                                No backups available.

                            </div>

                        )

                        :

                        (

                            <table>

                                <thead>

                                    <tr>

                                        <th>

                                            Backup ID

                                        </th>

                                        <th>

                                            Destination

                                        </th>

                                        <th>

                                            Status

                                        </th>

                                        <th>

                                            Backup Time

                                        </th>

                                        <th>

                                            Size

                                        </th>

                                        <th>

                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {

                                        history.map(

                                            backup => (

                                                <tr

                                                    key={

                                                        backup.backupId

                                                    }

                                                >

                                                    <td>

                                                        #

                                                        {

                                                            backup.backupId

                                                        }

                                                    </td>

                                                    <td>

                                                        <span className="tag-db">

                                                            {

                                                                formatStorageType(

                                                                    backup.backupLocation

                                                                )

                                                            }

                                                        </span>

                                                    </td>

                                                    <td>

                                                        <StatusBadge

                                                            status={

                                                                backup.status

                                                            }

                                                        />

                                                    </td>

                                                    <td>

                                                        {

                                                            formatDateTime(

                                                                backup.backupDate

                                                            )

                                                        }

                                                    </td>

                                                    <td>

                                                        {

                                                            backup.backupSize

                                                        }

                                                    </td>

                                                    <td>

                                                        {

                                                            backup.status ===

                                                            "FAILED"

                                                            &&

                                                            <button

                                                                className="btn btn-sm"

                                                                onClick={() =>

                                                                    setErrRecord(

                                                                        backup

                                                                    )

                                                                }

                                                            >

                                                                View Error

                                                            </button>

                                                        }

                                                    </td>

                                                </tr>

                                            )

                                        )

                                    }

                                </tbody>

                            </table>

                        )

                }

            </div>

            <ErrorDetailModal

                record={errRecord}

                onClose={() =>

                    setErrRecord(null)

                }

            />

        </div>

    );

}
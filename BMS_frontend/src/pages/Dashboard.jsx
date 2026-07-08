import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import instanceService from "../services/instanceService.js";
import historyService from "../services/historyService.js";

import StatusBadge from "../components/StatusBadge.jsx";
import { ErrorDetailModal } from "../components/Modal.jsx";
import LoadError from "../components/LoadError.jsx";

import {
    useAsyncData,
    describeError
} from "../hooks/useAsyncData.js";

import {
    formatStorageType,
    formatDateTime,
    asArray
} from "../utils/format.js";

const EMPTY = {

    instances: [],

    history: [],

    partialError: ""

};

async function loadDashboard() {

    const [

        instanceResult,

        historyResult

    ] = await Promise.allSettled([

        instanceService.list(),

        historyService.list()

    ]);

    const instances =

        instanceResult.status === "fulfilled"

            ?

            asArray(instanceResult.value)

            :

            [];

    const history =

        historyResult.status === "fulfilled"

            ?

            asArray(historyResult.value)

            :

            [];

    const failures =

        [

            instanceResult,

            historyResult

        ]

            .filter(

                r => r.status === "rejected"

            )

            .map(

                r => describeError(r.reason)

            );

    return {

        instances,

        history,

        partialError:

            failures[0] || ""

    };

}

export default function Dashboard() {

    const {

        data,

        loading,

        error,

        reload

    } = useAsyncData(

        loadDashboard,

        [],

        EMPTY

    );

    const [

        errRecord,

        setErrRecord

    ] = useState(null);

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

        instances,

        history,

        partialError

    } = data || EMPTY;

    //--------------------------------------------------

    // Dashboard Cards

    //--------------------------------------------------

    const totalInstances =

        instances.length;

    const activeInstances =

        instances.filter(

            i => i.status === "ACTIVE"

        ).length;

    const inactiveInstances =

        instances.filter(

            i =>

                i.status === "INACTIVE"

        ).length;

    const failed24h =

        history.filter(h =>

            h.status === "FAILED"

            &&

            Date.now()

            -

            new Date(

                h.backupDate

            ).getTime()

            <

            86400000

        ).length;

    const recent =

        [...history]

            .sort(

                (a, b) =>

                    new Date(

                        b.backupDate

                    )

                    -

                    new Date(

                        a.backupDate

                    )

            )

            .slice(0, 8);

      return (

        <div>

            <div className="page-head">

                <div>

                    <div className="crumb">

                        Home

                    </div>

                    <h1>

                        Dashboard

                    </h1>

                    <div className="sub">

                        Overview of backup infrastructure across East Coast Railway database instances

                    </div>

                </div>

                <Link
                    to="/backup/run"
                    className="btn btn-accent"
                >

                    ⚡ Run Manual Backup

                </Link>

            </div>

            {

                error &&

                <LoadError

                    message={error}

                    onRetry={reload}

                />

            }

            {

                !error

                &&

                partialError

                &&

                <LoadError

                    message={partialError}

                    onRetry={reload}

                />

            }

            <div className="kpi-grid">

                <div className="kpi">

                    <div className="kpi-label">

                        Total Instances

                    </div>

                    <div className="kpi-value">

                        {

                            loading

                                ?

                                "—"

                                :

                                totalInstances

                        }

                    </div>

                    <div className="kpi-foot">

                        MySQL & Oracle registered databases

                    </div>

                </div>

                <div className="kpi green">

                    <div className="kpi-label">

                        Active Instances

                    </div>

                    <div className="kpi-value">

                        {

                            loading

                                ?

                                "—"

                                :

                                activeInstances

                        }

                    </div>

                    <div className="kpi-foot">

                        Reachable & Eligible

                    </div>

                </div>

                <div className="kpi amber">

                    <div className="kpi-label">

                        Inactive Instances

                    </div>

                    <div className="kpi-value">

                        {

                            loading

                                ?

                                "—"

                                :

                                inactiveInstances

                        }

                    </div>

                    <div className="kpi-foot">

                        Need attention

                    </div>

                </div>

                <div className="kpi red">

                    <div className="kpi-label">

                        Failed (24h)

                    </div>

                    <div className="kpi-value">

                        {

                            loading

                                ?

                                "—"

                                :

                                failed24h

                        }

                    </div>

                    <div className="kpi-foot">

                        Backup failures

                    </div>

                </div>

            </div>

            <div className="card">

                <div className="card-head">

                    <h3>

                        Recent Backup Activity

                    </h3>

                    <Link

                        to="/history"

                        className="btn btn-sm"

                    >

                        View Full History →

                    </Link>

                </div>

                {

                    loading ?

                        (

                            <div className="card-pad">

                                Loading recent activity...

                            </div>

                        )

                        :

                        recent.length === 0 ?

                            (

                                <div className="empty-state">

                                    <div className="icon">

                                        📭

                                    </div>

                                    No backup activity yet.

                                </div>

                            )

                            :

                            (

                                <table>

                                    <thead>

                                        <tr>

                                            <th>

                                                Instance

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

                                            recent.map(

                                                (backup) => (

                                                    <tr

                                                        key={

                                                            backup.backupId

                                                        }

                                                    >

                                                        <td

                                                            style={{

                                                                fontWeight: 600

                                                            }}

                                                        >

                                                            {

                                                                backup.instanceName

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
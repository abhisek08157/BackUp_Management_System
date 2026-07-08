import React, { useEffect, useMemo, useState } from "react";

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

const TABS = [

    {

        key: "ALL",

        label: "All"

    },

    {

        key: "SUCCESS",

        label: "Success"

    },

    {

        key: "FAILED",

        label: "Failed"

    }

];

async function loadHistory() {

    return asArray(

        await historyService.list()

    );

}

export default function BackupHistory() {

    const {

        data,

        loading,

        error,

        reload

    } = useAsyncData(

        loadHistory,

        [],

        []

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

    const history = data || [];

    const [

        tab,

        setTab

    ] = useState("ALL");

    const [

        errRecord,

        setErrRecord

    ] = useState(null);

    const counts = useMemo(() => ({

        ALL:

            history.length,

        SUCCESS:

            history.filter(

                h =>

                    h.status === "SUCCESS"

            ).length,

        FAILED:

            history.filter(

                h =>

                    h.status === "FAILED"

            ).length

    }), [history]);

    const filtered = useMemo(() => {

        return [...history]

            .filter(

                h =>

                    tab === "ALL"

                    ||

                    h.status === tab

            )

            .sort(

                (a, b) =>

                    new Date(

                        b.backupDate

                    )

                    -

                    new Date(

                        a.backupDate

                    )

            );

    }, [history, tab]);

      return (

        <div>

            <div className="page-head">

                <div>

                    <div className="crumb">

                        Home / Backup History

                    </div>

                    <h1>

                        Backup History

                    </h1>

                    <div className="sub">

                        Complete audit trail of database backups

                    </div>

                </div>

            </div>

            {

                error &&

                <LoadError

                    message={error}

                    onRetry={reload}

                />

            }

            <div className="tabs">

                {

                    TABS.map((t) => (

                        <div

                            key={t.key}

                            className={`tab${

                                tab === t.key

                                    ? " active"

                                    : ""

                            }`}

                            onClick={() =>

                                setTab(t.key)

                            }

                        >

                            {t.label}

                            <span className="count">

                                {

                                    counts[t.key]

                                }

                            </span>

                        </div>

                    ))

                }

            </div>

            <div className="card">

                {

                    loading ?

                        (

                            <div className="card-pad">

                                Loading backup history...

                            </div>

                        )

                        :

                        filtered.length === 0 ?

                            (

                                <div className="empty-state">

                                    <div className="icon">

                                        📭

                                    </div>

                                    No backup history found.

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

                                                Duration

                                            </th>

                                            <th>

                                            </th>

                                        </tr>

                                    </thead>

                                    <tbody>

                                        {

                                            filtered.map(

                                                (backup) => (

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

    <div
        style={{
            display: "flex",
            alignItems: "center",
            gap: "8px"
        }}
    >

        <StatusBadge status={backup.status} />

        <StatusBadge status={backup.type} />

    </div>

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

                                                                backup.duration

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
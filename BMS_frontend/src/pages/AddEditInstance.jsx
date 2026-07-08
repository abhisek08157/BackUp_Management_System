import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import instanceService from "../services/instanceService.js";
import StatusBadge from "../components/StatusBadge.jsx";
import LoadError from "../components/LoadError.jsx";

import { useToast } from "../context/ToastContext.jsx";
import { describeError } from "../hooks/useAsyncData.js";

const EMPTY = {

    instanceName: "",

    databaseType: "MYSQL",

    databaseName: "",

    ipAddress: "",

    port: "",

    dbUsername: "",

    dbPassword: "",

    status: "ACTIVE"

};

export default function AddEditInstance() {

    const { id } = useParams();

    const isEdit = Boolean(id);

    const navigate = useNavigate();

    const toast = useToast();

    const [form, setForm] = useState(EMPTY);

    const [errors, setErrors] = useState({});

    const [loading, setLoading] = useState(isEdit);

    const [loadError, setLoadError] = useState("");

    const [saving, setSaving] = useState(false);

    const [saveError, setSaveError] = useState("");

    const [savedInstance, setSavedInstance] = useState(null);

    const [testState, setTestState] =
        useState("idle");

    const [testMessage, setTestMessage] =
        useState("");

    const [connectionVerifiedFor,
        setConnectionVerifiedFor] =
        useState("");

    //---------------------------------------------------
    // Load Existing Instance
    //---------------------------------------------------

    useEffect(() => {

        if (!isEdit) return;

        const loadInstance = async () => {

            try {

                const instance =
                    await instanceService.get(id);

                setForm({

                    ...EMPTY,

                    ...instance,

                    port: String(instance.port)

                });

            }

            catch (e) {

                setLoadError(

                    describeError(e)

                );

            }

            finally {

                setLoading(false);

            }

        };

        loadInstance();

    }, [id, isEdit]);

    //---------------------------------------------------
    // Signature
    //---------------------------------------------------

    const signature = useMemo(() => {

        return JSON.stringify({

            databaseType:
                form.databaseType,

            ipAddress:
                form.ipAddress,

            port:
                form.port,

            databaseName:
                form.databaseName,

            dbUsername:
                form.dbUsername,

            dbPassword:
                form.dbPassword

        });

    }, [

        form.databaseType,

        form.ipAddress,

        form.port,

        form.databaseName,

        form.dbUsername,

        form.dbPassword

    ]);

    //---------------------------------------------------
    // Update Field
    //---------------------------------------------------

    const update = (key) => (e) => {

        setForm((old) => ({

            ...old,

            [key]: e.target.value

        }));

        if (testState !== "idle") {

            setTestState("idle");

            setTestMessage("");

            setConnectionVerifiedFor("");

        }

    };

    //---------------------------------------------------
    // Validation
    //---------------------------------------------------

    const validateNow = () => {

        const validationErrors =
            instanceService.validate(form);

        setErrors(validationErrors);

        return validationErrors;

    };

    //---------------------------------------------------
    // Test Connection
    //---------------------------------------------------

    const handleTestConnection = async () => {

        const validationErrors =
            validateNow();

        if (Object.keys(validationErrors).length)
            return;

        try {

            setTestState("testing");

            setTestMessage("");

            const response =
                await instanceService
                    .testConnection(form);

            if (response.success) {

                setTestState("success");

                setConnectionVerifiedFor(
                    signature
                );

            }

            else {

                setTestState("error");

            }

            setTestMessage(
                response.message
            );

        }

        catch (e) {

            setTestState("error");

            setTestMessage(

                describeError(e)

            );

        }

    };

    //---------------------------------------------------
    // Save Enabled
    //---------------------------------------------------

    const canSave =

        testState === "success"

        &&

        connectionVerifiedFor === signature;

    //---------------------------------------------------
    // Save Instance
    //---------------------------------------------------

    const handleSave = async (e) => {

        e.preventDefault();

        const validationErrors =
            validateNow();

        if (

            Object.keys(validationErrors).length

        ) return;

        if (!canSave) {

            toast.push(

                "Please verify the database connection first.",

                "warn"

            );

            return;

        }

        setSaving(true);

        setSaveError("");

        try {

            const payload = {

                ...form,

                port: Number(form.port)

            };

            let result;

            if (isEdit) {

                result = await instanceService.update(

                    id,

                    payload

                );

            }

            else {

                result = await instanceService.create(

                    payload

                );

            }

            setSavedInstance(result);

            toast.push(

                `Instance "${result.instanceName}" ${isEdit ? "updated" : "created"} successfully.`,

                "success"

            );

            setTimeout(() => {

                navigate(

                    `/instances/${result.instanceId}`

                );

            }, 800);

        }

        catch (e) {

            setSaveError(

                describeError(e)

            );

        }

        finally {

            setSaving(false);

        }

    };

    if (loading)

        return (

            <div className="card card-pad">

                Loading instance...

            </div>

        );

    if (loadError)

        return (

            <LoadError

                message={loadError}

                onRetry={() => window.location.reload()}

            />

        );

     return (

        <div>

            <div className="page-head">

                <div>

                    <div className="crumb">

                        Home / Instances /

                        {isEdit ? "Edit" : "Add New"}

                    </div>

                    <h1>

                        {isEdit

                            ? "Edit Instance"

                            : "Add New Instance"}

                    </h1>

                    <div className="sub">

                        Register a MySQL or Oracle production database for backup monitoring

                    </div>

                </div>

                {

                    savedInstance &&

                    <StatusBadge

                        status={savedInstance.status}

                    />

                }

            </div>

            <form

                className="card card-pad"

                onSubmit={handleSave}

                noValidate

                style={{ maxWidth: 780 }}

            >

                {

                    saveError &&

                    <div className="alert error">

                        {saveError}

                    </div>

                }

                <div
                    className="field"
                    style={{ marginBottom: 16 }}
                >

                    <label>

                        Database Type

                        <span className="req">*</span>

                    </label>

                    <div className="db-choice">

                        {

                            ["MYSQL", "ORACLE"].map((type) => (

                                <div

                                    key={type}

                                    className={`opt${form.databaseType === type ? " selected" : ""}`}

                                    onClick={() =>
                                        update("databaseType")({

                                            target: {

                                                value: type

                                            }

                                        })
                                    }

                                >

                                    {

                                        type === "MYSQL"

                                            ? "MySQL"

                                            : "Oracle"

                                    }

                                </div>

                            ))

                        }

                    </div>

                </div>

                <div className="form-grid">

                    <div className="field">

                        <label>

                            Instance Name

                            <span className="req">*</span>

                        </label>

                        <input

                            className={errors.instanceName ? "invalid" : ""}

                            value={form.instanceName}

                            onChange={update("instanceName")}

                            placeholder="e.g. Railway Production"

                        />

                        {

                            errors.instanceName &&

                            <span className="err">

                                {errors.instanceName}

                            </span>

                        }

                    </div>

                    <div className="field">

                        <label>

                            Database Name

                            <span className="req">*</span>

                        </label>

                        <input

                            className={errors.databaseName ? "invalid" : ""}

                            value={form.databaseName}

                            onChange={update("databaseName")}

                        />

                        {

                            errors.databaseName &&

                            <span className="err">

                                {errors.databaseName}

                            </span>

                        }

                    </div>

                    <div className="field">

                        <label>

                            Host / IP Address

                            <span className="req">*</span>

                        </label>

                        <input

                            className={errors.ipAddress ? "invalid" : ""}

                            value={form.ipAddress}

                            onChange={update("ipAddress")}

                        />

                        {

                            errors.ipAddress &&

                            <span className="err">

                                {errors.ipAddress}

                            </span>

                        }

                    </div>

                    <div className="field">

                        <label>

                            Port

                            <span className="req">*</span>

                        </label>

                        <input

                            className={errors.port ? "invalid" : ""}

                            value={form.port}

                            onChange={update("port")}

                            placeholder={

                                form.databaseType === "MYSQL"

                                    ? "3306"

                                    : "1521"

                            }

                        />

                        {

                            errors.port &&

                            <span className="err">

                                {errors.port}

                            </span>

                        }

                    </div>

                    <div className="field">

                        <label>

                            Database Username

                            <span className="req">*</span>

                        </label>

                        <input

                            className={errors.dbUsername ? "invalid" : ""}

                            value={form.dbUsername}

                            onChange={update("dbUsername")}

                        />

                        {

                            errors.dbUsername &&

                            <span className="err">

                                {errors.dbUsername}

                            </span>

                        }

                    </div>

                    <div className="field">

                        <label>

                            Database Password

                            <span className="req">*</span>

                        </label>

                        <input

                            type="password"

                            className={errors.dbPassword ? "invalid" : ""}

                            value={form.dbPassword}

                            onChange={update("dbPassword")}

                        />

                        {

                            errors.dbPassword &&

                            <span className="err">

                                {errors.dbPassword}

                            </span>

                        }

                    </div>

                </div>

                <div className="divider" />

                <div

                    style={{

                        display: "flex",

                        alignItems: "center",

                        gap: 12,

                        flexWrap: "wrap"

                    }}

                >

                    <button

                        type="button"

                        className="btn"

                        onClick={handleTestConnection}

                        disabled={

                            testState === "testing"

                        }

                    >

                        {

                            testState === "testing"

                                ?

                                <>

                                    <span className="spinner dark" />

                                    {" "}

                                    Testing...

                                </>

                                :

                                "🔌 Test Connection"

                        }

                    </button>

                    {

                        testState === "success"

                        &&

                        <span className="badge active">

                            <span className="dot" />

                            Connection Verified

                        </span>

                    }

                    {

                        testState === "error"

                        &&

                        <span className="badge failed">

                            <span className="dot" />

                            Connection Failed

                        </span>

                    }

                </div>

                {

                    testMessage &&

                    <div

                        className={`alert ${

                            testState === "success"

                                ?

                                "success"

                                :

                                "error"

                        }`}

                        style={{ marginTop: 12 }}

                    >

                        {testMessage}

                    </div>

                }

                {

                    !canSave

                    &&

                    testState !== "testing"

                    &&

                    <div

                        className="field hint"

                        style={{ marginTop: 8 }}

                    >

                        Please verify the database connection before saving.

                    </div>

                }

                <div className="divider" />

                <div

                    style={{

                        display: "flex",

                        gap: 10

                    }}

                >

                    <button

                        type="submit"

                        className="btn btn-primary"

                        disabled={

                            !canSave || saving

                        }

                    >

                        {

                            saving

                                ?

                                <span className="spinner" />

                                :

                                isEdit

                                    ?

                                    "Save Changes"

                                    :

                                    "Save Instance"

                        }

                    </button>

                    <button

                        type="button"

                        className="btn"

                        onClick={() =>

                            navigate("/instances")

                        }

                    >

                        Cancel

                    </button>

                </div>

            </form>

        </div>

    );

}
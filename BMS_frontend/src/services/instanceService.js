import axiosClient from "../api/axiosClient.js";
import { asArray } from "../utils/format.js";
import { mapInstance } from "./mapers/instanceMapper.js";
function validateInstancePayload(payload) {

    const errors = {};

    if (!payload.instanceName?.trim())
        errors.instanceName = "Instance name is required";

    if (!payload.databaseType)
        errors.databaseType = "Select a database type";

    if (!payload.databaseName?.trim())
        errors.databaseName = "Database name is required";

    if (!payload.ipAddress?.trim())
        errors.ipAddress = "Host / IP Address is required";

    if (!payload.port)
        errors.port = "Port is required";

    if (!payload.dbUsername?.trim())
        errors.dbUsername = "Database username is required";

    if (!payload.dbPassword?.trim())
        errors.dbPassword = "Database password is required";

    return errors;

}

const instanceService = {

    validate: validateInstancePayload,

    async list() {

    const response =
        await axiosClient.get(
            "/instances/status"
        );

    return response.map(mapInstance);

},

    async get(instanceId) {

    const response =
        await axiosClient.get(
            `/instances/${instanceId}`
        );

    return mapInstance(response);

},

    async create(payload) {

    const errors =
        validateInstancePayload(payload);

    if (Object.keys(errors).length) {

        const e =
            new Error("Validation failed");

        e.fieldErrors = errors;

        throw e;

    }

    const response =
        await axiosClient.post(
            "/instances",
            payload
        );

    return mapInstance(response);

},

    async update(instanceId, payload) {

    const errors =
        validateInstancePayload(payload);

    if (Object.keys(errors).length) {

        const e =
            new Error("Validation failed");

        e.fieldErrors = errors;

        throw e;

    }

    const response =
        await axiosClient.put(
            `/instances/${instanceId}`,
            payload
        );

    return mapInstance(response);

},
    async remove(instanceId) {

    await axiosClient.delete(
        `/instances/${instanceId}`
    );

    return {

        success: true

    };

},
    async testConnection(payload) {

    return axiosClient.post(
        "/instances/test-connection",
        payload
    );

},

    async liveStatus() {

    const response =
        await axiosClient.get(
            "/instances/status"
        );

    return response.map(mapInstance);

},

};

export default instanceService;
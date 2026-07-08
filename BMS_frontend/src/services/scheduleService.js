import axiosClient from "../api/axiosClient.js";
import { asArray } from "../utils/format.js";
import { mapSchedule } from "./mapers/scheduleMapper.js";
function validateSchedule(payload) {

    const errors = {};

    if (!payload.instanceId)
        errors.instanceId = "Select an instance";

   if (!payload.backupDate)
    errors.backupDate = "Select backup date";

if (!payload.backupTime)
    errors.backupTime = "Select backup time";
    if (!payload.storageType)
        errors.storageType =
            "Select backup location";

    return errors;

}

const scheduleService = {

    validate: validateSchedule,

    async list() {

    const response =
        await axiosClient.get(
            "/schedules"
        );

    return response.map(mapSchedule);

},

    async create(payload) {

    const errors =
        validateSchedule(payload);

    if (Object.keys(errors).length) {

        const e =
            new Error("Validation failed");

        e.fieldErrors = errors;

        throw e;

    }

    const today = new Date();

const date =
    today.toISOString().split("T")[0];

const request = {

    instanceId: Number(payload.instanceId),

    backupDateTime:
        payload.backupDateTime,

    backupLocation:
        payload.storageType,

    status:
        payload.status ?? "ACTIVE"

};

    console.log("Schedule Request =", request);

const response =
    await axiosClient.post(
        "/schedules",
        request
    );

},
    async update(scheduleId, payload) {

    const request = {

        instanceId:
            Number(payload.instanceId),

        backupDateTime:
            payload.backupDateTime,

        frequency:
            payload.frequency,

        backupLocation:
            payload.storageType,

        status:
            payload.status

    };

    const response =
        await axiosClient.put(

            `/schedules/${scheduleId}`,

            request

        );

    return mapSchedule(response);

},
    async remove(scheduleId) {

    await axiosClient.delete(

        `/schedules/${scheduleId}`

    );

    return {

        success: true

    };

},

};

export default scheduleService;
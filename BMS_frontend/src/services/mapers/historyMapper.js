export function mapHistory(history) {

    return {

        id: history.backupId,

        backupId: history.backupId,

        instanceId: history.instanceId,

        instanceName: history.instanceName || "Unknown",

        backupDate: history.backupDate,

        backupFile: history.backupFile,

        backupLocation: history.backupFile || "LOCAL",

        backupSize: history.backupSize,

        duration: history.duration,

        status: history.status,

        remarks: history.remarks,
        

        errorMessage: history.remarks,

        type: history.backupType || "MANUAL",

    };

}
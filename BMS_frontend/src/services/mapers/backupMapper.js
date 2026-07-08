export function mapBackup(response) {

    return {

        backupId:
            response.backupId,

        instanceId:
            response.instanceId,

        instanceName:
            response.instanceName,

        backupDate:
            response.backupDate,

        backupFile:
            response.backupFile,

        backupSize:
            response.backupSize,

        duration:
            response.duration,

        remarks:
            response.remarks,

        status:
            response.status,

        success:
            response.status === "SUCCESS"

    };

}
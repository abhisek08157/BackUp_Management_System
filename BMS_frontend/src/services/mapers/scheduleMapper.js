export function mapSchedule(schedule) {

    return {

        scheduleId: schedule.scheduleId,

        instanceId: schedule.instanceId,

        instanceName: schedule.instanceName,

        frequency: schedule.frequency,

        backupDateTime: schedule.backupDateTime,

        backupLocation: schedule.backupLocation,

        status: schedule.status

    };

}
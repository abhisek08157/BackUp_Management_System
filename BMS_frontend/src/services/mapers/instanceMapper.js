// src/services/mappers/instanceMapper.js

export function mapInstance(instance) {

    if (!instance) return null;

    return {

        // IDs
        id: instance.instanceId,
        instanceId: instance.instanceId,

        // Basic Details
        instanceName: instance.instanceName ?? "",
        databaseName: instance.databaseName ?? "",
        databaseType: instance.databaseType ?? "",

        // Connection Details
        ipAddress: instance.ipAddress ?? "",
        port: Number(instance.port ?? 0),

        dbUsername: instance.dbUsername ?? "",
        dbPassword: instance.dbPassword ?? "",

        // Status
        status: instance.status ?? "INACTIVE",

        // UI Compatibility
       createdAt:
instance.createdAt ?? null,

        usedInSchedule: instance.usedInSchedule ?? false

    };

}
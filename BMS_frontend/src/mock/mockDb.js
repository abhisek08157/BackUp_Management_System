// In-memory demo data store.
// This exists purely so the console runs standalone (npm run dev) before the
// real Spring/Node backend at http://localhost:8080 is wired up. Every
// service in src/services calls the REAL REST endpoints from the API spec;
// when DEMO_MODE is switched off (src/config.js) these mocks are never touched.

let idCounter = 100;
export const nextId = () => String(++idCounter);

const now = Date.now();
const hrs = (n) => new Date(now - n * 3600 * 1000).toISOString();
const future = (n) => new Date(now + n * 3600 * 1000).toISOString();

export const db = {
  instances: [
    { id: '1', instanceName: 'PRS-Ticketing-Primary', databaseType: 'ORACLE', databaseName: 'PRS_PROD', ipAddress: '10.12.4.11', port: 1521, dbUsername: 'prs_admin', status: 'ACTIVE', createdAt: hrs(720), usedInSchedule: true },
    { id: '2', instanceName: 'FOIS-Freight-DB', databaseType: 'MYSQL', databaseName: 'fois_freight', ipAddress: '10.12.4.22', port: 3306, dbUsername: 'fois_user', status: 'ACTIVE', createdAt: hrs(500), usedInSchedule: true },
    { id: '3', instanceName: 'IRCTC-Payments', databaseType: 'ORACLE', databaseName: 'IRCTC_PAY', ipAddress: '10.12.5.9', port: 1521, dbUsername: 'pay_svc', status: 'INACTIVE', createdAt: hrs(300), usedInSchedule: false },
    { id: '4', instanceName: 'Crew-Mgmt-DB', databaseType: 'MYSQL', databaseName: 'crew_mgmt', ipAddress: '10.12.6.4', port: 3306, dbUsername: 'crew_root', status: 'ACTIVE', createdAt: hrs(48), usedInSchedule: false },
    { id: '5', instanceName: 'NTES-Tracking', databaseType: 'MYSQL', databaseName: 'ntes_live', ipAddress: '10.12.7.2', port: 3306, dbUsername: 'ntes_svc', status: 'ACTIVE', createdAt: hrs(6), usedInSchedule: false }
  ],
  history: [
    { id: 'h1', instanceId: '1', instanceName: 'PRS-Ticketing-Primary', type: 'MANUAL', storageType: 'LOCAL', status: 'COMPLETED', startedAt: hrs(2), finishedAt: hrs(1.9), sizeMb: 4820, errorMessage: null },
    { id: 'h2', instanceId: '2', instanceName: 'FOIS-Freight-DB', type: 'SCHEDULED', storageType: 'GOOGLE_DRIVE', status: 'FAILED', startedAt: hrs(5), finishedAt: hrs(4.9), sizeMb: 0,
      errorMessage: 'java.sql.SQLException: Connection refused to 10.12.4.22:3306\n  at com.backup.connector.MySqlConnector.connect(MySqlConnector.java:88)\n  at com.backup.service.BackupRunner.run(BackupRunner.java:44)\nCaused by: java.net.ConnectException: Connection timed out after 30000ms' },
    { id: 'h3', instanceId: '1', instanceName: 'PRS-Ticketing-Primary', type: 'SCHEDULED', storageType: 'FILE_SERVER', status: 'COMPLETED', startedAt: hrs(26), finishedAt: hrs(25.8), sizeMb: 4790, errorMessage: null },
    { id: 'h4', instanceId: '3', instanceName: 'IRCTC-Payments', type: 'MANUAL', storageType: 'LOCAL', status: 'FAILED', startedAt: hrs(30), finishedAt: hrs(29.95), sizeMb: 0,
      errorMessage: 'ORA-01017: invalid username/password; logon denied\n  at com.backup.connector.OracleConnector.authenticate(OracleConnector.java:61)' },
    { id: 'h5', instanceId: '4', instanceName: 'Crew-Mgmt-DB', type: 'MANUAL', storageType: 'ONE_DRIVE', status: 'ONGOING', startedAt: hrs(0.05), finishedAt: null, sizeMb: 0, errorMessage: null },
    { id: 'h6', instanceId: '2', instanceName: 'FOIS-Freight-DB', type: 'SCHEDULED', storageType: 'LOCAL', status: 'UPCOMING', startedAt: future(4), finishedAt: null, sizeMb: 0, errorMessage: null }
  ],
  schedules: [
    { id: 's1', instanceId: '1', instanceName: 'PRS-Ticketing-Primary', frequency: 'DAILY', time: '02:00', storageType: 'FILE_SERVER', status: 'ACTIVE', createdAt: hrs(700) },
    { id: 's2', instanceId: '2', instanceName: 'FOIS-Freight-DB', frequency: 'WEEKLY', time: '03:30', storageType: 'GOOGLE_DRIVE', status: 'ACTIVE', createdAt: hrs(480) }
  ]
};

export const clone = (v) => JSON.parse(JSON.stringify(v));

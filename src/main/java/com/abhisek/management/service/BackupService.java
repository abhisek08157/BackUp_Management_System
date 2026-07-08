package com.abhisek.management.service;

import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.abhisek.management.entity.BackupHistory;
import com.abhisek.management.entity.Instance;
import com.abhisek.management.repository.BackupHistoryRepository;
import com.abhisek.management.repository.InstanceRepository;

@Service
public class BackupService {

    @Autowired
    private InstanceRepository instanceRepository;

    @Autowired
    private BackupHistoryRepository backupHistoryRepository;
    @Autowired
    private GoogleDriveService googleDriveService;

    // ============================================
    // DOWNLOAD BACKUP
    // ============================================

    public File downloadBackup(Integer backupId) {

        BackupHistory history = backupHistoryRepository
                .findById(backupId)
                .orElseThrow(() ->
                        new RuntimeException("Backup not found"));

        return new File(history.getBackupFile());
    }

    // ============================================
    // RUN BACKUP
    // ============================================

    public String runBackup(Integer instanceId,
            String storageType,
            String backupType) {

        try {

            if (storageType == null || storageType.isBlank()) {
                storageType = "LOCAL";
            }

            Instance instance =
                    instanceRepository.findById(instanceId)
                            .orElseThrow(() ->
                                    new RuntimeException("Instance not found"));

            //----------------------------------------
            // Backup Location
            //----------------------------------------

            String backupFolder;

            switch (storageType.toUpperCase()) {

                case "LOCAL":

                    backupFolder = "C:\\RailwayBackups";
                    break;

                case "FILE_SERVER":

                    backupFolder = "\\\\192.168.29.100\\RailwayBackup";
                    break;

                case "GOOGLE_DRIVE":

                    // Backup locally first
                    backupFolder = "C:\\RailwayBackups";
                    break;

                default:

                    backupFolder = "C:\\RailwayBackups";
            }

            File folder = new File(backupFolder);

            if (!folder.exists()) {
                folder.mkdirs();
            }

            //----------------------------------------
            // File Extension
            //----------------------------------------

            String extension;

            if ("ORACLE".equalsIgnoreCase(instance.getDatabaseType())) {

                extension = ".dmp";

            } else {

                extension = ".sql";
            }

            String fileName =
                    instance.getDatabaseName()
                            + "_"
                            + System.currentTimeMillis()
                            + extension;

            String backupPath =
                    backupFolder
                            + File.separator
                            + fileName;

            //----------------------------------------
            // Process Builder
            //----------------------------------------

            ProcessBuilder pb;

            if ("MYSQL".equalsIgnoreCase(instance.getDatabaseType())) {

                pb = new ProcessBuilder(

                        "mysqldump",

                        "--no-tablespaces",

                        "-h",
                        instance.getIpAddress(),

                        "-P",
                        instance.getPort().toString(),

                        "-u" + instance.getDbUsername(),

                        "-p" + instance.getDbPassword(),

                        instance.getDatabaseName(),

                        "-r",
                        backupPath

                );

            } else if ("ORACLE".equalsIgnoreCase(instance.getDatabaseType())) {

                throw new RuntimeException(
                        "Oracle backup is supported. Install Oracle Client (expdp) to enable backup."
                );

            } else {

                throw new RuntimeException("Unsupported Database Type");
            }

            //----------------------------------------
            // Debug
            //----------------------------------------

            System.out.println("====================================");
            System.out.println("Starting Backup...");
            System.out.println("Database Type : " + instance.getDatabaseType());
            System.out.println("Storage Type  : " + storageType);
            System.out.println("Host          : " + instance.getIpAddress());
            System.out.println("Port          : " + instance.getPort());
            System.out.println("Database      : " + instance.getDatabaseName());
            System.out.println("User          : " + instance.getDbUsername());
            System.out.println("Save File     : " + backupPath);
            System.out.println("====================================");

            long startTime = System.currentTimeMillis();

            Process process = pb.start();

            BufferedReader errorReader =
                    new BufferedReader(
                            new InputStreamReader(
                                    process.getErrorStream()));

            String line;

            while ((line = errorReader.readLine()) != null) {

                System.out.println(line);

            }

            int result = process.waitFor();

            long endTime = System.currentTimeMillis();

            //----------------------------------------
            // Backup History
            //----------------------------------------

            BackupHistory history = new BackupHistory();

            history.setInstance(instance);
            history.setBackupType(
                    backupType == null ? "MANUAL" : backupType
            );

            history.setBackupDate(LocalDateTime.now());

            history.setBackupFile(backupPath);

            File backupFile = new File(backupPath);

            if (backupFile.exists()) {

                history.setBackupSize(
                        (backupFile.length() / 1024)
                                + " KB");

            } else {

                history.setBackupSize("0 KB");
            }

            history.setDuration(
                    (endTime - startTime)
                            + " ms");

            if (result == 0 || backupFile.exists()) {

                history.setStatus("SUCCESS");

                history.setRemarks(
                        "Backup completed successfully");

            } else {

                history.setStatus("FAILED");

                history.setRemarks(
                        "Backup failed");
            }

            backupHistoryRepository.save(history);
            if ("GOOGLE_DRIVE".equalsIgnoreCase(storageType)
                    && "SUCCESS".equals(history.getStatus())) {

            	System.out.println("Uploading to Google Drive...");

            	String driveLink =
            	        googleDriveService.uploadFile(new File(backupPath));

            	System.out.println("Uploaded Successfully");
            	System.out.println("Drive Link: " + driveLink);

            	history.setBackupFile(driveLink);

            	backupHistoryRepository.save(history);
            }

            return history.getStatus();

        }

        catch (Exception e) {

            e.printStackTrace();

            return "FAILED : " + e.getMessage();

        }
        

    }

    public String runBackup(Integer instanceId) {

        return runBackup(instanceId, "LOCAL", "MANUAL");

    }

}
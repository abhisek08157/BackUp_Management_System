package com.abhisek.management.service;

import java.io.File;
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

    // ==========================
    // DOWNLOAD BACKUP
    // ==========================
    public File downloadBackup(Integer backupId) {

        BackupHistory history = backupHistoryRepository
                .findById(backupId)
                .orElseThrow(() ->
                        new RuntimeException("Backup not found"));

        return new File(history.getBackupFile());
    }

    // ==========================
    // RUN BACKUP
    // ==========================
    public String runBackup(Integer instanceId) {

        try {

            Instance instance = instanceRepository.findById(instanceId)
                    .orElseThrow(() ->
                            new RuntimeException("Instance not found"));

            //-----------------------------------------------------
            // Create Backup Folder
            //-----------------------------------------------------

            String backupFolder = "C:\\RailwayBackups";

            File folder = new File(backupFolder);

            if (!folder.exists()) {
                folder.mkdirs();
            }

            //-----------------------------------------------------
            // Backup File Name
            //-----------------------------------------------------

            String fileName =
                    instance.getDatabaseName()
                            + "_"
                            + System.currentTimeMillis()
                            + ".sql";

            String backupPath =
                    backupFolder + File.separator + fileName;

            //-----------------------------------------------------
            // Create mysqldump Command
            //-----------------------------------------------------

            ProcessBuilder pb = new ProcessBuilder(

                    "mysqldump",

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

            //-----------------------------------------------------
            // Print Debug Information
            //-----------------------------------------------------

            System.out.println("====================================");
            System.out.println("Starting Backup...");
            System.out.println("Host      : " + instance.getIpAddress());
            System.out.println("Port      : " + instance.getPort());
            System.out.println("Database  : " + instance.getDatabaseName());
            System.out.println("User      : " + instance.getDbUsername());
            System.out.println("Save File : " + backupPath);
            System.out.println("====================================");

            long startTime = System.currentTimeMillis();

            Process process = pb.start();

            int result = process.waitFor();

            long endTime = System.currentTimeMillis();

            //-----------------------------------------------------
            // Save Backup History
            //-----------------------------------------------------

            BackupHistory history = new BackupHistory();

            history.setInstance(instance);
            history.setBackupDate(LocalDateTime.now());
            history.setBackupFile(backupPath);

            File backupFile = new File(backupPath);

            if (backupFile.exists()) {
                history.setBackupSize((backupFile.length() / 1024) + " KB");
            } else {
                history.setBackupSize("0 KB");
            }

            history.setDuration((endTime - startTime) + " ms");

            if (result == 0) {

                history.setStatus("SUCCESS");
                history.setRemarks("Backup completed successfully");

            } else {

                history.setStatus("FAILED");
                history.setRemarks("mysqldump failed");

            }

            backupHistoryRepository.save(history);

            return history.getStatus();

        }

        catch (Exception e) {

            e.printStackTrace();

            BackupHistory history = new BackupHistory();

            history.setBackupDate(LocalDateTime.now());
            history.setStatus("FAILED");
            history.setRemarks(e.getMessage());

            backupHistoryRepository.save(history);

            return "FAILED : " + e.getMessage();

        }

    }

}
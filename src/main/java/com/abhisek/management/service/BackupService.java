package com.abhisek.management.service;

import java.io.File;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.abhisek.management.entity.BackupHistory;
import com.abhisek.management.entity.Instance;
import com.abhisek.management.repository.BackupHistoryRepository;
import com.abhisek.management.repository.InstanceRepository;
import java.nio.file.Files;
import java.nio.file.Path;
@Service
public class BackupService {

    @Autowired
    private InstanceRepository instanceRepository;

    @Autowired
    private BackupHistoryRepository backupHistoryRepository;
    public File downloadBackup(Integer backupId) {

        BackupHistory history =
                backupHistoryRepository.findById(backupId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Backup not found"));

        return new File(history.getBackupFile());
    }

    @SuppressWarnings("deprecation")
	public String runBackup(Integer instanceId) {

        try {

            Instance instance =
                    instanceRepository.findById(instanceId)
                            .orElseThrow(() ->
                                    new RuntimeException("Instance not found"));

            String backupFolder = "C:\\RailwayBackups";

            File folder = new File(backupFolder);

            if (!folder.exists()) {
                folder.mkdirs();
            }

            String fileName =
                    instance.getDatabaseName()
                    + "_"
                    + System.currentTimeMillis()
                    + ".sql";

            String backupPath =
                    backupFolder + "\\" + fileName;

            String command =
                    "mysqldump -u"
                    + instance.getDbUsername()
                    + " -p"
                    + instance.getDbPassword()
                    + " "
                    + instance.getDatabaseName()
                    + " -r "
                    + backupPath;

            long startTime = System.currentTimeMillis();

            Process process =
                    Runtime.getRuntime().exec(command);

            int result = process.waitFor();

            long endTime = System.currentTimeMillis();

            BackupHistory history = new BackupHistory();

            history.setInstance(instance);
            history.setBackupDate(LocalDateTime.now());
            history.setBackupFile(backupPath);

            File backupFile = new File(backupPath);

            history.setBackupSize(
                    (backupFile.length() / 1024) + " KB");

            history.setDuration(
                    (endTime - startTime) + " ms");

            if (result == 0) {

                history.setStatus("SUCCESS");
                history.setRemarks("Backup completed");

            } else {

                history.setStatus("FAILED");
                history.setRemarks("mysqldump failed");
            }

            backupHistoryRepository.save(history);

            return history.getStatus();

        } catch (Exception e) {

            e.printStackTrace();

            return "FAILED : " + e.getMessage();
        }
    }
}
package com.abhisek.management.scheduler;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.abhisek.management.entity.BackupSchedule;
import com.abhisek.management.repository.BackupScheduleRepository;
import com.abhisek.management.service.BackupService;

@Component
public class BackupScheduler {

    @Autowired
    private BackupScheduleRepository scheduleRepository;

    @Autowired
    private BackupService backupService;

    @Scheduled(fixedRate = 60000)
    public void executeScheduledBackups() {

        List<BackupSchedule> schedules =
                scheduleRepository.findAll();

        LocalDateTime now = LocalDateTime.now();

        for (BackupSchedule schedule : schedules) {

            if ("ACTIVE".equalsIgnoreCase(
                    schedule.getStatus())) {

                LocalDateTime backupTime =
                        schedule.getBackupDateTime();

                if (backupTime != null &&
                	    backupTime.getYear() == now.getYear() &&
                	    backupTime.getMonthValue() == now.getMonthValue() &&
                	    backupTime.getDayOfMonth() == now.getDayOfMonth() &&
                	    backupTime.getHour() == now.getHour() &&
                	    backupTime.getMinute() == now.getMinute()) {

                	backupService.runBackup(

                	        schedule.getInstance().getInstanceId(),

                	        schedule.getBackupLocation(),

                	        "SCHEDULED"

                	);
                	    schedule.setStatus("COMPLETED");
                	    scheduleRepository.save(schedule);

                	    System.out.println(
                	            "Scheduled Backup Executed");
                	}
                }
            }
        }
    }

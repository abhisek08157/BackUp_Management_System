package com.abhisek.management;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class BackupMonitoringSystemApplication {

    public static void main(String[] args) {
        SpringApplication.run(
                BackupMonitoringSystemApplication.class,
                args);
    }
}
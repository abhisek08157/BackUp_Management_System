package com.abhisek.management.scheduler;

import java.sql.Connection;
import java.sql.DriverManager;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.abhisek.management.entity.Instance;
import com.abhisek.management.repository.InstanceRepository;

@Component
public class InstanceHealthScheduler {

    @Autowired
    private InstanceRepository instanceRepository;

    @Scheduled(fixedRate = 60000) // every 1 minute
    public void checkAllInstances() {

        List<Instance> instances = instanceRepository.findAll();

        for (Instance instance : instances) {

            String status = getDatabaseStatus(instance);

            if (!status.equals(instance.getStatus())) {

                instance.setStatus(status);

                instanceRepository.save(instance);

            }
        }

        System.out.println("Instance health check completed.");
    }

    private String getDatabaseStatus(Instance instance) {

        try {

            String url;

            if ("MYSQL".equalsIgnoreCase(instance.getDatabaseType())) {

                url =
                        "jdbc:mysql://"
                        + instance.getIpAddress()
                        + ":"
                        + instance.getPort()
                        + "/"
                        + instance.getDatabaseName()
                        + "?useSSL=false"
                        + "&allowPublicKeyRetrieval=true"
                        + "&serverTimezone=UTC"
                        + "&connectTimeout=5000"
                        + "&socketTimeout=5000";

            } else {

                url =
                        "jdbc:oracle:thin:@//"
                        + instance.getIpAddress()
                        + ":"
                        + instance.getPort()
                        + "/"
                        + instance.getDatabaseName();

            }

            try (Connection connection =
                    DriverManager.getConnection(
                            url,
                            instance.getDbUsername(),
                            instance.getDbPassword())) {

                return "ACTIVE";

            }

        } catch (Exception e) {

            return "INACTIVE";

        }

    }
}
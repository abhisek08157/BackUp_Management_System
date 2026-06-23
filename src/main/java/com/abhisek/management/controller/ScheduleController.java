package com.abhisek.management.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.abhisek.management.entity.BackupSchedule;
import com.abhisek.management.service.ScheduleService;

@RestController
@RequestMapping("/api/schedules")
@CrossOrigin("*")
public class ScheduleController {

    @Autowired
    private ScheduleService scheduleService;

    @PostMapping
    public BackupSchedule createSchedule(
            @RequestBody BackupSchedule schedule) {

        return scheduleService.saveSchedule(schedule);
    }

    @GetMapping
    public List<BackupSchedule> getAllSchedules() {

        return scheduleService.getAllSchedules();
    }

    @GetMapping("/{id}")
    public BackupSchedule getScheduleById(
            @PathVariable Integer id) {

        return scheduleService.getScheduleById(id);
    }

    @DeleteMapping("/{id}")
    public String deleteSchedule(
            @PathVariable Integer id) {

        scheduleService.deleteSchedule(id);

        return "Schedule Deleted Successfully";
    }
}
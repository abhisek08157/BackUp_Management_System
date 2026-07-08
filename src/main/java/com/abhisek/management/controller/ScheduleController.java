package com.abhisek.management.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.abhisek.management.dto.ScheduleRequest;
import com.abhisek.management.dto.ScheduleResponse;
import com.abhisek.management.service.ScheduleService;

@RestController
@RequestMapping("/api/schedules")
@CrossOrigin("*")
public class ScheduleController {

    @Autowired
    private ScheduleService scheduleService;

    @PostMapping
    public ScheduleResponse createSchedule(
            @RequestBody ScheduleRequest request) {

        return scheduleService.saveSchedule(request);
    }

    @GetMapping
    public List<ScheduleResponse> getAllSchedules() {

        return scheduleService.getAllSchedules();
    }

    @GetMapping("/{id}")
    public ScheduleResponse getScheduleById(
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
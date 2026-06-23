package com.abhisek.management.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.abhisek.management.dto.HistoryResponse;
import com.abhisek.management.service.HistoryService;

@RestController
@RequestMapping("/api/history")
public class HistoryController {

    private final HistoryService historyService;

    public HistoryController(HistoryService historyService) {
        this.historyService = historyService;
    }

    @GetMapping
    public ResponseEntity<List<HistoryResponse>> getAllHistory() {
        return ResponseEntity.ok(historyService.getAllHistory());
    }

    @GetMapping("/{id}")
    public ResponseEntity<HistoryResponse> getHistoryById(@PathVariable Integer id) {
        return ResponseEntity.ok(historyService.getHistoryById(id));
    }

    @GetMapping("/instance/{instanceId}")
    public ResponseEntity<List<HistoryResponse>> getHistoryByInstanceId(
            @PathVariable Integer instanceId) {
        return ResponseEntity.ok(historyService.getHistoryByInstanceId(instanceId));
    }
}
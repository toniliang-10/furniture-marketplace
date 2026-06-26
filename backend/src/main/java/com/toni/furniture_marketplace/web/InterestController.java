package com.toni.furniture_marketplace.web;

import com.toni.furniture_marketplace.dto.InterestRequest;
import com.toni.furniture_marketplace.model.Interest;
import com.toni.furniture_marketplace.service.InterestService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/furniture")
public class InterestController {

    private final InterestService interestService;

    public InterestController(InterestService interestService) {
        this.interestService = interestService;
    }

    @PostMapping("/{id}/interest")
    @ResponseStatus(HttpStatus.CREATED)
    public Interest express(@PathVariable Long id, @RequestBody InterestRequest request) {
        return interestService.expressInterest(id, request);
    }
}

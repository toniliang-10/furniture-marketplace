package com.toni.furniture_marketplace.web;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
public class HelloController {
    
    @GetMapping("/hello")
    public String hello(){
        return "Furniture marketplace is up";
    }
}

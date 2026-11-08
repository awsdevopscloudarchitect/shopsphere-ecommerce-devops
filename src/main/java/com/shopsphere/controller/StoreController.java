package com.shopsphere.controller;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
@Controller
public class StoreController {
  @GetMapping("/") public String home() { return "index"; }
}

package com.dlink.controller;

import com.dlink.common.result.Result;
import com.dlink.service.MenuService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

/**
 * MenuController
 *
 * @author cl1226
 * @since 2023/6/13 13:15
 **/
@RestController
@RequestMapping("/api/menu")
public class MenuController {

    @Autowired
    private MenuService menuService;

    @GetMapping("/listByType")
    public Result listByCode(@RequestParam String type) {
        Result result = menuService.list(type);
        return result;
    }

}

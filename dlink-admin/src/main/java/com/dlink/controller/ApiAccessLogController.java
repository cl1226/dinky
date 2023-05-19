package com.dlink.controller;

import com.dlink.common.result.Result;
import com.dlink.model.ApiAccessLog;
import com.dlink.service.ApiAccessLogService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * ApiAccessLogController
 *
 * @author cl1226
 * @since 2023/5/19 17:28
 **/
@Slf4j
@RestController
@RequestMapping("/api/accesslog/summary")
public class ApiAccessLogController {

    @Override
    private ApiAccessLogService accessLogService;

    @GetMapping
    public Result getAll() {
        List<ApiAccessLog> list = accessLogService.list();
        return Result.succeed(list, "获取成功");
    }



}

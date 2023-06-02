package com.dlink.controller;

import cn.hutool.json.JSONArray;
import cn.hutool.json.JSONObject;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.dlink.common.result.Result;
import com.dlink.dto.SearchCondition;
import com.dlink.model.ApiAccessLog;
import com.dlink.service.ApiAccessLogService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.text.ParseException;
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

    @Autowired
    private ApiAccessLogService accessLogService;

    @GetMapping("/all")
    public Result getAll() {
        List<ApiAccessLog> list = accessLogService.list();
        return Result.succeed(list, "获取成功");
    }

    @PostMapping("/detail/page")
    public Result search(@RequestBody SearchCondition condition) {
        try {
            Page<ApiAccessLog> search = accessLogService.search(condition);
            return Result.succeed(search, "获取成功");
        } catch (ParseException e) {
            e.printStackTrace();
        }
        return Result.failed("获取失败");
    }

    @GetMapping
    public Result summary() {
        JSONObject summary = accessLogService.summary();
        return Result.succeed(summary, "获取成功");
    }

    @GetMapping("/countByDay")
    public Result countByDay(@RequestParam String beginDate, @RequestParam String endDate) {
        JSONArray array = accessLogService.countByDay(beginDate, endDate);
        return Result.succeed(array, "获取成功");
    }

    @RequestMapping("/top5api")
    public Result top5api(@RequestParam String beginDate, @RequestParam String endDate){
        try {
            List<JSONObject> jsonObjects = accessLogService.top5api(beginDate, endDate);
            return Result.succeed(jsonObjects, "获取成功");
        } catch (ParseException e) {
            e.printStackTrace();
        }
        return Result.failed("获取失败");
    }

    @RequestMapping("/top5app")
    public Result top5app(@RequestParam String beginDate, @RequestParam String endDate){
        try {
            List<JSONObject> jsonObjects = accessLogService.top5app(beginDate, endDate);
            return Result.succeed(jsonObjects, "获取成功");
        } catch (ParseException e) {
            e.printStackTrace();
        }
        return Result.failed("获取失败");
    }

    @RequestMapping("/topNIP")
    public Result topNIP(@RequestParam String beginDate, @RequestParam String endDate){
        try {
            List<JSONObject> jsonObjects = accessLogService.topNIP(beginDate, endDate);
            return Result.succeed(jsonObjects, "获取成功");
        } catch (ParseException e) {
            e.printStackTrace();
        }
        return Result.failed("获取失败");
    }

    @RequestMapping("/top5duration")
    public Result top5duration(@RequestParam String beginDate, @RequestParam String endDate){
        try {
            List<JSONObject> jsonObjects = accessLogService.top5duration(beginDate, endDate);
            return Result.succeed(jsonObjects, "获取成功");
        } catch (ParseException e) {
            e.printStackTrace();
        }
        return Result.failed("获取失败");
    }

    @RequestMapping("/successRatio")
    public Result successRatio(@RequestParam String beginDate, @RequestParam String endDate){
        try {
            JSONObject jsonObject = accessLogService.successRatio(beginDate, endDate);
            return Result.succeed(jsonObject, "获取成功");
        } catch (ParseException e) {
            e.printStackTrace();
        }
        return Result.failed("获取失败");
    }



}

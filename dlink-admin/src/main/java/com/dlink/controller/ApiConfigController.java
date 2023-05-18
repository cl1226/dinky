package com.dlink.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.dlink.common.result.Result;
import com.dlink.dto.DebugDTO;
import com.dlink.dto.SearchCondition;
import com.dlink.model.ApiConfig;
import com.dlink.service.ApiConfigService;
import lombok.extern.slf4j.Slf4j;
import org.codehaus.jackson.JsonNode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;

/**
 * DataApiController
 *
 * @author cl1226
 * @since 2023/5/17 14:19
 **/
@Slf4j
@RestController
@RequestMapping("/api/dataservice/config")
public class ApiConfigController {

    @Autowired
    private ApiConfigService service;

    @PostMapping("/page")
    public Result page(@RequestBody SearchCondition searchCondition) throws Exception {
        Page<ApiConfig> page = service.page(searchCondition);
        return Result.succeed(page, "获取成功");
    }

    @PutMapping
    public Result saveOrUpdate(@RequestBody ApiConfig apiConfig) {
        try {
            service.saveOrUpdate(apiConfig);
            return Result.succeed(apiConfig, "创建成功");
        } catch (Exception e) {
            e.printStackTrace();
            return Result.failed("创建失败");
        }
    }

    @DeleteMapping
    public Result delete(@RequestBody SearchCondition searchCondition) {
        try {
            service.removeBatchByIds(searchCondition.getIds());
            return Result.succeed(searchCondition.getIds(), "删除成功");
        } catch (Exception e) {
            e.printStackTrace();
            return Result.failed("删失败");
        }
    }

    @GetMapping("/online")
    public Result online(@RequestParam Integer id) {
        ApiConfig apiConfig = service.online(id);
        if (apiConfig == null) {
            return Result.failed("上线失败");
        } else {
            return Result.succeed(apiConfig, "上线成功");
        }
    }

    @GetMapping("/offline")
    public Result offline(@RequestParam Integer id) {
        ApiConfig apiConfig = service.offline(id);
        if (apiConfig == null) {
            return Result.failed("下线失败");
        } else {
            return Result.succeed(apiConfig, "下线成功");
        }
    }

    @PostMapping("/executeSql")
    public Result executeSql(@RequestBody DebugDTO debugDTO) {
        Result result = service.executeSql(debugDTO);
        return result;
    }

}

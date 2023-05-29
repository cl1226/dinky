package com.dlink.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.dlink.common.result.Result;
import com.dlink.dto.SearchCondition;
import com.dlink.model.ApiConfig;
import com.dlink.model.AppConfig;
import com.dlink.service.AppConfigService;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

/**
 * AppConfigController
 *
 * @author cl1226
 * @since 2023/5/18 16:42
 **/
@Slf4j
@RestController
@RequestMapping("/api/app/config")
public class AppConfigController {

    @Autowired
    private AppConfigService appConfigService;

    @PostMapping("/page")
    public Result page(@RequestBody SearchCondition searchCondition) throws Exception {
        Page<AppConfig> page = appConfigService.page(searchCondition);
        return Result.succeed(page, "获取成功");
    }

    @GetMapping("/detail")
    public Result getDetailById(@RequestParam Integer id) {
        AppConfig appConfig = appConfigService.getDetailById(id);
        if (appConfig != null) {
            return Result.succeed(appConfig, "获取成功");
        }
        return Result.failed(null, "获取失败");
    }

    @PostMapping("/apiConfig/search")
    public Result searchApiConfigByCondition(@RequestBody SearchCondition condition) {
        Page<ApiConfig> apiConfigs = appConfigService.searchApiConfigByCondition(condition);
        if (apiConfigs != null) {
            return Result.succeed(apiConfigs, "获取成功");
        }
        return Result.failed(null, "获取失败");
    }

    @PutMapping
    public Result saveOrUpdate(@RequestBody AppConfig appConfig) {
        try {
            appConfigService.add(appConfig);
            return Result.succeed(appConfig, appConfig.getId() != null ? "编辑成功" : "创建成功");
        } catch (Exception e) {
            e.printStackTrace();
            return Result.failed(appConfig.getId() != null ? "编辑失败" : "创建失败");
        }
    }

    @DeleteMapping
    public Result delete(@RequestBody SearchCondition searchCondition) {
        try {
            appConfigService.removeBatchByIds(searchCondition.getIds());
            return Result.succeed(searchCondition.getIds(), "删除成功");
        } catch (Exception e) {
            e.printStackTrace();
            return Result.failed("删失败");
        }
    }

    @GetMapping("/generate/token")
    public Result generateToken() {
        return Result.succeed(RandomStringUtils.random(32, true, true), "生成成功");
    }

}

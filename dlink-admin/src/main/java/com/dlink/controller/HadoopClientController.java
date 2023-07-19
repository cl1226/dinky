package com.dlink.controller;

import com.dlink.common.result.Result;
import com.dlink.dto.SearchCondition;
import com.dlink.model.HadoopClient;
import com.dlink.service.HadoopClientService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

/**
 * EnvironmentController
 *
 * @author cl1226
 * @since 2023/7/3 8:44
 **/
@Slf4j
@RestController
@RequestMapping("/api/environment/instance")
public class HadoopClientController {

    @Autowired
    private HadoopClientService hadoopClientService;

    @PostMapping("page")
    public Result page(@RequestBody SearchCondition searchCondition) {
        return Result.succeed(hadoopClientService.page(searchCondition), "获取成功");
    }

    @PutMapping
    public Result create(@RequestBody HadoopClient instance) {
        Result result = hadoopClientService.create(instance);
        return result;
    }

    @DeleteMapping
    public Result remove(@RequestParam Integer id) {
        boolean b = hadoopClientService.removeById(id);
        if (b) {
            return Result.succeed("删除成功");
        }
        return Result.failed("删除失败");
    }

    @PostMapping("testConnect")
    public Result test(@RequestBody HadoopClient instance) {
        Result result = hadoopClientService.testConnect(instance);
        return result;
    }

}

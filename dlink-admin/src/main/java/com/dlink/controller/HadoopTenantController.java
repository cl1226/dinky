package com.dlink.controller;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.dlink.common.result.Result;
import com.dlink.model.HadoopClusterModel;
import com.dlink.model.HadoopTenant;
import com.dlink.service.HadoopTenantService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * HadoopTenantController
 *
 * @author cl1226
 * @since 2023/7/12 13:36
 **/
@Slf4j
@RestController
@RequestMapping("/api/hadoop/tenant")
public class HadoopTenantController {

    @Autowired
    private HadoopTenantService hadoopTenantService;

    @GetMapping
    public Result list(@RequestParam Integer clusterId) {
        List<HadoopTenant> list = hadoopTenantService.list(Wrappers.<HadoopTenant>lambdaQuery().eq(HadoopTenant::getClusterId, clusterId));
        return Result.succeed(list, "获取成功");
    }

    @DeleteMapping
    public Result delete(@RequestParam Integer id) {
        hadoopTenantService.removeById(id);
        return Result.succeed("删除成功");
    }

    @PutMapping
    public Result create(@RequestBody HadoopTenant model) {
        return hadoopTenantService.saveOrUpdateModel(model);
    }
}

package com.dlink.controller;

import com.dlink.common.result.Result;
import com.dlink.model.HadoopCluster;
import com.dlink.model.HadoopClusterModel;
import com.dlink.service.HadoopClusterService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * HadoopClusterController
 *
 * @author cl1226
 * @since 2023/6/28 10:40
 **/
@Slf4j
@RestController
@RequestMapping("/api/hadoop/cluster")
public class HadoopClusterController {

    @Autowired
    private HadoopClusterService hadoopClusterService;

    @GetMapping
    public Result listAll() {
        List<HadoopCluster> list = hadoopClusterService.list();
        return Result.succeed(list, "获取成功");
    }

    @GetMapping("detail")
    public Result detail(@RequestParam Integer id) {
        HadoopCluster hadoopCluster = hadoopClusterService.getById(id);
        return Result.succeed(hadoopCluster, "获取成功");
    }

    @DeleteMapping
    public Result delete(@RequestParam Integer id) {
        hadoopClusterService.removeById(id);
        return Result.succeed("删除成功");
    }

    @PostMapping("load")
    public Result load(@RequestBody HadoopClusterModel model) {
        Result res = hadoopClusterService.load(model);
        return res;
    }

    @PutMapping
    public Result create(@RequestBody HadoopClusterModel model) {
        return hadoopClusterService.save(model);
    }

}

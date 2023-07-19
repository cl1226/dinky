package com.dlink.controller;

import cn.hutool.core.lang.UUID;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.dlink.common.result.Result;
import com.dlink.model.HadoopCluster;
import com.dlink.model.HadoopClusterModel;
import com.dlink.model.YarnQueue;
import com.dlink.service.HadoopClusterService;
import com.dlink.service.YarnQueueService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
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
    @Autowired
    private YarnQueueService yarnQueueService;

    @GetMapping
    public Result listAll() {
        List<HadoopClusterModel> list =  hadoopClusterService.listAll();
        return Result.succeed(list, "获取成功");
    }

    @GetMapping("detail")
    public Result detail(@RequestParam Integer id) {
        return hadoopClusterService.detail(id);
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
    @GetMapping("/getUuid")
    public Result getUuid() {
        return Result.succeed(UUID.fastUUID().toString(), "获取成功");
    }

    @PutMapping
    public Result create(@RequestBody HadoopClusterModel model) {
        return hadoopClusterService.save(model);
    }

    @PostMapping("/upload")
    public Result upload(@RequestParam("files") MultipartFile file, @RequestParam("uuid") String uuid) {
        String path = "/hadoop/" + uuid + "/keytab";
        Result res = hadoopClusterService.upload(file, path);
        return res;
    }

    @PostMapping("/uploadXml")
    public Result uploadXml(@RequestParam("files") MultipartFile[] files, @RequestParam("uuid") String uuid) {
        List<Result> res = new ArrayList<>();
        for (MultipartFile file : files) {
            String path = "/hadoop/" + uuid + "/xml";
            Result upload = hadoopClusterService.upload(file, path);
            res.add(upload);
        }
        return Result.succeed(res, "上传成功");
    }

    @GetMapping("/getQueuesByClusterId")
    public Result getQueuesByClusterId(@RequestParam Integer clusterId) {
        List<YarnQueue> list = yarnQueueService.list(Wrappers.<YarnQueue>lambdaQuery().eq(YarnQueue::getClusterId, clusterId));
        return Result.succeed(list, "获取成功");
    }

}

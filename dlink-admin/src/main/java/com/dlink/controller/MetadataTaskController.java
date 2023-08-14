package com.dlink.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.dlink.common.result.Result;
import com.dlink.dto.SearchCondition;
import com.dlink.model.DataBase;
import com.dlink.model.MetadataTask;
import com.dlink.model.MetadataTaskInstance;
import com.dlink.service.MetadataCatalogueService;
import com.dlink.service.DataBaseService;
import com.dlink.service.MetadataTaskInstanceService;
import com.dlink.service.MetadataTaskService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * MetadataTaskController
 *
 * @author cl1226
 * @since 2023/6/9 13:40
 **/
@Slf4j
@RestController
@RequestMapping("/api/metadata/task")
public class MetadataTaskController {

    @Autowired
    private MetadataTaskService metadataTaskService;
    @Autowired
    private MetadataCatalogueService metadataCatalogueService;
    @Autowired
    private MetadataTaskInstanceService metadataTaskInstanceService;
    @Autowired
    private DataBaseService dataBaseService;

    /**
     * 新增或者更新
     */
    @PutMapping
    public Result saveOrUpdate(@RequestBody MetadataTask metadataTask) throws Exception {
        try {
            if (metadataTask.getId() == null) {
                metadataTask.setStatus(0);
            }
            DataBase dataBase = dataBaseService.getById(metadataTask.getDatasourceId());
            metadataTask.setDatasourceName(dataBase.getName());
            List<String> paths = metadataCatalogueService.listAbsolutePathById(metadataTask.getCatalogueId());
            metadataTask.setPath("/" + paths.stream().map(String::valueOf).collect(Collectors.joining("/")));
            if (metadataTask.getScheduleType().equals("SINGLE")) {
                metadataTask.setCronExpression("");
            }
            metadataTaskService.saveOrUpdate(metadataTask);
            return Result.succeed(metadataTask, "创建成功");
        } catch (Exception e) {
            e.printStackTrace();
            return Result.failed("创建失败");
        }
    }

    @GetMapping(value = "/detail")
    public Result detail(@RequestParam Integer id) {
        MetadataTask metadataTask = metadataTaskService.getById(id);
        return Result.succeed(metadataTask, "获取成功");
    }

    /**
     * page
     */
    @PostMapping(value = "/page")
    public Result page(@RequestBody SearchCondition searchCondition) throws Exception {
        try {
            Page<MetadataTask> page = metadataTaskService.page(searchCondition);
            return Result.succeed(page, "查询成功");
        } catch (Exception e) {
            e.printStackTrace();
            return Result.failed("查询失败");
        }
    }

    @DeleteMapping
    public Result delete(@RequestBody SearchCondition searchCondition) {
        try {
            metadataTaskService.removeBatchByIds(searchCondition.getIds());
            return Result.succeed(searchCondition.getIds(), "删除成功");
        } catch (Exception e) {
            e.printStackTrace();
            return Result.failed("删除失败");
        }
    }

    @PutMapping(value = "/online")
    public Result online(@RequestParam Integer id) {
        Result result = metadataTaskService.online(id);
        return result;
    }

    @PutMapping(value = "/offline")
    public Result offline(@RequestParam Integer id) {
        Result result = metadataTaskService.offline(id);
        return result;
    }

    @PutMapping("/execute")
    public Result execute(@RequestParam Integer id) {
        Result result = metadataTaskService.execute(id);
        return result;
    }

    @GetMapping("/showLog")
    public Result showLog(@RequestParam Integer id) {
        Result result = metadataTaskService.showLog(id);
        return result;
    }

    @GetMapping("/statistics/metadata")
    public Result statisticsMetadata() {
        return metadataTaskService.statisticsMetadata();
    }

    @GetMapping("/statistics/taskInstance")
    public Result statisticsTaskInstance() {
        return metadataTaskService.statisticsTaskInstance();
    }

    /**
     * page
     */
    @PostMapping(value = "/pageInstance")
    public Result pageInstance(@RequestBody SearchCondition searchCondition) throws Exception {
        try {
            Page<MetadataTaskInstance> page = metadataTaskInstanceService.page(searchCondition);
            return Result.succeed(page, "查询成功");
        } catch (Exception e) {
            e.printStackTrace();
            return Result.failed("查询失败");
        }
    }

}

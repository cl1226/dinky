package com.dlink.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.dlink.common.result.Result;
import com.dlink.dto.MetadataColumnDTO;
import com.dlink.dto.MetadataDbDTO;
import com.dlink.dto.MetadataTableDTO;
import com.dlink.dto.SearchCondition;
import com.dlink.metadata.result.JdbcSelectResult;
import com.dlink.model.MetadataDb;
import com.dlink.service.MetadataColumnService;
import com.dlink.service.MetadataDbService;
import com.dlink.service.MetadataService;
import com.dlink.service.MetadataTableService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

/**
 * MetadataController
 *
 * @author cl1226
 * @since 2023/6/13 16:54
 **/
@Slf4j
@RestController
@RequestMapping("/api/metadata")
public class MetadataController {

    @Autowired
    private MetadataDbService metadataDbService;

    @Autowired
    private MetadataTableService metadataTableService;

    @Autowired
    private MetadataColumnService metadataColumnService;

    @Autowired
    private MetadataService metadataService;

    @PostMapping("/page")
    public Result page(@RequestBody SearchCondition searchCondition) {
        if (searchCondition.getItemType().equals("Database")) {
            Page<MetadataDbDTO> page = metadataDbService.page(searchCondition);
            return Result.succeed(page, "获取成功");
        } else if (searchCondition.getItemType().equals("Table")) {
            Page<MetadataTableDTO> page = metadataTableService.page(searchCondition);
            return Result.succeed(page, "获取成功");
        } else if (searchCondition.getItemType().equals("Column")) {
            Page<MetadataColumnDTO> page = metadataColumnService.page(searchCondition);
            return Result.succeed(page, "获取成功");
        }
        return Result.failed("获取失败");
    }

    @PostMapping("/detail")
    public Result detail(@RequestBody SearchCondition searchCondition) {
        if (searchCondition.getItemType().equals("Database")) {
            MetadataDbDTO metadataDbDTO = metadataDbService.detail(searchCondition.getId());
            return Result.succeed(metadataDbDTO, "获取成功");
        } else if (searchCondition.getItemType().equals("Table")) {
            MetadataTableDTO detail = metadataTableService.detail(searchCondition.getId());
            return Result.succeed(detail, "获取成功");
        } else if (searchCondition.getItemType().equals("Column")) {
            MetadataColumnDTO detail = metadataColumnService.detail(searchCondition.getId());
            return Result.succeed(detail, "获取成功");
        }
        return Result.failed("获取失败");
    }

    @GetMapping("/preview")
    public Result preview(@RequestParam Integer id) {
        JdbcSelectResult preview = metadataTableService.preview(id);
        return Result.succeed(preview, "预览成功");
    }

    @GetMapping("/statistics")
    public Result statistics() {
        Result result = metadataService.statistics();
        return result;
    }

    @GetMapping("/statistics/detail")
    public Result statisticsDetail(@RequestParam String type) {
        Result result = metadataService.statisticsDetail();
        return result;
    }

    @PutMapping("/calcLineage")
    public Result calcLineage(@RequestParam Integer taskId) {
        Result result = metadataService.calcLineage(taskId);
        return result;
    }

}

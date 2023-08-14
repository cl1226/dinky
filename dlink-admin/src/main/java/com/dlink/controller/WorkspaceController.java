package com.dlink.controller;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.dlink.common.result.Result;
import com.dlink.dto.SearchCondition;
import com.dlink.dto.WorkspaceDTO;
import com.dlink.model.HadoopClusterModel;
import com.dlink.model.Workspace;
import com.dlink.service.WorkspaceService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * WorkspaceController
 *
 * @author cl1226
 * @since 2023/8/1 15:32
 **/
@Slf4j
@RestController
@RequestMapping("/api/workspace")
public class WorkspaceController {

    @Autowired
    private WorkspaceService workspaceService;

    @GetMapping
    public Result listAll(@RequestParam Integer clusterId) {
        return workspaceService.listAll(clusterId);
    }

    @GetMapping(value = "listByUser")
    public Result listByUser(@RequestParam Integer clusterId) {
        return workspaceService.listByUser(clusterId);
    }

    @PutMapping
    public Result create(@RequestBody WorkspaceDTO workspace) {
        Result result = workspaceService.addOrUpdate(workspace);
        return result;
    }

    @DeleteMapping
    public Result delete(@RequestBody SearchCondition searchCondition) {
        return workspaceService.remove(searchCondition.getId());
    }

}

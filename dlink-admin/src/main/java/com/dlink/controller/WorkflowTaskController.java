/*
 *
 *  Licensed to the Apache Software Foundation (ASF) under one or more
 *  contributor license agreements.  See the NOTICE file distributed with
 *  this work for additional information regarding copyright ownership.
 *  The ASF licenses this file to You under the Apache License, Version 2.0
 *  (the "License"); you may not use this file except in compliance with
 *  the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

package com.dlink.controller;

import com.dlink.common.result.ProTableResult;
import com.dlink.common.result.Result;
import com.dlink.model.*;
import com.dlink.service.WorkflowTaskService;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

/**
 * 工作流任务 Controller
 *
 * @author cl1226
 * @since 2023-04-20 15:58
 */
@Slf4j
@RestController
@RequestMapping("/api/workflow/task")
public class WorkflowTaskController {

    @Autowired
    private WorkflowTaskService taskService;

    /**
     * 新增或者更新
     */
    @PutMapping
    public Result saveOrUpdate(@RequestBody WorkflowTask task) throws Exception {
        if (taskService.saveOrUpdateTask(task)) {
            return Result.succeed("操作成功");
        } else {
            return Result.failed("操作失败");
        }
    }

    /**
     * 动态查询列表
     */
    @PostMapping
    public ProTableResult<WorkflowTask> listTasks(@RequestBody JsonNode para) {
        return taskService.selectForProTable(para);
    }

    /**
     * 批量删除
     */
    @DeleteMapping
    public Result deleteMul(@RequestBody JsonNode para) {
        if (para.size() > 0) {
            boolean isAdmin = false;
            List<Integer> error = new ArrayList<>();
            for (final JsonNode item : para) {
                Integer id = item.asInt();
                if (!taskService.removeById(id)) {
                    error.add(id);
                }
            }
            if (error.size() == 0 && !isAdmin) {
                return Result.succeed("删除成功");
            } else {
                return Result.succeed("删除部分成功，但" + error.toString() + "删除失败，共" + error.size() + "次失败。");
            }
        } else {
            return Result.failed("请选择要删除的记录");
        }
    }


    /**
     * 获取指定ID的信息
     */
    @GetMapping
    public Result getOneById(@RequestParam Integer id) {
        WorkflowTask task = taskService.getTaskInfoById(id);
        return Result.succeed(task, "获取成功");
    }

    /**
     * 发布任务
     */
    @GetMapping(value = "/releaseTask")
    public Result releaseTask(@RequestParam Integer id) {
        return taskService.releaseTask(id);
    }

    /**
     * 维护任务
     */
    @GetMapping(value = "/developTask")
    public Result developTask(@RequestParam Integer id) {
        return Result.succeed(taskService.developTask(id), "操作成功");
    }

    /**
     * 上线任务
     */
    @GetMapping(value = "/onLineTask")
    public Result onLineTask(@RequestParam Integer id) {
        return taskService.onLineTask(id);
    }

    /**
     * 下线任务
     */
    @GetMapping(value = "/offLineTask")
    public Result offLineTask(@RequestParam Integer id, @RequestParam String type) {
        return taskService.offLineTask(id, type);
    }

    /**
     * 注销任务
     */
    @GetMapping(value = "/cancelTask")
    public Result cancelTask(@RequestParam Integer id) {
        return taskService.cancelTask(id);
    }

    /**
     * 恢复任务
     */
    @GetMapping(value = "/recoveryTask")
    public Result recoveryTask(@RequestParam Integer id) {
        return Result.succeed(taskService.recoveryTask(id), "操作成功");
    }

}
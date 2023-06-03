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

package com.dlink.service;

import cn.hutool.json.JSONObject;
import com.dlink.common.result.Result;
import com.dlink.db.service.ISuperService;
import com.dlink.dto.DsSearchCondition;
import com.dlink.dto.WorkflowTaskDTO;
import com.dlink.model.*;

import java.util.List;

/**
 * WorkflowTaskService
 *
 * @author cl1226
 * @since 2023-04-20 11:21
 */
public interface WorkflowTaskService extends ISuperService<WorkflowTask> {

    WorkflowTaskDTO getTaskInfoById(Integer id);

    void initTenantByTaskId(Integer id);

    boolean saveOrUpdateTask(WorkflowTask task);

    Result releaseTask(Integer id);

    boolean developTask(Integer id);

    Result onLineTask(Integer id);

    Result reOnLineTask(Integer id, String savePointPath);

    Result offLineTask(Integer id);

    Result getLock(Integer id);

    Result releaseLock(Integer id);

    Result startTask(Integer id);

    Result schedulerTask(Integer id, String cron);

    Result updateSchedulerTask(Integer id, String cron);

    Result deleteSchedulerTask(Integer id);

    Result schedulerOnlineTask(Integer id);

    Result schedulerOfflineTask(Integer id);

    Result cancelTask(Integer id);

    boolean recoveryTask(Integer id);

    List<String> previewSchedule(String schedule);

    JSONObject pageFlowInstance(DsSearchCondition condition);

    JSONObject pageTaskInstance(DsSearchCondition condition);

}

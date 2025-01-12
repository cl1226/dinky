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

package com.dlink.scheduler.client;

import cn.hutool.json.JSONUtil;
import com.dlink.scheduler.config.DolphinSchedulerProperties;
import com.dlink.scheduler.constant.Constants;
import com.dlink.scheduler.model.DagData;
import com.dlink.scheduler.model.ProcessDefinition;
import com.dlink.scheduler.result.PageInfo;
import com.dlink.scheduler.result.Result;
import com.dlink.scheduler.utils.MyJSONUtil;
import com.dlink.scheduler.utils.ParamUtil;
import com.dlink.scheduler.utils.ReadFileUtil;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import cn.hutool.core.lang.TypeReference;
import cn.hutool.core.util.StrUtil;
import cn.hutool.http.HttpRequest;
import cn.hutool.json.JSONObject;

/**
 * 工作流定义
 *
 * @author 郑文豪
 */
@Component
public class ProcessClient {

    private static final Logger logger = LoggerFactory.getLogger(TaskClient.class);

    @Autowired
    private DolphinSchedulerProperties dolphinSchedulerProperties;

    /**
     * 查询工作流定义
     *
     * @param projectCode 项目编号
     * @param processName 工作流定义名
     * @return {@link   List<ProcessDefinition>}
     * @author 郑文豪
     * @date 2022/9/7 16:59
     */
    public List<ProcessDefinition> getProcessDefinition(Long projectCode, String processName) {
        Map<String, Object> map = new HashMap<>();
        map.put("projectCode", projectCode);
        String format = StrUtil.format(dolphinSchedulerProperties.getUrl() + "/projects/{projectCode}/process-definition", map);

        String content = HttpRequest.get(format)
            .header(Constants.TOKEN, dolphinSchedulerProperties.getToken())
            .form(ParamUtil.getPageParams(processName))
            .timeout(5000)
            .execute().body();
        PageInfo<JSONObject> data = MyJSONUtil.toPageBean(content);
        List<ProcessDefinition> lists = new ArrayList<>();
        if (data == null || data.getTotalList() == null) {
            return lists;
        }

        for (JSONObject jsonObject : data.getTotalList()) {
            lists.add(MyJSONUtil.toBean(jsonObject, ProcessDefinition.class));
        }
        return lists;
    }

    /**
     * 查询工作流定义
     *
     * @param projectCode 项目编号
     * @param processName 工作流定义名
     * @return {@link ProcessDefinition}
     * @author 郑文豪
     * @date 2022/9/7 16:59
     */
    public ProcessDefinition getProcessDefinitionInfo(Long projectCode, String processName) {

        List<ProcessDefinition> lists = getProcessDefinition(projectCode, processName);
        for (ProcessDefinition list : lists) {
            if (list.getName().equalsIgnoreCase(processName)) {
                return list;
            }
        }
        return null;
    }

    /**
     * 删除工作流
     *
     * @param projectCode 项目编号
     * @param processCode 工作流编号
     * @return {@link ProcessDefinition}
     * @author cl1226
     * @date 2023/04/23 15:54
     */
    public JSONObject deleteProcessDefinition(Long projectCode, Long processCode) {
        Map<String, Object> map = new HashMap<>();
        map.put("projectCode", projectCode);
        map.put("processCode", processCode);
        String format = StrUtil.format(dolphinSchedulerProperties.getUrl() + "/projects/{projectCode}/process-definition/{processCode}", map);

        String content = HttpRequest.delete(format)
                .header(Constants.TOKEN, dolphinSchedulerProperties.getToken())
                .timeout(5000)
                .execute().body();

        return MyJSONUtil.verifyResult(MyJSONUtil.toBean(content, new TypeReference<Result<JSONObject>>() {
        }));
    }

    /**
     * 根据编号获取
     *
     * @param projectCode 项目编号
     * @param processCode 任务编号
     * @return {@link DagData}
     * @author 郑文豪
     * @date 2022/9/13 14:33
     */
    public DagData getProcessDefinitionInfo(Long projectCode, Long processCode) {
        Map<String, Object> map = new HashMap<>();
        map.put("projectCode", projectCode);
        map.put("code", processCode);
        String format = StrUtil.format(dolphinSchedulerProperties.getUrl() + "/projects/{projectCode}/process-definition/{code}", map);

        String content = HttpRequest.get(format)
            .header(Constants.TOKEN, dolphinSchedulerProperties.getToken())
            .timeout(5000)
            .execute().body();

        return MyJSONUtil.verifyResult(MyJSONUtil.toBean(content, new TypeReference<Result<DagData>>() {
        }));
    }

    /**
     * 创建工作流定义
     *
     * @param projectCode 项目编号
     * @param processName 工作流定义名称
     * @return {@link ProcessDefinition}
     * @author 郑文豪
     * @date 2022/9/7 17:00
     */
    public ProcessDefinition createProcessDefinition(Long projectCode, String processName, Long taskCode, String taskDefinitionJson) {
        Map<String, Object> map = new HashMap<>();
        map.put("projectCode", projectCode);
        String format = StrUtil.format(dolphinSchedulerProperties.getUrl() + "/projects/{projectCode}/process-definition", map);

        Map<String, Object> taskMap = new HashMap<>();
        taskMap.put("code", taskCode);

        String taskRelationJson = ReadFileUtil.taskRelation(taskMap);

        Map<String, Object> params = new HashMap<>();
        params.put("name", processName);
        params.put("description", "系统添加");
        params.put("tenantCode", "default");
        params.put("taskRelationJson", taskRelationJson);
        params.put("taskDefinitionJson", taskDefinitionJson);
        params.put("executionType", "PARALLEL");

        String content = HttpRequest.post(format)
            .header(Constants.TOKEN, dolphinSchedulerProperties.getToken())
            .form(params)
            .timeout(5000)
            .execute().body();

        return MyJSONUtil.verifyResult(MyJSONUtil.toBean(content, new TypeReference<Result<ProcessDefinition>>() {
        }));
    }

    /**
     * 创建工作流定义V2
     *
     * @param projectCode 项目编号
     * @param processName 工作流定义名称
     * @return {@link ProcessDefinition}
     * @author cl1226
     * @date 2022/9/7 17:00
     */
    public ProcessDefinition createProcessDefinitionV2(Long projectCode, String processName, String taskDefinitionJson, String taskRelationJson) {
        Map<String, Object> map = new HashMap<>();
        map.put("projectCode", projectCode);
        String format = StrUtil.format(dolphinSchedulerProperties.getUrl() + "/projects/{projectCode}/process-definition", map);

        Map<String, Object> params = new HashMap<>();
        params.put("name", processName);
        params.put("description", "系统添加");
        params.put("tenantCode", "default");
        params.put("taskRelationJson", taskRelationJson);
        params.put("taskDefinitionJson", taskDefinitionJson);
        params.put("executionType", "PARALLEL");

        String content = HttpRequest.post(format)
                .header(Constants.TOKEN, dolphinSchedulerProperties.getToken())
                .form(params)
                .timeout(5000)
                .execute().body();

        return MyJSONUtil.verifyResult(MyJSONUtil.toBean(content, new TypeReference<Result<ProcessDefinition>>() {
        }));
    }

    /**
     * 上线工作流
     *
     * @param projectCode 项目编号
     * @param processDefinition 工作流
     * @return {@link ProcessDefinition}
     * @author cl1226
     * @date 2023/04/23 15:54
     */
    public JSONObject onlineProcessDefinition(Long projectCode, ProcessDefinition processDefinition, String status) {
        Map<String, Object> map = new HashMap<>();
        map.put("projectCode", projectCode);
        map.put("processCode", processDefinition.getCode());
        String format = StrUtil.format(dolphinSchedulerProperties.getUrl() + "/projects/{projectCode}/process-definition/{processCode}/release", map);

        Map<String, Object> params = new HashMap<>();
        params.put("name", processDefinition.getName());
        params.put("code", processDefinition.getCode());
        params.put("projectCode", processDefinition.getProjectCode());
        params.put("releaseState", status);

        String content = HttpRequest.post(format)
                .header(Constants.TOKEN, dolphinSchedulerProperties.getToken())
                .form(params)
                .timeout(5000)
                .execute().body();

        return MyJSONUtil.verifyResult(MyJSONUtil.toBean(content, new TypeReference<Result<JSONObject>>() {
        }));
    }

    /**
     * 创建调度
     *
     * @param projectCode 项目编号
     * @param processDefinition 工作流
     * @return {@link ProcessDefinition}
     * @author cl1226
     * @date 2023/04/23 15:54
     */
    public JSONObject schedulerProcessDefinition(Long projectCode, ProcessDefinition processDefinition, String scheduler) {
        Map<String, Object> map = new HashMap<>();
        map.put("projectCode", projectCode);
        String format = StrUtil.format(dolphinSchedulerProperties.getUrl() + "/projects/{projectCode}/schedules", map);

        Map<String, Object> params = new HashMap<>();
        params.put("schedule", scheduler);
        params.put("projectCode", processDefinition.getProjectCode());
        params.put("processDefinitionCode", processDefinition.getCode());

        String content = HttpRequest.post(format)
                .header(Constants.TOKEN, dolphinSchedulerProperties.getToken())
                .form(params)
                .timeout(5000)
                .execute().body();

        return MyJSONUtil.verifyResult(MyJSONUtil.toBean(content, new TypeReference<Result<JSONObject>>() {
        }));
    }

    /**
     * 更新调度
     *
     * @param projectCode 项目编号
     * @param processDefinition 工作流
     * @return {@link ProcessDefinition}
     * @author cl1226
     * @date 2023/04/23 15:54
     */
    public JSONObject updateSchedulerProcessDefinition(Long projectCode, ProcessDefinition processDefinition,
                                                       String cron, Integer cronId) {
        Map<String, Object> map = new HashMap<>();
        map.put("projectCode", projectCode);
        map.put("id", cronId);
        String format = StrUtil.format(dolphinSchedulerProperties.getUrl() + "/projects/{projectCode}/schedules/{id}", map);

        Map<String, Object> params = new HashMap<>();
        params.put("id", cronId);
        params.put("schedule", cron);
        params.put("projectCode", processDefinition.getProjectCode());

        String content = HttpRequest.put(format)
                .header(Constants.TOKEN, dolphinSchedulerProperties.getToken())
                .form(params)
                .timeout(5000)
                .execute().body();

        return MyJSONUtil.verifyResult(MyJSONUtil.toBean(content, new TypeReference<Result<JSONObject>>() {
        }));
    }

    /**
     * 删除调度
     *
     * @param projectCode 项目编号
     * @param processDefinition 工作流
     * @return {@link ProcessDefinition}
     * @author cl1226
     * @date 2023/04/23 15:54
     */
    public JSONObject deleteSchedulerProcessDefinition(Long projectCode, ProcessDefinition processDefinition,
                                                       Integer cronId) {
        Map<String, Object> map = new HashMap<>();
        map.put("projectCode", projectCode);
        map.put("id", cronId);
        String format = StrUtil.format(dolphinSchedulerProperties.getUrl() + "/projects/{projectCode}/schedules/{id}", map);

        Map<String, Object> params = new HashMap<>();
        params.put("id", cronId);
        params.put("projectCode", processDefinition.getProjectCode());

        String content = HttpRequest.delete(format)
                .header(Constants.TOKEN, dolphinSchedulerProperties.getToken())
                .form(params)
                .timeout(5000)
                .execute().body();

        return MyJSONUtil.verifyResult(MyJSONUtil.toBean(content, new TypeReference<Result<JSONObject>>() {
        }));
    }

    /**
     * 调度上线
     *
     * @param projectCode 项目编号
     * @return {@link ProcessDefinition}
     * @author cl1226
     * @date 2023/04/23 15:54
     */
    public JSONObject schedulerOnlineProcessDefinition(Long projectCode, Integer id) {
        Map<String, Object> map = new HashMap<>();
        map.put("projectCode", projectCode);
        map.put("id", id);
        String format = StrUtil.format(dolphinSchedulerProperties.getUrl() + "/projects/{projectCode}/schedules/{id}/online", map);

        String content = HttpRequest.post(format)
                .header(Constants.TOKEN, dolphinSchedulerProperties.getToken())
                .timeout(5000)
                .execute().body();

        return MyJSONUtil.verifyResult(MyJSONUtil.toBean(content, new TypeReference<Result<JSONObject>>() {
        }));
    }

    /**
     * 调度下线
     *
     * @param projectCode 项目编号
     * @return {@link ProcessDefinition}
     * @author cl1226
     * @date 2023/04/23 15:54
     */
    public JSONObject schedulerOfflineProcessDefinition(Long projectCode, Integer id) {
        Map<String, Object> map = new HashMap<>();
        map.put("projectCode", projectCode);
        map.put("id", id);
        String format = StrUtil.format(dolphinSchedulerProperties.getUrl() + "/projects/{projectCode}/schedules/{id}/offline", map);

        String content = HttpRequest.post(format)
                .header(Constants.TOKEN, dolphinSchedulerProperties.getToken())
                .timeout(5000)
                .execute().body();

        return MyJSONUtil.verifyResult(MyJSONUtil.toBean(content, new TypeReference<Result<JSONObject>>() {
        }));
    }

    /**
     * 启动工作流
     *
     * @Param projectCode 项目编号
     * @param processCode 工作流编号
     * @return {@link ProcessDefinition}
     * @author cl1226
     * @date 2023/04/26 08:30
     */
    public JSONObject startProcessDefinition(Long projectCode, Long processCode) {
        Map<String, Object> map = new HashMap<>();
        map.put("projectCode", projectCode);
        String format = StrUtil.format(dolphinSchedulerProperties.getUrl() + "/projects/{projectCode}/executors/start-process-instance", map);

        DateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        Calendar instance = Calendar.getInstance();
        instance.set(Calendar.HOUR, 0);
        instance.set(Calendar.MINUTE, 0);
        instance.set(Calendar.SECOND, 0);
        String todayStr = dateFormat.format(instance.getTime());
        Map<String, String> timeMap = new HashMap<>();
        timeMap.put("complementStartDate", todayStr);
        timeMap.put("complementEndDate", todayStr);

        Map<String, Object> params = new HashMap<>();
        params.put("failureStrategy", "CONTINUE");
        params.put("processDefinitionCode", processCode);
        params.put("processInstancePriority", "HIGH");
        params.put("projectCode", processCode);
        params.put("scheduleTime", JSONUtil.toJsonStr(timeMap));
        params.put("warningType", "ALL");

        String content = HttpRequest.post(format)
                .header(Constants.TOKEN, dolphinSchedulerProperties.getToken())
                .form(params)
                .timeout(5000)
                .execute().body();

        return MyJSONUtil.verifyResult(MyJSONUtil.toBean(content, new TypeReference<Result<JSONObject>>() {
        }));
    }

    /**
     * 获取工作流实例
     *
     * @author cl1226
     * @date 2023/04/23 15:54
     */
    public JSONObject pageFlowInstance(JSONObject condition) {
        Map<String, Object> map = new HashMap<>();
        map.put("projectCode", condition.getLong("projectCode"));
        map.put("pageNo", condition.getInt("pageNo"));
        map.put("pageSize", condition.getInt("pageSize"));
        map.put("searchVal", condition.getStr("searchVal"));
        map.put("executorName", condition.getStr("executorName", ""));
        map.put("host", condition.getStr("host", ""));
        map.put("stateType", condition.getStr("stateType", ""));
        map.put("startDate", condition.getStr("startDate", ""));
        map.put("endDate", condition.getStr("endDate", ""));
        String format = StrUtil.format(dolphinSchedulerProperties.getUrl() +
                "/projects/{projectCode}/process-instances?pageNo={pageNo}&pageSize={pageSize}&searchVal={searchVal}&executorName={executorName}&host={host}&stateType={stateType}&startDate={startDate}&endDate={endDate}",
                map);

        String content = HttpRequest.get(format)
                .header(Constants.TOKEN, dolphinSchedulerProperties.getToken())
                .timeout(5000)
                .execute().body();

        return MyJSONUtil.verifyResult(MyJSONUtil.toBean(content, new TypeReference<Result<JSONObject>>() {
        }));
    }

    /**
     * 获取任务实例
     *
     * @author cl1226
     * @date 2023/04/23 15:54
     */
    public JSONObject pageTaskInstance(JSONObject condition) {
        Map<String, Object> map = new HashMap<>();
        map.put("projectCode", condition.getLong("projectCode"));
        map.put("pageNo", condition.getInt("pageNo"));
        map.put("pageSize", condition.getInt("pageSize"));
        map.put("searchVal", condition.getStr("searchVal"));
        map.put("executorName", condition.getStr("executorName", ""));
        map.put("host", condition.getStr("host", ""));
        map.put("stateType", condition.getStr("stateType", ""));
        map.put("startDate", condition.getStr("startDate", ""));
        map.put("endDate", condition.getStr("endDate", ""));
        String format = StrUtil.format(dolphinSchedulerProperties.getUrl() +
                        "/projects/{projectCode}/task-instances?pageNo={pageNo}&pageSize={pageSize}&searchVal={searchVal}&executorName={executorName}&host={host}&stateType={stateType}&startDate={startDate}&endDate={endDate}",
                map);

        String content = HttpRequest.get(format)
                .header(Constants.TOKEN, dolphinSchedulerProperties.getToken())
                .timeout(5000)
                .execute().body();

        return MyJSONUtil.verifyResult(MyJSONUtil.toBean(content, new TypeReference<Result<JSONObject>>() {
        }));
    }

    /**
     * 获取任务状态图表
     *
     * @author cl1226
     * @date 2023/06/07 08:27
     */
    public JSONObject getTaskStateCount(JSONObject condition) {
        Map<String, Object> map = new HashMap<>();
        map.put("projectCode", condition.getStr("projectCode", "0"));
        map.put("startDate", condition.getStr("startDate"));
        map.put("endDate", condition.getStr("endDate"));
        String format = StrUtil.format(dolphinSchedulerProperties.getUrl() +
                        "/projects/analysis/task-state-count?startDate={startDate}&endDate={endDate}&projectCode=0",
                map);

        String content = HttpRequest.get(format)
                .header(Constants.TOKEN, dolphinSchedulerProperties.getToken())
                .timeout(5000)
                .execute().body();

        return MyJSONUtil.verifyResult(MyJSONUtil.toBean(content, new TypeReference<Result<JSONObject>>() {
        }));
    }

    /**
     * 获取工作流状态图表
     *
     * @author cl1226
     * @date 2023/06/07 08:27
     */
    public JSONObject getProcessStateCount(JSONObject condition) {
        Map<String, Object> map = new HashMap<>();
        map.put("projectCode", condition.getStr("projectCode", "0"));
        map.put("startDate", condition.getStr("startDate"));
        map.put("endDate", condition.getStr("endDate"));
        String format = StrUtil.format(dolphinSchedulerProperties.getUrl() +
                        "/projects/analysis/process-state-count?startDate={startDate}&endDate={endDate}&projectCode=0",
                map);

        String content = HttpRequest.get(format)
                .header(Constants.TOKEN, dolphinSchedulerProperties.getToken())
                .timeout(5000)
                .execute().body();

        return MyJSONUtil.verifyResult(MyJSONUtil.toBean(content, new TypeReference<Result<JSONObject>>() {
        }));
    }

    /**
     * 获取任务定义图表
     *
     * @author cl1226
     * @date 2023/06/07 08:27
     */
    public JSONObject getTaskDefineCount(JSONObject condition) {
        Map<String, Object> map = new HashMap<>();
        map.put("projectCode", condition.getStr("projectCode", "0"));
        String format = StrUtil.format(dolphinSchedulerProperties.getUrl() +
                        "/projects/analysis/define-user-count?projectCode=0",
                map);

        String content = HttpRequest.get(format)
                .header(Constants.TOKEN, dolphinSchedulerProperties.getToken())
                .timeout(5000)
                .execute().body();

        return MyJSONUtil.verifyResult(MyJSONUtil.toBean(content, new TypeReference<Result<JSONObject>>() {
        }));
    }

    /**
     * 获取任务日志
     *
     * @author cl1226
     * @date 2023/06/07 16:08
     */
    public JSONObject getTaskLog(Integer taskId) {
        Map<String, Object> map = new HashMap<>();
        map.put("taskInstanceId", taskId);
        map.put("limit", 1000);
        map.put("skipLineNum", 0);
        String format = StrUtil.format(dolphinSchedulerProperties.getUrl() +
                        "/log/detail?taskInstanceId={taskInstanceId}&limit={limit}&skipLineNum={skipLineNum}",
                map);

        String content = HttpRequest.get(format)
                .header(Constants.TOKEN, dolphinSchedulerProperties.getToken())
                .timeout(5000)
                .execute().body();

        return MyJSONUtil.verifyResult(MyJSONUtil.toBean(content, new TypeReference<Result<JSONObject>>() {
        }));
    }

    /**
     * 工作流重跑
     *
     * @author cl1226
     * @date 2023/06/07 16:08
     */
    public JSONObject rerun(JSONObject condition) {
        Map<String, Object> map = new HashMap<>();
        map.put("projectCode", condition.getLong("projectCode"));

        Map<String, Object> params = new HashMap<>();
        params.put("index", condition.getInt("index", 1));
        params.put("processInstanceId", condition.getStr("processInstanceId"));
        params.put("executeType", condition.getStr("executeType", "REPEAT_RUNNING"));
        params.put("buttonType", condition.getStr("buttonType", "run"));

        String format = StrUtil.format(dolphinSchedulerProperties.getUrl() +
                        "/projects/{projectCode}/executors/execute",
                map);

        String content = HttpRequest.post(format)
                .header(Constants.TOKEN, dolphinSchedulerProperties.getToken())
                .form(params)
                .timeout(5000)
                .execute().body();

        return MyJSONUtil.verifyResult(MyJSONUtil.toBean(content, new TypeReference<Result<JSONObject>>() {
        }));
    }

    /**
     * 工作流停止
     *
     * @author cl1226
     * @date 2023/06/07 16:08
     */
    public JSONObject stop(JSONObject condition) {
        Map<String, Object> map = new HashMap<>();
        map.put("projectCode", condition.getLong("projectCode"));

        Map<String, Object> params = new HashMap<>();
        params.put("processInstanceId", condition.getStr("processInstanceId"));
        params.put("executeType", condition.getStr("executeType", "STOP"));

        String format = StrUtil.format(dolphinSchedulerProperties.getUrl() +
                        "/projects/{projectCode}/executors/execute",
                map);

        String content = HttpRequest.post(format)
                .header(Constants.TOKEN, dolphinSchedulerProperties.getToken())
                .form(params)
                .timeout(5000)
                .execute().body();

        return MyJSONUtil.verifyResult(MyJSONUtil.toBean(content, new TypeReference<Result<JSONObject>>() {
        }));
    }

    /**
     * 工作流暂停
     *
     * @author cl1226
     * @date 2023/06/07 16:08
     */
    public JSONObject pause(JSONObject condition) {
        Map<String, Object> map = new HashMap<>();
        map.put("projectCode", condition.getLong("projectCode"));

        Map<String, Object> params = new HashMap<>();
        params.put("processInstanceId", condition.getStr("processInstanceId"));
        params.put("executeType", condition.getStr("executeType", "PAUSE"));

        String format = StrUtil.format(dolphinSchedulerProperties.getUrl() +
                        "/projects/{projectCode}/executors/execute",
                map);

        String content = HttpRequest.post(format)
                .header(Constants.TOKEN, dolphinSchedulerProperties.getToken())
                .form(params)
                .timeout(5000)
                .execute().body();

        return MyJSONUtil.verifyResult(MyJSONUtil.toBean(content, new TypeReference<Result<JSONObject>>() {
        }));
    }

    /**
     * 工作流恢复运行
     *
     * @author cl1226
     * @date 2023/06/07 16:08
     */
    public JSONObject suspend(JSONObject condition) {
        Map<String, Object> map = new HashMap<>();
        map.put("projectCode", condition.getLong("projectCode"));

        Map<String, Object> params = new HashMap<>();
        params.put("index", condition.getInt("index", 0));
        params.put("processInstanceId", condition.getStr("processInstanceId"));
        params.put("executeType", condition.getStr("executeType", "RECOVER_SUSPENDED_PROCESS"));
        params.put("buttonType", condition.getStr("buttonType", "suspend"));

        String format = StrUtil.format(dolphinSchedulerProperties.getUrl() +
                        "/projects/{projectCode}/executors/execute",
                map);

        String content = HttpRequest.post(format)
                .header(Constants.TOKEN, dolphinSchedulerProperties.getToken())
                .form(params)
                .timeout(5000)
                .execute().body();

        return MyJSONUtil.verifyResult(MyJSONUtil.toBean(content, new TypeReference<Result<JSONObject>>() {
        }));
    }
}

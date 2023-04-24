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

import com.dlink.scheduler.config.DolphinSchedulerProperties;
import com.dlink.scheduler.constant.Constants;
import com.dlink.scheduler.model.DagData;
import com.dlink.scheduler.model.ProcessDefinition;
import com.dlink.scheduler.result.PageInfo;
import com.dlink.scheduler.result.Result;
import com.dlink.scheduler.utils.MyJSONUtil;
import com.dlink.scheduler.utils.ParamUtil;
import com.dlink.scheduler.utils.ReadFileUtil;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
        String format = StrUtil.format(dolphinSchedulerProperties.getUrl() + "/projects/{projectCode}/schedulers", map);

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
        String format = StrUtil.format(dolphinSchedulerProperties.getUrl() + "/projects/{projectCode}/schedulers/{id}", map);

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
        String format = StrUtil.format(dolphinSchedulerProperties.getUrl() + "/projects/{projectCode}/schedulers/{id}", map);

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
        String format = StrUtil.format(dolphinSchedulerProperties.getUrl() + "/projects/{projectCode}/schedulers/{id}/online", map);

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
        String format = StrUtil.format(dolphinSchedulerProperties.getUrl() + "/projects/{projectCode}/schedulers/{id}/offline", map);

        String content = HttpRequest.post(format)
                .header(Constants.TOKEN, dolphinSchedulerProperties.getToken())
                .timeout(5000)
                .execute().body();

        return MyJSONUtil.verifyResult(MyJSONUtil.toBean(content, new TypeReference<Result<JSONObject>>() {
        }));
    }

}

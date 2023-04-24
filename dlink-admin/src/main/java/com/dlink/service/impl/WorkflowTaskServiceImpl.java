package com.dlink.service.impl;

import cn.hutool.core.collection.CollUtil;
import cn.hutool.core.convert.Convert;
import cn.hutool.json.JSONArray;
import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.dlink.assertion.Assert;
import com.dlink.assertion.Asserts;
import com.dlink.common.result.Result;
import com.dlink.config.Dialect;
import com.dlink.db.service.impl.SuperServiceImpl;
import com.dlink.dto.WorkflowEdge;
import com.dlink.dto.WorkflowTaskDTO;
import com.dlink.exception.BusException;
import com.dlink.function.compiler.CustomStringJavaCompiler;
import com.dlink.function.pool.UdfCodePool;
import com.dlink.function.util.UDFUtil;
import com.dlink.init.SystemInit;
import com.dlink.mapper.WorkflowTaskMapper;
import com.dlink.model.*;
import com.dlink.scheduler.client.ProcessClient;
import com.dlink.scheduler.client.TaskClient;
import com.dlink.scheduler.config.DolphinSchedulerProperties;
import com.dlink.scheduler.enums.ReleaseState;
import com.dlink.scheduler.model.*;
import com.dlink.service.WorkflowTaskService;
import com.dlink.utils.UDFUtils;
import com.google.common.collect.Lists;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * 任务 服务实现类
 *
 * @author cl1226
 * @since 2023-04-20 12:16
 */
@Service
public class WorkflowTaskServiceImpl extends SuperServiceImpl<WorkflowTaskMapper, WorkflowTask> implements WorkflowTaskService {

    @Autowired
    private DolphinSchedulerProperties dolphinSchedulerProperties;
    @Autowired
    private ProcessClient processClient;
    @Autowired
    private TaskClient taskClient;

    @Override
    public WorkflowTask getTaskInfoById(Integer id) {
        WorkflowTask task = this.getById(id);
        return task;
    }

    @Override
    public void initTenantByTaskId(Integer id) {

    }

    @Override
    public boolean saveOrUpdateTask(WorkflowTask task) {
        // if modify task else create task
        if (task.getId() != null) {
            WorkflowTask taskInfo = getById(task.getId());
            Assert.check(taskInfo);
            if (JobLifeCycle.RELEASE.equalsValue(taskInfo.getStep())
                    || JobLifeCycle.ONLINE.equalsValue(taskInfo.getStep())
                    || JobLifeCycle.CANCEL.equalsValue(taskInfo.getStep())) {
                throw new BusException("该作业已" + JobLifeCycle.get(taskInfo.getStep()).getLabel() + "，禁止修改！");
            }
            task.setStep(JobLifeCycle.DEVELOP.getValue());
            task.setStatus(WorkflowLifeCycle.CREATE.getValue());
            this.updateById(task);
        } else {
            task.setStatus(WorkflowLifeCycle.CREATE.getValue());
            task.setStep(JobLifeCycle.CREATE.getValue());
            this.save(task);
        }
        return true;
    }

    @Override
    public Result releaseTask(Integer id) {
        WorkflowTask taskInfo = getById(id);
        taskInfo.setStatus(WorkflowLifeCycle.DEPLOY.getValue());
        this.updateById(taskInfo);

        if (StringUtils.isBlank(taskInfo.getGraphData())) {
            return Result.failed("工作流程中缺少节点");
        }

        Project dinkyProject = SystemInit.getProject();
        long projectCode = dinkyProject.getCode();
        ProcessDefinition process = processClient.getProcessDefinitionInfo(projectCode, taskInfo.getName());

        if (process != null) {
            if (process.getReleaseState() == ReleaseState.ONLINE) {
                return Result.failed("工作流定义 [" + taskInfo.getName() + "] 已经上线");
            }
            long processCode = process.getCode();
            processClient.deleteProcessDefinition(projectCode, processCode);
        }

        // 生成任务及关系
        String graphData = taskInfo.getGraphData();
        WorkflowTaskDTO workflowTaskDTO = JSONUtil.toBean(graphData, WorkflowTaskDTO.class);
        Map<String, Long> map = new HashMap<>();
        List<TaskRequest> taskRequests = new ArrayList<>();
        List<ProcessTaskRelation> taskRelations = new ArrayList<>();
        workflowTaskDTO.getNodes().stream().forEach(x -> {
            List<WorkflowEdge> filterEdges = workflowTaskDTO.getEdges().stream().
                    filter(y -> y.getTarget().equals(x.getId())).collect(Collectors.toList());
            // 每一个节点生成一个taskRequest
            TaskRequest taskRequest = new TaskRequest();
            DlinkTaskParams dlinkTaskParams = new DlinkTaskParams();
            dlinkTaskParams.setTaskId(String.valueOf(x.getJobId()));
            dlinkTaskParams.setAddress(dolphinSchedulerProperties.getAddress());
            taskRequest.setTaskParams(JSONUtil.parseObj(dlinkTaskParams).toString());
            taskRequest.setTaskType("DINKY");
            taskRequest.setName(x.getLabel());
            Long taskCode = taskClient.genTaskCode(projectCode);
            map.put(x.getId(), taskCode);
            taskRequest.setCode(taskCode);
            taskRequests.add(taskRequest);
            // 每一个节点生成一个relation
            ProcessTaskRelation processTaskRelation = new ProcessTaskRelation();
            if (filterEdges.size() > 0) {
                Long dependenceCodes = 0L;
                if (filterEdges.size() > 0) {
                    dependenceCodes = map.get(filterEdges.get(0).getSource());
                }
                processTaskRelation.setPreTaskCode(dependenceCodes);
                processTaskRelation.setPostTaskCode(taskCode);
                processTaskRelation.setProjectCode(projectCode);
            } else {
                processTaskRelation.setPreTaskCode(0);
                processTaskRelation.setPostTaskCode(taskCode);
                processTaskRelation.setProjectCode(projectCode);
            }
            taskRelations.add(processTaskRelation);

//            String taskDefinitionJsonObj = JSONUtil.toJsonStr(taskRequest);

//            TaskDefinitionLog taskDefinition = taskClient.createTaskDefinition(projectCode, processDefinition.getCode(), dependenceCodes, taskDefinitionJsonObj);
//            map.put(x.getId(), taskDefinition.getCode());
        });
        // 创建流程
        ProcessDefinition processDefinition = processClient.createProcessDefinitionV2(
                projectCode,
                taskInfo.getName(),
                JSONUtil.parseArray(taskRequests).toString(),
                JSONUtil.parseArray(taskRelations).toString());
        return Result.succeed("部署工作流成功");
    }

    @Override
    public boolean developTask(Integer id) {
        return false;
    }

    @Override
    public Result onLineTask(Integer id) {
        WorkflowTask taskInfo = getById(id);
        taskInfo.setStatus(WorkflowLifeCycle.ONLINE.getValue());
        this.updateById(taskInfo);
        if (StringUtils.isBlank(taskInfo.getGraphData())) {
            return Result.failed("工作流程中缺少节点");
        }

        Project dinkyProject = SystemInit.getProject();
        long projectCode = dinkyProject.getCode();
        ProcessDefinition process = processClient.getProcessDefinitionInfo(projectCode, taskInfo.getName());
        if (process == null) {
            return Result.failed("工作流不存在：" + taskInfo.getName());
        }
        JSONObject entries = processClient.onlineProcessDefinition(projectCode, process, "ONLINE");
        return Result.succeed("上线工作流成功");
    }

    @Override
    public Result reOnLineTask(Integer id, String savePointPath) {
        return null;
    }

    @Override
    public Result offLineTask(Integer id) {
        WorkflowTask taskInfo = getById(id);
        taskInfo.setStatus(WorkflowLifeCycle.OFFLINE.getValue());
        this.updateById(taskInfo);
        if (StringUtils.isBlank(taskInfo.getGraphData())) {
            return Result.failed("工作流程中缺少节点");
        }

        Project dinkyProject = SystemInit.getProject();
        long projectCode = dinkyProject.getCode();
        ProcessDefinition process = processClient.getProcessDefinitionInfo(projectCode, taskInfo.getName());
        if (process == null) {
            return Result.failed("工作流不存在：" + taskInfo.getName());
        }
        JSONObject entries = processClient.onlineProcessDefinition(projectCode, process, "OFFLINE");
        return Result.succeed("下线工作流成功");
    }

    @Override
    public Result schedulerTask(Integer id, String cron) {
        WorkflowTask taskInfo = getById(id);

        if (StringUtils.isBlank(taskInfo.getGraphData())) {
            return Result.failed("工作流程中缺少节点");
        }

        Project dinkyProject = SystemInit.getProject();
        long projectCode = dinkyProject.getCode();
        ProcessDefinition process = processClient.getProcessDefinitionInfo(projectCode, taskInfo.getName());

        if (process == null) {
            return Result.failed("工作流不存在：" + taskInfo.getName());
        }

        if (process != null) {
            if (process.getReleaseState() != ReleaseState.ONLINE) {
                return Result.failed("工作流定义 [" + taskInfo.getName() + "] 不是上线状态");
            }
        }
        JSONObject entries = processClient.schedulerProcessDefinition(projectCode, process, cron);

        taskInfo.setCron(cron);
        taskInfo.setCronId(56);
        this.updateById(taskInfo);
        return Result.succeed("配置工作流调度成功");
    }

    @Override
    public Result updateSchedulerTask(Integer id, String cron) {
        WorkflowTask taskInfo = getById(id);

        if (StringUtils.isBlank(taskInfo.getGraphData())) {
            return Result.failed("工作流程中缺少节点");
        }

        Project dinkyProject = SystemInit.getProject();
        long projectCode = dinkyProject.getCode();
        ProcessDefinition process = processClient.getProcessDefinitionInfo(projectCode, taskInfo.getName());

        if (process == null) {
            return Result.failed("工作流不存在：" + taskInfo.getName());
        }

        if (process != null) {
            if (process.getReleaseState() != ReleaseState.ONLINE) {
                return Result.failed("工作流定义 [" + taskInfo.getName() + "] 不是上线状态");
            }
        }
        JSONObject entries = processClient.updateSchedulerProcessDefinition(projectCode, process, cron, taskInfo.getCronId());

        taskInfo.setCron(cron);
        this.updateById(taskInfo);
        return Result.succeed("更新工作流调度成功");
    }

    @Override
    public Result deleteSchedulerTask(Integer id) {
        WorkflowTask taskInfo = getById(id);

        if (StringUtils.isBlank(taskInfo.getGraphData())) {
            return Result.failed("工作流程中缺少节点");
        }

        Project dinkyProject = SystemInit.getProject();
        long projectCode = dinkyProject.getCode();
        ProcessDefinition process = processClient.getProcessDefinitionInfo(projectCode, taskInfo.getName());

        if (process == null) {
            return Result.failed("工作流不存在：" + taskInfo.getName());
        }

        if (process != null) {
            if (process.getReleaseState() != ReleaseState.ONLINE) {
                return Result.failed("工作流定义 [" + taskInfo.getName() + "] 不是上线状态");
            }
        }
        JSONObject entries = processClient.deleteSchedulerProcessDefinition(projectCode, process, taskInfo.getCronId());

        taskInfo.setCron("");
        taskInfo.setCronId(-1);
        this.updateById(taskInfo);
        return Result.succeed("删除工作流调度成功");
    }

    @Override
    public Result schedulerOnlineTask(Integer id) {
        WorkflowTask taskInfo = getById(id);

        if (StringUtils.isBlank(taskInfo.getGraphData())) {
            return Result.failed("工作流程中缺少节点");
        }

        Project dinkyProject = SystemInit.getProject();
        long projectCode = dinkyProject.getCode();
        ProcessDefinition process = processClient.getProcessDefinitionInfo(projectCode, taskInfo.getName());

        if (process == null) {
            return Result.failed("工作流不存在：" + taskInfo.getName());
        }

        if (process != null) {
            if (process.getReleaseState() != ReleaseState.ONLINE) {
                return Result.failed("工作流定义 [" + taskInfo.getName() + "] 不是上线状态");
            }
        }
        JSONObject entries = processClient.schedulerOnlineProcessDefinition(projectCode, taskInfo.getCronId());

        return Result.succeed("工作流调度上线成功");
    }

    @Override
    public Result schedulerOfflineTask(Integer id) {
        WorkflowTask taskInfo = getById(id);

        if (StringUtils.isBlank(taskInfo.getGraphData())) {
            return Result.failed("工作流程中缺少节点");
        }

        Project dinkyProject = SystemInit.getProject();
        long projectCode = dinkyProject.getCode();
        ProcessDefinition process = processClient.getProcessDefinitionInfo(projectCode, taskInfo.getName());

        if (process == null) {
            return Result.failed("工作流不存在：" + taskInfo.getName());
        }

        if (process != null) {
            if (process.getReleaseState() != ReleaseState.ONLINE) {
                return Result.failed("工作流定义 [" + taskInfo.getName() + "] 不是上线状态");
            }
        }
        JSONObject entries = processClient.schedulerOfflineProcessDefinition(projectCode, taskInfo.getCronId());

        return Result.succeed("工作流调度下线成功");
    }

    @Override
    public Result cancelTask(Integer id) {
        return null;
    }

    @Override
    public boolean recoveryTask(Integer id) {
        return false;
    }
}

package com.dlink.service.impl;

import cn.dev33.satoken.stp.StpUtil;
import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.dlink.assertion.Assert;
import com.dlink.common.result.Result;
import com.dlink.db.service.impl.SuperServiceImpl;
import com.dlink.dto.WorkflowEdge;
import com.dlink.dto.WorkflowTaskDTO;
import com.dlink.exception.BusException;
import com.dlink.init.SystemInit;
import com.dlink.mapper.WorkflowTaskMapper;
import com.dlink.model.*;
import com.dlink.scheduler.client.ProcessClient;
import com.dlink.scheduler.client.TaskClient;
import com.dlink.scheduler.config.DolphinSchedulerProperties;
import com.dlink.scheduler.enums.Flag;
import com.dlink.scheduler.enums.ReleaseState;
import com.dlink.scheduler.model.*;
import com.dlink.service.WorkflowCatalogueService;
import com.dlink.service.WorkflowTaskService;
import com.google.common.collect.Lists;
import org.apache.commons.beanutils.BeanUtils;
import org.apache.commons.lang3.StringUtils;
import org.quartz.TriggerUtils;
import org.quartz.impl.triggers.CronTriggerImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.lang.reflect.InvocationTargetException;
import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.stream.Collectors;

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
    @Autowired
    private WorkflowCatalogueService catalogueService;

    @Override
    public WorkflowTaskDTO getTaskInfoById(Integer id) {
        WorkflowTask task = this.getById(id);
        WorkflowTaskDTO taskDTO = new WorkflowTaskDTO();
        try {
            BeanUtils.copyProperties(taskDTO, task);
            String loginId = StpUtil.getLoginIdAsString();
            if (loginId.equals(task.getLockUser())) {
                taskDTO.setLockStatus(true);
            } else {
                taskDTO.setLockStatus(false);
            }
        } catch (IllegalAccessException e) {
            e.printStackTrace();
        } catch (InvocationTargetException e) {
            e.printStackTrace();
        }

        return taskDTO;
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
            if (WorkflowLifeCycle.ONLINE.getValue().equals(taskInfo.getStatus())
                    || WorkflowLifeCycle.CANCEL.getValue().equals(taskInfo.getStatus())) {
                throw new BusException("该作业已" + WorkflowLifeCycle.get(taskInfo.getStatus()).getLabel() + "，禁止修改！");
            }
            task.setStatus(WorkflowLifeCycle.CREATE.getValue());
            this.updateById(task);
        } else {
            task.setStatus(WorkflowLifeCycle.CREATE.getValue());
            this.save(task);
        }
        return true;
    }

    private WorkflowCatalogue getRootCatalogueByCatalogue(WorkflowCatalogue catalogue) {
        if (catalogue.getParentId() != null && catalogue.getParentId() > 0) {
            catalogue = catalogueService.getById(catalogue.getParentId());
            return getRootCatalogueByCatalogue(catalogue);
        }
        return catalogue;
    }

    @Override
    public Result releaseTask(Integer id) {
        WorkflowTask taskInfo = getById(id);

        if (StringUtils.isBlank(taskInfo.getGraphData())) {
            return Result.failed("工作流程中缺少节点");
        }
        // 获取根目录
        WorkflowCatalogue catalogue = catalogueService.getOne(new LambdaQueryWrapper<WorkflowCatalogue>().eq(WorkflowCatalogue::getTaskId, id));
        if (catalogue == null) {
            return Result.failed("节点获取失败");
        }
        WorkflowCatalogue root = getRootCatalogueByCatalogue(catalogue);
        if (root == null) {
            return Result.failed("根节点获取失败");
        }
        long projectCode = Long.valueOf(root.getProjectCode());
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
        // 1. 生成节点，每一个节点生成一个taskRequest
        workflowTaskDTO.getNodes().stream().forEach(x -> {
            // 每一个节点生成一个taskRequest
            TaskRequest taskRequest = new TaskRequest();
            DlinkTaskParams dlinkTaskParams = new DlinkTaskParams();
            dlinkTaskParams.setTaskId(String.valueOf(x.getJobId()));
            dlinkTaskParams.setAddress(dolphinSchedulerProperties.getAddress());
            taskRequest.setTaskParams(JSONUtil.parseObj(dlinkTaskParams).toString());
            taskRequest.setTaskType("DINKY");
            taskRequest.setFlag(Flag.YES);
            taskRequest.setName(x.getLabel());
            Long taskCode = taskClient.genTaskCode(projectCode);
            map.put(x.getId(), taskCode);
            taskRequest.setCode(taskCode);
            taskRequests.add(taskRequest);
        });
        workflowTaskDTO.getNodes().stream().forEach(x -> {
            List<WorkflowEdge> filterEdges = workflowTaskDTO.getEdges().stream().
                    filter(y -> y.getTarget().equals(x.getId())).collect(Collectors.toList());
            // 每一个节点生成一个relation
            ProcessTaskRelation processTaskRelation = new ProcessTaskRelation();
            if (filterEdges.size() > 0) {
                Long dependenceCodes = 0L;
                if (filterEdges.size() > 0) {
                    dependenceCodes = map.get(filterEdges.get(0).getSource());
                }
                processTaskRelation.setPreTaskCode(dependenceCodes);
                processTaskRelation.setPostTaskCode(map.get(x.getId()));
                processTaskRelation.setProjectCode(projectCode);
            } else {
                processTaskRelation.setPreTaskCode(0);
                processTaskRelation.setPostTaskCode(map.get(x.getId()));
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

        if (processDefinition != null) {
            taskInfo.setStatus(WorkflowLifeCycle.DEPLOY.getValue());
            this.updateById(taskInfo);
        }

        return Result.succeed("部署工作流成功");
    }

    @Override
    public boolean developTask(Integer id) {
        return false;
    }

    @Override
    @Transactional
    public Result onLineTask(Integer id) {
        WorkflowTask taskInfo = getById(id);

        if (StringUtils.isBlank(taskInfo.getGraphData())) {
            return Result.failed("工作流程中缺少节点");
        }

        // 获取根目录
        WorkflowCatalogue catalogue = catalogueService.getOne(new LambdaQueryWrapper<WorkflowCatalogue>().eq(WorkflowCatalogue::getTaskId, id));
        if (catalogue == null) {
            return Result.failed("节点获取失败");
        }
        WorkflowCatalogue root = getRootCatalogueByCatalogue(catalogue);
        if (root == null) {
            return Result.failed("根节点获取失败");
        }
        long projectCode = Long.valueOf(root.getProjectCode());
        ProcessDefinition process = processClient.getProcessDefinitionInfo(projectCode, taskInfo.getName());
        if (process == null) {
            return Result.failed("工作流不存在：" + taskInfo.getName());
        }
        JSONObject entries = processClient.onlineProcessDefinition(projectCode, process, "ONLINE");

        // 设置周期调度，且上线
        if (taskInfo.getSchedulerType() == "CYCLE" && StringUtils.isNotBlank(taskInfo.getCron())) {
            // 创建周期调度
            JSONObject res = processClient.schedulerProcessDefinition(projectCode, process, taskInfo.getCron());
            // 上线周期调度
            if (res != null && res.get("id", Integer.class) != null) {
                processClient.schedulerOnlineProcessDefinition(projectCode, res.get("id", Integer.class));
            } else {
                return Result.failed("工作流上线失败");
            }
            taskInfo.setCronId(res.get("id", Integer.class));
        }

        taskInfo.setStatus(WorkflowLifeCycle.ONLINE.getValue());
        this.updateById(taskInfo);
        return Result.succeed("工作流上线成功");
    }

    @Override
    public Result reOnLineTask(Integer id, String savePointPath) {
        return null;
    }

    @Override
    @Transactional
    public Result offLineTask(Integer id) {
        WorkflowTask taskInfo = getById(id);

        if (StringUtils.isBlank(taskInfo.getGraphData())) {
            return Result.failed("工作流程中缺少节点");
        }

        // 获取根目录
        WorkflowCatalogue catalogue = catalogueService.getOne(new LambdaQueryWrapper<WorkflowCatalogue>().eq(WorkflowCatalogue::getTaskId, id));
        if (catalogue == null) {
            return Result.failed("节点获取失败");
        }
        WorkflowCatalogue root = getRootCatalogueByCatalogue(catalogue);
        if (root == null) {
            return Result.failed("根节点获取失败");
        }
        long projectCode = Long.valueOf(root.getProjectCode());
        ProcessDefinition process = processClient.getProcessDefinitionInfo(projectCode, taskInfo.getName());
        if (process == null) {
            return Result.failed("工作流不存在：" + taskInfo.getName());
        }
        processClient.onlineProcessDefinition(projectCode, process, "OFFLINE");

        // 下线周期调度，且在海豚调度中删除
        if (StringUtils.isNotBlank(taskInfo.getCron()) && taskInfo.getCronId() != null && taskInfo.getCronId() != -1) {
            // 下线周期调度（下线工作流时同时已经下线了周期调度）
//            processClient.schedulerOfflineProcessDefinition(projectCode, taskInfo.getCronId());
            // 删除周期调度
            processClient.deleteSchedulerProcessDefinition(projectCode, process, taskInfo.getCronId());
            taskInfo.setCronId(-1);
        }

        taskInfo.setStatus(WorkflowLifeCycle.OFFLINE.getValue());
        this.updateById(taskInfo);
        return Result.succeed("工作流下线成功");
    }

    @Override
    public synchronized Result getLock(Integer id) {
        WorkflowTask taskInfo = getById(id);
        if (taskInfo == null) {
            return Result.failed("抢锁失败，作业不存在");
        }
        if (taskInfo.getLockUser() != null && !taskInfo.getLockUser().equals("")) {
            return Result.failed("抢锁失败，该作业正被其他用户编辑");
        }

        taskInfo.setLockUser(StpUtil.getLoginIdAsString());
        this.updateById(taskInfo);
        WorkflowTaskDTO taskDTO = new WorkflowTaskDTO();
        try {
            BeanUtils.copyProperties(taskDTO, taskInfo);
            String loginId = StpUtil.getLoginIdAsString();
            if (loginId.equals(taskInfo.getLockUser())) {
                taskDTO.setLockStatus(true);
            } else {
                taskDTO.setLockStatus(false);
            }
        } catch (IllegalAccessException e) {
            e.printStackTrace();
        } catch (InvocationTargetException e) {
            e.printStackTrace();
        }
        return Result.succeed(taskDTO, "抢锁成功");
    }

    @Override
    public synchronized Result releaseLock(Integer id) {
        WorkflowTask taskInfo = getById(id);
        if (taskInfo == null) {
            return Result.failed("解锁失败，作业不存在");
        }
        if (taskInfo.getLockUser() == null && taskInfo.getLockUser().equals("")) {
            return Result.failed("解锁失败，该作业未被加锁");
        }
        String loginId = StpUtil.getLoginIdAsString();
        if (taskInfo.getLockUser() != null && !taskInfo.getLockUser().equals(loginId)) {
            return Result.failed("解锁失败，该作业已被其他用户加锁");
        }
        taskInfo.setLockUser("");
        this.updateById(taskInfo);
        WorkflowTaskDTO taskDTO = new WorkflowTaskDTO();
        try {
            BeanUtils.copyProperties(taskDTO, taskInfo);
            if (loginId.equals(taskInfo.getLockUser())) {
                taskDTO.setLockStatus(true);
            } else {
                taskDTO.setLockStatus(false);
            }
        } catch (IllegalAccessException e) {
            e.printStackTrace();
        } catch (InvocationTargetException e) {
            e.printStackTrace();
        }
        return Result.succeed(taskDTO, "解锁成功");
    }

    @Override
    public Result startTask(Integer id) {
        WorkflowTask taskInfo = getById(id);
        if (taskInfo == null) {
            return Result.failed("启动失败，作业不存在");
        }
        // 获取根目录
        WorkflowCatalogue catalogue = catalogueService.getOne(new LambdaQueryWrapper<WorkflowCatalogue>().eq(WorkflowCatalogue::getTaskId, id));
        if (catalogue == null) {
            return Result.failed("节点获取失败");
        }
        WorkflowCatalogue root = getRootCatalogueByCatalogue(catalogue);
        if (root == null) {
            return Result.failed("根节点获取失败");
        }
        long projectCode = Long.valueOf(root.getProjectCode());
        ProcessDefinition process = processClient.getProcessDefinitionInfo(projectCode, taskInfo.getName());
        if (process == null) {
            return Result.failed("工作流不存在：" + taskInfo.getName());
        }
        processClient.startProcessDefinition(projectCode, process.getCode());
        return Result.succeed("工作流启动成功");
    }

    @Override
    public Result schedulerTask(Integer id, String cron) {
        WorkflowTask taskInfo = getById(id);

        if (StringUtils.isBlank(taskInfo.getGraphData())) {
            return Result.failed("工作流程中缺少节点");
        }

        // 获取根目录
        WorkflowCatalogue catalogue = catalogueService.getOne(new LambdaQueryWrapper<WorkflowCatalogue>().eq(WorkflowCatalogue::getTaskId, id));
        if (catalogue == null) {
            return Result.failed("节点获取失败");
        }
        WorkflowCatalogue root = getRootCatalogueByCatalogue(catalogue);
        if (root == null) {
            return Result.failed("根节点获取失败");
        }
        long projectCode = Long.valueOf(root.getProjectCode());
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

        // 获取根目录
        WorkflowCatalogue catalogue = catalogueService.getOne(new LambdaQueryWrapper<WorkflowCatalogue>().eq(WorkflowCatalogue::getTaskId, id));
        if (catalogue == null) {
            return Result.failed("节点获取失败");
        }
        WorkflowCatalogue root = getRootCatalogueByCatalogue(catalogue);
        if (root == null) {
            return Result.failed("根节点获取失败");
        }
        long projectCode = Long.valueOf(root.getProjectCode());
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

        // 获取根目录
        WorkflowCatalogue catalogue = catalogueService.getOne(new LambdaQueryWrapper<WorkflowCatalogue>().eq(WorkflowCatalogue::getTaskId, id));
        if (catalogue == null) {
            return Result.failed("节点获取失败");
        }
        WorkflowCatalogue root = getRootCatalogueByCatalogue(catalogue);
        if (root == null) {
            return Result.failed("根节点获取失败");
        }
        long projectCode = Long.valueOf(root.getProjectCode());
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

        // 获取根目录
        WorkflowCatalogue catalogue = catalogueService.getOne(new LambdaQueryWrapper<WorkflowCatalogue>().eq(WorkflowCatalogue::getTaskId, id));
        if (catalogue == null) {
            return Result.failed("节点获取失败");
        }
        WorkflowCatalogue root = getRootCatalogueByCatalogue(catalogue);
        if (root == null) {
            return Result.failed("根节点获取失败");
        }
        long projectCode = Long.valueOf(root.getProjectCode());
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

        // 获取根目录
        WorkflowCatalogue catalogue = catalogueService.getOne(new LambdaQueryWrapper<WorkflowCatalogue>().eq(WorkflowCatalogue::getTaskId, id));
        if (catalogue == null) {
            return Result.failed("节点获取失败");
        }
        WorkflowCatalogue root = getRootCatalogueByCatalogue(catalogue);
        if (root == null) {
            return Result.failed("根节点获取失败");
        }
        long projectCode = Long.valueOf(root.getProjectCode());
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

    @Override
    public List<String> previewSchedule(String schedule) {
        CronTriggerImpl cronTriggerImpl = new CronTriggerImpl();
        DateFormat format = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        List<String> dates = new ArrayList<>();
        try {
            cronTriggerImpl.setCronExpression(schedule);
            List<Date> computeFireTimes = TriggerUtils.computeFireTimes(cronTriggerImpl, null, 5);
            computeFireTimes.stream().forEach(x -> {
                dates.add(format.format(x));
            });
        } catch (ParseException e) {
            e.printStackTrace();
        }

        return dates;
    }
}

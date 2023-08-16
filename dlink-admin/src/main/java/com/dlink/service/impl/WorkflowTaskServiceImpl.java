package com.dlink.service.impl;

import cn.dev33.satoken.stp.StpUtil;
import cn.hutool.core.bean.BeanUtil;
import cn.hutool.core.bean.copier.CopyOptions;
import cn.hutool.json.JSONArray;
import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.dlink.assertion.Assert;
import com.dlink.common.result.Result;
import com.dlink.context.TenantContextHolder;
import com.dlink.context.WorkspaceContextHolder;
import com.dlink.db.service.impl.SuperServiceImpl;
import com.dlink.dto.DsSearchCondition;
import com.dlink.dto.WorkflowEdge;
import com.dlink.dto.WorkflowTaskDTO;
import com.dlink.exception.BusException;
import com.dlink.mapper.WorkflowTaskMapper;
import com.dlink.model.*;
import com.dlink.scheduler.client.ProcessClient;
import com.dlink.scheduler.client.TaskClient;
import com.dlink.scheduler.config.DolphinSchedulerProperties;
import com.dlink.scheduler.enums.Flag;
import com.dlink.scheduler.enums.ReleaseState;
import com.dlink.scheduler.model.*;
import com.dlink.service.*;
import com.dlink.utils.CommonUtil;
import com.dlink.utils.SparkUtil;
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
    @Autowired
    private CatalogueService service;
    @Autowired
    private TaskService taskService;
    @Autowired
    private SparkUtil sparkUtil;
    @Autowired
    private WorkspaceService workspaceService;
    @Autowired
    private CommonUtil commonUtil;

    @Override
    public WorkflowTaskDTO getTaskInfoById(Integer id) {
        WorkflowTask task = this.getById(id);
        WorkflowTaskDTO taskDTO = new WorkflowTaskDTO();
        BeanUtil.copyProperties(task, taskDTO, CopyOptions.create(null, true));
        String loginId = StpUtil.getLoginIdAsString();
        if (loginId.equals(task.getLockUser())) {
            taskDTO.setLockStatus(true);
        } else {
            taskDTO.setLockStatus(false);
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
        }
        task.setStatus(WorkflowLifeCycle.CREATE.getValue());
        String graphData = task.getGraphData();
        WorkflowTaskDTO workflowTaskDTO = JSONUtil.toBean(graphData, WorkflowTaskDTO.class);
        if (workflowTaskDTO != null && workflowTaskDTO.getNodes() != null && workflowTaskDTO.getNodes().size() > 0) {
            workflowTaskDTO.getNodes().stream().forEach(x -> {
                String nodeType = x.getNodeType();
                String nodeInfo = x.getNodeInfo();
                String nodeGroup = x.getGroup();
                if ("compute".equals(nodeGroup) && "Spark".equals(nodeType)) {
                    String nodeId = x.getId();

                    Task nodeTask = taskService.getOne(Wrappers.<Task>lambdaQuery().eq(Task::getNodeId, nodeId));
                    if (nodeTask == null) {
                        nodeTask = new Task();
                    }
                    nodeTask.setEnabled(true);
                    Integer tenantId = (Integer) TenantContextHolder.get();
                    nodeTask.setTenantId(tenantId);
                    nodeTask.setName(x.getLabel());
                    nodeTask.setNodeId(nodeId);
                    nodeTask.setDialect(nodeType);
                    nodeTask.setNodeInfo(nodeInfo);
                    taskService.saveOrUpdate(nodeTask);
                }
            });
        }
        this.saveOrUpdate(task);
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
        if (taskInfo.getType().equals("octopus")) {
            taskInfo.setStatus(WorkflowLifeCycle.DEPLOY.getValue());
            this.saveOrUpdate(taskInfo);
            return Result.succeed(taskInfo, "部署成功");
        }
        // 获取海豚调度项目code
        long projectCode = Long.parseLong(commonUtil.getCurrentWorkspace().getProjectCode());
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
            String nodeType = x.getNodeType();
            String nodeInfo = x.getNodeInfo();
            if (nodeType.equals("Spark")) {
                String nodeId = x.getId();
                Task nodeTask = taskService.getOne(Wrappers.<Task>lambdaQuery().eq(Task::getNodeId, nodeId));
                if (nodeTask != null) {
                    dlinkTaskParams.setTaskId(String.valueOf(nodeTask.getId()));
                } else {
                    nodeTask = new Task();
                    nodeTask.setName(x.getLabel());
                    nodeTask.setNodeId(nodeId);
                    nodeTask.setDialect(nodeType);
                    nodeTask.setNodeInfo(nodeInfo);
                    taskService.saveOrUpdate(nodeTask);
                    dlinkTaskParams.setTaskId(String.valueOf(nodeTask.getId()));
                }
            } else {
                JSONObject jsonObject = JSONUtil.parseObj(nodeInfo);
                dlinkTaskParams.setTaskId(jsonObject.getStr("jobId"));
            }
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
            // 每一个节点生成一个或多个relation
            if (filterEdges.size() > 0) {
                filterEdges.stream().forEach(edge -> {
                    ProcessTaskRelation processTaskRelation = new ProcessTaskRelation();
                    Long dependenceCodes = map.get(edge.getSource());
                    processTaskRelation.setPreTaskCode(dependenceCodes);
                    processTaskRelation.setPostTaskCode(map.get(x.getId()));
                    processTaskRelation.setProjectCode(projectCode);
                    taskRelations.add(processTaskRelation);
                });
            } else {
                ProcessTaskRelation processTaskRelation = new ProcessTaskRelation();
                processTaskRelation.setPreTaskCode(0);
                processTaskRelation.setPostTaskCode(map.get(x.getId()));
                processTaskRelation.setProjectCode(projectCode);
                taskRelations.add(processTaskRelation);
            }

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

        if (taskInfo.getType().equals("octopus")) {
            taskInfo.setStatus(WorkflowLifeCycle.ONLINE.getValue());
            this.saveOrUpdate(taskInfo);
            return Result.succeed(taskInfo, "上线成功");
        }

        // 获取海豚调度项目code
        long projectCode = Long.parseLong(commonUtil.getCurrentWorkspace().getProjectCode());
        ProcessDefinition process = processClient.getProcessDefinitionInfo(projectCode, taskInfo.getName());
        if (process == null) {
            return Result.failed("工作流不存在：" + taskInfo.getName());
        }
        processClient.onlineProcessDefinition(projectCode, process, "ONLINE");

        // 设置周期调度，且上线
        if (taskInfo.getSchedulerType().equals("CYCLE") && StringUtils.isNotBlank(taskInfo.getCron())) {
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

        if (taskInfo.getType().equals("octopus")) {
            taskInfo.setStatus(WorkflowLifeCycle.OFFLINE.getValue());
            this.saveOrUpdate(taskInfo);
            return Result.succeed(taskInfo, "下线成功");
        }

        // 获取海豚调度项目code
        long projectCode = Long.parseLong(commonUtil.getCurrentWorkspace().getProjectCode());
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
        BeanUtil.copyProperties(taskInfo, taskDTO, CopyOptions.create(null, true));
        String loginId = StpUtil.getLoginIdAsString();
        if (loginId.equals(taskInfo.getLockUser())) {
            taskDTO.setLockStatus(true);
        } else {
            taskDTO.setLockStatus(false);
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
        BeanUtil.copyProperties(taskInfo, taskDTO, CopyOptions.create(null, true));
        if (loginId.equals(taskInfo.getLockUser())) {
            taskDTO.setLockStatus(true);
        } else {
            taskDTO.setLockStatus(false);
        }
        return Result.succeed(taskDTO, "解锁成功");
    }

    @Override
    public Result startTask(Integer id) {
        WorkflowTask taskInfo = getById(id);
        if (taskInfo == null) {
            return Result.failed("启动失败，作业不存在");
        }
        if (!taskInfo.getStatus().equals(WorkflowLifeCycle.ONLINE.getValue())) {
            return Result.failed("启动失败，作业未上线");
        }
        if (taskInfo.getType().equals("octopus")) {
            Result result = sparkUtil.submitSparkTask(taskInfo);
            return result;
        }
        // 获取海豚调度项目code
        long projectCode = Long.parseLong(commonUtil.getCurrentWorkspace().getProjectCode());
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

        // 获取海豚调度项目code
        long projectCode = Long.parseLong(commonUtil.getCurrentWorkspace().getProjectCode());
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

        // 获取海豚调度项目code
        long projectCode = Long.parseLong(commonUtil.getCurrentWorkspace().getProjectCode());
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

        // 获取海豚调度项目code
        long projectCode = Long.parseLong(commonUtil.getCurrentWorkspace().getProjectCode());
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

        // 获取海豚调度项目code
        long projectCode = Long.parseLong(commonUtil.getCurrentWorkspace().getProjectCode());
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

        // 获取海豚调度项目code
        long projectCode = Long.parseLong(commonUtil.getCurrentWorkspace().getProjectCode());
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

    @Override
    public JSONObject pageFlowInstance(DsSearchCondition condition) {
        JSONObject conditionJSON = JSONUtil.parseObj(condition);
        Workspace currentWorkspace = commonUtil.getCurrentWorkspace();
        conditionJSON.set("projectCode", currentWorkspace.getProjectCode());
        JSONObject jsonObject = processClient.pageFlowInstance(conditionJSON);
        JSONArray totalList = jsonObject.getJSONArray("totalList");
        List<String> taskNames = new ArrayList<>();
        if (totalList != null && totalList.size() > 0) {
            for (JSONObject jo : totalList.jsonIter()) {
                String name = jo.getStr("name");
                String taskName = name.substring(0, name.indexOf("-"));
                taskNames.add(taskName);
            }
        }
        if (taskNames.size() > 0) {
            Map<String, Integer> map = new HashMap<>();
            List<WorkflowTask> workflowTasks = this.list(Wrappers.<WorkflowTask>query().in("name", taskNames));
            for (WorkflowTask task : workflowTasks) {
                map.put(task.getName(), task.getId());
            }
            for (JSONObject jo : totalList.jsonIter()) {
                String name = jo.getStr("name");
                String taskName = name.substring(0, name.indexOf("-"));
                jo.set("workflowId", map.get(taskName));
            }
        }
        return jsonObject;
    }

    @Override
    public JSONObject pageTaskInstance(DsSearchCondition condition) {
        JSONObject conditionJSON = JSONUtil.parseObj(condition);
        Workspace currentWorkspace = commonUtil.getCurrentWorkspace();
        conditionJSON.set("projectCode", currentWorkspace.getProjectCode());
        JSONObject jsonObject = processClient.pageTaskInstance(conditionJSON);
        JSONArray totalList = jsonObject.getJSONArray("totalList");
        if (totalList != null && totalList.size() > 0) {
            List<String> workflowNames = new ArrayList<>();
            for (JSONObject jo : totalList.jsonIter()) {
                JSONObject taskParams = jo.getJSONObject("taskParams");
                if (taskParams != null) {
                    jo.set("taskId", taskParams.getInt("taskId"));
                }
                String processInstanceName = jo.getStr("processInstanceName");
                String workflowName = processInstanceName.substring(0, processInstanceName.indexOf("-"));
                workflowNames.add(workflowName);
            }
            if (workflowNames.size() > 0) {
                Map<String, Integer> map = new HashMap<>();
                List<WorkflowTask> workflowTasks = this.list(Wrappers.<WorkflowTask>query().in("name", workflowNames));
                for (WorkflowTask task : workflowTasks) {
                    map.put(task.getName(), task.getId());
                }
                for (JSONObject jo : totalList.jsonIter()) {
                    String processInstanceName = jo.getStr("processInstanceName");
                    String workflowName = processInstanceName.substring(0, processInstanceName.indexOf("-"));
                    jo.set("workflowId", map.get(workflowName));
                }
            }
        }

        return jsonObject;
    }

    @Override
    public JSONObject getProcessStateCount(DsSearchCondition condition) {
        JSONObject conditionJSON = JSONUtil.parseObj(condition);
        Workspace currentWorkspace = commonUtil.getCurrentWorkspace();
        conditionJSON.set("projectCode", currentWorkspace.getProjectCode());
        JSONObject jsonObject = processClient.getProcessStateCount(conditionJSON);
        return jsonObject;
    }

    @Override
    public JSONObject getTaskStateCount(DsSearchCondition condition) {
        JSONObject conditionJSON = JSONUtil.parseObj(condition);
        Workspace currentWorkspace = commonUtil.getCurrentWorkspace();
        conditionJSON.set("projectCode", currentWorkspace.getProjectCode());
        JSONObject jsonObject = processClient.getTaskStateCount(conditionJSON);
        return jsonObject;
    }

    @Override
    public JSONObject getTaskDefineCount(DsSearchCondition condition) {
        JSONObject conditionJSON = JSONUtil.parseObj(condition);
        Workspace currentWorkspace = commonUtil.getCurrentWorkspace();
        conditionJSON.set("projectCode", currentWorkspace.getProjectCode());
        JSONObject jsonObject = processClient.getTaskDefineCount(conditionJSON);
        return jsonObject;
    }

    @Override
    public JSONObject getTaskLog(Integer taskId) {
        JSONObject taskLog = processClient.getTaskLog(taskId);
        return taskLog;
    }

    @Override
    public JSONObject rerun(DsSearchCondition condition) {
        JSONObject conditionJSON = JSONUtil.parseObj(condition);
        JSONObject rerun = processClient.rerun(conditionJSON);
        return rerun;
    }

    @Override
    public JSONObject stop(DsSearchCondition condition) {
        JSONObject conditionJSON = JSONUtil.parseObj(condition);
        JSONObject stop = processClient.stop(conditionJSON);
        return stop;
    }

    @Override
    public JSONObject pause(DsSearchCondition condition) {
        JSONObject conditionJSON = JSONUtil.parseObj(condition);
        JSONObject pause = processClient.pause(conditionJSON);
        return pause;
    }

    @Override
    public JSONObject suspend(DsSearchCondition condition) {
        JSONObject conditionJSON = JSONUtil.parseObj(condition);
        JSONObject suspend = processClient.suspend(conditionJSON);
        return suspend;
    }

}

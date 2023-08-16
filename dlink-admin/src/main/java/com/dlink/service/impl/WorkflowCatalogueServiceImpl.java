package com.dlink.service.impl;

import cn.dev33.satoken.stp.StpUtil;
import cn.hutool.core.bean.BeanUtil;
import cn.hutool.core.bean.copier.CopyOptions;
import cn.hutool.json.JSONObject;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.dlink.config.Dialect;
import com.dlink.context.WorkspaceContextHolder;
import com.dlink.db.service.impl.SuperServiceImpl;
import com.dlink.dto.CatalogueTaskDTO;
import com.dlink.dto.WorkflowCatalogueTaskDTO;
import com.dlink.dto.WorkflowTaskDTO;
import com.dlink.mapper.WorkflowCatalogueMapper;
import com.dlink.model.*;
import com.dlink.scheduler.client.ProcessClient;
import com.dlink.scheduler.client.ProjectClient;
import com.dlink.scheduler.model.ProcessDefinition;
import com.dlink.scheduler.model.Project;
import com.dlink.scheduler.result.Result;
import com.dlink.service.*;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

import static com.dlink.assertion.Asserts.isNotNull;
import static com.dlink.assertion.Asserts.isNull;

/**
 * WorkflowCatalogueServiceImpl
 *
 * @author cl1226
 * @since 2023/4/20 10:34
 **/
@Service
public class WorkflowCatalogueServiceImpl extends SuperServiceImpl<WorkflowCatalogueMapper, WorkflowCatalogue> implements WorkflowCatalogueService {

    @Autowired
    private WorkflowTaskService taskService;
    @Autowired
    private JobInstanceService jobInstanceService;
    @Autowired
    private ProcessClient processClient;
    @Autowired
    private ProjectClient projectClient;
    @Autowired
    private WorkflowCatalogueService catalogueService;
    @Autowired
    private DataBaseService databaseService;
    @Autowired
    private TaskService taskService2;
    @Autowired
    private AlertHistoryService alertHistoryService;
    @Autowired
    private WorkspaceService workspaceService;
    @Autowired
    private UserService userService;

    @Override
    public List<WorkflowCatalogueDTO> getAllData() {
        List<WorkflowCatalogue> catalogues = this.list();
        List<WorkflowCatalogueDTO> workflowCatalogueDTOS = BeanUtil.copyToList(catalogues, WorkflowCatalogueDTO.class, CopyOptions.create(null, true));
        List<WorkflowTask> tasks = taskService.list();
        for (WorkflowCatalogueDTO catalogue : workflowCatalogueDTOS) {
            if (!catalogue.getIsLeaf()) {
                continue;
            }
            for (WorkflowTask task : tasks) {
                if (catalogue.getTaskId().intValue() == task.getId().intValue()) {
                    String lockUser = task.getLockUser();
                    String loginId = StpUtil.getLoginIdAsString();
                    if (lockUser.equals(loginId)) {
                        catalogue.setLockInfo("我锁定");
                        break;
                    }
                    User user = userService.getById(lockUser);
                    if (user != null) {
                        catalogue.setLockInfo(user.getNickname() + "锁定");
                    }
                    break;
                }
            }
        }
        return workflowCatalogueDTOS;
    }

    @Override
    public List<WorkflowCatalogue> getAllRootData() {
        return this.list(Wrappers.<WorkflowCatalogue>query().eq("parent_id", 0));
    }

    @Override
    public WorkflowCatalogue findByParentIdAndName(Integer parentId, String name) {
        return baseMapper.selectOne(Wrappers.<WorkflowCatalogue>query().eq("parent_id", parentId).eq("name", name));
    }

    @Transactional(rollbackFor = Exception.class)
    @Override
    public boolean createCatalogue(WorkflowCatalogue catalogue) {
        boolean b = this.saveOrUpdate(catalogue);
        return b;
    }

    @Transactional(rollbackFor = Exception.class)
    @Override
    public WorkflowCatalogue createCatalogueAndTask(WorkflowCatalogueTaskDTO catalogueTaskDTO) {
        WorkflowTask task = new WorkflowTask();
        task.setName(catalogueTaskDTO.getName());
        task.setAlias(catalogueTaskDTO.getAlias());
        task.setSchedulerType("SINGLE");
        task.setStatus("CREATE");
        task.setType(catalogueTaskDTO.getType());
        taskService.saveOrUpdateTask(task);
        // 新建之后默认抢锁
        taskService.getLock(task.getId());
        WorkflowCatalogue catalogue = new WorkflowCatalogue();
        catalogue.setTenantId(catalogueTaskDTO.getTenantId());
        catalogue.setName(catalogueTaskDTO.getName());
        catalogue.setIsLeaf(true);
        catalogue.setTaskId(task.getId());
        catalogue.setType(catalogueTaskDTO.getType());
        catalogue.setParentId(catalogueTaskDTO.getParentId());
        this.save(catalogue);
        return catalogue;
    }

    @Override
    public WorkflowCatalogue createCatalogAndFileTask(CatalogueTaskDTO catalogueTaskDTO, String ment) {
        return null;
    }

    @Override
    public boolean toRename(WorkflowCatalogue catalogue) {
        return this.createCatalogue(catalogue);
    }

    @Override
    public List<String> removeCatalogueAndTaskById(Integer id) {
        List<String> errors = new ArrayList<>();
        WorkflowCatalogue catalogue = this.getById(id);
        if (isNull(catalogue)) {
            errors.add(id + "不存在！");
        } else {
            if (isNotNull(catalogue.getTaskId())) {
                Integer taskId = catalogue.getTaskId();
                WorkflowTaskDTO taskInfo = taskService.getTaskInfoById(taskId);
                if (taskInfo.getStatus().equals(WorkflowLifeCycle.ONLINE.getValue())) {
                    errors.add(taskInfo.getName());
                } else {
                    // 删除作业同时将海豚调度上的任务删除
                    this.removeWorkflowInDSByTaskId(catalogue.getTaskId());
                    this.removeById(id);
                }
            } else {
                long count = catalogueService.count(new LambdaQueryWrapper<WorkflowCatalogue>().eq(WorkflowCatalogue::getParentId, catalogue.getId()));
                if (count > 0) {
                    errors.add("该目录下存在子目录或者作业，不允许删除");
                } else {
                    List<WorkflowCatalogueDTO> catalogueDTOS = this.getAllData();
                    List<WorkflowCatalogue> all = BeanUtil.copyToList(catalogueDTOS, WorkflowCatalogue.class, CopyOptions.create(null, true));
                    Set<WorkflowCatalogue> del = new HashSet<>();
                    this.findAllCatalogueInDir(id, all, del);
                    List<String> actives = this.analysisActiveCatalogues(del);
                    if (actives.isEmpty()) {
                        for (WorkflowCatalogue c : del) {
                            // 删除作业同时将海豚调度上的任务删除
                            if (c.getTaskId() != null) {
                                this.removeWorkflowInDSByTaskId(c.getTaskId());
                            }
                            this.removeById(id);
                            this.removeById(c.getId());
                        }
                    } else {
                        errors.addAll(actives);
                    }
                }
            }
        }

        return errors;
    }

    private WorkflowCatalogue getRootCatalogueByCatalogue(WorkflowCatalogue catalogue) {
        if (catalogue.getParentId() != null && catalogue.getParentId() > 0) {
            catalogue = catalogueService.getById(catalogue.getParentId());
            return getRootCatalogueByCatalogue(catalogue);
        }
        return catalogue;
    }

    private void removeWorkflowInDSByTaskId(Integer taskId) {
        WorkflowTaskDTO taskInfo = taskService.getTaskInfoById(taskId);
        if (taskInfo != null) {
            // 获取海豚调度项目code
            Integer workspaceId = (Integer) WorkspaceContextHolder.get();
            Workspace workspace = workspaceService.getById(workspaceId);
            long projectCode = Long.parseLong(workspace.getProjectCode());
            ProcessDefinition process = processClient.getProcessDefinitionInfo(projectCode, taskInfo.getName());
            if (process != null) {
                processClient.deleteProcessDefinition(projectCode, process.getCode());
            }
            // 删除成功后再删除任务
            taskService.removeById(taskId);
        }
    }

    private List<String> analysisActiveCatalogues(Set<WorkflowCatalogue> del) {
        List<WorkflowCatalogue> activeCatalogue = del.stream()
                .filter(catalogue -> catalogue.getTaskId() != null)
                .collect(Collectors.toList());
        List<String> result = new ArrayList<>();
        for (WorkflowCatalogue catalogue : activeCatalogue) {
            WorkflowTask workflowTask = taskService.getById(catalogue.getTaskId());
            if (workflowTask.getStatus().equals(WorkflowLifeCycle.ONLINE.getValue())) {
                result.add(workflowTask.getName());
            }
        }
        return result;
    }

    private void findAllCatalogueInDir(Integer id, List<WorkflowCatalogue> all, Set<WorkflowCatalogue> del) {
        List<WorkflowCatalogue> relatedList =
                all.stream().filter(catalogue -> id.equals(catalogue.getId()) || id.equals(catalogue.getParentId()))
                        .collect(Collectors.toList());
        relatedList.forEach(catalogue -> {
            if (id.intValue() != catalogue.getId().intValue()) {
                findAllCatalogueInDir(catalogue.getId(), all, del);
            }
        });
        del.addAll(relatedList);
    }

    @Override
    public boolean moveCatalogue(Integer id, Integer parentId) {
        return false;
    }

    @Override
    public boolean copyTask(WorkflowCatalogue catalogue) {
        return false;
    }

    @Override
    public Integer addDependCatalogue(String[] catalogueNames) {
        return null;
    }

    @Override
    public JSONObject dataStatistics(String key) {
        if ("develop".equals(key)) {
            long sourceNum = databaseService.count();
            long jobNum = taskService2.count();
            long flowNum = taskService.count();
            JSONObject json = new JSONObject();
            json.set("sourceNum", sourceNum);
            json.set("jobNum", jobNum);
            json.set("flowNum", flowNum);
            return json;
        } else if ("devops".equals(key)) {
            JobInstanceStatus jobInstanceStatus = jobInstanceService.getStatusCount(false);
            long finished = jobInstanceStatus.getFinished();
            long failed = jobInstanceStatus.getFailed();
            long processing = jobInstanceStatus.getRunning();
            JSONObject json = new JSONObject();
            json.set("finished", finished);
            json.set("failed", failed);
            json.set("processing", processing);
            return json;
        } else if ("alert".equals(key)) {
            long success = alertHistoryService.count(new LambdaQueryWrapper<AlertHistory>().eq(AlertHistory::getStatus, 1));
            long fail = alertHistoryService.count(new LambdaQueryWrapper<AlertHistory>().eq(AlertHistory::getStatus, 2));
            JSONObject json = new JSONObject();
            json.set("success", success);
            json.set("fail", fail);
            return json;
        } else {
            return new JSONObject();
        }
    }

    @Override
    public List<JSONObject> getTaskEnum(String type) {

        List<JSONObject> list3 = new ArrayList<>();
        list3.add(new JSONObject().set("label", "数据质量").set("type", "Quality").set("group", "quality"));

//        JSONObject jsonObject5 = new JSONObject();
//        jsonObject5.set("key", "data quality");
//        jsonObject5.set("title", "数据稽核");
//        jsonObject5.set("order", "5");
//        jsonObject5.set("res", list3);
//        result.add(jsonObject5);

        if (StringUtils.isNotBlank(type) && "dinky".equals(type)) {
            List<JSONObject> list2 = new ArrayList<>();
            list2.add(new JSONObject().set("label", "SHELL").set("type", "Shell").set("group", "compute"));
            list2.add(new JSONObject().set("label", "FlinkSQL").set("type", "FlinkSQL").set("group", "compute"));
            list2.add(new JSONObject().set("label", "HiveSQL").set("type", "Hive").set("group", "compute"));
            list2.add(new JSONObject().set("label", "StarRocks").set("type", "StarRocks").set("group", "compute"));
            list2.add(new JSONObject().set("label", "Spark").set("type", "Spark").set("group", "compute"));
            List<JSONObject> res = new ArrayList<>();
            JSONObject jsonObject4 = new JSONObject();
            jsonObject4.set("key", "data compute");
            jsonObject4.set("title", "数据集成");
            jsonObject4.set("order", "1");
            jsonObject4.set("res", list2);
            res.add(jsonObject4);
            return res;
        } else {
            List<JSONObject> inputs = new ArrayList<>();
            inputs.add(new JSONObject().set("label", "FTP").set("type", "Ftp").set("group", "input"));
            inputs.add(new JSONObject().set("label", "File").set("type", "File").set("group", "input"));
            inputs.add(new JSONObject().set("label", "Hive").set("type", "Hive").set("group", "input"));
            inputs.add(new JSONObject().set("label", "HDFS").set("type", "HDFS").set("group", "input"));
            inputs.add(new JSONObject().set("label", "Mysql").set("type", "Mysql").set("group", "input"));
            inputs.add(new JSONObject().set("label", "Sqlserver").set("type", "Sqlserver").set("group", "input"));
            inputs.add(new JSONObject().set("label", "InfluxDB").set("type", "InfluxDB").set("group", "input"));
            inputs.add(new JSONObject().set("label", "Kafka").set("type", "Kafka").set("group", "input"));

            List<JSONObject> transforms = new ArrayList<>();
            transforms.add(new JSONObject().set("label", "过滤").set("type", "Filter").set("group", "transform"));
            transforms.add(new JSONObject().set("label", "Join").set("type", "Join").set("group", "transform"));
            transforms.add(new JSONObject().set("label", "重分区").set("type", "Repartition").set("group", "transform"));
            transforms.add(new JSONObject().set("label", "加列").set("type", "AddColumn").set("group", "transform"));

            List<JSONObject> outputs = new ArrayList<>();
            outputs.add(new JSONObject().set("label", "Console").set("type", "Console").set("group", "output"));
            outputs.add(new JSONObject().set("label", "Mysql").set("type", "Mysql").set("group", "output"));
            outputs.add(new JSONObject().set("label", "Hive").set("type", "Hive").set("group", "output"));
            outputs.add(new JSONObject().set("label", "StarRocks").set("type", "StarRocks").set("group", "output"));

            List<JSONObject> result = new ArrayList<>();
            JSONObject jsonObject1 = new JSONObject();
            jsonObject1.set("key", "input");
            jsonObject1.set("title", "输入");
            jsonObject1.set("order", "1");
            jsonObject1.set("res", inputs);
            result.add(jsonObject1);

            JSONObject jsonObject2 = new JSONObject();
            jsonObject2.set("key", "transform");
            jsonObject2.set("title", "转换");
            jsonObject2.set("order", "2");
            jsonObject2.set("res", transforms);
            result.add(jsonObject2);

            JSONObject jsonObject3 = new JSONObject();
            jsonObject3.set("key", "output");
            jsonObject3.set("title", "输出");
            jsonObject3.set("order", "3");
            jsonObject3.set("res", outputs);
            result.add(jsonObject3);
            return result;
        }
    }
}

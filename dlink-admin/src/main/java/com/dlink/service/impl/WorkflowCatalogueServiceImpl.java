package com.dlink.service.impl;

import cn.hutool.json.JSONObject;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.dlink.config.Dialect;
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

    @Override
    public List<WorkflowCatalogue> getAllData() {
        return this.list();
    }

    @Override
    public WorkflowCatalogue findByParentIdAndName(Integer parentId, String name) {
        return baseMapper.selectOne(Wrappers.<WorkflowCatalogue>query().eq("parent_id", parentId).eq("name", name));
    }

    @Transactional(rollbackFor = Exception.class)
    @Override
    public boolean createCatalogue(WorkflowCatalogue catalogue) {
        // 创建dolphinscheduler的项目, 只有根目录才会去创建项目
        if (catalogue.getParentId() == null || catalogue.getParentId() == 0) {
            Project project = null;
            if (StringUtils.isBlank(catalogue.getProjectCode())) {
                project = projectClient.createProjectByName(catalogue.getName());
            } else {
                project = projectClient.updateProjectByName(catalogue.getProjectCode(), catalogue.getName());
            }
            if (project != null) {
                catalogue.setProjectCode(String.valueOf(project.getCode()));
                this.saveOrUpdate(catalogue);
                return true;
            }
        } else {
            catalogue.setProjectCode("");
            this.saveOrUpdate(catalogue);
            return true;
        }
        return false;
    }

    @Transactional(rollbackFor = Exception.class)
    @Override
    public WorkflowCatalogue createCatalogueAndTask(WorkflowCatalogueTaskDTO catalogueTaskDTO) {
        WorkflowTask task = new WorkflowTask();
        task.setName(catalogueTaskDTO.getName());
        task.setAlias(catalogueTaskDTO.getAlias());
        task.setSchedulerType("SINGLE");
        task.setStatus("CREATE");
        taskService.saveOrUpdateTask(task);
        WorkflowCatalogue catalogue = new WorkflowCatalogue();
        catalogue.setTenantId(catalogueTaskDTO.getTenantId());
        catalogue.setName(catalogueTaskDTO.getName());
        catalogue.setIsLeaf(true);
        catalogue.setTaskId(task.getId());
        catalogue.setParentId(catalogueTaskDTO.getParentId());
        catalogue.setProjectCode("");
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
                    List<WorkflowCatalogue> all = this.getAllData();
                    Set<WorkflowCatalogue> del = new HashSet<>();
                    this.findAllCatalogueInDir(id, all, del);
                    List<String> actives = this.analysisActiveCatalogues(del);
                    if (actives.isEmpty()) {
                        for (WorkflowCatalogue c : del) {
                            // 删除作业同时将海豚调度上的任务删除
                            if (c.getTaskId() != null) {
                                this.removeWorkflowInDSByTaskId(c.getTaskId());
                            }

                            if (StringUtils.isNotBlank(catalogue.getProjectCode())) {
                                // 删除dolphinscheduler的项目
                                Result<JSONObject> result = projectClient.deleteProjectByCode(catalogue.getProjectCode());
                                if (result.getSuccess()) {
                                    this.removeById(id);
                                }
                            } else {
                                this.removeById(id);
                            }
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
            // 获取根目录
            WorkflowCatalogue catalogue = catalogueService.getOne(new LambdaQueryWrapper<WorkflowCatalogue>().eq(WorkflowCatalogue::getTaskId, taskId));
            WorkflowCatalogue root = getRootCatalogueByCatalogue(catalogue);
            long projectCode = Long.valueOf(root.getProjectCode());
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
            if (id != catalogue.getId()) {
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
    public LinkedList<JSONObject> getTaskEnum() {
        LinkedList<String> list1 = new LinkedList<>();
        list1.add("FlinkSql");
        list1.add("FlinkJar");

        LinkedList<String> list2 = new LinkedList<>();
        list2.add("FlinkSql");
        list2.add("Hive");
        list2.add("Mysql");
        list2.add("Sqlserver");
        list2.add("StarRocks");
        list2.add("ClickHouse");
        list2.add("Doris");
        list2.add("Presto");
        list2.add("Sql");

        LinkedList<String> list3 = new LinkedList<>();
        list3.add("Data Quality");
        LinkedList<String> list4 = new LinkedList<>();
        list4.add("Python");

        LinkedList<JSONObject> result = new LinkedList<>();
        JSONObject jsonObject1 = new JSONObject();
        jsonObject1.set("key", "data integration");
        jsonObject1.set("title", "数据集成");
        jsonObject1.set("order", "1");
        jsonObject1.set("res", list1);
        result.add(jsonObject1);

        JSONObject jsonObject2 = new JSONObject();
        jsonObject2.set("key", "data compute");
        jsonObject2.set("title", "计算&分析");
        jsonObject2.set("order", "2");
        jsonObject2.set("res", list2);
        result.add(jsonObject2);

        JSONObject jsonObject3 = new JSONObject();
        jsonObject3.set("key", "data quality");
        jsonObject3.set("title", "数据监控");
        jsonObject3.set("order", "3");
        jsonObject3.set("res", list3);
        result.add(jsonObject3);

        JSONObject jsonObject4 = new JSONObject();
        jsonObject4.set("key", "other");
        jsonObject4.set("title", "其他");
        jsonObject4.set("order", "4");
        jsonObject4.set("res", list4);
        result.add(jsonObject4);

        return result;
    }
}

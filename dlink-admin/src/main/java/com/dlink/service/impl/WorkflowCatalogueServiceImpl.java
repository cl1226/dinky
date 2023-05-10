package com.dlink.service.impl;

import cn.hutool.json.JSON;
import cn.hutool.json.JSONObject;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.dlink.db.service.impl.SuperServiceImpl;
import com.dlink.dto.CatalogueTaskDTO;
import com.dlink.dto.WorkflowCatalogueTaskDTO;
import com.dlink.dto.WorkflowTaskDTO;
import com.dlink.init.SystemInit;
import com.dlink.mapper.WorkflowCatalogueMapper;
import com.dlink.model.*;
import com.dlink.scheduler.client.ProcessClient;
import com.dlink.scheduler.client.ProjectClient;
import com.dlink.scheduler.model.ProcessDefinition;
import com.dlink.scheduler.model.Project;
import com.dlink.scheduler.result.Result;
import com.dlink.service.JobInstanceService;
import com.dlink.service.WorkflowCatalogueService;
import com.dlink.service.WorkflowTaskService;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
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
        catalogue.setName(catalogueTaskDTO.getAlias());
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
                    taskService.removeById(taskId);
                    if (StringUtils.isNotBlank(catalogue.getProjectCode())) {
                        // 删除dolphinscheduler的项目
                        Result<JSONObject> result = projectClient.deleteProjectByCode(catalogue.getProjectCode());
                        if (result.getSuccess()) {
                            this.removeById(id);
                        }
                    } else {
                        this.removeById(id);
                    }
                }
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
                            taskService.removeById(c.getTaskId());
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
                // 先下线
//                processClient.onlineProcessDefinition(projectCode, process, "OFFLINE");
                // 再删除
                processClient.deleteProcessDefinition(projectCode, process.getCode());
            }
        }
    }

    private List<String> analysisActiveCatalogues(Set<WorkflowCatalogue> del) {
        List<WorkflowCatalogue> activeCatalogue = del.stream()
                .filter(catalogue -> catalogue.getTaskId() != null)
                .collect(Collectors.toList());
        List<String> result = new ArrayList<>();
        for (WorkflowCatalogue catalogue : activeCatalogue) {
            WorkflowTask workflowTask = taskService.getById(catalogue.getTaskId());
            if (workflowTask.getStatus().equals(WorkflowLifeCycle.ONLINE)) {
                result.add(workflowTask.getName());
            }
        }
        return result;
    }

    private void findAllCatalogueInDir(Integer id, List<WorkflowCatalogue> all, Set<WorkflowCatalogue> del) {
        List<WorkflowCatalogue> relatedList =
                all.stream().filter(catalogue -> id.equals(catalogue.getId()) || id.equals(catalogue.getParentId()))
                        .collect(Collectors.toList());
        List<WorkflowCatalogue> subDirCatalogue =
                relatedList.stream().filter(catalogue -> catalogue.getType() == null).collect(Collectors.toList());
        subDirCatalogue.forEach(catalogue -> {
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
}

package com.dlink.service.impl;

import cn.hutool.json.JSON;
import cn.hutool.json.JSONObject;
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
        if (catalogue.getParentId() == null) {
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
                JobInstance job = jobInstanceService.getJobInstanceByTaskId(taskId);
                if (job == null
                        || (JobStatus.FINISHED.getValue().equals(job.getStatus())
                        || JobStatus.FAILED.getValue().equals(job.getStatus())
                        || JobStatus.CANCELED.getValue().equals(job.getStatus())
                        || JobStatus.UNKNOWN.getValue().equals(job.getStatus()))) {
                    // 删除作业同时将海豚调度上线的任务删除
                    this.removeWorkflowInDSByTaskId(catalogue.getTaskId());
                    taskService.removeById(taskId);
                    if (StringUtils.isNotBlank(catalogue.getProjectCode())) {
                        // 删除dolphinscheduler的项目
                        JSONObject result = projectClient.deleteProjectByName(catalogue.getProjectCode());
                        if (result.getBool("success")) {
                            this.removeById(id);
                        }
                    } else {
                        this.removeById(id);
                    }
                } else {
                    errors.add(job.getName());
                }
            } else {
                List<WorkflowCatalogue> all = this.getAllData();
                Set<WorkflowCatalogue> del = new HashSet<>();
                this.findAllCatalogueInDir(id, all, del);
                List<String> actives = this.analysisActiveCatalogues(del);
                if (actives.isEmpty()) {
                    for (WorkflowCatalogue c : del) {
                        // 删除作业同时将海豚调度上线的任务删除
                        this.removeWorkflowInDSByTaskId(c.getTaskId());
                        taskService.removeById(c.getTaskId());
                        this.removeById(c.getId());
                    }
                } else {
                    errors.addAll(actives);
                }
            }
        }

        return errors;
    }

    private void removeWorkflowInDSByTaskId(Integer taskId) {
        WorkflowTaskDTO taskInfo = taskService.getTaskInfoById(taskId);
        if (taskInfo != null) {
            Project dinkyProject = SystemInit.getProject();
            long projectCode = dinkyProject.getCode();
            ProcessDefinition process = processClient.getProcessDefinitionInfo(projectCode, taskInfo.getName());
            if (process != null) {
                // 先下线
                processClient.onlineProcessDefinition(projectCode, process, "OFFLINE");
                // 再删除
                processClient.deleteProcessDefinition(projectCode, process.getCode());
            }
        }
    }

    private List<String> analysisActiveCatalogues(Set<WorkflowCatalogue> del) {
        List<Integer> actives = jobInstanceService.listJobInstanceActive().stream().map(JobInstance::getTaskId)
                .collect(Collectors.toList());
        List<WorkflowCatalogue> activeCatalogue = del.stream()
                .filter(catalogue -> catalogue.getTaskId() != null && actives.contains(catalogue.getTaskId()))
                .collect(Collectors.toList());
        return activeCatalogue.stream().map(catalogue -> taskService.getById(catalogue.getTaskId()).getName())
                .collect(Collectors.toList());
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

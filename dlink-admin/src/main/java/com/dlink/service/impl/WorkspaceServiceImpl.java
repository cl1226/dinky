package com.dlink.service.impl;

import cn.dev33.satoken.stp.StpUtil;
import cn.hutool.core.bean.BeanUtil;
import cn.hutool.core.bean.copier.CopyOptions;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.dlink.common.result.Result;
import com.dlink.db.service.impl.SuperServiceImpl;
import com.dlink.dto.UserDTO;
import com.dlink.dto.WorkspaceDTO;
import com.dlink.dto.WorkspaceUserDTO;
import com.dlink.mapper.WorkspaceMapper;
import com.dlink.model.HadoopClient;
import com.dlink.model.HadoopCluster;
import com.dlink.model.User;
import com.dlink.model.Workspace;
import com.dlink.scheduler.client.ProjectClient;
import com.dlink.scheduler.model.ProcessDefinition;
import com.dlink.scheduler.model.Project;
import com.dlink.service.HadoopClusterService;
import com.dlink.service.UserService;
import com.dlink.service.WorkspaceService;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * WorkspaceServiceImpl
 *
 * @author cl1226
 * @since 2023/7/31 14:41
 **/
@Service
public class WorkspaceServiceImpl extends SuperServiceImpl<WorkspaceMapper, Workspace> implements WorkspaceService {

    @Autowired
    private HadoopClusterService hadoopClusterService;
    @Autowired
    private UserService userService;
    @Autowired
    private ProjectClient projectClient;

    @Override
    public Result listAll(Integer clusterId) {
        List<Workspace> workspaces = this.list(Wrappers.<Workspace>lambdaQuery().eq(Workspace::getClusterId, clusterId));
        List<WorkspaceDTO> workspaceDTOS = new ArrayList<>();
        for (Workspace workspace : workspaces) {
            WorkspaceDTO workspaceDTO = new WorkspaceDTO();
            BeanUtil.copyProperties(workspace, workspaceDTO, CopyOptions.create(null, true));
            if (StringUtils.isNotBlank(workspace.getUserIds())) {
                List<String> userIds = Arrays.stream(workspace.getUserIds().split(",")).collect(Collectors.toList());
                List<UserDTO> userDTOS = hadoopClusterService.listBindUser(clusterId);
                Stream<WorkspaceUserDTO> workspaceUserDTOStream = userDTOS.stream()
                        .filter(u -> userIds.contains(String.valueOf(u.getUser().getId())))
                        .map(user -> {
                            WorkspaceUserDTO workspaceUserDTO = new WorkspaceUserDTO();
                            BeanUtil.copyProperties(user.getUser(), workspaceUserDTO, CopyOptions.create(null, true));
                            workspaceUserDTO.setLabel(user.getUser().getUsername() + " " + user.getUser().getNickname());
                            workspaceUserDTO.setRoleList(user.getRoleList());
                            workspaceUserDTO.setValue(user.getUser().getId());
                            return workspaceUserDTO;
                        });
                workspaceDTO.setUsers(workspaceUserDTOStream.collect(Collectors.toList()));
            }
            workspaceDTOS.add(workspaceDTO);
        }
        return Result.succeed(workspaceDTOS, "获取成功");
    }

    @Override
    public Result listByUser(Integer clusterId) {
        LambdaQueryWrapper<Workspace> wrapper = Wrappers.<Workspace>lambdaQuery()
                .eq(Workspace::getClusterId, clusterId);
        List<Workspace> workspaces = this.list(wrapper);
        int userId = StpUtil.getLoginIdAsInt();
        Stream<Workspace> filterWS = workspaces.stream()
                .filter(w -> Arrays.stream(w.getUserIds().split(",")).collect(Collectors.toList()).contains(String.valueOf(userId)));
        return Result.succeed(filterWS, "获取成功");
    }

    @Override
    public Result addOrUpdate(WorkspaceDTO workspace) {
        Workspace ws = new Workspace();
        BeanUtil.copyProperties(workspace, ws, CopyOptions.create(null, true));
        HadoopCluster cluster = hadoopClusterService.getById(workspace.getClusterId());
        if (cluster == null) {
            return Result.failed("缺少集群信息");
        }
        if (cluster != null) {
            ws.setClusterName(cluster.getName());
        }
        Stream<String> userIdStream = workspace.getUsers().stream().map(u -> u.getId()).map(String::valueOf);
        ws.setUserIds(userIdStream.collect(Collectors.joining(",")));
        // 对应海豚调度的项目
        Project project = null;
        if (StringUtils.isNotBlank(workspace.getProjectCode())) {
            project = projectClient.updateProjectByName(workspace.getProjectCode(), workspace.getName());
        } else {
            project = projectClient.createProjectByName(workspace.getName());
        }
        if (project != null) {
            ws.setProjectCode(String.valueOf(project.getCode()));
        }
        this.saveOrUpdate(ws);
        return Result.succeed(ws, "保存成功");
    }

    @Override
    public Result remove(Integer workspaceId) {
        Workspace workspace = this.getById(workspaceId);
        if (workspace != null) {
            projectClient.deleteProjectByCode(String.valueOf(workspace.getProjectCode()));
        }
        this.removeById(workspaceId);
        return Result.succeed("删除成功");
    }
}

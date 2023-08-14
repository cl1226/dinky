package com.dlink.utils;

import com.dlink.context.ClusterContextHolder;
import com.dlink.context.WorkspaceContextHolder;
import com.dlink.model.HadoopCluster;
import com.dlink.model.Workspace;
import com.dlink.service.HadoopClusterService;
import com.dlink.service.WorkspaceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * CommonUtil
 *
 * @author cl1226
 * @since 2023/8/8 10:09
 **/
@Component
public class CommonUtil {

    @Autowired
    private HadoopClusterService hadoopClusterService;

    @Autowired
    private WorkspaceService workspaceService;

    public HadoopCluster getCurrentCluster() {
        Integer clusterId = (Integer) ClusterContextHolder.get();
        return hadoopClusterService.getById(clusterId);
    }

    public Workspace getCurrentWorkspace() {
        Integer workspaceId = (Integer) WorkspaceContextHolder.get();
        return workspaceService.getById(workspaceId);
    }

}

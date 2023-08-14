package com.dlink.service;

import com.dlink.common.result.Result;
import com.dlink.db.service.ISuperService;
import com.dlink.dto.WorkspaceDTO;
import com.dlink.model.Workspace;

/**
 * WorkspaceService
 *
 * @author cl1226
 * @since 2023/7/31 14:40
 **/
public interface WorkspaceService extends ISuperService<Workspace> {

    Result listAll(Integer clusterId);

    Result listByUser(Integer clusterId);

    Result addOrUpdate(WorkspaceDTO workspace);

    Result remove(Integer workspaceId);

}

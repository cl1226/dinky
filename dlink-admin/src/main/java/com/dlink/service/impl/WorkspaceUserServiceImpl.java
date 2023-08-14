package com.dlink.service.impl;

import com.dlink.db.service.impl.SuperServiceImpl;
import com.dlink.mapper.WorkspaceUserMapper;
import com.dlink.model.WorkspaceUser;
import com.dlink.service.WorkspaceUserService;
import org.springframework.stereotype.Service;

/**
 * WorkspaceUserServiceImpl
 *
 * @author cl1226
 * @since 2023/7/31 14:41
 **/
@Service
public class WorkspaceUserServiceImpl extends SuperServiceImpl<WorkspaceUserMapper, WorkspaceUser> implements WorkspaceUserService {
}

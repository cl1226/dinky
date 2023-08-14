package com.dlink.service.impl;

import com.dlink.db.service.impl.SuperServiceImpl;
import com.dlink.mapper.ClusterUserRoleMapper;
import com.dlink.model.ClusterUserRole;
import com.dlink.service.ClusterUserRoleService;
import org.springframework.stereotype.Service;

/**
 * ClusterUserRoleServiceImpl
 *
 * @author cl1226
 * @since 2023/8/2 16:40
 **/
@Service
public class ClusterUserRoleServiceImpl extends SuperServiceImpl<ClusterUserRoleMapper, ClusterUserRole> implements ClusterUserRoleService {
}

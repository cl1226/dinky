package com.dlink.service.impl;

import com.dlink.db.service.impl.SuperServiceImpl;
import com.dlink.mapper.ClusterUserMapper;
import com.dlink.model.ClusterUser;
import com.dlink.service.ClusterUserService;
import org.springframework.stereotype.Service;

/**
 * ClusterUserServiceImpl
 *
 * @author cl1226
 * @since 2023/8/2 16:29
 **/
@Service
public class ClusterUserServiceImpl extends SuperServiceImpl<ClusterUserMapper, ClusterUser> implements ClusterUserService {
}

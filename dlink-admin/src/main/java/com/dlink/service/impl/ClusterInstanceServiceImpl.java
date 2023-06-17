package com.dlink.service.impl;

import com.dlink.db.service.impl.SuperServiceImpl;
import com.dlink.mapper.ClusterInstanceMapper;
import com.dlink.model.ClusterInstance;
import com.dlink.service.ClusterInstanceService;
import org.springframework.stereotype.Service;

/**
 * ClusterInstanceServiceImpl
 *
 * @author cl1226
 * @since 2023/6/15 15:25
 **/
@Service
public class ClusterInstanceServiceImpl extends SuperServiceImpl<ClusterInstanceMapper, ClusterInstance> implements ClusterInstanceService {
}

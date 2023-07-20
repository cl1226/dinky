package com.dlink.service.impl;

import com.dlink.db.service.impl.SuperServiceImpl;
import com.dlink.mapper.JarTaskMapper;
import com.dlink.model.JarTask;
import com.dlink.service.JarTaskService;
import org.springframework.stereotype.Service;

/**
 * JarTaskServiceImpl
 *
 * @author cl1226
 * @since 2023/7/10 16:27
 **/
@Service
public class JarTaskServiceImpl extends SuperServiceImpl<JarTaskMapper, JarTask> implements JarTaskService {
}

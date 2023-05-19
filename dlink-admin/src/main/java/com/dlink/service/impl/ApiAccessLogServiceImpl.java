package com.dlink.service.impl;

import com.dlink.db.service.impl.SuperServiceImpl;
import com.dlink.mapper.ApiAccessLogMapper;
import com.dlink.model.ApiAccessLog;
import com.dlink.service.ApiAccessLogService;
import org.springframework.stereotype.Service;

/**
 * ApiAccessLogServiceImpl
 *
 * @author cl1226
 * @since 2023/5/19 13:22
 **/
@Service
public class ApiAccessLogServiceImpl extends SuperServiceImpl<ApiAccessLogMapper, ApiAccessLog> implements ApiAccessLogService {
}

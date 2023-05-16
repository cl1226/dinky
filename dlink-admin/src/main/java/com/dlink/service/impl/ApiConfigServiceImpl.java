package com.dlink.service.impl;

import com.dlink.db.service.impl.SuperServiceImpl;
import com.dlink.mapper.ApiConfigMapper;
import com.dlink.model.ApiConfig;
import com.dlink.service.ApiConfigService;
import org.springframework.stereotype.Service;

/**
 * ApiConfigServiceImpl
 *
 * @author cl1226
 * @since 2023/5/16 8:16
 **/
@Service
public class ApiConfigServiceImpl extends SuperServiceImpl<ApiConfigMapper, ApiConfig> implements ApiConfigService {
}

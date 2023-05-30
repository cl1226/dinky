package com.dlink.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.dlink.common.result.Result;
import com.dlink.db.service.ISuperService;
import com.dlink.dto.SearchCondition;
import com.dlink.model.ApiConfig;
import com.dlink.model.AppConfig;
import com.dlink.model.AppToken;

/**
 * AppConfigService
 *
 * @author cl1226
 * @since 2023/5/18 16:40
 **/
public interface AppConfigService extends ISuperService<AppConfig> {

    Page<AppConfig> page(SearchCondition searchCondition);

    AppConfig getDetailById(Integer id);

    Page<ApiConfig> searchApiConfigByCondition(SearchCondition searchCondition);

    Result unbind(SearchCondition searchCondition);

    AppConfig add(AppConfig appConfig);

    AppToken generateToken(Integer appId, String secret);

    Integer verifyToken(String token);

}

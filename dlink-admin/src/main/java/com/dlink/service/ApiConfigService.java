package com.dlink.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.dlink.common.result.Result;
import com.dlink.db.service.ISuperService;
import com.dlink.dto.ApiConfigDTO;
import com.dlink.dto.DebugDTO;
import com.dlink.dto.SearchCondition;
import com.dlink.model.ApiConfig;
import com.dlink.model.Schema;

import javax.servlet.http.HttpServletResponse;
import java.util.List;

/**
 * ApiConfigService
 *
 * @author cl1226
 * @since 2023/5/16 8:15
 **/
public interface ApiConfigService extends ISuperService<ApiConfig> {

    Page<ApiConfig> page(SearchCondition searchCondition);

    boolean addOrEdit(ApiConfig apiConfig);

    ApiConfigDTO getDetail(Integer id);

    ApiConfig online(Integer id);

    ApiConfig offline(Integer id);

    Result executeSql(DebugDTO debugDTO);

    Result getMenuByCode(String code, String value);

    List<Schema> getSchemaByDatabase(Integer databaseId);

    ApiConfig configureAuth(Integer id, Integer appId);

    ApiConfig checkPath(String path);

    Result getAppsById(Integer apiId);
}

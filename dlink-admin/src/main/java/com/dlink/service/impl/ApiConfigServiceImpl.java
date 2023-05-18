package com.dlink.service.impl;

import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;
import com.alibaba.druid.pool.DruidPooledConnection;
import com.alibaba.fastjson.JSON;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.dlink.common.result.Result;
import com.dlink.db.service.impl.SuperServiceImpl;
import com.dlink.dto.DebugDTO;
import com.dlink.dto.SearchCondition;
import com.dlink.mapper.ApiConfigMapper;
import com.dlink.metadata.driver.Driver;
import com.dlink.model.ApiConfig;
import com.dlink.model.DataBase;
import com.dlink.service.ApiConfigService;
import com.dlink.service.DataBaseService;
import com.dlink.utils.JdbcUtil;
import com.dlink.utils.PoolUtils;
import com.dlink.utils.SqlEngineUtils;
import com.github.freakchick.orange.SqlMeta;
import com.github.freakchick.orange.engine.DynamicSqlEngine;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.SQLException;
import java.util.Map;

/**
 * ApiConfigServiceImpl
 *
 * @author cl1226
 * @since 2023/5/16 8:16
 **/
@Service
public class ApiConfigServiceImpl extends SuperServiceImpl<ApiConfigMapper, ApiConfig> implements ApiConfigService {

    @Autowired
    private DataBaseService dataBaseService;

    @Override
    public Page<ApiConfig> page(SearchCondition searchCondition) {

        Page<ApiConfig> page = new Page<>(searchCondition.getPageIndex(), searchCondition.getPageSize());

        QueryWrapper<ApiConfig> queryWrapper = new QueryWrapper<ApiConfig>();
        if (StringUtils.isNotBlank(searchCondition.getName())) {
            queryWrapper.eq("name", searchCondition.getName());
        }
        if (searchCondition.getCatalogueId() != null) {
            queryWrapper.eq("catalogue_id", searchCondition.getCatalogueId());
        }

        queryWrapper.orderByDesc("update_time");

        return this.baseMapper.selectPage(page, queryWrapper);
    }

    @Override
    public ApiConfig online(Integer id) {
        ApiConfig apiConfig = this.getById(id);
        if (apiConfig == null) {
            return null;
        }
        apiConfig.setStatus(1);
        this.updateById(apiConfig);
        return apiConfig;
    }

    @Override
    public ApiConfig offline(Integer id) {
        ApiConfig apiConfig = this.getById(id);
        if (apiConfig == null) {
            return null;
        }
        apiConfig.setStatus(0);
        this.updateById(apiConfig);
        return apiConfig;
    }

    @Override
    public Result executeSql(DebugDTO debugDTO) {
        ApiConfig apiConfig = this.getById(debugDTO.getId());
        if (apiConfig == null) {
            return Result.failed("调试失败");
        }
        DataBase dataBase = dataBaseService.getById(apiConfig.getDatasourceId());
        if (dataBase == null) {
            return Result.failed("调试失败， 数据源不存在");
        }
        try {
            DruidPooledConnection connection = PoolUtils.getPooledConnection(dataBase);
            Map<String, Object> map = JSON.parseObject(debugDTO.getParams(), Map.class);
            SqlMeta sqlMeta = SqlEngineUtils.getEngine().parse(apiConfig.getSegment(), map);
            Object data = JdbcUtil.executeSql(connection, sqlMeta.getSql(), sqlMeta.getJdbcParamValues());
            return Result.succeed(data, "调试成功");
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return Result.failed("调试失败");
    }
}

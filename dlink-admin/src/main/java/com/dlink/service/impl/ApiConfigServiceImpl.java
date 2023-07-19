package com.dlink.service.impl;

import com.alibaba.druid.pool.DruidPooledConnection;
import com.alibaba.fastjson.JSON;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.dlink.common.result.Result;
import com.dlink.constant.BaseConstant;
import com.dlink.db.service.impl.SuperServiceImpl;
import com.dlink.dto.ApiConfigDTO;
import com.dlink.dto.AppConfigDTO;
import com.dlink.dto.DebugDTO;
import com.dlink.dto.SearchCondition;
import com.dlink.mapper.ApiConfigMapper;
import com.dlink.model.*;
import com.dlink.service.ApiCatalogueService;
import com.dlink.service.ApiConfigService;
import com.dlink.service.AppConfigService;
import com.dlink.service.DataBaseService;
import com.dlink.utils.JdbcUtil;
import com.dlink.utils.PoolUtils;
import com.dlink.utils.SqlEngineUtils;
import com.github.freakchick.orange.SqlMeta;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.servlet.http.HttpServletResponse;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

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
    @Autowired
    private ApiCatalogueService apiCatalogueService;
    @Autowired
    private AppConfigService appConfigService;

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

        queryWrapper.orderByDesc("create_time");

        return this.baseMapper.selectPage(page, queryWrapper);
    }

    @Override
    public boolean addOrEdit(ApiConfig apiConfig) {
        String path = apiConfig.getPath().replaceAll("/", "");
        if (BaseConstant.API_DEBUG_STATUS.containsKey(path)) {
            apiConfig.setDebugStatus(BaseConstant.API_DEBUG_STATUS.get(path) ? 1 : 0);
        }
        return this.saveOrUpdate(apiConfig);
    }

    @Override
    public ApiConfigDTO getDetail(Integer id) {
        ApiConfig apiConfig = this.getById(id);
        if (apiConfig == null) {
            return null;
        }
        ApiConfigDTO apiConfigDTO = new ApiConfigDTO();
        BeanUtils.copyProperties(apiConfig, apiConfigDTO);
        DataBase database = dataBaseService.getById(apiConfig.getDatasourceId());
        if (database != null) {
            apiConfigDTO.setDatasourceName(database.getName());
        }
        ApiCatalogue apiCatalogue = apiCatalogueService.getById(apiConfig.getCatalogueId());
        if (apiCatalogue == null) {
            return null;
        }
        List<String> paths = apiCatalogueService.listAbsolutePathById(apiConfig.getCatalogueId());
        apiConfigDTO.setAbsolutePath("/" + paths.stream().map(String::valueOf).collect(Collectors.joining("/")));
        return apiConfigDTO;
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
        DataBase dataBase = dataBaseService.getById(debugDTO.getDatasourceId());
        if (dataBase == null) {
            return Result.failed("调试失败， 数据源不存在");
        }
        DruidPooledConnection connection = null;
        try {
            connection = PoolUtils.getPooledConnection(dataBase);
            Map<String, Object> map = JSON.parseObject(debugDTO.getParams(), Map.class);
            SqlMeta sqlMeta = SqlEngineUtils.getEngine().parse(debugDTO.getSql(), map);
            Object data = JdbcUtil.executeSqlLimit10(connection, sqlMeta.getSql(), sqlMeta.getJdbcParamValues());
            return Result.succeed(data, "调试成功");
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            if (connection != null) {
                try {
                    connection.close();
                } catch (SQLException e) {
                    e.printStackTrace();
                }
            }
        }
        return Result.failed("调试失败");
    }

    @Override
    public Result getMenuByCode(String code, String value) {
        String datasourceType = "Hive,StarRocks,Mysql,SQLServer,Oracle,PostgreSQL,Clickhouse,Presto";
        List<Map<String, String>> list = new ArrayList<>();
        Arrays.stream(datasourceType.split(",")).forEach(x -> {
            Map<String, String> map = new HashMap<>();
            map.put("label", x);
            map.put("value", x);
            list.add(map);
        });
        // 获取数据源类型
        if ("datasourceType".equals(code)) {
            return Result.succeed(list, "获取成功");
        }
        if ("datasourceId".equals(code)) {
            List<DataBase> database = dataBaseService.list(new QueryWrapper<DataBase>().eq("type", value));
            return Result.succeed(database, "获取成功");
        }
        if ("datasourceDb".equals(code)) {
            List<Schema> schemasAndTables = dataBaseService.getSchemasAndTables(Integer.valueOf(value));
            return Result.succeed(schemasAndTables, "获取成功");
        }
        return null;
    }

    @Override
    public List<Schema> getSchemaByDatabase(Integer databaseId) {
        List<Schema> schemasAndTables = dataBaseService.getSchemasAndTables(databaseId);
        return schemasAndTables;
    }

    @Override
    public ApiConfig configureAuth(Integer id, Integer appId) {
        ApiConfig apiConfig = this.getById(id);
        if (apiConfig == null) {
            return null;
        }
        AppConfig appConfig = appConfigService.getById(appId);
        if (appConfig == null) {
            return null;
        }
        apiConfig.setAuthId(appConfig.getId());
        apiConfig.setAuthTime(LocalDateTime.now());
        this.saveOrUpdate(apiConfig);
        return apiConfig;
    }

    @Override
    public ApiConfig checkPath(String path) {
        ApiConfig apiConfig = this.getOne(new QueryWrapper<ApiConfig>().eq("path", path.replaceAll("/", "")));
        return apiConfig;
    }

    @Override
    public Result getAppsById(Integer apiId) {
        ApiConfig apiConfig = this.getById(apiId);
        if (apiConfig == null) {
            return Result.failed("获取失败!");
        }
        AppConfigDTO appConfigDTO = new AppConfigDTO();
        if (apiConfig.getAuthType().equals("app") && apiConfig.getAuthId() != null) {
            AppConfig appConfig = appConfigService.getDetailById(apiConfig.getAuthId());
            if (appConfig != null) {
                BeanUtils.copyProperties(appConfig, appConfigDTO);
                appConfigDTO.setAuthTime(apiConfig.getAuthTime());
                return Result.succeed(appConfigDTO, "获取成功");
            }
        }

        return Result.succeed(appConfigDTO, "获取成功!");
    }
}

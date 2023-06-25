package com.dlink.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.dlink.common.result.Result;
import com.dlink.constant.AuthConstant;
import com.dlink.db.service.impl.SuperServiceImpl;
import com.dlink.dto.SearchCondition;
import com.dlink.mapper.AppConfigMapper;
import com.dlink.model.ApiConfig;
import com.dlink.model.AppConfig;
import com.dlink.model.AppToken;
import com.dlink.service.ApiConfigService;
import com.dlink.service.AppConfigService;
import org.apache.commons.lang3.RandomStringUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * AppConfigServiceimpl
 *
 * @author cl1226
 * @since 2023/5/18 16:41
 **/
@Service
public class AppConfigServiceImpl extends SuperServiceImpl<AppConfigMapper, AppConfig> implements AppConfigService {

    @Autowired
    private CacheManager cacheManager;

    @Autowired
    private ApiConfigService apiConfigService;

    @Override
    public Page<AppConfig> page(SearchCondition searchCondition) {
        Page<AppConfig> page = new Page<>(searchCondition.getPageIndex(), searchCondition.getPageSize());

        QueryWrapper<AppConfig> queryWrapper = new QueryWrapper<AppConfig>();
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
    public AppConfig getDetailById(Integer id) {
        AppConfig appConfig = this.getById(id);
        if (appConfig == null) {
            return null;
        }
        return appConfig;
    }

    @Override
    public Page<ApiConfig> searchApiConfigByCondition(SearchCondition searchCondition) {
        AppConfig appConfig = this.getById(searchCondition.getAppId());
        if (appConfig == null) {
            return null;
        }
        Page<ApiConfig> page = new Page<>(searchCondition.getPageIndex(), searchCondition.getPageSize());
        QueryWrapper<ApiConfig> queryWrapper = new QueryWrapper<ApiConfig>().eq("auth_id", appConfig.getId()).and(qr -> qr.like("name", searchCondition.getName()));
        queryWrapper.orderByDesc("auth_time");
        Page<ApiConfig> apiConfigs = apiConfigService.getBaseMapper().selectPage(page, queryWrapper);
        return apiConfigs;
    }

    @Override
    public Result unbind(SearchCondition searchCondition) {
        AppConfig appConfig = this.getById(searchCondition.getAppId());
        if (appConfig == null) {
            return Result.failed("解绑失败, AppConfig不存在");
        }
        ApiConfig apiConfig = apiConfigService.getById(searchCondition.getApiId());
        if (apiConfig == null) {
            return Result.failed("解绑失败, ApiConfig不存在");
        }
        apiConfig.setAuthTime(null);
        apiConfig.setAuthId(null);
        apiConfigService.lambdaUpdate()
                .eq(ApiConfig::getId, searchCondition.getApiId())
                .set(ApiConfig::getAuthId, null)
                .set(ApiConfig::getAuthTime, null)
                .update();
        return Result.succeed(apiConfig, "解绑成功");
    }

    @Override
    public AppConfig add(AppConfig appConfig) {
        if (appConfig.getExpireDesc().equals("5min")) {
            appConfig.setExpireDuration(5 * 60);
        } else if (appConfig.getExpireDesc().equals("1hour")) {
            appConfig.setExpireDuration(60 * 60);
        } else if (appConfig.getExpireDesc().equals("1day")) {
            appConfig.setExpireDuration(60 * 60 * 24);
        } else if (appConfig.getExpireDesc().equals("30day")) {
            appConfig.setExpireDuration(60 * 60 * 24 * 30);
        } else if (appConfig.getExpireDesc().equals("once")) {
            appConfig.setExpireDuration(0);
        } else if ("forever".equals(appConfig.getExpireDesc())) {
            appConfig.setExpireDuration(-1);
        }
        this.saveOrUpdate(appConfig);
        return appConfig;
    }

    @Override
    @Transactional
    public AppToken generateToken(Integer appId, String secret) {
        AppConfig appConfig = this.getById(appId);
        if (appConfig == null) {
            return null;
        }
        if (!secret.equals(appConfig.getSecret())) {
            return null;
        }
        String token = RandomStringUtils.random(32, true, true);
        AppToken appToken = new AppToken();
        if (appConfig.getExpireDuration() == 0) {
            appToken.setExpireAt(0L);
        } else if (appConfig.getExpireDuration() == -1) {
            appToken.setExpireAt(-1L);
        } else if (appConfig.getExpireDuration() > 0) {
            long expireAt =System.currentTimeMillis() + appConfig.getExpireDuration() * 1000;
            appToken.setExpireAt(expireAt);
        }
        appToken.setToken(token);
        appToken.setAppId(appId);
        //最新token存入缓存
        cacheManager.getCache(AuthConstant.EHCACHE_TOKEN_APP).putIfAbsent(token, appToken);
//        //clean old token
//        String oldToken = cacheManager.getCache(AuthConstant.EHCACHE_APP_TOKEN).get(appId, String.class);
//        if (oldToken != null) {
//            cacheManager.getCache(AuthConstant.EHCACHE_TOKEN_APP).evict(oldToken);
//        }
//        //appid和最新token关系记录下来,便于下次可以找到旧token可以删除，否则缓存中token越来越多
//        cacheManager.getCache(AuthConstant.EHCACHE_APP_TOKEN).put(appId, token);

        return appToken;
    }

    @Override
    public Integer verifyToken(String token) {
        AppToken appToken = cacheManager.getCache(AuthConstant.EHCACHE_TOKEN_APP).get(token, AppToken.class);
        if (appToken == null) {
            return null;
        } else {
            Long expireTime = appToken.getExpireAt();
            // 单次失效
            if (expireTime == 0) {
                cacheManager.getCache(AuthConstant.EHCACHE_TOKEN_APP).evict(token);
                return appToken.getAppId();
            }
            // 永久有效
            else if (expireTime == -1) {
                return appToken.getAppId();
            }
            // 设置了有效的失效时间
            else if (expireTime > 0) {
                if (expireTime > System.currentTimeMillis()) {
                    return appToken.getAppId();
                } else {
                    // token已经过期就清除
                    cacheManager.getCache(AuthConstant.EHCACHE_TOKEN_APP).evict(token);
                    log.error("token: " + token + " expired!");
                    throw new RuntimeException("token expired!");
                }
            } else {
                return null;
            }

        }
    }
}

package com.dlink.service.impl;

import com.dlink.constant.AuthConstant;
import com.dlink.db.service.impl.SuperServiceImpl;
import com.dlink.mapper.AppConfigMapper;
import com.dlink.model.AppConfig;
import com.dlink.model.AppToken;
import com.dlink.service.AppConfigService;
import org.apache.commons.lang3.RandomStringUtils;
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
        this.save(appConfig);
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
        //clean old token
        String oldToken = cacheManager.getCache(AuthConstant.EHCACHE_APP_TOKEN).get(appId, String.class);
        if (oldToken != null) {
            cacheManager.getCache(AuthConstant.EHCACHE_TOKEN_APP).evict(oldToken);
        }
        //appid和最新token关系记录下来,便于下次可以找到旧token可以删除，否则缓存中token越来越多
        cacheManager.getCache(AuthConstant.EHCACHE_APP_TOKEN).put(appId, token);

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

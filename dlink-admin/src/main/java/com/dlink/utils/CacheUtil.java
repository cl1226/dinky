package com.dlink.utils;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import java.util.concurrent.TimeUnit;

/**
 * CacheUtil
 *
 * @author cl1226
 * @since 2023/7/6 13:34
 **/
@Component
public class CacheUtil {

    @Value("${dinky.api.cache.initial-capacity}")
    private Integer initialCapacity;

    @Value("${dinky.api.cache.maximum-size}")
    private Integer maximumSize;

    @Value("${dinky.api.cache.expire-after-write}")
    private Long expireAfterWrite;

    private static Cache<String, Object> cache = null;

    @PostConstruct
    public void init() {
        cache = Caffeine.newBuilder()
                .initialCapacity(initialCapacity)
                .maximumSize(maximumSize)
                .expireAfterWrite(expireAfterWrite, TimeUnit.SECONDS)
                .build();
    }

    public static Cache<String, Object> getInstance() {
        return cache;
    }

}

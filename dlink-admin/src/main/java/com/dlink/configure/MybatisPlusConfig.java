/*
 *
 *  Licensed to the Apache Software Foundation (ASF) under one or more
 *  contributor license agreements.  See the NOTICE file distributed with
 *  this work for additional information regarding copyright ownership.
 *  The ASF licenses this file to You under the Apache License, Version 2.0
 *  (the "License"); you may not use this file except in compliance with
 *  the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

package com.dlink.configure;

import com.baomidou.mybatisplus.annotation.DbType;
import com.baomidou.mybatisplus.extension.plugins.inner.PaginationInnerInterceptor;
import com.dlink.context.TenantContextHolder;

import java.util.List;

import com.dlink.context.WorkspaceContextHolder;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.baomidou.mybatisplus.extension.plugins.MybatisPlusInterceptor;
import com.baomidou.mybatisplus.extension.plugins.handler.TenantLineHandler;
import com.baomidou.mybatisplus.extension.plugins.inner.TenantLineInnerInterceptor;
import com.google.common.collect.Lists;

import lombok.extern.slf4j.Slf4j;
import net.sf.jsqlparser.expression.Expression;
import net.sf.jsqlparser.expression.LongValue;
import net.sf.jsqlparser.expression.NullValue;

/**
 * mybatisPlus config class
 */
@Configuration
@MapperScan("com.dlink.mapper")
@Slf4j
public class MybatisPlusConfig {

    private static final List<String> IGNORE_TABLE_NAMES = Lists.newArrayList(
            "dlink_hadoop_cluster", "dlink_user", "dlink_role", "dlink_cluster_user_role",
            "dlink_workspace");

    @Bean
    public MybatisPlusInterceptor mybatisPlusInterceptor() {
        log.info("mybatis plus interceptor execute");
        MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
        interceptor.addInnerInterceptor(new PaginationInnerInterceptor(DbType.MYSQL));
        interceptor.addInnerInterceptor(new TenantLineInnerInterceptor(new TenantLineHandler() {
            @Override
            public String getTenantIdColumn() {
                return "workspace_id";
            }

            @Override
            public Expression getTenantId() {
                Integer workspaceId = (Integer) WorkspaceContextHolder.get();
                if (workspaceId == null) {
                    // log.warn("request context workspace id is null");
                    return new NullValue();
                }
                return new LongValue(workspaceId);
            }

            @Override
            public boolean ignoreTable(String tableName) {
                return IGNORE_TABLE_NAMES.contains(tableName);
            }
        }));

        return interceptor;
    }

}

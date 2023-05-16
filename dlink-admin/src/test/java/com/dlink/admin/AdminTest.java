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

package com.dlink.admin;

import com.dlink.model.Catalogue;
import com.dlink.service.CatalogueService;
import com.dlink.service.impl.CatalogueServiceImpl;
import org.junit.Test;

import cn.dev33.satoken.secure.SaSecureUtil;
import org.junit.runner.RunWith;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

import java.util.List;

/**
 * SqlParserTest
 *
 * @author wenmo
 * @since 2021/6/14 17:03
 */
@SpringBootTest
@RunWith(SpringRunner.class)
@MapperScan("com.dlink.mapper")
public class AdminTest {

    @Autowired
    private CatalogueService catalogueService;

    @Test
    public void adminTest() {
        String admin = SaSecureUtil.md5("admin");
    }

    @Test
    public void getTreeData() {
        List<Catalogue> list = catalogueService.getAllDataByType("StarRocks");
        list.stream().forEach(System.out::println);
    }
}

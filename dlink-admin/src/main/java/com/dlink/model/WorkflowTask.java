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

package com.dlink.model;

import com.baomidou.mybatisplus.annotation.FieldFill;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.dlink.db.model.SuperEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * WorkflowTask
 *
 * @author cl
 * @since 2023-04-20 11:17
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("dlink_workflow_task")
public class WorkflowTask extends SuperEntity {

    @TableField(fill = FieldFill.INSERT)
    private String alias;

    private Integer tenantId;

    private String type;

    private Integer versionId;

    private Integer step;

    private String graphData;

    private String status;

    private String cron;

    private Integer cronId;

    public WorkflowTask() {
    }

    public WorkflowTask(String alias, Integer tenantId, String type, Integer versionId,
                        Integer step, String graphData, String status, String cron,
                        Integer cronId) {
        this.alias = alias;
        this.tenantId = tenantId;
        this.type = type;
        this.versionId = versionId;
        this.step = step;
        this.graphData = graphData;
        this.status = status;
        this.cron = cron;
        this.cronId = cronId;
    }
}

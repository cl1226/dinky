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

package com.dlink.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * WorkflowTaskDTO
 *
 * @author cl1226
 * @since 2023/04/23 15:25
 */
@Getter
@Setter
public class WorkflowTaskDTO {
    private Integer id;
    private Integer tenantId;
    private String name;
    private String alias;
    private String type;
    private Integer versionId;
    private String graphData;
    private List<WorkflowNode> nodes;
    private List<WorkflowEdge> edges;
    private String schedulerType;
    private String cron;
    private Integer cronId;
    private String status;
    private String lockUser;
    private boolean lockStatus;
    private String projectCode;
}

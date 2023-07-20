package com.dlink.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.Date;

/**
 * ApiConfigDTO
 *
 * @author cl1226
 * @since 2023/5/18 17:40
 **/
@Data
public class ApiConfigDTO {

    private Integer id;
    private String name;
    private String path;
    private Integer catalogueId;
    private String absolutePath;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
    private String authType;
    private LocalDateTime authTime;
    private String accessType;
    private String datasourceType;
    private Integer datasourceId;
    private String datasourceName;
    private String datasourceDb;
    private String params;
    private String contentType;
    private String segment;
    private Integer status;
    private Integer tenantId;
    private Integer authId;
    private String description;
    private String domain;
    private String apiPrefix;
    private String cachePlugin;

}

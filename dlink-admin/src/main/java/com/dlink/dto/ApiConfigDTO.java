package com.dlink.dto;

import lombok.Data;

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
    private Date createTime;
    private Date updateTime;
    private String accessType;
    private String datasourceType;
    private Integer datasourceId;
    private String datasourceName;
    private String datasourceDb;
    private String params;
    private String contentType;
    private String segment;
    private Integer status;
    private String description;

}

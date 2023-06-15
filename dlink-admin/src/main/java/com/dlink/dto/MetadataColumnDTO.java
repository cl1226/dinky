package com.dlink.dto;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * MetadataColumnDTO
 *
 * @author cl1226
 * @since 2023/6/14 17:26
 **/
@Data
public class MetadataColumnDTO {

    private Integer id;

    private String name;

    private String columnType;

    private String datasourceType;

    private Integer datasourceId;

    private String datasourceName;

    private String dbName;

    private Integer dbId;

    private Integer tableId;

    private String tableName;

    private String position;

    private boolean partitionFlag;

    private String labelName;

    private String type;

    private String attributes;

    private String label;

    private String description;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;

    private boolean keyFlag;

    private boolean autoIncrement;

    private String defaultValue;

    private boolean isNullable;

    private String columnFamily;

    private Integer length;

    private Integer precisionLength;

    private Integer scale;

    private String characterSet;

    private String collationStr;

}

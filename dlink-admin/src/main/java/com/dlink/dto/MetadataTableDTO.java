package com.dlink.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/**
 * MetadataTableDTO
 *
 * @author cl1226
 * @since 2023/6/14 16:52
 **/
@Data
public class MetadataTableDTO {

    private Integer id;

    private String name;

    private String tableType;

    private String datasourceType;

    private Integer datasourceId;

    private String datasourceName;

    private String dbName;

    private Integer dbId;

    private String position;

    private String labelName;

    private String type;

    private String attributes;

    private String label;

    private String description;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;

    private List<MetadataColumnDTO> metadataColumnDTOS;

}

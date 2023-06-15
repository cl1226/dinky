package com.dlink.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/**
 * MetadataDbDTO
 *
 * @author cl1226
 * @since 2023/6/14 9:12
 **/
@Data
public class MetadataDbDTO {

    private Integer id;

    private String name;

    private String datasourceType;

    private Integer datasourceId;

    private String datasourceName;

    private String position;

    private String labelName;

    private String type;

    private String attributes;

    private String label;

    private String description;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;

    private List<MetadataTableDTO> metadataTableDTOS;

}

package com.dlink.model;

import com.baomidou.mybatisplus.annotation.TableName;
import com.dlink.db.model.SuperEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * MetadataTable
 *
 * @author cl1226
 * @since 2023/6/12 14:20
 **/
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("dlink_metadata_table")
public class MetadataTable extends SuperEntity {

    private String datasourceType;

    private Integer datasourceId;

    private String datasourceName;

    private Integer dbId;

    private String dbName;

    private String attributes;

    private String label;

    private String position;

}

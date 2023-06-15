package com.dlink.model;

import com.baomidou.mybatisplus.annotation.TableName;
import com.dlink.db.model.SuperEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * MetaSchema
 *
 * @author cl1226
 * @since 2023/6/12 14:15
 **/
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("dlink_metadata_db")
public class MetadataDb extends SuperEntity {

    private String datasourceType;

    private Integer datasourceId;

    private String datasourceName;

    private String attributes;

    private String label;
}

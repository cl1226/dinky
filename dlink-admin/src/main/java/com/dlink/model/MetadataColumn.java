package com.dlink.model;

import com.baomidou.mybatisplus.annotation.TableName;
import com.dlink.db.model.SuperEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigInteger;

/**
 * MetaColumn
 *
 * @author cl1226
 * @since 2023/6/12 14:25
 **/
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("dlink_metadata_column")
public class MetadataColumn extends SuperEntity {

    private String columnType;

    private String description;

    private String datasourceType;

    private Integer datasourceId;

    private String datasourceName;

    private Integer dbId;

    private String dbName;

    private Integer tableId;

    private String tableName;

    private String attributes;

    private String label;

    private String position;

    private boolean partitionFlag;

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

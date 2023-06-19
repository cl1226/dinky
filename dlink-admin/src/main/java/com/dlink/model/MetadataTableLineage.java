package com.dlink.model;

import com.baomidou.mybatisplus.annotation.TableName;
import com.dlink.db.model.SuperEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * MetadataTableLineage
 *
 * @author cl1226
 * @since 2023/6/16 10:37
 **/
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("dlink_metadata_table_lineage")
public class MetadataTableLineage extends SuperEntity {

    private Integer originDatasourceId;

    private String originDatasourceType;

    private String originDatasourceName;

    private Integer originDbId;

    private String originDbName;

    private Integer originTableId;

    private String originTableName;

    private Integer targetDatasourceId;

    private String targetDatasourceType;

    private String targetDatasourceName;

    private Integer targetDbId;

    private String targetDbName;

    private Integer targetTableId;

    private String targetTableName;

}

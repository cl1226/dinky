package com.dlink.model;

import com.baomidou.mybatisplus.annotation.TableName;
import com.dlink.db.model.SuperEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * MetadataColumnLineage
 *
 * @author cl1226
 * @since 2023/6/16 10:37
 **/
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("dlink_metadata_column_lineage")
public class MetadataColumnLineage extends MetadataTableLineage {

    private Integer originColumnId;

    private String originColumnName;

    private Integer targetColumnId;

    private String targetColumnName;

}

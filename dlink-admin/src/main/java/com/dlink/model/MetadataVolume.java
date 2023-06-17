package com.dlink.model;

import com.baomidou.mybatisplus.annotation.TableName;
import com.dlink.db.model.SuperEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

/**
 * MetadataVolume
 *
 * @author cl1226
 * @since 2023/6/15 15:04
 **/
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("dlink_metadata_volume")
public class MetadataVolume extends SuperEntity {

    private Integer datasourceId;

    private String datasourceType;

    private String datasourceName;

    private String type;

    private Integer dbNum;

    private Integer tableNum;

    private BigDecimal dataVol;

    private String dataUnit;

}

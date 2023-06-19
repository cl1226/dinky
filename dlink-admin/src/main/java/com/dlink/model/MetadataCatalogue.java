package com.dlink.model;

import com.baomidou.mybatisplus.annotation.TableName;
import com.dlink.db.model.SuperEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * AssetCatalogue
 *
 * @author cl1226
 * @since 2023/6/8 15:52
 **/
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("dlink_metadata_catalogue")
public class MetadataCatalogue extends SuperEntity {

    private Integer tenantId;

    private Integer parentId;

    private Boolean isLeaf;

}

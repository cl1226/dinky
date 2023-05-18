package com.dlink.model;

import com.baomidou.mybatisplus.annotation.TableName;
import com.dlink.db.model.SuperEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * ApiCatalogue
 *
 * @author cl1226
 * @since 2023/5/15 15:00
 **/
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("dlink_api_catalogue")
public class ApiCatalogue extends SuperEntity {

    private Integer tenantId;

    private Integer parentId;

    private Boolean isLeaf;

    public ApiCatalogue() {
    }

    public ApiCatalogue(Integer tenantId, Integer parentId, Boolean isLeaf) {
        this.tenantId = tenantId;
        this.parentId = parentId;
        this.isLeaf = isLeaf;
    }
}

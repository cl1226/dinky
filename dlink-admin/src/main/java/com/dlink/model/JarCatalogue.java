package com.dlink.model;

import com.baomidou.mybatisplus.annotation.TableName;
import com.dlink.db.model.SuperEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * JarCatalogue
 *
 * @author cl1226
 * @since 2023/6/27 15:30
 **/
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("dlink_jar_catalogue")
public class JarCatalogue extends SuperEntity {

    private Integer tenantId;

    private Integer parentId;

    private Boolean isLeaf;

    public JarCatalogue() {
    }

    public JarCatalogue(Integer tenantId, Integer parentId, Boolean isLeaf) {
        this.tenantId = tenantId;
        this.parentId = parentId;
        this.isLeaf = isLeaf;
    }
}

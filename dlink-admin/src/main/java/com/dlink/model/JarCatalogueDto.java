package com.dlink.model;

import com.dlink.db.model.SuperEntity;
import lombok.Data;

import java.util.List;

/**
 * JarCatalogueDto
 *
 * @author cl1226
 * @since 2023/7/8 8:42
 **/
@Data
public class JarCatalogueDto extends SuperEntity {

    private Integer tenantId;

    private Integer parentId;

    private Boolean isLeaf;

    private List<FileEntity> fileEntities;
}

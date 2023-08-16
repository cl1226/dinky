package com.dlink.model;

import com.dlink.db.model.SuperEntity;
import lombok.Data;

/**
 * WorkflowCatalogueDTO
 *
 * @author cl1226
 * @since 2023/8/14 11:02
 **/
@Data
public class WorkflowCatalogueDTO extends SuperEntity {

    private Integer tenantId;

    private Integer taskId;

    private String type;

    private Integer parentId;

    private Boolean isLeaf;

    private String lockInfo;

}

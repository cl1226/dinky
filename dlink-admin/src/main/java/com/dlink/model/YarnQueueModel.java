package com.dlink.model;

import com.baomidou.mybatisplus.annotation.TableName;
import com.dlink.db.model.SuperEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * YarnQueue
 *
 * @author cl1226
 * @since 2023/6/28 17:53
 **/
@Data
public class YarnQueueModel extends SuperEntity {

    private Integer clusterId;

    private String clusterName;

    private String clusterUUID;

    private String parentName;

    private Integer parentId;

    private String aclSubmitApps;

    private String policy;

}

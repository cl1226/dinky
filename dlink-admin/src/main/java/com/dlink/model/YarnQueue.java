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
@EqualsAndHashCode(callSuper = false)
@TableName("dlink_yarn_queue")
public class YarnQueue extends SuperEntity {

    private Integer clusterId;

    private String clusterName;

    private String aclSubmitApps;

    private String policy;

    private String parentName;

}

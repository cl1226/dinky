package com.dlink.model;

import com.baomidou.mybatisplus.annotation.TableName;
import com.dlink.db.model.SuperEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * HadoopTenant
 *
 * @author cl1226
 * @since 2023/7/12 13:32
 **/
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("dlink_hadoop_tenant")
public class HadoopTenant extends SuperEntity {

    private String description;

    private Integer clusterId;

    private String clusterName;

    private String clusterUuid;

    private Integer queueId;

    private String queueName;

}

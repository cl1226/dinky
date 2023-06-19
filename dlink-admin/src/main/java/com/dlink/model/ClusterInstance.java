package com.dlink.model;

import com.baomidou.mybatisplus.annotation.TableName;
import com.dlink.db.model.SuperEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * ClusterInstance
 *
 * @author cl1226
 * @since 2023/6/15 15:21
 **/
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("dlink_cluster_instance")
public class ClusterInstance extends SuperEntity {

    private String ip;

    private String hostName;

    private Integer port;

    private String username;

    private String password;
}

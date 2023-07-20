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
@TableName("dlink_hadoop_client")
public class HadoopClient extends SuperEntity {

    private String ip;

    private Integer clusterId;

    private String clusterName;

    private String hostname;

    private Integer port;

    private String username;

    private String password;

    private String env;

    private String description;
}

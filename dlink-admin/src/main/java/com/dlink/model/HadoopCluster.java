package com.dlink.model;

import com.baomidou.mybatisplus.annotation.TableName;
import com.dlink.db.model.SuperEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * HadoopCluster
 *
 * @author cl1226
 * @since 2023/6/27 17:24
 **/
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("dlink_hadoop_cluster")
public class HadoopCluster extends SuperEntity {

    private String url;

    private String username;

    private String password;

    private String uuid;

    private String clusterName;

    private String type;

    private String version;

    private String clusterStatus;

    private boolean hdfsHa;

    private String namenodeAddress;

    private boolean hiveHa;

    private String hiveserverAddress;

    private String metastoreAddress;

    private String zkQuorum;

    private boolean yarnHa;

    private String resourcemanagerAddress;

    private boolean kerberos;

    private String kdcHost;

    private String realm;

    private String krb5;

    private String keytabJson;

}

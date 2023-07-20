package com.dlink.model;

import com.dlink.db.model.SuperEntity;
import lombok.Data;

import java.util.List;

/**
 * HadoopClusterModel
 *
 * @author cl1226
 * @since 2023/6/28 15:22
 **/
@Data
public class HadoopClusterModel extends SuperEntity {

    private String uuid;

    private String type;

    private String url;

    private String username;

    private String password;

    private String clusterName;

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

    private List<YarnQueueModel> yarnQueueModels;

    private String xmlUrls;

}

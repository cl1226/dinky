package com.dlink.utils;

import cn.hutool.json.JSONArray;
import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;
import com.cloudera.api.ClouderaManagerClientBuilder;
import com.cloudera.api.DataView;
import com.cloudera.api.model.*;
import com.cloudera.api.v3.RoleConfigGroupsResource;
import com.cloudera.api.v31.RolesResourceV31;
import com.cloudera.api.v33.ClustersResourceV33;
import com.cloudera.api.v33.RootResourceV33;
import com.cloudera.api.v33.ServicesResourceV33;
import lombok.extern.slf4j.Slf4j;
import org.junit.Test;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * ClusterTest
 *
 * @author cl1226
 * @since 2023/6/27 17:33
 **/
@Slf4j
public class ClusterTest {

    static RootResourceV33 apiRoot;

    static {
        try {
            apiRoot = new ClouderaManagerClientBuilder().withBaseURL(new URL("http://node05:7180"))
                    .withPort(7180)
                    .withUsernamePassword("admin", "admin")
                    .build()
                    .getRootV33();
        } catch (MalformedURLException e) {
            e.printStackTrace();
        }
    }

    @Test
    public void testCluster() {
        String[] a = new String[]{"hdfs", "hive", "yarn"};
        List<String> serviceNames = Arrays.asList(a);
        String[] b = new String[]{"NAMENODE", "DATANODE", "HIVESERVER2", "HIVEMETASTORE", "RESOURCEMANAGER"};
        List<String> roleTypes = Arrays.asList(b);
        ApiClusterList apiClusterList = apiRoot.getClustersResource().readClusters(DataView.FULL);

        log.info("ClouderaManager 共管理了{}个集群", apiClusterList.getClusters().size());
        for(ApiCluster apiCluster : apiClusterList){
            ClustersResourceV33 clustersResource = apiRoot.getClustersResource();
            // 集群信息
            log.info("集群名称 {}", apiCluster.getName());
            log.info("集群显示名称 {}", apiCluster.getDisplayName());
            log.info("CDH 版本：{}", apiCluster.getFullVersion());
            log.info("ClusterUrl {}", apiCluster.getClusterUrl());
            // kerberos信息
            ApiKerberosInfo kerberosInfo = clustersResource.getKerberosInfo(apiCluster.getName());
            log.info("Kerberos认证 {}", kerberosInfo.isKerberized());
            log.info("KdcHost {}", kerberosInfo.getKdcHost());
            log.info("Domain {}", kerberosInfo.getDomain());

            ServicesResourceV33 servicesResource = clustersResource.getServicesResource(apiCluster.getName());
            // namenode信息
            ApiRoleList roles = servicesResource.getRolesResource("hdfs").readRoles();
            for (ApiRole role : roles) {
                if (role.getType().equals("NAMENODE")) {
                    String nnAddress = "";
                    String haStatus = role.getHaStatus().name();
                    String nnHostname = role.getHostRef().getHostname();
                    ApiConfigList configs = servicesResource.getRolesResource("hdfs").readRoleConfig(role.getName(), DataView.FULL);
                    String nnPort = "";
                    for (ApiConfig config : configs.getConfigs()) {
                        if (config.getName().equals("dfs_http_port")) {
                            nnPort = config.getValue() != null ? config.getValue() : config.getDefaultValue();
                            break;
                        }
                    }
                    nnAddress = "http://" + nnHostname + ":" + nnPort;
                    log.info("nnAddress: {} - {}", nnAddress, haStatus);
                }
            }

            // hiveserver信息
            ApiRoleList hiveRoles = servicesResource.getRolesResource("hive").readRoles();
            for (ApiRole role : hiveRoles) {
                if (role.getType().equals("HIVESERVER2")) {
                    String hostname = role.getHostRef().getHostname();
                    ApiConfigList configs = servicesResource.getRolesResource("hive").readRoleConfig(role.getName(), DataView.FULL);
                    String nnPort = "";
                    for (ApiConfig config : configs.getConfigs()) {
                        if (config.getName().equals("hiveserver2_webui_port")) {
                            nnPort = config.getValue() != null ? config.getValue() : config.getDefaultValue();
                            break;
                        }
                    }
                    String hiveServer2Address = "http://" + hostname + ":" + nnPort;
                    log.info("hiveServer2Address: {}", hiveServer2Address);
                }
            }

            // hivemetastore信息
            for (ApiRole role : hiveRoles) {
                if (role.getType().equals("HIVEMETASTORE")) {
                    String hostname = role.getHostRef().getHostname();
                    ApiConfigList configs = servicesResource.getRolesResource("hive").readRoleConfig(role.getName(), DataView.FULL);
                    String nnPort = "";
                    for (ApiConfig config : configs.getConfigs()) {
                        if (config.getName().equals("hive_metastore_port")) {
                            nnPort = config.getValue() != null ? config.getValue() : config.getDefaultValue();
                            break;
                        }
                    }
                    String hivemetastoreAddress = "http://" + hostname + ":" + nnPort;
                    log.info("hivemetastoreAddress: {}", hivemetastoreAddress);
                }
            }

            // yarn队列信息
            ApiServiceConfig yarnConfig = servicesResource.readServiceConfig("yarn", DataView.FULL);
            List<ApiConfig> configs = yarnConfig.getConfigs();
            String json = "";
            for (ApiConfig apiConfig : configs) {
                if (apiConfig.getName().equals("yarn_fs_scheduled_allocations")) {
                    json = apiConfig.getValue() == null ? apiConfig.getDefaultValue() : apiConfig.getValue();
                    break;
                }
            }

            JSONObject jsonObject = new JSONObject(json);
            String s = JSONUtil.toJsonPrettyStr(jsonObject);
            log.info("json: {}", s);
            JSONArray queues = jsonObject.getJSONArray("queues");
            resolveQueue(queues);

        }
        log.info("结束测试的时间为{},**************结束测试获取ClouderaManager集群信息**************");


    }

    public void resolveQueue(JSONArray queues) {
        queues.jsonIter().forEach(q -> {
            String name = q.getStr("name");
            log.info("queue name: {}", name);
            JSONArray children = q.getJSONArray("queues");
            this.resolveQueue(children);
        });
    }

    @Test
    public void test1() {
        String s = "/test/111/SquirrelSetup.log";
        String s1 = s.split("\\/")[s.split("\\/").length - 1];
        System.out.println(s1);
    }
}

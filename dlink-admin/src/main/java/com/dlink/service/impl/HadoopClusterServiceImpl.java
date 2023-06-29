package com.dlink.service.impl;

import cn.hutool.core.bean.BeanUtil;
import cn.hutool.json.JSONArray;
import cn.hutool.json.JSONObject;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.cloudera.api.ClouderaManagerClientBuilder;
import com.cloudera.api.DataView;
import com.cloudera.api.model.*;
import com.cloudera.api.v33.ClustersResourceV33;
import com.cloudera.api.v33.RootResourceV33;
import com.cloudera.api.v33.ServicesResourceV33;
import com.dlink.common.result.Result;
import com.dlink.db.service.impl.SuperServiceImpl;
import com.dlink.mapper.HadoopClusterMapper;
import com.dlink.model.HadoopCluster;
import com.dlink.model.HadoopClusterModel;
import com.dlink.model.YarnQueue;
import com.dlink.model.YarnQueueModel;
import com.dlink.service.HadoopClusterService;
import com.dlink.service.YarnQueueService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;

/**
 * HadoopClusterServiceImpl
 *
 * @author cl1226
 * @since 2023/6/28 10:39
 **/
@Service
@Slf4j
public class HadoopClusterServiceImpl extends SuperServiceImpl<HadoopClusterMapper, HadoopCluster> implements HadoopClusterService {

    @Autowired
    private YarnQueueService yarnQueueService;

    @Override
    @Transactional
    public Result save(HadoopClusterModel model) {
        HadoopCluster hadoopCluster = new HadoopCluster();
        BeanUtil.copyProperties(model, hadoopCluster);
        this.saveOrUpdate(hadoopCluster);
        List<YarnQueueModel> yarnQueueModels = model.getYarnQueueModels();
        LambdaQueryWrapper<YarnQueue> wrapper = Wrappers.<YarnQueue>lambdaQuery().eq(YarnQueue::getClusterId, hadoopCluster.getId());
        boolean b = yarnQueueService.remove(wrapper);
        List<YarnQueue> list = new ArrayList<>();
        if (b) {
            for (YarnQueueModel queueModel : yarnQueueModels) {
                YarnQueue yarnQueue = new YarnQueue();
                yarnQueue.setName(queueModel.getName());
                yarnQueue.setClusterName(hadoopCluster.getName());
                yarnQueue.setClusterId(hadoopCluster.getId());
                yarnQueue.setPolicy(queueModel.getPolicy());
                yarnQueue.setParentName(queueModel.getParentName());
                yarnQueue.setAclSubmitApps(queueModel.getAclSubmitApps());
                list.add(yarnQueue);
            }
            yarnQueueService.saveOrUpdateBatch(list);
        }

        return Result.succeed(hadoopCluster, "保存成功");
    }

    @Override
    public Result load(HadoopClusterModel model) {
        RootResourceV33 apiRoot = null;
        try {
            URL url = new URL(model.getUrl());
            apiRoot = new ClouderaManagerClientBuilder().withBaseURL(url)
                    .withPort(url.getPort())
                    .withUsernamePassword(model.getUsername(), model.getPassword())
                    .build()
                    .getRootV33();
        } catch (MalformedURLException e) {
            e.printStackTrace();
        }
        ApiClusterList apiClusterList = apiRoot.getClustersResource().readClusters(DataView.FULL);
        log.info("ClouderaManager 共管理了{}个集群", apiClusterList.getClusters().size());
        List<HadoopCluster> clusters = new ArrayList<>();
        List<YarnQueueModel> yarnQueues = new ArrayList<>();
        for(ApiCluster apiCluster : apiClusterList) {
            HadoopCluster hadoopCluster = new HadoopCluster();
            // 集群信息
            hadoopCluster.setClusterName(apiCluster.getName());
            hadoopCluster.setClusterStatus(apiCluster.getEntityStatus().name());
            hadoopCluster.setVersion(apiCluster.getFullVersion());
            hadoopCluster.setType(model.getType());

            ClustersResourceV33 clustersResource = apiRoot.getClustersResource();
            // kerberos信息
            ApiKerberosInfo kerberosInfo = clustersResource.getKerberosInfo(apiCluster.getName());
            hadoopCluster.setKerberos(kerberosInfo.isKerberized());
            hadoopCluster.setKdcHost(kerberosInfo.getKdcHost());
            hadoopCluster.setRealm(kerberosInfo.getKerberosRealm());

            ServicesResourceV33 servicesResource = clustersResource.getServicesResource(apiCluster.getName());
            // namenode信息
            ApiRoleList roles = servicesResource.getRolesResource("hdfs").readRoles();
            List<String> nnAddresses = new ArrayList<>();
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
                    nnAddresses.add(nnAddress);
                }
            }
            hadoopCluster.setHdfsHa(nnAddresses.size() > 1);
            hadoopCluster.setNamenodeAddress(String.join(",", nnAddresses));

            // hive信息
            // hiveserver2信息
            ApiRoleList hiveRoles = servicesResource.getRolesResource("hive").readRoles();
            List<String> hs2Addresses = new ArrayList<>();
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
                    hs2Addresses.add(hiveServer2Address);
                }
            }
            hadoopCluster.setHiveHa(hs2Addresses.size() > 1);
            hadoopCluster.setHiveserverAddress(String.join(",", hs2Addresses));

            // hivemetastore信息
            List<String> hmAddresses = new ArrayList<>();
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
                    String hmAddress = "http://" + hostname + ":" + nnPort;
                    hmAddresses.add(hmAddress);
                }
            }
            hadoopCluster.setMetastoreAddress(String.join(",", hmAddresses));

            // yarn信息
            ApiRoleList yarnRoles = servicesResource.getRolesResource("yarn").readRoles();
            List<String> rmAddresses = new ArrayList<>();
            for (ApiRole role : yarnRoles) {
                if (role.getType().equals("RESOURCEMANAGER")) {
                    String hostname = role.getHostRef().getHostname();
                    ApiConfigList configs = servicesResource.getRolesResource("yarn").readRoleConfig(role.getName(), DataView.FULL);
                    String nnPort = "";
                    for (ApiConfig config : configs.getConfigs()) {
                        if (config.getName().equals("resourcemanager_webserver_port")) {
                            nnPort = config.getValue() != null ? config.getValue() : config.getDefaultValue();
                            break;
                        }
                    }
                    String zkAddress = "http://" + hostname + ":" + nnPort;
                    rmAddresses.add(zkAddress);
                }
            }
            hadoopCluster.setYarnHa(rmAddresses.size() > 1);
            hadoopCluster.setResourcemanagerAddress(String.join(",", rmAddresses));

            // yarn队列信息
            ApiServiceConfig yarnConfig = servicesResource.readServiceConfig("yarn", DataView.SUMMARY);
            List<ApiConfig> yarnConfigs = yarnConfig.getConfigs();
            String json = "";
            for (ApiConfig apiConfig : yarnConfigs) {
                if (apiConfig.getName().equals("yarn_fs_scheduled_allocations_draft")) {
                    json = apiConfig.getValue() == null ? apiConfig.getDefaultValue() : apiConfig.getValue();
                    break;
                }
            }
            JSONObject jsonObject = new JSONObject(json);
            JSONArray queues = jsonObject.getJSONArray("queues");
            resolveQueue(null, queues, yarnQueues);
            for (YarnQueueModel yarnQueueModel : yarnQueues) {
                yarnQueueModel.setClusterName(apiCluster.getName());
                yarnQueueModel.setClusterUUID(apiCluster.getUuid());
            }

            // zk信息
            ApiRoleList zkRoles = servicesResource.getRolesResource("zookeeper").readRoles();
            List<String> zkAddresses = new ArrayList<>();
            for (ApiRole role : zkRoles) {
                String hostname = role.getHostRef().getHostname();
                ApiConfigList configs = servicesResource.getRolesResource("zookeeper").readRoleConfig(role.getName(), DataView.FULL);
                String nnPort = "";
                for (ApiConfig config : configs.getConfigs()) {
                    if (config.getName().equals("clientPort")) {
                        nnPort = config.getValue() != null ? config.getValue() : config.getDefaultValue();
                        break;
                    }
                }
                String zkAddress = hostname + ":" + nnPort;
                zkAddresses.add(zkAddress);
            }
            hadoopCluster.setZkQuorum(String.join(",", zkAddresses));
            clusters.add(hadoopCluster);
        }
        JSONObject jsonObject = new JSONObject();
        jsonObject.set("Cluster", clusters.get(0));
        jsonObject.set("YarnQueue", yarnQueues);
        return Result.succeed(jsonObject, "加载成功");
    }

    private void resolveQueue(JSONObject parent, JSONArray queues, List<YarnQueueModel> yarnQueues) {
        queues.jsonIter().forEach(q -> {
            YarnQueueModel yarnQueue = new YarnQueueModel();
            yarnQueue.setName(q.getStr("name"));
            yarnQueue.setAclSubmitApps(q.getStr("aclSubmitApps"));
            yarnQueue.setPolicy(q.getStr("schedulingPolicy"));
            if (parent != null) {
                yarnQueue.setParentName(parent.getStr("name"));
            }
            yarnQueues.add(yarnQueue);
            JSONArray children = q.getJSONArray("queues");
            this.resolveQueue(q, children, yarnQueues);
        });
    }
}

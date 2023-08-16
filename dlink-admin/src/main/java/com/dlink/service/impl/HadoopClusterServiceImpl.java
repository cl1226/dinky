package com.dlink.service.impl;

import cn.dev33.satoken.stp.StpUtil;
import cn.hutool.core.bean.BeanUtil;
import cn.hutool.core.bean.copier.CopyOptions;
import cn.hutool.core.lang.UUID;
import cn.hutool.json.JSONArray;
import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.cloudera.api.ClouderaManagerClientBuilder;
import com.cloudera.api.DataView;
import com.cloudera.api.model.*;
import com.cloudera.api.model.ApiConfig;
import com.cloudera.api.v33.ClustersResourceV33;
import com.cloudera.api.v33.RootResourceV33;
import com.cloudera.api.v33.ServicesResourceV33;
import com.dlink.common.result.Result;
import com.dlink.db.service.impl.SuperServiceImpl;
import com.dlink.dto.UserDTO;
import com.dlink.mapper.HadoopClusterMapper;
import com.dlink.minio.MinioStorageService;
import com.dlink.model.*;
import com.dlink.service.*;
import io.minio.errors.*;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.apache.hadoop.conf.Configuration;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.net.URL;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

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
    @Autowired
    private MinioStorageService minioStorageService;
    @Autowired
    private UserService userService;
    @Autowired
    private ClusterUserService clusterUserService;
    @Autowired
    private ClusterUserRoleService clusterUserRoleService;
    @Autowired
    private RoleService roleService;
    @Value("${dinky.minio.bucket-name}")
    private String bucketName;

    @Override
    @Transactional
    public Result save(HadoopClusterModel model) {
        HadoopCluster cluster = this.getOne(Wrappers.<HadoopCluster>lambdaQuery().eq(HadoopCluster::getUuid, model.getUuid()));
        if (cluster == null) {
            cluster = new HadoopCluster();
        }
        BeanUtil.copyProperties(model, cluster, CopyOptions.create(null, true));
        this.saveOrUpdate(cluster);
        List<YarnQueueModel> yarnQueueModels = model.getYarnQueueModels();
        LambdaQueryWrapper<YarnQueue> wrapper = Wrappers.<YarnQueue>lambdaQuery().eq(YarnQueue::getClusterId, cluster.getId());
        yarnQueueService.remove(wrapper);
        List<YarnQueue> list = new ArrayList<>();
        for (YarnQueueModel queueModel : yarnQueueModels) {
            YarnQueue yarnQueue = new YarnQueue();
            yarnQueue.setName(queueModel.getName());
            yarnQueue.setClusterName(cluster.getName());
            yarnQueue.setClusterId(cluster.getId());
            yarnQueue.setPolicy(queueModel.getPolicy());
            yarnQueue.setParentName(queueModel.getParentName());
            yarnQueue.setAclSubmitApps(queueModel.getAclSubmitApps());
            list.add(yarnQueue);
        }
        yarnQueueService.saveOrUpdateBatch(list);

        return Result.succeed(cluster, "保存成功");
    }

    @Override
    public List<HadoopClusterModel> listAll() {
        List<HadoopCluster> clusters = this.list();
        List<YarnQueue> queues = yarnQueueService.list();
        List<HadoopClusterModel> res = new ArrayList<>();
        if (clusters != null) {
            for (HadoopCluster cluster : clusters) {
                HadoopClusterModel hadoopClusterModel = new HadoopClusterModel();
                BeanUtil.copyProperties(cluster, hadoopClusterModel, CopyOptions.create(null, true));
                List<YarnQueue> yarnQueues = new ArrayList<>();
                for (YarnQueue queue : queues) {
                    if (cluster.getId().intValue() == queue.getClusterId().intValue()) {
                        yarnQueues.add(queue);
                    }
                }
                List<YarnQueueModel> yarnQueueModels = BeanUtil.copyToList(yarnQueues, YarnQueueModel.class);
                hadoopClusterModel.setYarnQueueModels(yarnQueueModels);
                res.add(hadoopClusterModel);
            }
        }
        return res;
    }

    @Override
    public List<UserDTO> listBindUser(Integer clusterId) {
        List<ClusterUserRole> clusterUserRoles = clusterUserRoleService.list(Wrappers.<ClusterUserRole>lambdaQuery().eq(ClusterUserRole::getClusterId, clusterId));
        List<Integer> userIds = new ArrayList<>();
        List<Integer> roleIds = new ArrayList<>();
        if (clusterUserRoles == null || clusterUserRoles.size() == 0) {
            return new ArrayList<UserDTO>();
        }
        for (ClusterUserRole clusterUserRole : clusterUserRoles) {
            userIds.add(clusterUserRole.getUserId());
            roleIds.add(clusterUserRole.getRoleId());
        }
        // 查询用户
        List<User> users = new ArrayList<>();
        if (userIds.size() > 0) {
            users = userService.list(Wrappers.<User>lambdaQuery().in(User::getId, userIds));
        }
        // 查询角色
        List<Role> roles = new ArrayList<>();
        if (roleIds.size() > 0) {
            roles = roleService.list(Wrappers.<Role>lambdaQuery().in(Role::getId, roleIds));
        }

        // 绑定用户角色
        Map<Integer, User> userMap = new HashMap<>();
        Map<Integer, Role> roleMap = new HashMap<>();
        for (User user : users) {
            userMap.put(user.getId(), user);
        }
        for (Role role : roles) {
            roleMap.put(role.getId(), role);
        }
        List<UserDTO> userDTOS = new ArrayList<>();
        for (ClusterUserRole userRole : clusterUserRoles) {
            UserDTO userDTO = new UserDTO();
            userDTO.setUser(userMap.get(userRole.getUserId()));
            List<Role> roleList = new ArrayList<>();
            roleList.add(roleMap.get(userRole.getRoleId()));
            userDTO.setRoleList(roleList);
            userDTO.setId(userRole.getId());
            userDTOS.add(userDTO);
        }
        return userDTOS;
    }

    @Override
    public Result bindUserRole(ClusterUserRole clusterUserRole) {
        LambdaQueryWrapper<ClusterUserRole> wrapper = Wrappers.<ClusterUserRole>lambdaQuery()
                .eq(ClusterUserRole::getClusterId, clusterUserRole.getClusterId())
                .eq(ClusterUserRole::getUserId, clusterUserRole.getUserId())
                .eq(ClusterUserRole::getRoleId, clusterUserRole.getRoleId());
        List<ClusterUserRole> clusterUserRoles = clusterUserRoleService.list(wrapper);
        if (clusterUserRoles != null && clusterUserRoles.size() > 0) {
            return Result.failed("关系已存在，无法重复绑定");
        }
        boolean save = clusterUserRoleService.save(clusterUserRole);
        if (save) {
            return Result.succeed(clusterUserRole, "绑定成功");
        }
        return Result.failed("绑定失败");
    }

    @Override
    public Result unbindUserRole(ClusterUserRole clusterUserRole) {
        ClusterUserRole userRole = clusterUserRoleService.getById(clusterUserRole.getId());
        if (userRole == null) {
            return Result.failed("关系不存在，无法解绑");
        }
        boolean save = clusterUserRoleService.removeById(clusterUserRole.getId());
        if (save) {
            return Result.succeed(clusterUserRole, "解绑成功");
        }
        return Result.failed("解绑失败");
    }

    @Override
    public List<HadoopClusterModel> listByUser() {
        List<HadoopCluster> clusters = this.list();
        List<YarnQueue> queues = yarnQueueService.list();
        List<HadoopClusterModel> res = new ArrayList<>();
        if (clusters != null) {
            for (HadoopCluster cluster : clusters) {
                HadoopClusterModel hadoopClusterModel = new HadoopClusterModel();
                BeanUtil.copyProperties(cluster, hadoopClusterModel, CopyOptions.create(null, true));
                List<YarnQueue> yarnQueues = new ArrayList<>();
                for (YarnQueue queue : queues) {
                    if (cluster.getId().intValue() == queue.getClusterId().intValue()) {
                        yarnQueues.add(queue);
                    }
                }
                List<YarnQueueModel> yarnQueueModels = BeanUtil.copyToList(yarnQueues, YarnQueueModel.class);
                hadoopClusterModel.setYarnQueueModels(yarnQueueModels);
                res.add(hadoopClusterModel);
            }
        }
        int userId = StpUtil.getLoginIdAsInt();
        List<ClusterUserRole> clusterUserRoles = clusterUserRoleService.list(Wrappers.<ClusterUserRole>lambdaQuery().eq(ClusterUserRole::getUserId, userId));
        List<Integer> clusterIds = clusterUserRoles.stream().map(x -> x.getClusterId()).collect(Collectors.toList());
        List<HadoopClusterModel> filters = res.stream().filter(r -> clusterIds.contains(r.getId())).collect(Collectors.toList());
        return filters;
    }

    @Override
    public Result detail(Integer id) {
        HadoopCluster cluster = this.getById(id);
        if (cluster == null) {
            return Result.failed("获取失败");
        }
        List<YarnQueue> yarnQueues = yarnQueueService.list(Wrappers.<YarnQueue>lambdaQuery().eq(YarnQueue::getClusterId, cluster.getId()));
        HadoopClusterModel hadoopClusterModel = new HadoopClusterModel();
        BeanUtil.copyProperties(cluster, hadoopClusterModel, CopyOptions.create(null, true));
        List<YarnQueueModel> yarnQueueModels = BeanUtil.copyToList(yarnQueues, YarnQueueModel.class);
        hadoopClusterModel.setYarnQueueModels(yarnQueueModels);
        return Result.succeed(hadoopClusterModel, "获取成功");
    }

    @Override
    public Result upload(MultipartFile file, String path) {
        String res = null;
        try {
            res = minioStorageService.uploadFile(bucketName, file.getBytes(), path + "/" + file.getOriginalFilename());
        } catch (IOException e) {
            e.printStackTrace();
        }
        return Result.succeed(res, "上传成功");
    }

    @Override
    public Result load(HadoopClusterModel model) {
        if (model.getType().equals("CDH")) {
            Result result = this.loadCDH(model);
            return result;
        } else {
            return this.loadApache(model);
        }
    }

    public Result loadApache(HadoopClusterModel model) {
        List<YarnQueueModel> yarnQueues = new ArrayList<>();
        Configuration configuration = new Configuration(false);
        String xmlUrls = model.getXmlUrls();
        if (StringUtils.isBlank(xmlUrls)) {
            return Result.failed("缺少配置文件");
        }
        JSONArray ja = JSONUtil.parseArray(xmlUrls);
        for (int i = 0; i < ja.size(); i++) {
            InputStream inputStream = minioStorageService.downloadFile(bucketName, ja.get(i).toString());
            configuration.addResource(inputStream);
        }

        HadoopCluster hadoopCluster = new HadoopCluster();
        // 集群信息
        String defaultFS = configuration.get("fs.defaultFS");
        String clusterName = defaultFS.split("//")[1];
        System.out.println("集群名称: " + clusterName);
        hadoopCluster.setClusterName(clusterName);
        hadoopCluster.setType(model.getType());
        hadoopCluster.setUuid(model.getUuid());
        // namenode信息
        String namenodes = configuration.get("dfs.ha.namenodes." + clusterName);
        String[] names = namenodes.split(",");
        System.out.println("Hdfs高可用: " + (names.length > 1));
        List<String> namenodeAddresses = new ArrayList<>();
        Arrays.stream(names).forEach(name -> {
            String s = configuration.get("dfs.namenode.http-address." + clusterName + "." + name);
            namenodeAddresses.add("http://" + s);
        });
        hadoopCluster.setHdfsHa(names.length > 1);
        hadoopCluster.setNamenodeAddress(String.join(",", namenodeAddresses.stream().collect(Collectors.joining(","))));

        // hive信息
        String s = configuration.get("hive.zookeeper.quorum");
        hadoopCluster.setHiveHa(StringUtils.isNotBlank(s));
        hadoopCluster.setHiveserverAddress(configuration.get("hive.server2.thrift.bind.host") + ":" + configuration.get("hive.server2.thrift.port"));
        hadoopCluster.setMetastoreAddress(configuration.get("hive.metastore.uris"));

        // yarn信息
        String rms = configuration.get("yarn.resourcemanager.ha.rm-ids");
        List<String> rmAddresses = new ArrayList<>();
        Arrays.stream(rms.split(",")).forEach(rm -> {
            rmAddresses.add("http://" + configuration.get("yarn.resourcemanager.webapp.address." + rm));
        });
        hadoopCluster.setYarnHa(configuration.get("yarn.resourcemanager.ha.enabled").equals("true"));
        hadoopCluster.setResourcemanagerAddress(rmAddresses.stream().collect(Collectors.joining(",")));
        // zookeeper信息
        hadoopCluster.setZkQuorum(configuration.get("ha.zookeeper.quorum"));
        // yarn队列信息
        RestTemplate restTemplate = new RestTemplate();
        String body = restTemplate.exchange(rmAddresses.get(0) + "/ws/v1/cluster/scheduler", HttpMethod.GET, null, String.class).getBody();
        if (StringUtils.isNotBlank(body)) {
            JSONObject jo = new JSONObject(body);
            JSONObject schedulerJSON = jo.getJSONObject("scheduler");
            JSONObject schedulerInfo = schedulerJSON.getJSONObject("schedulerInfo");
            JSONObject q = schedulerInfo.getJSONObject("queues");
            JSONArray queues = q.getJSONArray("queue");
            JSONArray jsonArray = new JSONArray();
            jsonArray.set(schedulerInfo);
            resolveQueue(null, jsonArray, yarnQueues, "Apache");
            for (YarnQueueModel yarnQueueModel : yarnQueues) {
                yarnQueueModel.setClusterName(hadoopCluster.getName());
                yarnQueueModel.setClusterUUID(hadoopCluster.getUuid());
            }
        }

        JSONObject jsonObject = new JSONObject();
        jsonObject.set("Cluster", hadoopCluster);
        jsonObject.set("YarnQueue", yarnQueues);
        return Result.succeed(jsonObject, "加载成功");
    }

    public Result loadCDH(HadoopClusterModel model) {
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
            hadoopCluster.setUuid(apiCluster.getUuid());

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
                        if (config.getName().equals("hs2_thrift_address_port")) {
                            nnPort = config.getValue() != null ? config.getValue() : config.getDefaultValue();
                            break;
                        }
                    }
                    String hiveServer2Address = "jdbc:hive2://" + hostname + ":" + nnPort;
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
                    String hmAddress = "thrift://" + hostname + ":" + nnPort;
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
            ApiServiceConfig yarnConfig = servicesResource.readServiceConfig("yarn", DataView.FULL);
            List<ApiConfig> yarnConfigs = yarnConfig.getConfigs();
            String json = "";
            for (ApiConfig apiConfig : yarnConfigs) {
                if (apiConfig.getName().equals("yarn_fs_scheduled_allocations_draft")) {
                    json = apiConfig.getValue() == null ? apiConfig.getDefaultValue() : apiConfig.getValue();
                    break;
                }
            }
            if (StringUtils.isBlank(json)) {
                for (ApiConfig apiConfig : yarnConfigs) {
                    if (apiConfig.getName().equals("yarn_fs_scheduled_allocations")) {
                        json = apiConfig.getValue() == null ? apiConfig.getDefaultValue() : apiConfig.getValue();
                        break;
                    }
                }
            }
            if (StringUtils.isNotBlank(json)) {
                JSONObject jsonObject = new JSONObject(json);
                JSONArray queues = jsonObject.getJSONArray("queues");
                resolveQueue(null, queues, yarnQueues, "CDH");
                for (YarnQueueModel yarnQueueModel : yarnQueues) {
                    yarnQueueModel.setClusterName(apiCluster.getName());
                    yarnQueueModel.setClusterUUID(apiCluster.getUuid());
                }
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

    private void resolveQueue(JSONObject parent, JSONArray queues, List<YarnQueueModel> yarnQueues, String type) {
        queues.jsonIter().forEach(q -> {
            String queueName = q.getStr("name");
            if (StringUtils.isBlank(queueName)) {
                queueName = q.getStr("queueName");
            }
            YarnQueueModel yarnQueue = new YarnQueueModel();
            yarnQueue.setName(queueName);
            final String[] aclSubmitApps = {q.getStr("aclSubmitApps")};
            if (StringUtils.isBlank(aclSubmitApps[0])) {
                JSONObject queueAcls = q.getJSONObject("queueAcls");
                if (queueAcls != null) {
                    JSONArray queueAcl = queueAcls.getJSONArray("queueAcl");
                    queueAcl.jsonIter().forEach(acl -> {
                        if (acl.getStr("accessType").equals("SUBMIT_APP")) {
                            aclSubmitApps[0] = acl.getStr("accessControlList");
                        }
                    });
                }
            }
            yarnQueue.setAclSubmitApps(aclSubmitApps[0]);
            yarnQueue.setPolicy(q.getStr("schedulingPolicy"));
            if (parent != null) {
                String parentQueueName = parent.getStr("name");
                if (StringUtils.isBlank(parentQueueName)) {
                    parentQueueName = parent.getStr("queueName");
                }
                yarnQueue.setParentName(parentQueueName);
            }
            yarnQueues.add(yarnQueue);
            if ("CDH".equals(type)) {
                JSONArray children = q.getJSONArray("queues");
                this.resolveQueue(q, children, yarnQueues, type);
            } else {
                JSONObject jsonObject = q.getJSONObject("queues");
                if (jsonObject != null) {
                    JSONArray children = jsonObject.getJSONArray("queue");
                    this.resolveQueue(q, children, yarnQueues, type);
                }
            }
        });
    }
}

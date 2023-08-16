package com.dlink.utils;

import cn.hutool.core.io.FileUtil;
import cn.hutool.core.util.RandomUtil;
import cn.hutool.json.JSONArray;
import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.dlink.assertion.Asserts;
import com.dlink.assertion.Tips;
import com.dlink.common.result.Result;
import com.dlink.context.ClusterContextHolder;
import com.dlink.dto.WorkflowTaskDTO;
import com.dlink.job.JobResult;
import com.dlink.minio.MinioStorageService;
import com.dlink.model.*;
import com.dlink.service.HadoopClientService;
import com.dlink.service.HadoopClusterService;
import com.dlink.service.HadoopTenantService;
import com.jcraft.jsch.JSchException;
import org.apache.commons.lang3.StringUtils;
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.security.UserGroupInformation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.util.*;
import java.util.stream.Collectors;

/**
 * SparkUtil
 *
 * @author cl1226
 * @since 2023/7/18 17:21
 **/
@Component
public class SparkUtil {

    @Autowired
    private HadoopClusterService hadoopClusterService;
    @Autowired
    private HadoopClientService hadoopClientService;
    @Autowired
    private HadoopTenantService hadoopTenantService;
    @Autowired
    private MinioStorageService minioStorageService;
    @Autowired
    private CommonUtil commonUtil;
    @Value("${dinky.minio.url}")
    private String minioUrl;
    @Value("${dinky.minio.bucket-name}")
    private String bucket;

    public Result submitSparkTask(WorkflowTask task) {
        Asserts.checkNull(task, Tips.TASK_NOT_EXIST);
        Integer clusterId = (Integer) ClusterContextHolder.get();
        HadoopCluster cluster = hadoopClusterService.getById(clusterId);

        List<HadoopClient> list = hadoopClientService.list(Wrappers.<HadoopClient>lambdaQuery().eq(HadoopClient::getClusterId, clusterId));
        if (list == null || list.size() == 0) {
            return Result.failed("请为集群设置客户端连接，用于远程提交任务!");
        }

        int i = RandomUtil.randomInt(0, list.size());
        HadoopClient hadoopClient = list.get(i);
        String envStr = hadoopClient.getEnv();
        if (StringUtils.isBlank(envStr)) {
            return Result.failed("集群客户端没有配置环境变量");
        }
        Map<String, String> env = new HashMap<>();
        Arrays.stream(envStr.split("\\n")).forEach(line -> {
            String[] lines = line.split("=");
            env.put(lines[0].trim(), lines[1].trim());
        });
        List<String> noContainsKey = Arrays.stream("HADOOP_CONF_DIR,JAVA_HOME,YARN_CONF_DIR,SPARK_HOME".split(","))
                .filter(confName -> !env.containsKey(confName)).collect(Collectors.toList());
        if (noContainsKey != null && noContainsKey.size() > 0) {
            return Result.failed("缺少环境配置项: " + noContainsKey.stream().collect(Collectors.joining(",")));
        }
        String attributes = task.getAttributes();
        JSONObject jsonObject = new JSONObject(attributes);
        ShellUtil instance = ShellUtil.getInstance();
        StringBuffer buffer = new StringBuffer();
        HadoopCluster currentCluster = commonUtil.getCurrentCluster();
        Workspace currentWorkspace = commonUtil.getCurrentWorkspace();
        try {
            instance.init(hadoopClient.getIp(), hadoopClient.getPort(), hadoopClient.getUsername(), hadoopClient.getPassword());
            buffer.append("spark-submit ")
                    .append("--master yarn ")
                    .append("--deploy-mode cluster ")
                    .append("--class com.svolt.octopus.SparkJobStarter ")
                    .append("--conf spark.driver.memory=").append(jsonObject.getStr("driverMemory", "1024m")).append(" ")
                    .append("--conf spark.executor.cores=").append(jsonObject.getStr("executorCores", "1")).append(" ")
                    .append("--conf spark.executor.memory=").append(jsonObject.getStr("executorMemory", "1024m")).append(" ")
                    .append("--conf spark.executor.instances=").append(jsonObject.getStr("executorInstances", "2")).append(" ")
                    .append("--conf spark.yarn.maxAppAttempts=1 ")
                    .append("--conf spark.yarn.submit.waitAppCompletion=false ");

            Arrays.stream(jsonObject.getStr("optionParameters", "")
                    .split("\\n"))
                    .forEach(parameter -> {
                        buffer.append(parameter.trim()).append(" ");
                    });
            StringBuffer jarPath= new StringBuffer();
            jarPath.append("," + minioUrl + "/" + bucket + "/" + currentCluster.getName() + "/" + currentWorkspace.getObsPath() + "/jar/octopus/dependencies/hutool-all-5.8.11.jar");
            StringBuffer filePath= new StringBuffer();
            if (jsonObject.getJSONArray("resourcePaths") != null) {
                jsonObject.getJSONArray("resourcePaths").stream().forEach(path -> {
                    if (String.valueOf(path).trim().endsWith(".jar")) {
                        jarPath.append(",").append(minioUrl + "/" + bucket + "/" + currentCluster.getName() + "/" + currentWorkspace.getObsPath() + String.valueOf(path).trim());
                    } else {
                        filePath.append(",").append(minioUrl + "/" + bucket + "/" + currentCluster.getName() + "/" + currentWorkspace.getObsPath() + String.valueOf(path).trim());
                    }
                });
            }
            if (StringUtils.isNotBlank(jarPath)) {
                buffer.append("--jars " + jarPath.toString().substring(1)).append(" ");
            }
            if (StringUtils.isNotBlank(filePath)) {
                buffer.append("--files " + filePath.toString().substring(1)).append(" ");
            }

            JSONObject params = new JSONObject();
            params.set("name", task.getName());
            List<JSONObject> steps = new ArrayList<>();
            WorkflowTaskDTO workflowTaskDTO = JSONUtil.toBean(task.getGraphData(), WorkflowTaskDTO.class);
            // 组装step
            Map<String, JSONObject> stepMap = new HashMap<>();
            workflowTaskDTO.getNodes().stream().forEach(node -> {
                JSONObject step = new JSONObject();
                step.set("id", node.getId());
                step.set("stepType", node.getGroup());
                step.set("sourceType", node.getNodeType());
                step.set("name", node.getLabel());
                step.set("result_table_name", node.getResult_table_name());
                step.set("source_table_name", node.getSource_table_name());
                step.set("attributes", StringUtils.isNotBlank(node.getNodeInfo()) ? JSONUtil.parseObj(node.getNodeInfo()) : "{}");
                stepMap.put(node.getId(), step);
                steps.add(step);
            });
            params.set("steps", steps);
            // 设置前置
            workflowTaskDTO.getEdges().stream().forEach(edge -> {
                stepMap.get(edge.getTarget()).set("source_table_name", stepMap.get(edge.getSource()).getStr("result_table_name"));
            });

            buffer.append(minioUrl + "/" + bucket + "/" + currentCluster.getName() + "/" + currentWorkspace.getObsPath() + "/jar/octopus/octopus-1.0.0.jar").append(" ")
                    .append("\"" + params.toString().replaceAll("\\\"", "\\\\\"").replaceAll("}}", "}^}") + "\"");
            StringBuffer cmd = new StringBuffer("source /etc/profile && ");
            if (cluster.isKerberos()) {
                cmd.append("kinit -kt /opt/keytab/svolt.keytab svolt@SVOLT.COM && ");
            }
            cmd.append(buffer);
            instance.execute(cmd.toString());
            return Result.succeed("提交成功");
        } catch (JSchException e) {
            e.printStackTrace();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

}

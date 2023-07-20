package com.dlink.utils;

import cn.hutool.core.util.XmlUtil;
import cn.hutool.json.JSONArray;
import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;
import org.apache.commons.lang3.StringUtils;
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.Path;
import org.junit.Test;
import org.springframework.http.HttpMethod;
import org.springframework.web.client.RestTemplate;
import org.w3c.dom.Document;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.*;
import java.util.stream.Collectors;

/**
 * XmlTest
 *
 * @author cl1226
 * @since 2023/7/12 10:28
 **/
public class XmlTest {

    @Test
    public void test1() throws IOException {
        Configuration configuration = new Configuration(false);
        configuration.addResource(new FileInputStream("C:\\Users\\SV00242152\\Desktop\\tdp-xml\\core-site.xml"));
        configuration.addResource(new FileInputStream("C:\\Users\\SV00242152\\Desktop\\tdp-xml\\hdfs-site.xml"));
        configuration.addResource(new FileInputStream("C:\\Users\\SV00242152\\Desktop\\tdp-xml\\yarn-site.xml"));
        configuration.addResource(new FileInputStream("C:\\Users\\SV00242152\\Desktop\\tdp-xml\\hive-site.xml"));
        configuration.addResource(new FileInputStream("C:\\Users\\SV00242152\\Desktop\\tdp-xml\\mapred-site.xml"));

        String defaultFS = configuration.get("fs.defaultFS");
        String clusterName = defaultFS.split("//")[1];
        System.out.println("集群名称: " + clusterName);

        String namenodes = configuration.get("dfs.ha.namenodes." + clusterName);
        String[] names = namenodes.split(",");
        System.out.println("Hdfs高可用: " + (names.length > 1));
        List<String> namenodeAddresses = new ArrayList<>();
        Arrays.stream(names).forEach(name -> {
            String s = configuration.get("dfs.namenode.http-address." + clusterName + "." + name);
            namenodeAddresses.add("http://" + s);
        });
        System.out.println("Namenode地址：" + namenodeAddresses.stream().collect(Collectors.joining(",")));
        String s = configuration.get("hive.zookeeper.quorum");
        System.out.println("Hive高可用：" + StringUtils.isNotBlank(s));
        System.out.println("Hiveserver地址：" + configuration.get("hive.server2.thrift.bind.host") + ":" + configuration.get("hive.server2.thrift.port"));
        System.out.println("Hive Metastore地址：" + configuration.get("hive.metastore.uris"));
        System.out.println("Yarn高可用：" + configuration.get("yarn.resourcemanager.ha.enabled").equals("true"));
        String rms = configuration.get("yarn.resourcemanager.ha.rm-ids");
        List<String> rmAddresses = new ArrayList<>();
        Arrays.stream(rms.split(",")).forEach(rm -> {
            rmAddresses.add("http://" + configuration.get("yarn.resourcemanager.webapp.address." + rm));
        });
        System.out.println("Resourcemanager地址：" + rmAddresses.stream().collect(Collectors.joining(",")));
        System.out.println("Zookeeper地址：" + configuration.get("ha.zookeeper.quorum"));

    }

    @Test
    public void test2() {
//        RestTemplate restTemplate = new RestTemplate();
//        String result = restTemplate.exchange("http://sv-wx-sysj-hadoop02:8088/ws/v1/cluster/scheduler", HttpMethod.GET, null, String.class).getBody();
//        System.out.println(result);
//        JSONObject jsonObject = JSONUtil.parseObj(result);
//        System.out.println(jsonObject.get("scheduler"));
        String s = "{\"type\":\"Apache\",\"xmlUrls\":\"[\\\"/hadoop/2594d645-34fe-46a4-b7c7-eff54ade7802/keytab/core-site.xml\\\",\\\"/hadoop/2594d645-34fe-46a4-b7c7-eff54ade7802/keytab/hdfs-site.xml\\\",\\\"/hadoop/2594d645-34fe-46a4-b7c7-eff54ade7802/keytab/hive-site.xml\\\",\\\"/hadoop/2594d645-34fe-46a4-b7c7-eff54ade7802/keytab/mapred-site.xml\\\",\\\"/hadoop/2594d645-34fe-46a4-b7c7-eff54ade7802/keytab/yarn-site.xml\\\"]\",\"uuid\":\"2594d645-34fe-46a4-b7c7-eff54ade7802\"}\n";
        JSONObject jo = JSONUtil.parseObj(s);
        JSONArray ja = jo.getJSONArray("xmlUrls");
        for (int i = 0; i < ja.size(); i++) {
            System.out.println(ja.get(i));
        }
    }

}

package com.dlink.service.impl;

import cn.hutool.core.bean.BeanUtil;
import cn.hutool.core.bean.copier.CopyOptions;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.dlink.common.result.Result;
import com.dlink.db.service.impl.SuperServiceImpl;
import com.dlink.dto.SearchCondition;
import com.dlink.mapper.ClusterInstanceMapper;
import com.dlink.model.HadoopClient;
import com.dlink.model.HadoopCluster;
import com.dlink.service.HadoopClientService;
import com.dlink.service.HadoopClusterService;
import com.dlink.utils.ShellUtil;
import com.jcraft.jsch.JSchException;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * EnvironmentInstanceServiceImpl
 *
 * @author cl1226
 * @since 2023/07/03 08:48
 **/
@Service
public class HadoopClientServiceImpl extends SuperServiceImpl<ClusterInstanceMapper, HadoopClient> implements HadoopClientService {

    @Autowired
    private HadoopClusterService hadoopClusterService;

    @Override
    public Page<HadoopClient> page(SearchCondition searchCondition) {
        Page<HadoopClient> page = new Page<>(searchCondition.getPageIndex(), searchCondition.getPageSize());

        QueryWrapper<HadoopClient> queryWrapper = new QueryWrapper<HadoopClient>();
        if (StringUtils.isNotBlank(searchCondition.getName())) {
            queryWrapper.like("name", searchCondition.getName());
        }
        if (StringUtils.isNotBlank(searchCondition.getHostname())) {
            queryWrapper.like("hostname", searchCondition.getHostname());
        }
        if (StringUtils.isNotBlank(searchCondition.getHostname())) {
            queryWrapper.like("cluster_name", searchCondition.getClusterName());
        }

        queryWrapper.orderByDesc("create_time");

        return this.baseMapper.selectPage(page, queryWrapper);
    }

    @Override
    public Result create(HadoopClient instance) {
        HadoopClient hadoopClient = new HadoopClient();
        BeanUtil.copyProperties(instance, hadoopClient, CopyOptions.create(null, true));
        HadoopCluster cluster = hadoopClusterService.getById(hadoopClient.getClusterId());
        if (cluster != null) {
            hadoopClient.setClusterName(cluster.getName());
        }
        this.saveOrUpdate(hadoopClient);
        return Result.succeed(hadoopClient, "保存成功");
    }

    @Override
    public Result testConnect(HadoopClient hadoopClient) {
        ShellUtil instance = ShellUtil.getInstance();
        try {
            instance.init(hadoopClient.getIp(), hadoopClient.getPort(), hadoopClient.getUsername(), hadoopClient.getPassword());
            String res = instance.execCmd("source /etc/profile && ls /");
            if (StringUtils.isNotBlank(res)) {
                return Result.succeed("连接成功");
            }
            return Result.failed("连接失败");
        } catch (JSchException e) {
            e.printStackTrace();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return Result.failed("连接失败");
    }
}

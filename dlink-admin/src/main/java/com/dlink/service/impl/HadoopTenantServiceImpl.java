package com.dlink.service.impl;

import com.dlink.common.result.Result;
import com.dlink.db.service.impl.SuperServiceImpl;
import com.dlink.mapper.HadoopTenantMapper;
import com.dlink.model.HadoopCluster;
import com.dlink.model.HadoopTenant;
import com.dlink.model.YarnQueue;
import com.dlink.service.HadoopClusterService;
import com.dlink.service.HadoopTenantService;
import com.dlink.service.YarnQueueService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * HadoopTenantServiceImpl
 *
 * @author cl1226
 * @since 2023/7/12 13:36
 **/
@Service
public class HadoopTenantServiceImpl extends SuperServiceImpl<HadoopTenantMapper, HadoopTenant> implements HadoopTenantService {

    @Autowired
    private HadoopClusterService hadoopClusterService;
    @Autowired
    private YarnQueueService yarnQueueService;

    @Override
    public Result saveOrUpdateModel(HadoopTenant model) {
        Integer clusterId = model.getClusterId();
        HadoopCluster hadoopCluster = hadoopClusterService.getById(clusterId);
        if (hadoopCluster == null) {
            return Result.failed("集群为空");
        }
        model.setClusterName(hadoopCluster.getName());
        model.setClusterUuid(hadoopCluster.getUuid());
        Integer queueId = model.getQueueId();
        YarnQueue yarnQueue = yarnQueueService.getById(queueId);
        if (yarnQueue == null) {
            return Result.failed("队列为空");
        }
        model.setQueueName(yarnQueue.getName());
        this.saveOrUpdate(model);
        return Result.succeed(model, "保存成功");
    }
}

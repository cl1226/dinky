package com.dlink.service;

import com.dlink.common.result.Result;
import com.dlink.db.service.ISuperService;
import com.dlink.model.HadoopCluster;
import com.dlink.model.HadoopClusterModel;

/**
 * HadoopClusterService
 *
 * @author cl1226
 * @since 2023/6/28 10:39
 **/
public interface HadoopClusterService extends ISuperService<HadoopCluster> {

    Result save(HadoopClusterModel model);

    Result load(HadoopClusterModel model);

}

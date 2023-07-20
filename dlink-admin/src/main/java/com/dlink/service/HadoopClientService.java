package com.dlink.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.dlink.common.result.Result;
import com.dlink.db.service.ISuperService;
import com.dlink.dto.SearchCondition;
import com.dlink.model.HadoopClient;

/**
 * ClusterInstanceService
 *
 * @author cl1226
 * @since 2023/6/15 15:25
 **/
public interface HadoopClientService extends ISuperService<HadoopClient> {

    Page<HadoopClient> page(SearchCondition searchCondition);

    Result create(HadoopClient instance);

    Result testConnect(HadoopClient hadoopClient);
}

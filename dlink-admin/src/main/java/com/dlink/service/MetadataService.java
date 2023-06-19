package com.dlink.service;

import com.dlink.common.result.Result;

/**
 * MetadataService
 *
 * @author cl1226
 * @since 2023/6/15 14:14
 **/
public interface MetadataService {

    Result statistics();

    Result statisticsDetail();

    Result calcLineage(Integer taskId);

}

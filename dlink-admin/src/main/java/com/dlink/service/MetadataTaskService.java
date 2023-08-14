package com.dlink.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.dlink.common.result.Result;
import com.dlink.db.service.ISuperService;
import com.dlink.dto.SearchCondition;
import com.dlink.model.MetadataTask;

/**
 * MetadataTaskService
 *
 * @author cl1226
 * @since 2023/6/9 13:36
 **/
public interface MetadataTaskService extends ISuperService<MetadataTask> {

    Page<MetadataTask> page(SearchCondition searchCondition);

    Result online(Integer id);

    Result offline(Integer id);

    Result execute(Integer id);

    Result showLog(Integer id);

    Result statisticsMetadata();

    Result statisticsTaskInstance();

}

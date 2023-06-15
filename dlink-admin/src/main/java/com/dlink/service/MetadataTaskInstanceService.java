package com.dlink.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.dlink.db.service.ISuperService;
import com.dlink.dto.SearchCondition;
import com.dlink.model.MetadataTaskInstance;

/**
 * MetadataTaskInstanceService
 *
 * @author cl1226
 * @since 2023/6/15 9:20
 **/
public interface MetadataTaskInstanceService extends ISuperService<MetadataTaskInstance> {

    Page<MetadataTaskInstance> page(SearchCondition searchCondition);

}

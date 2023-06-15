package com.dlink.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.dlink.db.service.ISuperService;
import com.dlink.dto.MetadataDbDTO;
import com.dlink.dto.SearchCondition;
import com.dlink.model.MetadataDb;

/**
 * HiveMetaDbsService
 *
 * @author cl1226
 * @since 2023/6/13 11:01
 **/
public interface MetadataDbService extends ISuperService<MetadataDb> {

    Page<MetadataDbDTO> page(SearchCondition searchCondition);

    MetadataDbDTO detail(Integer id);

}

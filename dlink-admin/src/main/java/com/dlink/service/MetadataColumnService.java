package com.dlink.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.dlink.db.service.ISuperService;
import com.dlink.dto.MetadataColumnDTO;
import com.dlink.dto.SearchCondition;
import com.dlink.model.MetadataColumn;

/**
 * MetadataColumnService
 *
 * @author cl1226
 * @since 2023/6/14 17:29
 **/
public interface MetadataColumnService extends ISuperService<MetadataColumn> {

    Page<MetadataColumnDTO> page(SearchCondition searchCondition);

    MetadataColumnDTO detail(Integer id);

}

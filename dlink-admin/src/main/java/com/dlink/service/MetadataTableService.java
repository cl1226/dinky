package com.dlink.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.dlink.common.result.Result;
import com.dlink.db.service.ISuperService;
import com.dlink.dto.MetadataTableDTO;
import com.dlink.dto.SearchCondition;
import com.dlink.metadata.result.JdbcSelectResult;
import com.dlink.model.MetadataTable;

/**
 * MetadataTableService
 *
 * @author cl1226
 * @since 2023/6/14 14:15
 **/
public interface MetadataTableService extends ISuperService<MetadataTable> {

    Page<MetadataTableDTO> page(SearchCondition searchCondition);

    MetadataTableDTO detail(Integer id);

    JdbcSelectResult preview(Integer id);
}

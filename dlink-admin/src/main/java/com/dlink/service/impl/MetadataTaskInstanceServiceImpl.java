package com.dlink.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.dlink.db.service.impl.SuperServiceImpl;
import com.dlink.dto.SearchCondition;
import com.dlink.mapper.MetadataTaskInstanceMapper;
import com.dlink.model.MetadataTaskInstance;
import com.dlink.service.MetadataTaskInstanceService;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;

/**
 * MetadataTaskInstanceServiceImpl
 *
 * @author cl1226
 * @since 2023/6/15 9:21
 **/
@Service
public class MetadataTaskInstanceServiceImpl extends SuperServiceImpl<MetadataTaskInstanceMapper, MetadataTaskInstance> implements MetadataTaskInstanceService {

    @Override
    public Page<MetadataTaskInstance> page(SearchCondition searchCondition) {
        Page<MetadataTaskInstance> page = new Page<>(searchCondition.getPageIndex(), searchCondition.getPageSize());

        QueryWrapper<MetadataTaskInstance> queryWrapper = new QueryWrapper<MetadataTaskInstance>();
        if (StringUtils.isNotBlank(searchCondition.getName())) {
            queryWrapper.eq("name", searchCondition.getName());
        }
        if (searchCondition.getCatalogueId() != null) {
            queryWrapper.eq("catalogue_id", searchCondition.getCatalogueId());
        }

        queryWrapper.orderByDesc("create_time");

        return this.baseMapper.selectPage(page, queryWrapper);
    }

}

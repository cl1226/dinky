package com.dlink.service.impl;

import cn.hutool.core.bean.BeanUtil;
import cn.hutool.core.bean.copier.CopyOptions;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.dlink.db.service.impl.SuperServiceImpl;
import com.dlink.dto.MetadataColumnDTO;
import com.dlink.dto.SearchCondition;
import com.dlink.mapper.MetadataColumnMapper;
import com.dlink.model.MetadataColumn;
import com.dlink.model.MetadataColumnLineage;
import com.dlink.model.MetadataTableLineage;
import com.dlink.service.MetadataColumnLineageService;
import com.dlink.service.MetadataColumnService;
import com.dlink.service.MetadataTableLineageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * MetadataColumnServiceImpl
 *
 * @author cl1226
 * @since 2023/6/14 17:29
 **/
@Service
public class MetadataColumnServiceImpl extends SuperServiceImpl<MetadataColumnMapper, MetadataColumn> implements MetadataColumnService {

    @Autowired
    private MetadataTableLineageService metadataTableLineageService;
    @Autowired
    private MetadataColumnLineageService metadataColumnLineageService;

    @Override
    public Page<MetadataColumnDTO> page(SearchCondition searchCondition) {
        Page<MetadataColumn> page = new Page<>(searchCondition.getPageIndex(), searchCondition.getPageSize());

        QueryWrapper<MetadataColumn> queryWrapper = new QueryWrapper<MetadataColumn>();
        if (searchCondition.getDatasourceType() != null && searchCondition.getDatasourceType().size() > 0) {
            queryWrapper.in("datasource_type", searchCondition.getDatasourceType());
        }
        if (searchCondition.getName() != null) {
            queryWrapper.like("name", searchCondition.getName());
        }

        queryWrapper.orderByDesc("datasource_type", "update_time");

        Page<MetadataColumn> metadataColumnPage = this.baseMapper.selectPage(page, queryWrapper);

        List<MetadataColumn> records = metadataColumnPage.getRecords();
        List<MetadataColumnDTO> newRecords = new ArrayList<>();
        for (MetadataColumn metadataColumn : records) {
            MetadataColumnDTO metadataColumnDTO = new MetadataColumnDTO();
            BeanUtil.copyProperties(metadataColumn, metadataColumnDTO, CopyOptions.create(null, true));
            metadataColumnDTO.setLabelName(metadataColumn.getDatasourceType() + "_Column");
            metadataColumnDTO.setType("Column");
            metadataColumnDTO.setPosition("/" + metadataColumnDTO.getDatasourceName() + "/" + metadataColumn.getDbName() + "/" + metadataColumn.getTableName());
            newRecords.add(metadataColumnDTO);
        }
        Page<MetadataColumnDTO> result = new Page<>();
        BeanUtil.copyProperties(metadataColumnPage, result, CopyOptions.create(null, true, "records"));
        result.setRecords(newRecords);

        return result;
    }

    @Override
    public MetadataColumnDTO detail(Integer id) {
        MetadataColumn metadataColumn = this.getById(id);
        if (metadataColumn == null) {
            return null;
        }
        MetadataColumnDTO metadataColumnDTO = new MetadataColumnDTO();
        BeanUtil.copyProperties(metadataColumn, metadataColumnDTO, CopyOptions.create(null, true));
        metadataColumnDTO.setLabelName(metadataColumn.getDatasourceType() + "_Column");
        metadataColumnDTO.setType("Column");
        metadataColumnDTO.setPosition("/" + metadataColumn.getDatasourceName() + "/" + metadataColumn.getDbName() + "/" + metadataColumn.getTableName());

        LambdaQueryWrapper<MetadataTableLineage> tableWrapper = Wrappers.<MetadataTableLineage>lambdaQuery().eq(MetadataTableLineage::getOriginTableId, metadataColumn.getTableId());
        tableWrapper.or().eq(MetadataTableLineage::getTargetTableId, metadataColumn.getTableId());
        List<MetadataTableLineage> tableLineages = metadataTableLineageService.list(tableWrapper);

        LambdaQueryWrapper<MetadataColumnLineage> columnWrapper = Wrappers.<MetadataColumnLineage>lambdaQuery().eq(MetadataColumnLineage::getOriginTableId, metadataColumn.getTableId());
        columnWrapper.or().eq(MetadataColumnLineage::getTargetTableId, metadataColumn.getTableId());
        List<MetadataColumnLineage> columnLineages = metadataColumnLineageService.list(columnWrapper);
        metadataColumnDTO.setMetadataTableLineages(tableLineages);
        metadataColumnDTO.setMetadataColumnLineages(columnLineages);

        return metadataColumnDTO;
    }

}

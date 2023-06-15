package com.dlink.service.impl;

import cn.hutool.core.bean.BeanUtil;
import cn.hutool.core.bean.copier.CopyOptions;
import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.dlink.db.service.impl.SuperServiceImpl;
import com.dlink.dto.MetadataDbDTO;
import com.dlink.dto.MetadataTableDTO;
import com.dlink.dto.SearchCondition;
import com.dlink.mapper.MetadataDbMapper;
import com.dlink.model.MetadataDb;
import com.dlink.model.MetadataTable;
import com.dlink.service.MetadataDbService;
import com.dlink.service.MetadataTableService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * MetadataDbServiceImpl
 *
 * @author cl1226
 * @since 2023/6/13 11:01
 **/
@Service
public class MetadataDbServiceImpl extends SuperServiceImpl<MetadataDbMapper, MetadataDb> implements MetadataDbService {

    @Autowired
    private MetadataTableService metadataTableService;

    @Override
    public Page<MetadataDbDTO> page(SearchCondition searchCondition) {
        Page<MetadataDb> page = new Page<>(searchCondition.getPageIndex(), searchCondition.getPageSize());

        QueryWrapper<MetadataDb> queryWrapper = new QueryWrapper<MetadataDb>();
        if (searchCondition.getDatasourceType() != null && searchCondition.getDatasourceType().size() > 0) {
            queryWrapper.in("datasource_type", searchCondition.getDatasourceType());
        }
        if (searchCondition.getName() != null) {
            queryWrapper.like("name", searchCondition.getName());
        }

        queryWrapper.orderByDesc("datasource_type", "update_time");

        Page<MetadataDb> metadataDbPage = this.baseMapper.selectPage(page, queryWrapper);

        List<MetadataDb> records = metadataDbPage.getRecords();
        List<MetadataDbDTO> newRecords = new ArrayList<>();
        for (MetadataDb metadataDb : records) {
            MetadataDbDTO metadataDbDTO = new MetadataDbDTO();
            BeanUtil.copyProperties(metadataDb, metadataDbDTO, CopyOptions.create(null, true));
            metadataDbDTO.setLabelName(metadataDb.getDatasourceType() + "_DB");
            metadataDbDTO.setType("Database");
            metadataDbDTO.setPosition("/" + metadataDbDTO.getDatasourceName());
            newRecords.add(metadataDbDTO);
        }
        Page<MetadataDbDTO> result = new Page<>();
        BeanUtil.copyProperties(metadataDbPage, result, CopyOptions.create(null, true, "records"));
        result.setRecords(newRecords);

        return result;
    }

    @Override
    public MetadataDbDTO detail(Integer id) {
        MetadataDb metadataDb = this.getById(id);
        if (metadataDb == null) {
            return null;
        }
        MetadataDbDTO metadataDbDTO = new MetadataDbDTO();
        BeanUtil.copyProperties(metadataDb, metadataDbDTO, CopyOptions.create(null, true));
        metadataDbDTO.setLabelName(metadataDb.getDatasourceType() + "_DB");
        metadataDbDTO.setType("Database");
        metadataDbDTO.setPosition("/" + metadataDb.getDatasourceName());

        List<MetadataTable> metadataTables = metadataTableService.list(Wrappers.<MetadataTable>query().eq("db_id", metadataDb.getId()));
        List<MetadataTableDTO> metadataTableDTOS = BeanUtil.copyToList(metadataTables, MetadataTableDTO.class, CopyOptions.create(null, true));
        for (MetadataTableDTO metadataTableDTO : metadataTableDTOS) {
            if (metadataTableDTO.getAttributes() != null) {
                JSONObject jsonObject = JSONUtil.parseObj(metadataTableDTO.getAttributes());
                String tableType = jsonObject.getStr("Table Type", "");
                metadataTableDTO.setTableType(tableType);
            }
        }
        metadataDbDTO.setMetadataTableDTOS(metadataTableDTOS);
        return metadataDbDTO;
    }
}

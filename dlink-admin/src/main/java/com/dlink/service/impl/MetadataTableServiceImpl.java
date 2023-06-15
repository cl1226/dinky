package com.dlink.service.impl;

import cn.hutool.core.bean.BeanUtil;
import cn.hutool.core.bean.copier.CopyOptions;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.dlink.common.result.Result;
import com.dlink.db.service.impl.SuperServiceImpl;
import com.dlink.dto.MetadataColumnDTO;
import com.dlink.dto.MetadataTableDTO;
import com.dlink.dto.SearchCondition;
import com.dlink.mapper.MetadataTableMapper;
import com.dlink.metadata.driver.Driver;
import com.dlink.metadata.result.JdbcSelectResult;
import com.dlink.model.DataBase;
import com.dlink.model.MetadataColumn;
import com.dlink.model.MetadataTable;
import com.dlink.model.QueryData;
import com.dlink.result.AbstractResult;
import com.dlink.service.DataBaseService;
import com.dlink.service.MetadataColumnService;
import com.dlink.service.MetadataTableService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * MetadataTableServiceImpl
 *
 * @author cl1226
 * @since 2023/6/14 14:15
 **/
@Service
public class MetadataTableServiceImpl extends SuperServiceImpl<MetadataTableMapper, MetadataTable> implements MetadataTableService {

    @Autowired
    private MetadataColumnService metadataColumnService;
    @Autowired
    private DataBaseService dataBaseService;

    @Override
    public Page<MetadataTableDTO> page(SearchCondition searchCondition) {
        Page<MetadataTable> page = new Page<>(searchCondition.getPageIndex(), searchCondition.getPageSize());

        QueryWrapper<MetadataTable> queryWrapper = new QueryWrapper<MetadataTable>();
        if (searchCondition.getDatasourceType() != null && searchCondition.getDatasourceType().size() > 0) {
            queryWrapper.in("datasource_type", searchCondition.getDatasourceType());
        }
        if (searchCondition.getName() != null) {
            queryWrapper.like("name", searchCondition.getName());
        }

        queryWrapper.orderByDesc("datasource_type", "update_time");

        Page<MetadataTable> metadataTablePage = this.baseMapper.selectPage(page, queryWrapper);

        List<MetadataTable> records = metadataTablePage.getRecords();
        List<MetadataTableDTO> newRecords = new ArrayList<>();
        for (MetadataTable metadataTable : records) {
            MetadataTableDTO metadataTableDTO = new MetadataTableDTO();
            BeanUtil.copyProperties(metadataTable, metadataTableDTO, CopyOptions.create(null, true));
            metadataTableDTO.setLabelName(metadataTable.getDatasourceType() + "_Table");
            metadataTableDTO.setType("Table");
            metadataTableDTO.setPosition("/" + metadataTableDTO.getDatasourceName() + "/" + metadataTable.getDbName());
            newRecords.add(metadataTableDTO);
        }
        Page<MetadataTableDTO> result = new Page<>();
        BeanUtil.copyProperties(metadataTablePage, result, CopyOptions.create(null, true, "records"));
        result.setRecords(newRecords);

        return result;
    }

    @Override
    public MetadataTableDTO detail(Integer id) {
        MetadataTable metadataTable = this.getById(id);
        if (metadataTable == null) {
            return null;
        }
        MetadataTableDTO metadataTableDTO = new MetadataTableDTO();
        BeanUtil.copyProperties(metadataTable, metadataTableDTO, CopyOptions.create(null, true));
        metadataTableDTO.setLabelName(metadataTable.getDatasourceType() + "_Table");
        metadataTableDTO.setType("Table");
        metadataTableDTO.setPosition("/" + metadataTable.getDatasourceName() + "/" + metadataTable.getDbName());

        List<MetadataColumn> metadataColumns = metadataColumnService.list(Wrappers.<MetadataColumn>query().eq("table_id", metadataTable.getId()));
        List<MetadataColumnDTO> metadataColumnDTOS = BeanUtil.copyToList(metadataColumns, MetadataColumnDTO.class, CopyOptions.create(null, true));
        metadataTableDTO.setMetadataColumnDTOS(metadataColumnDTOS);
        return metadataTableDTO;
    }

    @Override
    public JdbcSelectResult preview(Integer id) {
        MetadataTable metadataTable = this.getById(id);
        if (metadataTable == null) {
            return new JdbcSelectResult();
        }
        DataBase dataBase = dataBaseService.getById(metadataTable.getDatasourceId());
        if (dataBase == null) {
            return new JdbcSelectResult();
        }
        Driver driver = Driver.build(dataBase.getDriverConfig());
        QueryData queryData = new QueryData();
        queryData.setSchemaName(metadataTable.getDbName());
        queryData.setTableName(metadataTable.getName());
        QueryData.Option option = queryData.new Option();
        option.setWhere("");
        option.setOrder("");
        option.setLimitStart("");
        option.setLimitEnd("");
        queryData.setOption(option);
        StringBuilder queryOption = driver.genQueryOption(queryData);
        return driver.query(queryOption.toString(), null);
    }
}

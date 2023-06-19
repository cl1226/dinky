package com.dlink.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.dlink.db.service.impl.SuperServiceImpl;
import com.dlink.mapper.MetadataCatalogueMapper;
import com.dlink.model.MetadataCatalogue;
import com.dlink.service.MetadataCatalogueService;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

import static com.dlink.assertion.Asserts.isNull;

/**
 * AssetCatalogueServiceImpl
 *
 * @author cl1226
 * @since 2023/6/8 16:01
 **/
@Service
public class MetadataCatalogueServiceImpl extends SuperServiceImpl<MetadataCatalogueMapper, MetadataCatalogue> implements MetadataCatalogueService {
    @Override
    public List<MetadataCatalogue> getAllData() {
        return this.list();
    }

    @Override
    public MetadataCatalogue findByParentIdAndName(Integer parentId, String name) {
        return baseMapper.selectOne(Wrappers.<MetadataCatalogue>query().eq("parent_id", parentId).eq("name", name));
    }

    @Override
    public MetadataCatalogue createCatalogue(MetadataCatalogue catalogue) {
        this.saveOrUpdate(catalogue);
        return catalogue;
    }

    @Override
    public List<String> removeCatalogueId(Integer id) {
        List<String> errors = new ArrayList<>();
        MetadataCatalogue catalogue = this.getById(id);
        if (isNull(catalogue)) {
            errors.add(id + "不存在！");
        } else {
            long count = this.count(new LambdaQueryWrapper<MetadataCatalogue>().eq(MetadataCatalogue::getParentId, catalogue.getId()));
            if (count > 0) {
                errors.add("该目录下存在子目录，不允许删除");
            } else {
                this.removeById(id);
            }
        }
        return errors;
    }

    @Override
    public boolean toRename(MetadataCatalogue catalogue) {
        MetadataCatalogue oldCatalogue = this.getById(catalogue.getId());
        if (isNull(oldCatalogue)) {
            return false;
        } else {
            this.updateById(catalogue);
            return true;
        }
    }

    private void getParentById(List<String> paths, Integer id) {
        if (id == 0) {
            return;
        }
        MetadataCatalogue apiCatalogue = this.getById(id);
        if (apiCatalogue != null){
            paths.add(apiCatalogue.getName());
            this.getParentById(paths, apiCatalogue.getParentId());
        } else {
            return;
        }
    }

    @Override
    public List<String> listAbsolutePathById(Integer id) {
        List<String> paths = new ArrayList<>();
        this.getParentById(paths, id);
        return paths;
    }
}

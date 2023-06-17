package com.dlink.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.dlink.db.service.impl.SuperServiceImpl;
import com.dlink.mapper.AssetCatalogueMapper;
import com.dlink.model.AssetCatalogue;
import com.dlink.service.AssetCatalogueService;
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
public class AssetCatalogueServiceImpl extends SuperServiceImpl<AssetCatalogueMapper, AssetCatalogue> implements AssetCatalogueService {
    @Override
    public List<AssetCatalogue> getAllData() {
        return this.list();
    }

    @Override
    public AssetCatalogue findByParentIdAndName(Integer parentId, String name) {
        return baseMapper.selectOne(Wrappers.<AssetCatalogue>query().eq("parent_id", parentId).eq("name", name));
    }

    @Override
    public AssetCatalogue createCatalogue(AssetCatalogue catalogue) {
        this.saveOrUpdate(catalogue);
        return catalogue;
    }

    @Override
    public List<String> removeCatalogueId(Integer id) {
        List<String> errors = new ArrayList<>();
        AssetCatalogue catalogue = this.getById(id);
        if (isNull(catalogue)) {
            errors.add(id + "不存在！");
        } else {
            long count = this.count(new LambdaQueryWrapper<AssetCatalogue>().eq(AssetCatalogue::getParentId, catalogue.getId()));
            if (count > 0) {
                errors.add("该目录下存在子目录，不允许删除");
            } else {
                this.removeById(id);
            }
        }
        return errors;
    }

    @Override
    public boolean toRename(AssetCatalogue catalogue) {
        AssetCatalogue oldCatalogue = this.getById(catalogue.getId());
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
        AssetCatalogue apiCatalogue = this.getById(id);
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

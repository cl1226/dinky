package com.dlink.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.dlink.db.service.impl.SuperServiceImpl;
import com.dlink.mapper.FileCatalogueMapper;
import com.dlink.model.FileCatalogue;
import com.dlink.service.FileCatalogueService;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import static com.dlink.assertion.Asserts.isNull;

/**
 * FileCatalogueServiceImpl
 *
 * @author cl1226
 * @since 2023/5/15 15:22
 **/
@Service
public class FileCatalogueServiceImpl extends SuperServiceImpl<FileCatalogueMapper, FileCatalogue> implements FileCatalogueService {
    @Override
    public List<FileCatalogue> getAllData() {
        return this.list();
    }

    @Override
    public FileCatalogue findByParentIdAndName(Integer parentId, String name) {
        return baseMapper.selectOne(Wrappers.<FileCatalogue>query().eq("parent_id", parentId).eq("name", name));
    }

    @Override
    public FileCatalogue createCatalogue(FileCatalogue catalogue) {
        this.saveOrUpdate(catalogue);
        return catalogue;
    }

    @Override
    public List<String> removeCatalogueId(Integer id) {
        List<String> errors = new ArrayList<>();
        FileCatalogue catalogue = this.getById(id);
        if (isNull(catalogue)) {
            errors.add(id + "不存在！");
        } else {
            long count = this.count(new LambdaQueryWrapper<FileCatalogue>().eq(FileCatalogue::getParentId, catalogue.getId()));
            if (count > 0) {
                errors.add("该目录下存在子目录，不允许删除");
            } else {
                this.removeById(id);
            }
        }
        return errors;
    }

    private void findAllCatalogueInDir(Integer id, List<FileCatalogue> all, Set<FileCatalogue> del) {
        List<FileCatalogue> relatedList =
                all.stream().filter(catalogue -> id.equals(catalogue.getId()) || id.equals(catalogue.getParentId()))
                        .collect(Collectors.toList());
        relatedList.forEach(catalogue -> {
            if (id != catalogue.getId()) {
                findAllCatalogueInDir(catalogue.getId(), all, del);
            }
        });
        del.addAll(relatedList);
    }

    @Override
    public boolean toRename(FileCatalogue catalogue) {
        FileCatalogue oldCatalogue = this.getById(catalogue.getId());
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
        FileCatalogue apiCatalogue = this.getById(id);
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

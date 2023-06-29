package com.dlink.service;

import com.dlink.db.service.ISuperService;
import com.dlink.model.FileCatalogue;

import java.util.List;

/**
 * FileCatalogueService
 *
 * @author cl1226
 * @since 2023/6/27 15:31
 **/
public interface FileCatalogueService extends ISuperService<FileCatalogue> {

    List<FileCatalogue> getAllData();

    FileCatalogue findByParentIdAndName(Integer parentId, String name);

    FileCatalogue createCatalogue(FileCatalogue catalogue);

    List<String> removeCatalogueId(Integer id);

    boolean toRename(FileCatalogue catalogue);

    List<String> listAbsolutePathById(Integer id);

}

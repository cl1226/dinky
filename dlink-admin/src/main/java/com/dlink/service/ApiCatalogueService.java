package com.dlink.service;

import com.dlink.db.service.ISuperService;
import com.dlink.model.ApiCatalogue;

import java.util.LinkedList;
import java.util.List;

/**
 * ApiCatalogueService
 *
 * @author cl1226
 * @since 2023/5/15 15:10
 **/
public interface ApiCatalogueService extends ISuperService<ApiCatalogue> {

    List<ApiCatalogue> getAllData();

    ApiCatalogue findByParentIdAndName(Integer parentId, String name);

    ApiCatalogue createCatalogue(ApiCatalogue catalogue);

    List<String> removeCatalogueId(Integer id);

    boolean toRename(ApiCatalogue catalogue);

    List<String> listAbsolutePathById(Integer id);

}

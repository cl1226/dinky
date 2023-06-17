package com.dlink.service;

import com.dlink.db.service.ISuperService;
import com.dlink.model.AssetCatalogue;

import java.util.List;

/**
 * AssetCatalogueService
 *
 * @author cl1226
 * @since 2023/6/8 16:00
 **/
public interface AssetCatalogueService extends ISuperService<AssetCatalogue> {

    List<AssetCatalogue> getAllData();

    AssetCatalogue findByParentIdAndName(Integer parentId, String name);

    AssetCatalogue createCatalogue(AssetCatalogue catalogue);

    List<String> removeCatalogueId(Integer id);

    boolean toRename(AssetCatalogue catalogue);

    List<String> listAbsolutePathById(Integer id);

}

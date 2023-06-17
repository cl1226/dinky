package com.dlink.service;

import com.dlink.db.service.ISuperService;
import com.dlink.model.MetadataCatalogue;

import java.util.List;

/**
 * AssetCatalogueService
 *
 * @author cl1226
 * @since 2023/6/8 16:00
 **/
public interface MetadataCatalogueService extends ISuperService<MetadataCatalogue> {

    List<MetadataCatalogue> getAllData();

    MetadataCatalogue findByParentIdAndName(Integer parentId, String name);

    MetadataCatalogue createCatalogue(MetadataCatalogue catalogue);

    List<String> removeCatalogueId(Integer id);

    boolean toRename(MetadataCatalogue catalogue);

    List<String> listAbsolutePathById(Integer id);

}

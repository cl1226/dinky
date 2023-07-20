package com.dlink.service;

import com.dlink.db.service.ISuperService;
import com.dlink.model.JarCatalogue;
import com.dlink.model.JarCatalogueDto;

import java.util.List;

/**
 * JarCatalogueService
 *
 * @author cl1226
 * @since 2023/6/27 15:32
 **/
public interface JarCatalogueService extends ISuperService<JarCatalogue> {

    List<JarCatalogue> getAllData();

    List<JarCatalogueDto> getAllTreeAndData();

    JarCatalogue findByParentIdAndName(Integer parentId, String name);

    JarCatalogue createCatalogue(JarCatalogue catalogue);

    List<String> removeCatalogueId(Integer id);

    boolean toRename(JarCatalogue catalogue);

    List<String> listAbsolutePathById(Integer id);

}

package com.dlink.service;

import com.dlink.db.service.ISuperService;
import com.dlink.model.ServerCatalogue;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * ServerCatalogueService
 *
 * @author cl1226
 * @since 2023/5/9 10:40
 **/
@Service
public interface ServerCatalogueService extends ISuperService<ServerCatalogue> {

    List<ServerCatalogue> getAllData();

    List<String> removeCatalogueById(Integer id);
}

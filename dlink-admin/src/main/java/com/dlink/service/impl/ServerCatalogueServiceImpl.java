package com.dlink.service.impl;

import com.dlink.db.service.impl.SuperServiceImpl;
import com.dlink.mapper.ServerCatalogueMapper;
import com.dlink.model.ServerCatalogue;
import com.dlink.service.ServerCatalogueService;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

import static com.dlink.assertion.Asserts.isNull;

/**
 * ServerCatalogueServiceImpl
 *
 * @author cl1226
 * @since 2023/5/9 10:47
 **/
@Service
public class ServerCatalogueServiceImpl extends SuperServiceImpl<ServerCatalogueMapper, ServerCatalogue> implements ServerCatalogueService {

    @Override
    public List<ServerCatalogue> getAllData() {
        return this.list();
    }

    @Override
    public List<String> removeCatalogueById(Integer id) {
        List<String> errors = new ArrayList<>();
        ServerCatalogue catalogue = this.getById(id);
        if (isNull(catalogue)) {
            errors.add(id + "不存在！");
        } else {

        }

        return errors;
    }
}

package com.dlink.service;

import com.dlink.db.service.ISuperService;
import com.dlink.dto.CatalogueTaskDTO;
import com.dlink.dto.WorkflowCatalogueTaskDTO;
import com.dlink.model.WorkflowCatalogue;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * WorkflowCatalogueService
 *
 * @author cl1226
 * @since 2023/4/20 08:27
 **/
@Service
public interface WorkflowCatalogueService extends ISuperService<WorkflowCatalogue> {

    List<WorkflowCatalogue> getAllData();

    WorkflowCatalogue findByParentIdAndName(Integer parentId, String name);

    boolean createCatalogue(WorkflowCatalogue catalogue);

    WorkflowCatalogue createCatalogueAndTask(WorkflowCatalogueTaskDTO catalogueTaskDTO);

    WorkflowCatalogue createCatalogAndFileTask(CatalogueTaskDTO catalogueTaskDTO, String ment);

    boolean toRename(WorkflowCatalogue catalogue);

    List<String> removeCatalogueAndTaskById(Integer id);

    boolean moveCatalogue(Integer id, Integer parentId);

    boolean copyTask(WorkflowCatalogue catalogue);

    Integer addDependCatalogue(String[] catalogueNames);

}

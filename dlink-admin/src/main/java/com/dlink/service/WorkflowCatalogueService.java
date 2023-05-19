package com.dlink.service;

import cn.hutool.json.JSONObject;
import com.dlink.common.result.Result;
import com.dlink.db.service.ISuperService;
import com.dlink.dto.CatalogueTaskDTO;
import com.dlink.dto.WorkflowCatalogueTaskDTO;
import com.dlink.model.WorkflowCatalogue;
import org.springframework.stereotype.Service;

import java.util.LinkedList;
import java.util.List;

/**
 * WorkflowCatalogueService
 *
 * @author cl1226
 * @since 2023/4/20 08:27
 **/
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

    JSONObject dataStatistics(String key);

    List<JSONObject> getTaskEnum();

}

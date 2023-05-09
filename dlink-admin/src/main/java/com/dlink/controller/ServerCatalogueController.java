package com.dlink.controller;

import com.dlink.common.result.ProTableResult;
import com.dlink.common.result.Result;
import com.dlink.model.ServerCatalogue;
import com.dlink.service.ServerCatalogueService;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

/**
 * ServerCatalogueController
 *
 * @author cl1226
 * @since 2023/5/9 10:43
 **/
@Slf4j
@RestController
@RequestMapping("/api/server/catalogue")
public class ServerCatalogueController {

    @Autowired
    private ServerCatalogueService catalogueService;

    /**
     * 新增或者更新
     */
    @PutMapping
    public Result saveOrUpdate(@RequestBody ServerCatalogue catalogue) throws Exception {
        if (catalogueService.saveOrUpdate(catalogue)) {
            return Result.succeed("创建成功");
        } else {
            return Result.failed("创建失败");
        }
    }

    /**
     * 动态查询列表
     */
    @PostMapping
    public ProTableResult<ServerCatalogue> listCatalogues(@RequestBody JsonNode para) {
        return catalogueService.selectForProTable(para);
    }

    /**
     * 批量删除
     */
    @DeleteMapping
    public Result deleteMul(@RequestBody JsonNode para) {
        if (para.size() > 0) {
            boolean isAdmin = false;
            List<String> error = new ArrayList<>();
            for (final JsonNode item : para) {
                Integer id = item.asInt();
                List<String> ids = catalogueService.removeCatalogueById(id);
                if (!ids.isEmpty()) {
                    error.addAll(ids);
                }
            }
            if (error.size() == 0 && !isAdmin) {
                return Result.succeed("删除成功");
            } else {
                return Result.succeed("删除失败，请检查作业" + error.toString() + "状态。");
            }
        } else {
            return Result.failed("请选择要删除的记录");
        }
    }

    /**
     * 获取指定ID的信息
     */
    @PostMapping("/getOneById")
    public Result getOneById(@RequestBody ServerCatalogue catalogue) throws Exception {
        catalogue = catalogueService.getById(catalogue.getId());
        return Result.succeed(catalogue, "获取成功");
    }

    /**
     * 获取所有目录
     */
    @PostMapping("/getCatalogueTreeData")
    public Result getCatalogueTreeData() throws Exception {
        List<ServerCatalogue> catalogues = catalogueService.getAllData();
        return Result.succeed(catalogues, "获取成功");
    }

}

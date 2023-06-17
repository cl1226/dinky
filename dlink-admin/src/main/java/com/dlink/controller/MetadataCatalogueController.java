package com.dlink.controller;

import com.dlink.common.result.Result;
import com.dlink.model.AssetCatalogue;
import com.dlink.service.AssetCatalogueService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

/**
 * AssetCatalogueController
 *
 * @author cl1226
 * @since 2023/6/8 15:59
 **/
@Slf4j
@RestController
@RequestMapping("/api/asset/catalogue")
public class AssetCatalogueController {

    @Autowired
    private AssetCatalogueService assetCatalogueService;

    /**
     * 获取所有目录
     */
    @GetMapping("/getCatalogueTreeData")
    public Result getCatalogueTreeData() throws Exception {
        List<AssetCatalogue> catalogues = assetCatalogueService.getAllData();
        return Result.succeed(catalogues, "获取成功");
    }

    /**
     * 新增或者更新
     */
    @PutMapping
    public Result saveOrUpdate(@RequestBody AssetCatalogue catalogue) throws Exception {
        try {
            AssetCatalogue assetCatalogue = assetCatalogueService.createCatalogue(catalogue);
            return Result.succeed(assetCatalogue, "创建成功");
        } catch (Exception e) {
            e.printStackTrace();
            return Result.failed("创建失败");
        }
    }

    /**
     * 批量删除
     */
    @DeleteMapping
    public Result deleteMul(@RequestParam Integer id) {
        if (id != null) {
            boolean isAdmin = false;
            List<String> error = new ArrayList<>();
            List<String> ids = assetCatalogueService.removeCatalogueId(id);
            if (!ids.isEmpty()) {
                error.addAll(ids);
            }
            if (error.size() == 0 && !isAdmin) {
                return Result.succeed("删除成功");
            } else {
                return Result.succeed("删除失败，请检查" + error.toString() + "状态。");
            }
        } else {
            return Result.failed("请选择要删除的记录");
        }
    }

    /**
     * 获取指定ID的信息
     */
    @GetMapping("/getOneById")
    public Result getOneById(@RequestParam Integer id) throws Exception {
        AssetCatalogue catalogue = assetCatalogueService.getById(id);
        return Result.succeed(catalogue, "获取成功");
    }

    /**
     * 重命名节点和作业
     */
    @PutMapping("/toRename")
    public Result toRename(@RequestBody AssetCatalogue catalogue) throws Exception {
        if (assetCatalogueService.toRename(catalogue)) {
            return Result.succeed("重命名成功");
        } else {
            return Result.failed("重命名失败");
        }
    }

}

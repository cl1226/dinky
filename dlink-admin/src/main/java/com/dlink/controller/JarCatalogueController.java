package com.dlink.controller;

import com.dlink.common.result.Result;
import com.dlink.model.JarCatalogue;
import com.dlink.model.JarCatalogueDto;
import com.dlink.service.JarCatalogueService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

/**
 * JarCatalogueController
 *
 * @author cl1226
 * @since 2023/6/27 15:29
 **/
@Slf4j
@RestController
@RequestMapping("/api/jar/catalogue")
public class JarCatalogueController {

    @Autowired
    private JarCatalogueService jarCatalogueService;

    /**
     * 获取所有目录
     */
    @GetMapping("/getCatalogueTreeData")
    public Result getCatalogueTreeData() throws Exception {
        List<JarCatalogue> catalogues = jarCatalogueService.getAllData();
        return Result.succeed(catalogues, "获取成功");
    }

    /**
     * 获取所有目录/JAR
     */
    @GetMapping("/getAllTreeAndData")
    public Result getAllTreeAndData() throws Exception {
        List<JarCatalogueDto> catalogues = jarCatalogueService.getAllTreeAndData();
        return Result.succeed(catalogues, "获取成功");
    }

    /**
     * 新增或者更新
     */
    @PutMapping
    public Result saveOrUpdate(@RequestBody JarCatalogue catalogue) throws Exception {
        try {
            JarCatalogue jarCatalogue = jarCatalogueService.createCatalogue(catalogue);
            return Result.succeed(jarCatalogue, "创建成功");
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
            List<String> ids = jarCatalogueService.removeCatalogueId(id);
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
        JarCatalogue catalogue = jarCatalogueService.getById(id);
        return Result.succeed(catalogue, "获取成功");
    }

    /**
     * 重命名节点和作业
     */
    @PutMapping("/toRename")
    public Result toRename(@RequestBody JarCatalogue catalogue) throws Exception {
        if (jarCatalogueService.toRename(catalogue)) {
            return Result.succeed("重命名成功");
        } else {
            return Result.failed("重命名失败");
        }
    }
}

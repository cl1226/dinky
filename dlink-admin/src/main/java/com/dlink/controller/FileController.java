package com.dlink.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.dlink.common.result.Result;
import com.dlink.dto.SearchCondition;
import com.dlink.model.FileEntity;
import com.dlink.model.FileModel;
import com.dlink.service.FileEntityService;
import com.dlink.service.FileService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletResponse;

/**
 * FileController
 *
 * @author cl1226
 * @since 2023/6/27 15:24
 **/
@Slf4j
@RestController
@RequestMapping("/api/file/manage")
public class FileController {

    @Autowired
    private FileService fileService;
    @Autowired
    private FileEntityService fileEntityService;


    @PostMapping("/upload")
    public Result upload(@RequestParam("file") MultipartFile file,
                         @RequestParam("catalogueId") Integer id,
                         @RequestParam("type") String type) {
        Result res = fileService.upload(file, id, type);
        return res;
    }

    @PostMapping("/page")
    public Result list(@RequestBody SearchCondition searchCondition) {
        Page<FileEntity> page = fileEntityService.page(searchCondition);
        return Result.succeed(page, "获取成功");
    }

    @GetMapping("/detail")
    public Result getOne(@RequestParam Integer id) {
        FileEntity fileEntity = fileEntityService.getById(id);
        return Result.succeed(fileEntity, "获取成功");
    }

    @GetMapping("/showFile")
    public Result show(@RequestParam Integer id) {
        Result result = fileEntityService.show(id);
        return result;
    }

    @GetMapping("/downloadFile")
    public void download(HttpServletResponse response, @RequestParam Integer id) {
        fileEntityService.download(response, id);
    }

    @PutMapping
    public Result add(@RequestBody FileModel fileModel) {
        FileEntity fileEntity = fileEntityService.create(fileModel);
        return Result.succeed(fileEntity, "上传成功");
    }

    @PostMapping("rename")
    public Result rename(@RequestBody FileModel fileModel) {
        FileEntity fileEntity = fileEntityService.getById(fileModel.getId());
        if (fileEntity == null) {
            return Result.failed("重命名失败");
        }
        fileEntity.setName(fileModel.getName());
        boolean b = fileEntityService.saveOrUpdate(fileEntity);
        if (b) {
            return Result.succeed(fileEntity, "重命名成功");
        }
        return Result.failed("重命名失败");
    }

    @DeleteMapping
    public Result delete(@RequestBody SearchCondition searchCondition) {
        try {
            fileEntityService.remove(searchCondition.getIds());
            return Result.succeed(searchCondition.getIds(), "删除成功");
        } catch (Exception e) {
            e.printStackTrace();
            return Result.failed("删除失败");
        }
    }

}

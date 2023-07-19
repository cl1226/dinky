package com.dlink.service.impl;

import cn.hutool.core.bean.BeanUtil;
import cn.hutool.core.bean.copier.CopyOptions;
import cn.hutool.json.JSONObject;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.dlink.common.result.Result;
import com.dlink.db.service.impl.SuperServiceImpl;
import com.dlink.dto.SearchCondition;
import com.dlink.mapper.FileEntityMapper;
import com.dlink.minio.MinioStorageService;
import com.dlink.model.FileEntity;
import com.dlink.model.FileModel;
import com.dlink.service.FileEntityService;
import com.dlink.service.FileService;
import org.apache.commons.io.IOUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

/**
 * FileEntityServiceImpl
 *
 * @author cl1226
 * @since 2023/6/27 16:36
 **/
@Service
public class FileEntityServiceImpl extends SuperServiceImpl<FileEntityMapper, FileEntity> implements FileEntityService {

    @Autowired
    private MinioStorageService minioStorageService;
    @Autowired
    private FileService fileService;

    @Override
    public Page<FileEntity> page(SearchCondition searchCondition) {
        Page<FileEntity> page = new Page<>(searchCondition.getPageIndex(), searchCondition.getPageSize());

        QueryWrapper<FileEntity> queryWrapper = new QueryWrapper<FileEntity>();
        if (StringUtils.isNotBlank(searchCondition.getName())) {
            queryWrapper.eq("name", searchCondition.getName());
        }
        if (searchCondition.getCatalogueId() != null) {
            queryWrapper.eq("catalogue_id", searchCondition.getCatalogueId());
        }
        queryWrapper.eq("type", searchCondition.getType());

        queryWrapper.orderByDesc("create_time");

        return this.baseMapper.selectPage(page, queryWrapper);
    }

    @Override
    public FileEntity create(FileModel fileModel) {
        FileEntity fileEntity = new FileEntity();
        if (fileModel.getType().equals("File") && !fileModel.getUploadType().equals("upload")) {
            String filename = fileModel.getName();
            if (StringUtils.isNotBlank(fileModel.getFilePath())) {
                filename = fileModel.getFilePath().split("\\/")[fileModel.getFilePath().split("\\/").length - 1];
            }
            String path = fileService.upload(fileModel.getStr().getBytes(StandardCharsets.UTF_8), filename, fileModel.getCatalogueId(), fileModel.getType());
            BeanUtil.copyProperties(fileModel, fileEntity, CopyOptions.create(null, true));
            if (StringUtils.isBlank(path)) {
                return null;
            }
            fileEntity.setFilePath(path);
            this.saveOrUpdate(fileEntity);
        } else {
            BeanUtil.copyProperties(fileModel, fileEntity, CopyOptions.create(null, true));
            this.saveOrUpdate(fileEntity);
        }
        return fileEntity;
    }

    @Override
    public Result show(Integer id) {
        FileEntity fileEntity = this.getById(id);
        if (fileEntity == null) {
            return Result.failed("获取失败");
        }
        if (!fileEntity.getType().equals("File")) {
            return Result.failed(fileEntity.getType() + "类型文件不支持查看");
        }
        String path = fileEntity.getFilePath();
        InputStream inputStream = minioStorageService.downloadFile(path);
        String res = "";
        try {
            res = IOUtils.toString(inputStream, StandardCharsets.UTF_8);
            JSONObject jsonObject = new JSONObject();
            jsonObject.set("filename", fileEntity.getName());
            jsonObject.set("catalogueId", fileEntity.getCatalogueId());
            jsonObject.set("content", res);
            jsonObject.set("name", fileEntity.getName());
            jsonObject.set("filePath", path);
            return Result.succeed(jsonObject, "获取成功");
        } catch (IOException e) {
            e.printStackTrace();
        }
        return Result.failed("获取失败");
    }

    @Override
    public void download(HttpServletResponse response, Integer id) {
        FileEntity fileEntity = this.getById(id);
        if (fileEntity == null) {
            return;
        }
        String path = fileEntity.getFilePath();
        InputStream inputStream = minioStorageService.downloadFile(path);
        OutputStream outputStream = null;
        byte buf[] = new byte[1024];
        int length = 0;
        response.reset();
        try {
            outputStream = response.getOutputStream();
            response.setHeader("Content-Disposition", "attachment;filename=" +
                    URLEncoder.encode(fileEntity.getName(), "UTF-8"));
            response.setContentType("application/octet-stream");
            response.setCharacterEncoding("UTF-8");
            // 输出文件
            while ((length = inputStream.read(buf)) > 0) {
                outputStream.write(buf, 0, length);
            }
            System.out.println("下载成功");
            inputStream.close();
        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            try {
                outputStream.close();
                if (inputStream != null) {
                    inputStream.close();
                }
            } catch (IOException e){
                e.printStackTrace();
            }
        }
    }

    @Override
    public Result remove(List<Integer> ids) {
        for (Integer id : ids) {
            FileEntity fileEntity = this.getById(id);
            String path = fileEntity.getFilePath();
            minioStorageService.removeFile(path);
        }
        this.removeBatchByIds(ids);
        return Result.succeed("删除成功");
    }
}

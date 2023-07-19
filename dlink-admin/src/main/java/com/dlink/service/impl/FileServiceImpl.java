package com.dlink.service.impl;

import com.dlink.common.result.Result;
import com.dlink.minio.MinioStorageService;
import com.dlink.service.FileCatalogueService;
import com.dlink.service.FileService;
import com.dlink.service.JarCatalogueService;
import io.minio.errors.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

/**
 * FileServiceImpl
 *
 * @author cl1226
 * @since 2023/6/27 15:44
 **/
@Service
public class FileServiceImpl implements FileService {

    @Autowired
    private MinioStorageService minioStorageService;
    @Autowired
    private FileCatalogueService fileCatalogueService;
    @Autowired
    private JarCatalogueService jarCatalogueService;

    @Override
    public Result upload(MultipartFile file, Integer catalogueId, String type) {
        String path = "";
        if (type.equals("File")) {
            List<String> pathList = fileCatalogueService.listAbsolutePathById(catalogueId);
            Collections.reverse(pathList);
            path = pathList.stream().map(String::valueOf).collect(Collectors.joining("/"));
        } else {
            List<String> pathList = jarCatalogueService.listAbsolutePathById(catalogueId);
            Collections.reverse(pathList);
            path = pathList.stream().map(String::valueOf).collect(Collectors.joining("/"));
        }
        try {
            String res = minioStorageService.uploadFile(file.getBytes(), "/" + type.toLowerCase(Locale.ROOT) + "/" + path + "/" + file.getOriginalFilename());
            return Result.succeed(res, "上传成功");
        } catch (IOException e) {
            e.printStackTrace();
        } catch (ServerException e) {
            e.printStackTrace();
        } catch (InsufficientDataException e) {
            e.printStackTrace();
        } catch (ErrorResponseException e) {
            e.printStackTrace();
        } catch (NoSuchAlgorithmException e) {
            e.printStackTrace();
        } catch (InvalidKeyException e) {
            e.printStackTrace();
        } catch (InvalidResponseException e) {
            e.printStackTrace();
        } catch (XmlParserException e) {
            e.printStackTrace();
        } catch (InternalException e) {
            e.printStackTrace();
        }
        return Result.failed("上传失败");
    }

    @Override
    public String upload(byte[] bytes, String filename, Integer catalogueId, String type) {
        String path = "";
        if (type.equals("File")) {
            List<String> pathList = fileCatalogueService.listAbsolutePathById(catalogueId);
            Collections.reverse(pathList);
            path = pathList.stream().map(String::valueOf).collect(Collectors.joining("/"));
        } else {
            List<String> pathList = jarCatalogueService.listAbsolutePathById(catalogueId);
            Collections.reverse(pathList);
            path = pathList.stream().map(String::valueOf).collect(Collectors.joining("/"));
        }
        String res = null;
        try {
            res = minioStorageService.uploadFile(bytes, "/" + path + "/" + filename);
        } catch (ServerException e) {
            e.printStackTrace();
        } catch (InsufficientDataException e) {
            e.printStackTrace();
        } catch (ErrorResponseException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        } catch (NoSuchAlgorithmException e) {
            e.printStackTrace();
        } catch (InvalidKeyException e) {
            e.printStackTrace();
        } catch (InvalidResponseException e) {
            e.printStackTrace();
        } catch (XmlParserException e) {
            e.printStackTrace();
        } catch (InternalException e) {
            e.printStackTrace();
        }
        return res;
    }
}

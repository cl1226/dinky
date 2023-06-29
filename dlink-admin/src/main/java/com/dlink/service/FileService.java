package com.dlink.service;

import com.dlink.common.result.Result;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;

/**
 * FileService
 *
 * @author cl1226
 * @since 2023/6/27 15:43
 **/
public interface FileService {

    Result upload(MultipartFile file, Integer catalogueId, String type);

    String upload(byte[] bytes, String filename, Integer catalogueId, String type);

}

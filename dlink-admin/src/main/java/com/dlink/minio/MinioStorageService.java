package com.dlink.minio;

import io.minio.errors.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;

/**
 * MinioStorageService
 *
 * @author cl1226
 * @since 2023/6/27 14:44
 **/
@Slf4j
@Service
public class MinioStorageService {

    @Autowired
    private MinioTemplate minioTemplate;
    @Value("${dinky.minio.url}")
    private String url;
    @Value("${dinky.minio.access-key}")
    private String accessKey;
    @Value("${dinky.minio.secret-key}")
    private String secretKey;
    @Value("${dinky.minio.bucket-name}")
    private String bucketName;

    /**
     * 获取文件外链
     *
     * @param objectName 文件名称
     * @param expires    过期时间 <=7
     * @return url
     * @throws Exception https://docs.minio.io/cn/java-client-api-reference.html#getObject
     */
    public String getObjectURL(String objectName, int expires) {
        try {
            return minioTemplate.getObjectURL(bucketName, objectName, expires);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    public String uploadFile(byte[] data, String filePath) throws ServerException, InsufficientDataException, ErrorResponseException, IOException, NoSuchAlgorithmException, InvalidKeyException, InvalidResponseException, XmlParserException, InternalException {
        InputStream inputStream = new ByteArrayInputStream(data);
        minioTemplate.putObject(bucketName, filePath, inputStream);
        String path = filePath;
        return path;
    }

    public String uploadFile(String bucketName, byte[] data, String filePath) {
        InputStream inputStream = new ByteArrayInputStream(data);
        String path = null;
        try {
            minioTemplate.putObject(bucketName, filePath, inputStream);
            path = filePath;
        } catch (Exception e) {
            e.printStackTrace();
        }
        return path;
    }


    public String uploadFile(InputStream inputStream, String fileName, String contentType) {
        String path = null;
        try {
            minioTemplate.putObject(bucketName, fileName, inputStream, inputStream.available(), contentType);
            path = fileName;
        } catch (Exception e) {
            e.printStackTrace();
        }
        return path;
    }


    public String uploadFile(String bucketName, InputStream inputStream, String fileName, String contentType) {
        String path = null;
        try {
            minioTemplate.putObject(bucketName, fileName, inputStream, inputStream.available(), contentType);
            path = fileName;
        } catch (Exception e) {
            e.printStackTrace();
        }
        return path;
    }

    public InputStream downloadFile(String filePath) {
        InputStream inputStream = null;
        try {
            inputStream = minioTemplate.getObject(bucketName, filePath);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return inputStream;
    }

    public void removeFile(String filePath){
        try{
            minioTemplate.removeObject(bucketName,filePath);
        }catch (Exception e){
            e.printStackTrace();
        }
    }

}
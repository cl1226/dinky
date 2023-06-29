package com.dlink.minio;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.InputStream;

/**
 * MinioStorageService
 *
 * @author cl1226
 * @since 2023/6/27 14:44
 **/
@Service
public class MinioStorageService {

    @Autowired
    private MinioTemplate minioTemplate;
    @Autowired
    private MinioProperties minioProperties;

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
            return minioTemplate.getObjectURL(minioProperties.getBucketName(), objectName, expires);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    public String uploadFile(byte[] data, String filePath) {
        InputStream inputStream = new ByteArrayInputStream(data);
        String path = null;
        try {
            minioTemplate.putObject(minioProperties.getBucketName(), filePath, inputStream);
            path = filePath;
        } catch (Exception e) {

        }
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
            minioTemplate.putObject(minioProperties.getBucketName(), fileName, inputStream, inputStream.available(), contentType);
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
            inputStream = minioTemplate.getObject(minioProperties.getBucketName(), filePath);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return inputStream;
    }

    public void removeFile(String filePath){
        try{
            minioTemplate.removeObject(minioProperties.getBucketName(),filePath);
        }catch (Exception e){
            e.printStackTrace();
        }
    }

}

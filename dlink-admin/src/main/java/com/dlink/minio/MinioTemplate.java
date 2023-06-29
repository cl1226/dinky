package com.dlink.minio;

import io.minio.*;
import io.minio.errors.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;

/**
 * MinioTemplate
 *
 * @author cl1226
 * @since 2023/6/27 14:43
 **/
@Component
@Configuration
@EnableConfigurationProperties(MinioProperties.class)
public class MinioTemplate {

    @Autowired
    private MinioProperties minioProperties;

    private MinioClient minioClient;

    public MinioTemplate() {}

    public MinioClient getMinioClient() {
        if (minioClient == null) {
            MinioClient client = MinioClient.builder()
                    .endpoint(minioProperties.getUrl())
                    .credentials(minioProperties.getAccessKey(), minioProperties.getSecretKey())
                    .build();
            return client;
        }
        return minioClient;
    }

    public void createBucket(String bucketName) throws IOException, InvalidKeyException, NoSuchAlgorithmException, InsufficientDataException, InvalidResponseException, InternalException, ErrorResponseException, ServerException, XmlParserException {
        MinioClient minioClient = getMinioClient();
        if (!minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucketName).build())) {
            minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucketName).build());
        }
    }

    /**
     * 获取文件外链
     * @param bucketName bucket 名称
     * @param objectName 文件名称
     * @param expires   过期时间 <=7
     * @return
     */
    public String getObjectURL(String bucketName,String objectName,int expires) throws IOException, InvalidKeyException, NoSuchAlgorithmException, InsufficientDataException, InvalidResponseException, InternalException, ErrorResponseException, ServerException, XmlParserException {
        return getMinioClient().getPresignedObjectUrl(GetPresignedObjectUrlArgs.builder().bucket(bucketName).object(objectName).expiry(expires).build());
    }

    /**
     * 获取文件
     * @param bucketName
     * @param objectName
     * @return
     */
    public InputStream getObject(String bucketName, String objectName) throws IOException, InvalidKeyException, NoSuchAlgorithmException, InsufficientDataException, InvalidResponseException, InternalException, ErrorResponseException, ServerException, XmlParserException {
        return getMinioClient().getObject(GetObjectArgs.builder().bucket(bucketName).object(objectName).build());
    }

    /**
     * 上传文件
     * @param bucketName
     * @param objectName
     * @param stream
     */
    public void putObject(String bucketName, String objectName, InputStream stream) throws IOException, NoSuchAlgorithmException, InvalidKeyException, InvalidResponseException, ErrorResponseException, InsufficientDataException, InternalException, ServerException, XmlParserException {
        createBucket(bucketName);
        getMinioClient().putObject(
                PutObjectArgs.builder()
                        .bucket(bucketName)
                        .object(objectName)
                        .stream(stream, stream.available(), -1)
                        .contentType("application/octet-stream").build());
    }

    public void putObject(String bucketName, String objectName, InputStream stream, int size, String contextType) throws IOException, NoSuchAlgorithmException, InvalidKeyException, InvalidResponseException, ErrorResponseException, InsufficientDataException, InternalException, ServerException, XmlParserException {
        createBucket(bucketName);
        getMinioClient().putObject(PutObjectArgs.builder()
                .bucket(bucketName)
                .object(objectName)
                .stream(stream, size, -1)
                .contentType(contextType)
                .build());
    }

    /**
     * 删除文件
     * @param bucketName
     * @param objectName
     */
    public void removeObject(String bucketName, String objectName) throws IOException, InvalidKeyException, NoSuchAlgorithmException, InsufficientDataException, InvalidResponseException, InternalException, ErrorResponseException, ServerException, XmlParserException {
        getMinioClient().removeObject(RemoveObjectArgs.builder().bucket(bucketName).object(objectName).build());
    }

}

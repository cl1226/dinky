package com.dlink.minio;

import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;
import org.springframework.stereotype.Component;

/**
 * MinioProperties
 *
 * @author cl1226
 * @since 2023/6/27 14:33
 **/
@Data
@Configuration
@Component
@PropertySource(value = {"classpath:application.yml"},
        ignoreResourceNotFound = false, encoding = "UTF-8", name = "authorSetting.properties")
@ConfigurationProperties(value = "minio")
public class MinioProperties {

    @Value("${minio.url}")
    private String url;
    @Value("${minio.access-key}")
    private String accessKey;
    @Value("${minio.secret-key}")
    private String secretKey;
    @Value("${minio.bucket-name}")
    private String bucketName;

}

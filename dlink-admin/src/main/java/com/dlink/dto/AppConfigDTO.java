package com.dlink.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.Date;

/**
 * AppConfigDTO
 *
 * @author cl1226
 * @since 2023/5/30 9:38
 **/
@Data
public class AppConfigDTO {

    private Integer id;

    private String name;

    private String secret;

    private String token;

    private String description;

    private String expireDesc;

    // -1 永久，0 单次有效，>0 失效时间
    private long expireDuration;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;

    private LocalDateTime authTime;

}

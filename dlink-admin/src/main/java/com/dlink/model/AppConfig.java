package com.dlink.model;

import com.baomidou.mybatisplus.annotation.TableName;
import com.dlink.db.model.SuperEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.Date;

/**
 * AppConfig
 *
 * @author cl1226
 * @since 2023/5/18 16:26
 **/
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("dlink_app_config")
public class AppConfig extends SuperEntity {

    private String secret;

    private String token;

    private String description;

    private String expireDesc;

    // -1 永久，0 单次有效，>0 失效时间
    private long expireDuration;

}

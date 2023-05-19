package com.dlink.model;

import com.baomidou.mybatisplus.annotation.TableName;
import com.dlink.db.model.SuperEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * ApiAccessLog
 *
 * @author cl1226
 * @since 2023/5/19 13:13
 **/
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("dlink_api_accesslog")
public class ApiAccessLog extends SuperEntity {

    private String url;

    private int status;

    private long duration;

    private long timestamp;

    private String ip;

    private Integer appId;

    private Integer apiId;

    private String error;

}

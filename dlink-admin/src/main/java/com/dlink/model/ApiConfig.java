package com.dlink.model;

import com.baomidou.mybatisplus.annotation.TableName;
import com.dlink.db.model.SuperEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * ApiConfig
 *
 * @author cl1226
 * @since 2023/5/15 16:22
 **/
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("dlink_api_config")
public class ApiConfig extends SuperEntity {

    private String path;

    private String datasourceId;

    private Integer catalogueId;

    private String description;

    public ApiConfig() {
    }
}

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

    private String params;

    private String contentType;

    private String segment;

    private Integer status;

    private Integer tenantId;

    private String description;

    public ApiConfig() {
    }

    public ApiConfig(String path, String datasourceId, Integer catalogueId, String params, String contentType, String segment, Integer status, Integer tenantId, String description) {
        this.path = path;
        this.datasourceId = datasourceId;
        this.catalogueId = catalogueId;
        this.params = params;
        this.contentType = contentType;
        this.segment = segment;
        this.status = status;
        this.tenantId = tenantId;
        this.description = description;
    }
}

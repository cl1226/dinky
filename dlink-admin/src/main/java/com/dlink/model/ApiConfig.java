package com.dlink.model;

import com.baomidou.mybatisplus.annotation.TableName;
import com.dlink.db.model.SuperEntity;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateTimeDeserializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;
import java.util.Date;

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

    private String authType;

    private String accessType;

    private String datasourceType;

    private Integer datasourceId;

    private String datasourceDb;

    private Integer catalogueId;

    private String params;

    private String contentType;

    private String segment;

    private Integer status;

    private Integer debugStatus;

    private Integer tenantId;

    private Integer authId;

    @JsonDeserialize(using = LocalDateTimeDeserializer.class)
    @JsonSerialize(using = LocalDateTimeSerializer.class)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone="GMT+8")
    private LocalDateTime authTime;

    private String description;

}

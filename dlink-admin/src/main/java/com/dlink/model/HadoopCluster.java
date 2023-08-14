package com.dlink.model;

import com.baomidou.mybatisplus.annotation.*;
import com.dlink.db.annotation.Save;
import com.dlink.db.model.SuperEntity;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateTimeDeserializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer;
import lombok.Data;
import lombok.EqualsAndHashCode;

import javax.validation.constraints.NotNull;
import java.time.LocalDateTime;

/**
 * HadoopCluster
 *
 * @author cl1226
 * @since 2023/6/27 17:24
 **/
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("dlink_hadoop_cluster")
public class HadoopCluster {

    /**
     * 主键ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Integer id;

    @NotNull(message = "名称不能为空", groups = {Save.class})
    private String name;

    @NotNull(message = "是否启用不能为空", groups = {Save.class})
    private Boolean enabled;

    @TableField(fill = FieldFill.INSERT)
    @JsonDeserialize(using = LocalDateTimeDeserializer.class)
    @JsonSerialize(using = LocalDateTimeSerializer.class)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    @JsonDeserialize(using = LocalDateTimeDeserializer.class)
    @JsonSerialize(using = LocalDateTimeSerializer.class)
    private LocalDateTime updateTime;

    private String url;

    private String username;

    private String password;

    private String uuid;

    private String clusterName;

    private String type;

    private String version;

    private String clusterStatus;

    private boolean hdfsHa;

    private String namenodeAddress;

    private boolean hiveHa;

    private String hiveserverAddress;

    private String metastoreAddress;

    private String zkQuorum;

    private boolean yarnHa;

    private String resourcemanagerAddress;

    private boolean kerberos;

    private String kdcHost;

    private String realm;

    private String krb5;

    private String keytabJson;

}

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
 * Workspace
 *
 * @author cl1226
 * @since 2023/7/31 14:22
 **/
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("dlink_workspace")
public class Workspace {

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

    private Integer clusterId;

    private String clusterName;

    private String description;

    private String obsPath;

    private String code;

    private String userIds;

    // 对应dolphinscheduler的项目CODE
    private String projectCode;

}

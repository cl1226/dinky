package com.dlink.model;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * WorkspaceUser
 *
 * @author cl1226
 * @since 2023/7/31 14:37
 **/
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("dlink_workspace_user")
public class WorkspaceUser implements Serializable {

    /**
     * id
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Integer id;

    /**
     * user id
     */
    private Integer userId;

    /**
     * workspace id
     */
    private Integer workspaceId;


    /**
     * create time
     */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    /**
     * update time
     */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

}

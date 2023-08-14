package com.dlink.model;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * ClusterUserRole
 *
 * @author cl1226
 * @since 2023/8/2 16:36
 **/
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("dlink_cluster_user_role")
public class ClusterUserRole implements Serializable {

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
     * cluster id
     */
    private Integer clusterId;

    /**
     * role id
     */
    private Integer roleId;

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

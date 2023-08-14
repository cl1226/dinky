package com.dlink.model;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * ClusterUser
 *
 * @author cl1226
 * @since 2023/8/2 16:26
 **/
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("dlink_cluster_user")
public class ClusterUser implements Serializable {

    private static final long serialVersionUID = -6123386787317880405L;

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

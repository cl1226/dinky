package com.dlink.model;

import com.baomidou.mybatisplus.annotation.TableName;
import com.dlink.db.model.SuperEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * JarTask
 *
 * @author cl1226
 * @since 2023/7/10 16:25
 **/
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("dlink_jar_task")
public class JarTask extends SuperEntity {

    private String nodeId;

    private String nodeType;

    private String nodeInfo;

}

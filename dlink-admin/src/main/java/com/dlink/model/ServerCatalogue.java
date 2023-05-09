package com.dlink.model;

import com.baomidou.mybatisplus.annotation.TableName;
import com.dlink.db.model.SuperEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * ServerCatalogue
 *
 * @author cl1226
 * @since 2023/5/9 10:40
 **/
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("dlink_server_catalogue")
public class ServerCatalogue extends SuperEntity {

    private Integer tenantId;

    private Integer taskId;

    private String type;

    private Integer parentId;

    private Boolean isLeaf;

    public ServerCatalogue() {
    }

    public ServerCatalogue(String name, Integer taskId, String type, Integer parentId, Boolean isLeaf) {
        this.setName(name);
        this.taskId = taskId;
        this.type = type;
        this.parentId = parentId;
        this.isLeaf = isLeaf;
    }
}

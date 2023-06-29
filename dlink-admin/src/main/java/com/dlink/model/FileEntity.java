package com.dlink.model;

import com.baomidou.mybatisplus.annotation.TableName;
import com.dlink.db.model.SuperEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * FileModel
 *
 * @author cl1226
 * @since 2023/6/27 16:32
 **/
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("dlink_file_entity")
public class FileEntity extends SuperEntity {

    private String filePath;

    private String description;

    private String type;

    private Integer catalogueId;

}

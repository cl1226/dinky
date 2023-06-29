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
public class FileModel extends SuperEntity {

    private String filePath;

    private String description;

    private String type;

    private String uploadType;

    private Integer catalogueId;

    private String str;

}

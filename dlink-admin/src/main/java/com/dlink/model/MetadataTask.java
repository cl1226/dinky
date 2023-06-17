package com.dlink.model;

import com.baomidou.mybatisplus.annotation.TableName;
import com.dlink.db.model.SuperEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * MetadataTask
 *
 * @author cl1226
 * @since 2023/6/9 13:31
 **/
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("dlink_metadata_task")
public class MetadataTask extends SuperEntity {

    private Integer catalogueId;

    private String path;

    private String description;

    private String datasourceType;

    private String datasourceName;

    private Integer datasourceId;

    private String scheduleType;

    private String scheduleStatus;

    private String cronExpression;

    private LocalDateTime nextRunTime;

    private Integer status;

    private String runStatus;

    private String updateStrategy;

    private String deleteStrategy;

    private Integer timeout;
}

package com.dlink.model;

import com.baomidou.mybatisplus.annotation.TableName;
import com.dlink.db.model.SuperEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * MetadataTaskInstance
 *
 * @author cl1226
 * @since 2023/6/15 9:18
 **/
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("dlink_metadata_task_instance")
public class MetadataTaskInstance extends SuperEntity {

    private Integer catalogueId;

    private Integer taskId;

    private String status;

    private String scheduleType;

    private String cronExpression;

    private LocalDateTime beginTime;

    private LocalDateTime endTime;

    private Long duration;

}

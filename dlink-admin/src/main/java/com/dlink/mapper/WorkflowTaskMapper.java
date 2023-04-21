package com.dlink.mapper;

import com.dlink.db.mapper.SuperMapper;
import com.dlink.model.WorkflowTask;
import org.apache.ibatis.annotations.Mapper;

/**
 * 作业 Mapper 接口
 *
 * @author cl1226
 * @since 2023-04-20 12:15
 */
@Mapper
public interface WorkflowTaskMapper extends SuperMapper<WorkflowTask> {
}

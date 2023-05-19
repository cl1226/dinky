package com.dlink.mapper;

import com.dlink.db.mapper.SuperMapper;
import com.dlink.model.ApiAccessLog;
import org.apache.ibatis.annotations.Mapper;

/**
 * ApiAccessLogMapper
 *
 * @author cl1226
 * @since 2023/5/19 13:21
 **/
@Mapper
public interface ApiAccessLogMapper extends SuperMapper<ApiAccessLog> {
}

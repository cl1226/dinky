package com.dlink.mapper;

import com.dlink.db.mapper.SuperMapper;
import com.dlink.model.AppConfig;
import org.apache.ibatis.annotations.Mapper;

/**
 * AppConfigMapper
 *
 * @author cl1226
 * @since 2023/5/18 16:39
 **/
@Mapper
public interface AppConfigMapper extends SuperMapper<AppConfig> {
}

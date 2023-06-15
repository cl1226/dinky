package com.dlink.mapper;

import com.dlink.db.mapper.SuperMapper;
import com.dlink.model.MetadataDb;
import org.apache.ibatis.annotations.Mapper;

/**
 * HiveMetaDbsMapper
 *
 * @author cl1226
 * @since 2023/6/12 14:28
 **/
@Mapper
public interface MetadataDbMapper extends SuperMapper<MetadataDb> {
}

package com.dlink.mapper;

import com.dlink.db.mapper.SuperMapper;
import com.dlink.model.HadoopCluster;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

/**
 * HadoopClusterMapper
 *
 * @author cl1226
 * @since 2023/6/28 10:39
 **/
@Mapper
public interface HadoopClusterMapper extends SuperMapper<HadoopCluster> {

    @Select("select * from dlink_hadoop_cluster where locate(hiveserver_address, #{url}) > 0")
    public HadoopCluster getOneByAddress(String url);

}

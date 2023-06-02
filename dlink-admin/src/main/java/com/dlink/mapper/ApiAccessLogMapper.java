package com.dlink.mapper;

import cn.hutool.json.JSONObject;
import com.dlink.db.mapper.SuperMapper;
import com.dlink.model.ApiAccessLog;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * ApiAccessLogMapper
 *
 * @author cl1226
 * @since 2023/5/19 13:21
 **/
@Mapper
public interface ApiAccessLogMapper extends SuperMapper<ApiAccessLog> {

    @Select("select substring(`timestamp`,1, 10) date,sum( success ) successNum, sum( fail ) failNum from (SELECT timestamp,case when status=200 then 1 else 0 end as success,case when status!=200 then 1 else 0 end as fail from dlink_api_accesslog where timestamp >= #{start} and timestamp < #{end}) a group by substr( `timestamp`, 1, 10 )")
    List<JSONObject> countByDate(@Param("start") String start, @Param("end") String end);

    @Select("select url,num from (select url,count(1) num from dlink_api_accesslog where timestamp >= #{start} and timestamp < #{end} group by url) a order by num desc limit 0,5")
    List<JSONObject> top5api(@Param("start") String start, @Param("end") String end);

    @Select("select url,duration from (select url,round(avg(duration)) duration from dlink_api_accesslog where timestamp >= #{start} and timestamp < #{end} group by url) a order by duration desc limit 0,10")
    List<JSONObject> top5duration(@Param("start") String start, @Param("end") String end);

    @Select("select sum( success ) successNum, sum( fail ) failNum from (SELECT case when status=200 then 1 else 0 end as success,case when status!=200 then 1 else 0 end as fail from dlink_api_accesslog where timestamp >= #{start} and timestamp < #{end}) a")
    List<JSONObject> summary(@Param("start") String start, @Param("end") String end);

    @Select("select app_id,num from (select app_id,count(1) num from dlink_api_accesslog where timestamp >= #{start} and timestamp < #{end} and app_id is not null and app_id != '' group by app_id) a order by num desc limit 0,5")
    List<JSONObject> top5app(@Param("start") String start, @Param("end") String end);

    @Select("select ip,num from (select ip,count(1) num from dlink_api_accesslog where timestamp >= #{start} and timestamp < #{end} group by ip) a order by num desc limit 0,10")
    List<JSONObject> topNIP(@Param("start") long start, @Param("end") long end);

    @Select("select sum(success) successNum,sum(fail) failNum from (select case when status=200 then 1 else 0 end as success,case when status!=200 then 1 else 0 end as fail from dlink_api_accesslog where timestamp >= #{start} and timestamp < #{end} ) a")
    JSONObject successRatio(@Param("start") long start, @Param("end") long end);

    @Select("<script>select * from dlink_api_accesslog where timestamp between #{start} and #{end} <if test=\"status != null and status !=''\" > and status = #{status}</if><if test=\"ip != null and ip !=''\" > and ip = #{ip}</if><if test=\"url != null and url !=''\" > and url = #{url}</if><if test=\"appId != null and appId !=''\" > and app_id = #{appId}</if></script>")
    List<ApiAccessLog> search(@Param("url") String url, @Param("appId") String appId, @Param("start") Long start, @Param("end") Long end, @Param("status") Integer status,@Param("ip") String ip) ;
}

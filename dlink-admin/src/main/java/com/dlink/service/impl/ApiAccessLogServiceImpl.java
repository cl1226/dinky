package com.dlink.service.impl;

import cn.hutool.json.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.dlink.db.service.impl.SuperServiceImpl;
import com.dlink.mapper.ApiAccessLogMapper;
import com.dlink.model.ApiAccessLog;
import com.dlink.service.ApiAccessLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.List;

/**
 * ApiAccessLogServiceImpl
 *
 * @author cl1226
 * @since 2023/5/19 13:22
 **/
@Service
public class ApiAccessLogServiceImpl extends SuperServiceImpl<ApiAccessLogMapper, ApiAccessLog> implements ApiAccessLogService {

    @Autowired
    private ApiAccessLogMapper mapper;

    private DateFormat format = new SimpleDateFormat("yyyy-MM-dd");

    @Override
    public JSONArray countByDay(String beginDate, String endDate) {
        try {
            List<String> dateList = new ArrayList<>();
            dateList.add(beginDate);
            dateList.add(endDate);
            List<JSONObject> list = mapper.countByDate(format.parse(beginDate).getTime(), format.parse(endDate).getTime());
            JSONObject jo = new JSONObject();
            list.stream().forEach(t -> {
                jo.put(t.getString("date"), t);
            });
            com.alibaba.fastjson.JSONArray array = new com.alibaba.fastjson.JSONArray();
            dateList.forEach(t -> {
                JSONObject o = jo.getJSONObject(t);
                if (o == null) {
                    JSONObject temp = new JSONObject();
                    temp.put("date", t);
                    temp.put("successNum", 0);
                    temp.put("failNum", 0);
                    array.add(temp);
                } else {
                    array.add(o);
                }
            });
        } catch (ParseException e) {
            e.printStackTrace();
        }
        return null;
    }

    @Override
    public List<JSONObject> top5api(String beginDate, String endDate) throws ParseException {
        return mapper.top5api(format.parse(beginDate).getTime(), format.parse(endDate).getTime());
    }

    @Override
    public List<JSONObject> top5app(String beginDate, String endDate) throws ParseException {
        return mapper.top5app(format.parse(beginDate).getTime(), format.parse(endDate).getTime());
    }

    @Override
    public List<JSONObject> topNIP(String beginDate, String endDate) throws ParseException {
        return mapper.topNIP(format.parse(beginDate).getTime(), format.parse(endDate).getTime());
    }

    @Override
    public List<JSONObject> top5duration(String beginDate, String endDate) throws ParseException {
        return mapper.top5duration(format.parse(beginDate).getTime(), format.parse(endDate).getTime());
    }

    @Override
    public JSONObject successRatio(String beginDate, String endDate) throws ParseException {
        return mapper.successRatio(format.parse(beginDate).getTime(), format.parse(endDate).getTime());
    }

    @Override
    public List<ApiAccessLog> search(String url, String appId, String beginDate, String endDate, Integer status, String ip) throws ParseException {
        return mapper.search(url, appId, format.parse(beginDate).getTime(), format.parse(endDate).getTime(), status, ip);
    }
}

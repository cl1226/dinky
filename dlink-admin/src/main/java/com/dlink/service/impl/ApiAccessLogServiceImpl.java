package com.dlink.service.impl;

import cn.hutool.json.JSONArray;
import cn.hutool.json.JSONObject;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.dlink.db.service.impl.SuperServiceImpl;
import com.dlink.dto.SearchCondition;
import com.dlink.mapper.ApiAccessLogMapper;
import com.dlink.model.ApiAccessLog;
import com.dlink.model.ApiConfig;
import com.dlink.service.ApiAccessLogService;
import com.dlink.service.ApiConfigService;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
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

    @Autowired
    private ApiConfigService apiConfigService;

    private DateFormat format = new SimpleDateFormat("yyyy-MM-dd");

    @Override
    public JSONArray countByDay(String beginDate, String endDate) {
        try {
            List<String> dateList = new ArrayList<>();
            dateList.add(beginDate);
            dateList.add(endDate);
            List<JSONObject> list = mapper.countByDate(beginDate + " 00:00:00", endDate + " 00:00:00");
            JSONObject jo = new JSONObject();
            list.stream().forEach(t -> {
                jo.put(t.getStr("date"), t);
            });
            Date parserBeginDate = format.parse(beginDate);
            Date parserEndDate = format.parse(endDate);
            Date tmp = parserBeginDate;
            Calendar dd = Calendar.getInstance();
            dd.setTime(tmp);
            JSONArray array = new JSONArray();
            while (dd.getTime().getTime() < parserEndDate.getTime()) {
                JSONObject o = jo.getJSONObject(format.format(dd.getTime()));
                if (o == null) {
                    JSONObject temp = new JSONObject();
                    temp.put("date", format.format(dd.getTime()));
                    temp.put("successNum", 0);
                    temp.put("failNum", 0);
                    array.add(temp);
                } else {
                    array.add(o);
                }
                dd.add(Calendar.DAY_OF_MONTH, 1);
            }
            return array;
        } catch (ParseException e) {
            e.printStackTrace();
        }
        return null;
    }

    @Override
    public List<JSONObject> top5api(String beginDate, String endDate) {
        return mapper.top5api(beginDate + " 00:00:00", endDate + " 00:00:00");
    }

    @Override
    public List<JSONObject> top5duration(String beginDate, String endDate) {
        return mapper.top5duration(beginDate + " 00:00:00", endDate + " 00:00:00");
    }

    @Override
    public List<JSONObject> top5app(String beginDate, String endDate) {
        return mapper.top5app(beginDate, endDate);
    }

    @Override
    public List<JSONObject> topNIP(String beginDate, String endDate) throws ParseException {
        return mapper.topNIP(format.parse(beginDate).getTime(), format.parse(endDate).getTime());
    }

    @Override
    public JSONObject successRatio(String beginDate, String endDate) throws ParseException {
        return mapper.successRatio(format.parse(beginDate).getTime(), format.parse(endDate).getTime());
    }

    @Override
    public Page<ApiAccessLog> search(SearchCondition condition) throws ParseException {

        Page<ApiAccessLog> page = new Page<>(condition.getPageIndex(), condition.getPageSize());

        QueryWrapper<ApiAccessLog> queryWrapper = new QueryWrapper<ApiAccessLog>();
        if (condition.getAppId() != null) {
            queryWrapper.eq("app_id", condition.getAppId());
        }
        if (StringUtils.isNotBlank(condition.getUrl())) {
            queryWrapper.like("url", condition.getUrl());
        }
        if (StringUtils.isNotBlank(condition.getBeginDate())) {
            queryWrapper.ge("timestamp", format.parse(condition.getBeginDate()).getTime());
        }
        if (StringUtils.isNotBlank(condition.getEndDate())) {
            queryWrapper.lt("timestamp", format.parse(condition.getEndDate()).getTime());
        }
        if (condition.getStatus() != null) {
            if (condition.getStatus() == 1) {
                queryWrapper.eq("status", 200);
            } else {
                queryWrapper.ne("status", 200);
            }
        }

        queryWrapper.orderByDesc("create_time");

        return this.baseMapper.selectPage(page, queryWrapper);

    }

    @Override
    public JSONObject summary() {
        DateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        Calendar now = Calendar.getInstance();
        now.add(Calendar.DAY_OF_MONTH, 1);
        now.set(Calendar.HOUR, 0);
        now.set(Calendar.MINUTE, 0);
        now.set(Calendar.SECOND, 0);
        String endDate = dateFormat.format(now.getTime());
        now.add(Calendar.DAY_OF_MONTH, -7);
        String beginDate = dateFormat.format(now.getTime());
        List<JSONObject> summary = mapper.summary(beginDate, endDate);
        long onlineNum = apiConfigService.count(new QueryWrapper<ApiConfig>().eq("status", 1));
        long offlineNum = apiConfigService.count() - onlineNum;
        JSONObject jsonObject = new JSONObject();
        jsonObject.set("onlineNum", onlineNum);
        jsonObject.set("offlineNum", offlineNum);
        jsonObject.set("beginDate", beginDate.substring(0, 10));
        jsonObject.set("endDate", endDate.substring(0, 10));
        if (summary != null && summary.size() > 0) {
            jsonObject.set("successNum", summary.get(0).getInt("successNum"));
            jsonObject.set("failNum", summary.get(0).get("failNum"));
        } else {
            jsonObject.set("successNum", 0);
            jsonObject.set("failNum", 0);
        }

        return jsonObject;
    }
}

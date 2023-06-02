package com.dlink.service;

import cn.hutool.json.JSONArray;
import cn.hutool.json.JSONObject;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.dlink.db.service.ISuperService;
import com.dlink.dto.SearchCondition;
import com.dlink.model.ApiAccessLog;

import java.text.ParseException;
import java.util.List;

/**
 * ApiAccessLogService
 *
 * @author cl1226
 * @since 2023/5/19 13:22
 **/
public interface ApiAccessLogService extends ISuperService<ApiAccessLog> {

    JSONArray countByDay(String beginDate, String endDate);

    List<JSONObject> top5api(String beginDate, String endDate) throws ParseException;

    List<JSONObject> top5duration(String beginDate, String endDate) throws ParseException;

    List<JSONObject> top5app(String beginDate, String endDate) throws ParseException;

    List<JSONObject> topNIP(String beginDate, String endDate) throws ParseException;

    JSONObject successRatio(String beginDate, String endDate) throws ParseException;

    Page<ApiAccessLog> search(SearchCondition condition) throws ParseException;

    JSONObject summary();
}

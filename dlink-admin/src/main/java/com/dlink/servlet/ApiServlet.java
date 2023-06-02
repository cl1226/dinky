package com.dlink.servlet;

import com.alibaba.druid.pool.DruidPooledConnection;
import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.alibaba.fastjson.TypeReference;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.dlink.common.result.Result;
import com.dlink.model.ApiConfig;
import com.dlink.model.DataBase;
import com.dlink.service.ApiConfigService;
import com.dlink.service.DataBaseService;
import com.dlink.utils.JdbcUtil;
import com.dlink.utils.PoolUtils;
import com.dlink.utils.SqlEngineUtils;
import com.github.freakchick.orange.SqlMeta;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.stream.Collectors;

/**
 * ApiServlet
 *
 * @author cl1226
 * @since 2023/5/17 18:18
 **/
@Slf4j
@Component
public class ApiServlet extends HttpServlet {

    @Autowired
    private ApiConfigService apiConfigService;
    @Autowired
    private DataBaseService dataBaseService;

    @Value("${dinky.api.context}")
    String apiContext;

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String servletPath = req.getRequestURI();
        servletPath = servletPath.substring(apiContext.length() + 1);

        PrintWriter out = null;
        try {
            out = resp.getWriter();
            Result responseDto = process(servletPath, req, resp);
            out.append(JSON.toJSONString(responseDto));

        } catch (Exception e) {
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.append(JSON.toJSONString(Result.failed(e.toString())));
            log.error(e.toString(), e);
        } finally {
            if (out != null) {
                out.close();
            }
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        doGet(req, resp);
    }

    private Result process(String path, HttpServletRequest request, HttpServletResponse response) {
        long now = System.currentTimeMillis();

        ApiConfig config = apiConfigService.getOne(new QueryWrapper<ApiConfig>().eq("path", path));
        if (config == null) {
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            return Result.failed(path + ": api路径不存在");
        }
        if (config.getStatus() != 1) {
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            return Result.failed(path + ": api未上线");
        }

        try {
            DataBase dataBase = dataBaseService.getById(config.getDatasourceId());
            if (dataBase == null) {
                response.setStatus(500);
                return Result.failed("Datasource not exists!");
            }

            Map<String, Object> sqlParam = getParams(request, config);

            DruidPooledConnection connection = PoolUtils.getPooledConnection(dataBase);
            SqlMeta sqlMeta = SqlEngineUtils.getEngine().parse(config.getSegment(), sqlParam);
            Object data = JdbcUtil.executeSql(connection, sqlMeta.getSql(), sqlMeta.getJdbcParamValues());
//            JSONObject jsonObject = new JSONObject();
//            jsonObject.put("timeConsuming", System.currentTimeMillis() - now);
//            jsonObject.put("requestPath", request.getRequestURI());
//            StringBuilder sb = new StringBuilder();
//            sb.append(request.getMethod()).append(" ").
//                    append(request.getServletPath()).append(request.getPathInfo()).append(" ")
//                    .append(request.getProtocol()).append("\n")
//                    .append("User-Agent: " + request.getHeader("user-agent"));
//            StringBuilder sb2 = new StringBuilder();
//            DateFormat format = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
//            sb2.append("Response-Status: " + request.getProtocol()).append(" ").append(response.getStatus()).append(" ")
//                    .append("\n")
//                    .append("Content-Length: " + data.toString().length()).append("\n")
//                    .append("Content-Type:" + request.getContentType()).append("\n")
//                    .append("Date: " + format.format(Calendar.getInstance().getTime())).append("\n");
//            jsonObject.put("data", data);
//            jsonObject.put("request", sb.toString());
//            jsonObject.put("response", sb2.toString());
            return Result.succeed(data, "Interface request successful!");

        } catch (Exception e) {
            response.setStatus(400);
            JSONObject jsonObject = new JSONObject();
            StringBuilder sb = new StringBuilder();
            sb.append(request.getMethod()).append(" ").append(request.getContentType()).append(request.getServletPath()).append(" ").append(request.getProtocol())
                    .append("\n")
                    .append("User-Agent: " + request.getHeader("user-agent"));
            jsonObject.put("requestPath", request.getRequestURI());
            jsonObject.put("request", sb.toString());
            jsonObject.put("response", e.getMessage());
            return Result.failed(jsonObject, "Interface request failed");

        }
    }

    private Map<String, Object> getParams(HttpServletRequest request, ApiConfig apiConfig) {
        String unParseContentType = request.getContentType();

        // 如果是浏览器get请求过来，取出来的contentType是null
        if (unParseContentType == null) {
            unParseContentType = MediaType.APPLICATION_FORM_URLENCODED_VALUE;
        }
        // issues/I57ZG2
        // 解析contentType 格式: appliation/json;charset=utf-8
        String[] contentTypeArr = unParseContentType.split(";");
        String contentType = contentTypeArr[0];

        Map<String, Object> params = null;
        // 如果是application/json请求，不管接口规定的content-type是什么，接口都可以访问，且请求参数都以json body 为准
        if (contentType.equalsIgnoreCase(MediaType.APPLICATION_JSON_VALUE)) {
            JSONObject jo = getHttpJsonBody(request);
            params = JSONObject.parseObject(jo.toJSONString(), new TypeReference<Map<String, Object>>() {
            });
        }
        // 如果是application/x-www-form-urlencoded请求，先判断接口规定的content-type是不是确实是application/x-www-form-urlencoded
        else if (contentType.equalsIgnoreCase(MediaType.APPLICATION_FORM_URLENCODED_VALUE)) {
            if (MediaType.APPLICATION_FORM_URLENCODED_VALUE.equalsIgnoreCase(apiConfig.getContentType())) {
                params = this.getSqlParam(request, apiConfig);
            } else {
                throw new RuntimeException("this API only support content-type: " + apiConfig.getContentType() + ", but you use: " + contentType);
            }
        } else {
            throw new RuntimeException("content-type not supported: " + contentType);
        }

        return params;
    }

    private JSONObject getHttpJsonBody(HttpServletRequest request) {
        try {
            InputStreamReader in = new InputStreamReader(request.getInputStream(), "utf-8");
            BufferedReader br = new BufferedReader(in);
            StringBuilder sb = new StringBuilder();
            String line = null;
            while ((line = br.readLine()) != null) {
                sb.append(line);
            }
            br.close();
            JSONObject jsonObject = JSON.parseObject(sb.toString());
            return jsonObject;
        } catch (Exception e) {
            log.error(e.getMessage(), e);
        } finally {

        }
        return null;
    }

    public Map<String, Object> getSqlParam(HttpServletRequest request, ApiConfig config) {
        Map<String, Object> map = new HashMap<>();

        JSONArray requestParams = JSON.parseArray(config.getParams());
        for (int i = 0; i < requestParams.size(); i++) {
            JSONObject jo = requestParams.getJSONObject(i);
            String name = jo.getString("name");
            String type = jo.getString("type");

            //数组类型参数
            if (type.startsWith("Array")) {
                String[] values = request.getParameterValues(name);
                if (values != null) {
                    List<String> list = Arrays.asList(values);
                    if (values.length > 0) {
                        switch (type) {
                            case "Array<double>":
                                List<Double> collect = list.stream().map(value -> Double.valueOf(value)).collect(Collectors.toList());
                                map.put(name, collect);
                                break;
                            case "Array<bigint>":
                                List<Long> longs = list.stream().map(value -> Long.valueOf(value)).collect(Collectors.toList());
                                map.put(name, longs);
                                break;
                            case "Array<string>":
                            case "Array<date>":
                                map.put(name, list);
                                break;
                        }
                    } else {
                        map.put(name, list);
                    }
                } else {
                    map.put(name, null);
                }
            } else {

                String value = request.getParameter(name);
                if (StringUtils.isNotBlank(value)) {

                    switch (type) {
                        case "double":
                            Double v = Double.valueOf(value);
                            map.put(name, v);
                            break;
                        case "bigint":
                            Long longV = Long.valueOf(value);
                            map.put(name, longV);
                            break;
                        case "string":
                        case "date":
                            map.put(name, value);
                            break;
                    }
                } else {
                    map.put(name, value);
                }
            }
        }
        return map;
    }
}

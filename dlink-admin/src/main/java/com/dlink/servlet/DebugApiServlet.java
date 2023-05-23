package com.dlink.servlet;

import com.alibaba.druid.pool.DruidPooledConnection;
import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.alibaba.fastjson.TypeReference;
import com.dlink.common.result.Result;
import com.dlink.model.DataBase;
import com.dlink.service.ApiConfigService;
import com.dlink.service.DataBaseService;
import com.dlink.utils.JdbcUtil;
import com.dlink.utils.PoolUtils;
import com.dlink.utils.SqlEngineUtils;
import com.github.freakchick.orange.SqlMeta;
import lombok.extern.slf4j.Slf4j;
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

/**
 * DebugApiServlet
 *
 * @author cl1226
 * @since 2023/5/22 14:23
 **/
@Slf4j
@Component
public class DebugApiServlet extends HttpServlet {

    @Autowired
    private ApiConfigService apiConfigService;
    @Autowired
    private DataBaseService dataBaseService;

    @Value("${dinky.api.context}")
    String apiContext;

    @Value("${dinky.api.debug.context}")
    String debugapiContext;

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String servletPath = req.getRequestURI();
        servletPath = servletPath.substring(debugapiContext.length() + 2);

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

        try {
            // 获取数据源, SQL, Params
            Map<String, Object> requestInfo = getRequestInfo(request);
            DataBase database = (DataBase) requestInfo.get("database");
            if (database == null) {
                response.setStatus(500);
                return Result.failed("Datasource not exists!");
            }
            Map<String, Object> params = (Map<String, Object>) requestInfo.get("params");

            DruidPooledConnection connection = PoolUtils.getPooledConnection(database);
            SqlMeta sqlMeta = SqlEngineUtils.getEngine().parse(String.valueOf(requestInfo.get("sql")), params);
            Object data = JdbcUtil.executeSql(connection, sqlMeta.getSql(), sqlMeta.getJdbcParamValues());
            JSONObject jsonObject = new JSONObject();
            jsonObject.put("timeConsuming", System.currentTimeMillis() - now);
            jsonObject.put("requestPath", apiContext + request.getPathInfo());
            StringBuilder sb = new StringBuilder();
            sb.append(request.getMethod()).append(" ")
                    .append(request.getServletPath()).append(request.getPathInfo()).append(" ")
                    .append(request.getProtocol()).append("\n")
                    .append("User-Agent: " + request.getHeader("user-agent"));
            StringBuilder sb2 = new StringBuilder();
            DateFormat format = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            sb2.append("Response-Status: " + request.getProtocol()).append(" ").append(response.getStatus()).append(" ")
                    .append("\n")
                    .append("Content-Length: " + data.toString().length()).append("\n")
                    .append("Content-Type:" + request.getContentType()).append("\n")
                    .append("Date: " + format.format(Calendar.getInstance().getTime())).append("\n")
                    .append(data);
            jsonObject.put("request", sb.toString());
            jsonObject.put("response", sb2.toString());
            return Result.succeed(jsonObject, "Interface request successful!");

        } catch (Exception e) {
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

    private Map<String, Object> getRequestInfo(HttpServletRequest request) {
        String unParseContentType = request.getContentType();
        // 如果是浏览器get请求过来，取出来的contentType是null
        if (unParseContentType == null) {
            unParseContentType = MediaType.APPLICATION_FORM_URLENCODED_VALUE;
        }
        // issues/I57ZG2
        // 解析contentType 格式: appliation/json;charset=utf-8
        String[] contentTypeArr = unParseContentType.split(";");
        String contentType = contentTypeArr[0];

        Map<String, Object> info = new HashMap<>();
        Map<String, Object> params = null;
        // 如果是application/json请求，不管接口规定的content-type是什么，接口都可以访问，且请求参数都以json body 为准
        if (contentType.equalsIgnoreCase(MediaType.APPLICATION_JSON_VALUE)) {
            JSONObject jo = getHttpJsonBody(request);

            DataBase dataBase = dataBaseService.getById(jo.getString("datasourceId"));
            info.put("database", dataBase);
            params = JSONObject.parseObject(jo.getJSONObject("params").toJSONString(), new TypeReference<Map<String, Object>>() {
            });
            info.put("params", params);
            info.put("sql", jo.getString("sql"));
        } else if (contentType.equalsIgnoreCase(MediaType.APPLICATION_FORM_URLENCODED_VALUE)) {
        } else {
            throw new RuntimeException("content-type not supported: " + contentType);
        }

        return info;
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

}

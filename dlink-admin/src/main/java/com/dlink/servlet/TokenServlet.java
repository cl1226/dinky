package com.dlink.servlet;

import com.alibaba.fastjson.JSON;
import com.dlink.model.AppToken;
import com.dlink.service.AppConfigService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.PrintWriter;

/**
 * TokenServlet
 *
 * @author cl1226
 * @since 2023/5/19 13:34
 **/
@Slf4j
@Component
public class TokenServlet extends HttpServlet {

    @Autowired
    private AppConfigService appConfigService;

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) {
        response.setCharacterEncoding("UTF-8");
        response.setContentType("application/json; charset=utf-8");
        // 跨域设置
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Credentials", "true");
        // 这里很重要，要不然js header不能跨域携带  Authorization属性
        response.setHeader("Access-Control-Allow-Headers", "*");
        response.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT, OPTIONS, DELETE");

        String appid = request.getParameter("appid");
        String secret = request.getParameter("secret");

        AppToken token = appConfigService.generateToken(Integer.valueOf(appid), secret);
        PrintWriter out = null;
        try {
            out = response.getWriter();
            out.append(JSON.toJSONString(token));

        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            log.error(e.toString(), e);
        } finally {
            if (out != null) {
                out.close();
            }
        }
    }


    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) {
        doGet(req, resp);
    }

}

package com.dlink.filter;

import com.alibaba.fastjson.JSON;
import com.dlink.common.result.Result;
import com.dlink.utils.IPUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import javax.servlet.*;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;

/**
 * ApiIPFilter
 *
 * @author cl1226
 * @since 2023/5/19 14:11
 **/
@Slf4j
@Component
public class ApiIPFilter implements Filter {
    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        Filter.super.init(filterConfig);
    }

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        log.debug("IP filter execute");
        HttpServletRequest request = (HttpServletRequest) servletRequest;
        HttpServletResponse response = (HttpServletResponse) servletResponse;

        String originIp = IPUtil.getOriginIp(request);

        String method = request.getMethod();
        PrintWriter out = null;
        try {

            //js跨域的预检请求，不经过处理逻辑。开发模式下，前端启动，访问8521的页面进行请求测试会跨域
            if (method.equals("OPTIONS")) {
                response.setStatus(HttpServletResponse.SC_OK);
                return;
            }

//            boolean checkIP = ipService.checkIP(originIp);
            if (false) {
                out = response.getWriter();
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                out.append(JSON.toJSONString(Result.failed("Illegal ip (" + originIp + "), access forbidden")));
            } else {
                filterChain.doFilter(servletRequest, servletResponse);
            }
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.append(JSON.toJSONString(Result.failed(e.toString())));
            log.error(e.toString());

        } finally {
            if (out != null) {
                out.close();
            }
        }
    }

    @Override
    public void destroy() {
        Filter.super.destroy();
    }
}

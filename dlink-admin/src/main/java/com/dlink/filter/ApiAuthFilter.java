package com.dlink.filter;

import cn.hutool.core.thread.ThreadUtil;
import com.alibaba.fastjson.JSON;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.dlink.common.result.Result;
import com.dlink.model.ApiAccessLog;
import com.dlink.model.ApiConfig;
import com.dlink.service.ApiAccessLogService;
import com.dlink.service.ApiConfigService;
import com.dlink.service.AppConfigService;
import com.dlink.utils.IPUtil;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.servlet.*;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import java.util.UUID;

/**
 * ApiAuthFilter
 *
 * @author cl1226
 * @since 2023/5/19 14:28
 **/
@Slf4j
@Component
public class ApiAuthFilter implements Filter {

    @Value("${dinky.api.context}")
    private String apiContext;

    @Autowired
    private ApiConfigService apiConfigService;
    @Autowired
    private AppConfigService appConfigService;
    @Autowired
    private ApiAccessLogService apiAccessLogService;

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        long now = System.currentTimeMillis();
        ApiAccessLog apiAccessLog = new ApiAccessLog();
        apiAccessLog.setTimestamp(now / 1000);

        log.debug("auth filter execute");
        HttpServletRequest request = (HttpServletRequest) servletRequest;
        HttpServletResponse response = (HttpServletResponse) servletResponse;

        String uri = request.getRequestURI();
        String servletPath = uri.substring(apiContext.length() + 1);

        // 不使用writer的时候不要提前获取response的writer,否则无法在后续filter中设置编码
        try {
            // 校验接口是否存在
            ApiConfig apiConfig = apiConfigService.getOne(new QueryWrapper<ApiConfig>().eq("path", servletPath));
            if (apiConfig == null) {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                response.getWriter().append(JSON.toJSONString(Result.failed("Api not exists")));
                return;
            }
            apiAccessLog.setApiId(apiConfig.getId());
            // 如果是私有接口，校验权限
            if ("app".equals(apiConfig.getAuthType())) {
                String tokenStr = request.getHeader("Authorization");
                if (StringUtils.isBlank(tokenStr)) {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.getWriter().append(JSON.toJSONString(Result.failed("No Token!")));
                    return;
                } else {
                    Integer appId = appConfigService.verifyToken(tokenStr);
                    apiAccessLog.setAppId(appId);
                    if (appId == null) {
                        log.error("token[{}] matched no appid", tokenStr);
                        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                        response.getWriter().append(JSON.toJSONString(Result.failed("Token Invalid!")));
                        return;
                    } else {
                        Integer authId = apiConfig.getAuthId();
                        if (authId.intValue() != appId.intValue()) {
                            log.error("token[{}] matched appid[{}], but appid not authorized", tokenStr, appId);
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            response.getWriter().append(JSON.toJSONString(Result.failed("Token Invalid!")));
                            return;
                        }
                    }
                }
            }

            filterChain.doFilter(servletRequest, servletResponse);

        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().append(JSON.toJSONString(Result.failed(e.toString())));
            log.error(e.getMessage(), e);
            apiAccessLog.setError(e.getMessage());
        } finally {
            if (response.getWriter() != null) {
                response.getWriter().close();
            }

            apiAccessLog.setDuration(System.currentTimeMillis() - now);
            apiAccessLog.setIp(IPUtil.getOriginIp(request));
            apiAccessLog.setStatus(response.getStatus());
            apiAccessLog.setUrl(uri);
            apiAccessLog.setName("AccessLog");
            log.info(JSON.toJSONString(apiAccessLog));
            ThreadUtil.execute(() -> {
                apiAccessLogService.save(apiAccessLog);
            });

        }
    }
}

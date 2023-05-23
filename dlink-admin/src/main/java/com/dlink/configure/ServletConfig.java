package com.dlink.configure;

import com.dlink.servlet.ApiServlet;
import com.dlink.servlet.DebugApiServlet;
import com.dlink.servlet.TokenServlet;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.servlet.ServletRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * ServletConfig
 *
 * @author cl1226
 * @since 2023/5/18 12:21
 **/
@Slf4j
@Configuration
public class ServletConfig {

    @Value("${dinky.api.context}")
    private String apiContext;

    @Value("${dinky.api.debug.context}")
    private String apiDebugContext;

    @Autowired
    private ApiServlet apiServlet;

    @Autowired
    private DebugApiServlet debugApiServlet;

    @Autowired
    private TokenServlet tokenServlet;

    @Bean
    public ServletRegistrationBean getServletRegistrationBean() {
        String format = String.format("/%s/*", apiContext);
        ServletRegistrationBean bean = new ServletRegistrationBean(apiServlet);
        bean.addUrlMappings(format);
        return bean;
    }

    @Bean
    public ServletRegistrationBean getServletRegistrationBean2() {
        String format = String.format("/%s/*", apiDebugContext);
        ServletRegistrationBean bean = new ServletRegistrationBean(debugApiServlet);
        bean.addUrlMappings(format);
        return bean;
    }

    @Bean
    public ServletRegistrationBean tokenServletRegistrationBean() {
        ServletRegistrationBean bean = new ServletRegistrationBean(tokenServlet);
        bean.addUrlMappings("/token/generate");
        return bean;
    }
}

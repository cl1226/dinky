package com.dlink.configure;

import com.dlink.servlet.ApiServlet;
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

    @Autowired
    private ApiServlet apiServlet;

    @Bean
    public ServletRegistrationBean getServletRegistrationBean() {
        String format = String.format("/%s/*", apiContext);
        ServletRegistrationBean bean = new ServletRegistrationBean(apiServlet);
        bean.addUrlMappings(format);
        log.info("regist APIServlet servelet for {} urlMappings",format);
        return bean;
    }
}

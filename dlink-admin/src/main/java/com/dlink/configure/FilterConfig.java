package com.dlink.configure;

import com.dlink.filter.ApiAuthFilter;
import com.dlink.filter.ApiHeaderFilter;
import com.dlink.filter.ApiIPFilter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * FilterConfig
 *
 * @author cl1226
 * @since 2023/5/19 13:51
 **/
@Slf4j
@Configuration
public class FilterConfig {

    @Value("${dinky.api.context}")
    private String apiContext;

    @Autowired
    private ApiIPFilter apiIPFilter;

    @Autowired
    private ApiAuthFilter apiAuthFilter;

    @Bean
    public FilterRegistrationBean apiHeaderFilter() {
        int apiHeaderFilterOrder = 1;
        String format = String.format("/%s/*", apiContext);
        FilterRegistrationBean registrationBean = new FilterRegistrationBean();
        registrationBean.setFilter(new ApiHeaderFilter());
        registrationBean.addUrlPatterns(format);
        registrationBean.setOrder(apiHeaderFilterOrder);
        registrationBean.setEnabled(true);
        log.info("Register apiHeaderFilter for {} UrlPatterns, and order is {}", format, apiHeaderFilterOrder);
        return registrationBean;
    }

    @Bean
    public FilterRegistrationBean ipFilter() {
        int ipfilterOrder = 2;
        String format = String.format("/%s/*", apiContext);
        FilterRegistrationBean registrationBean = new FilterRegistrationBean();
        registrationBean.setFilter(apiIPFilter);
        registrationBean.addUrlPatterns(format);
        registrationBean.setOrder(ipfilterOrder);
        registrationBean.setEnabled(true);
        log.info("regist ipFilter for {} UrlPatterns, and order is {}",format,ipfilterOrder);
        return registrationBean;
    }

    @Bean
    public FilterRegistrationBean authFilter() {
        int authFilterOrder = 3;
        String format = String.format("/%s/*", apiContext);
        FilterRegistrationBean registrationBean = new FilterRegistrationBean();
        registrationBean.setFilter(apiAuthFilter);
        registrationBean.addUrlPatterns(format);
        registrationBean.setOrder(authFilterOrder);
        registrationBean.setEnabled(true);
        log.info("regist authFilter for {} UrlPatterns, and order is {}", format, authFilterOrder);
        return registrationBean;
    }
}

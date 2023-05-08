package com.dlink.utils;

import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;
import org.junit.Test;
import org.quartz.TriggerUtils;
import org.quartz.impl.triggers.CronTriggerImpl;

import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

public class CronTest {

    @Test
    public void previewSchedule() {
        String schedule = "{\"startTime\":\"2023-05-08 00:00:00\",\"endTime\":\"2123-05-08 00:00:00\",\"crontab\":\"0 0 * * * ? *\",\"timezoneId\":\"Asia/Shanghai\"}";
        CronTriggerImpl cronTriggerImpl = new CronTriggerImpl();
        JSONObject jsonObject = JSONUtil.parseObj(schedule);
        DateFormat format = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        List<String> dates = new ArrayList<>();
        try {
            cronTriggerImpl.setCronExpression(jsonObject.getStr("crontab"));
            String startTime = jsonObject.getStr("startTime");
            String endTime = jsonObject.getStr("endTime");
            List<Date> computeFireTimes = TriggerUtils.computeFireTimes(cronTriggerImpl, null, 5);
            computeFireTimes.stream().forEach(x -> {
                dates.add(format.format(x));
            });
        } catch (ParseException e) {
            e.printStackTrace();
        }

        dates.stream().forEach(x -> System.out.println(x));
    }

}

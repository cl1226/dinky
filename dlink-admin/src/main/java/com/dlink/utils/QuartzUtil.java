package com.dlink.utils;

import com.dlink.service.MetadataTaskService;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * QuartzUtil
 *
 * @author cl1226
 * @since 2023/6/15 10:06
 **/
@Component
public class QuartzUtil implements Job {

    @Autowired
    private MetadataTaskService metadataTaskService;

    @Override
    public void execute(JobExecutionContext jobExecutionContext) throws JobExecutionException {
        Integer taskId = (Integer) jobExecutionContext.getJobDetail().getJobDataMap().get("taskId");
        metadataTaskService.execute(taskId);
    }
}

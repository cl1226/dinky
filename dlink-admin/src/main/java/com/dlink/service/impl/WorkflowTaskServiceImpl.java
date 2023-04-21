package com.dlink.service.impl;

import cn.hutool.core.collection.CollUtil;
import cn.hutool.core.convert.Convert;
import com.dlink.assertion.Assert;
import com.dlink.assertion.Asserts;
import com.dlink.common.result.Result;
import com.dlink.config.Dialect;
import com.dlink.db.service.impl.SuperServiceImpl;
import com.dlink.exception.BusException;
import com.dlink.function.compiler.CustomStringJavaCompiler;
import com.dlink.function.pool.UdfCodePool;
import com.dlink.function.util.UDFUtil;
import com.dlink.mapper.WorkflowTaskMapper;
import com.dlink.model.*;
import com.dlink.service.WorkflowTaskService;
import com.dlink.utils.UDFUtils;
import org.springframework.stereotype.Service;

import java.util.Map;

/**
 * 任务 服务实现类
 *
 * @author cl1226
 * @since 2023-04-20 12:16
 */
@Service
public class WorkflowTaskServiceImpl extends SuperServiceImpl<WorkflowTaskMapper, WorkflowTask> implements WorkflowTaskService {
    @Override
    public WorkflowTask getTaskInfoById(Integer id) {
        WorkflowTask task = this.getById(id);
        return task;
    }

    @Override
    public void initTenantByTaskId(Integer id) {

    }

    @Override
    public boolean saveOrUpdateTask(WorkflowTask task) {
        // if modify task else create task
        if (task.getId() != null) {
            WorkflowTask taskInfo = getById(task.getId());
            Assert.check(taskInfo);
            if (JobLifeCycle.RELEASE.equalsValue(taskInfo.getStep())
                    || JobLifeCycle.ONLINE.equalsValue(taskInfo.getStep())
                    || JobLifeCycle.CANCEL.equalsValue(taskInfo.getStep())) {
                throw new BusException("该作业已" + JobLifeCycle.get(taskInfo.getStep()).getLabel() + "，禁止修改！");
            }
            task.setStep(JobLifeCycle.DEVELOP.getValue());
            this.updateById(task);
        } else {
            task.setStep(JobLifeCycle.CREATE.getValue());
            this.save(task);
        }
        return true;
    }

    @Override
    public Result releaseTask(Integer id) {
        return null;
    }

    @Override
    public boolean developTask(Integer id) {
        return false;
    }

    @Override
    public Result onLineTask(Integer id) {
        return null;
    }

    @Override
    public Result reOnLineTask(Integer id, String savePointPath) {
        return null;
    }

    @Override
    public Result offLineTask(Integer id, String type) {
        return null;
    }

    @Override
    public Result cancelTask(Integer id) {
        return null;
    }

    @Override
    public boolean recoveryTask(Integer id) {
        return false;
    }
}

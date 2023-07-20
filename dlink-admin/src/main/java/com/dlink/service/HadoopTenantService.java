package com.dlink.service;

import com.dlink.common.result.Result;
import com.dlink.db.service.ISuperService;
import com.dlink.model.HadoopTenant;

/**
 * HadoopTenantService
 *
 * @author cl1226
 * @since 2023/7/12 13:35
 **/
public interface HadoopTenantService extends ISuperService<HadoopTenant> {

    Result saveOrUpdateModel(HadoopTenant model);

}

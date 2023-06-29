package com.dlink.service.impl;

import com.dlink.db.service.impl.SuperServiceImpl;
import com.dlink.mapper.YarnQueueMapper;
import com.dlink.model.YarnQueue;
import com.dlink.service.YarnQueueService;
import org.springframework.stereotype.Service;

/**
 * YarnQueueServiceImpl
 *
 * @author cl1226
 * @since 2023/6/29 9:53
 **/
@Service
public class YarnQueueServiceImpl extends SuperServiceImpl<YarnQueueMapper, YarnQueue> implements YarnQueueService {
}

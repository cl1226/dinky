package com.dlink.service.impl;

import com.dlink.db.service.impl.SuperServiceImpl;
import com.dlink.mapper.MetadataTableLineageMapper;
import com.dlink.model.MetadataTableLineage;
import com.dlink.service.MetadataTableLineageService;
import org.springframework.stereotype.Service;

/**
 * MetadataTableLineageServiceImpl
 *
 * @author cl1226
 * @since 2023/6/16 14:37
 **/
@Service
public class MetadataTableLineageServiceImpl extends SuperServiceImpl<MetadataTableLineageMapper, MetadataTableLineage> implements MetadataTableLineageService {
}

package com.dlink.service.impl;

import com.dlink.db.service.impl.SuperServiceImpl;
import com.dlink.mapper.MetadataColumnLineageMapper;
import com.dlink.model.MetadataColumnLineage;
import com.dlink.service.MetadataColumnLineageService;
import org.springframework.stereotype.Service;

/**
 * MetadataColumnLineageServiceImpl
 *
 * @author cl1226
 * @since 2023/6/16 16:25
 **/
@Service
public class MetadataColumnLineageServiceImpl extends SuperServiceImpl<MetadataColumnLineageMapper, MetadataColumnLineage> implements MetadataColumnLineageService {
}

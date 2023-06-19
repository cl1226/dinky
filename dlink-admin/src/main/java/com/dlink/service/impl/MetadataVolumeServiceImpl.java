package com.dlink.service.impl;

import com.dlink.db.service.impl.SuperServiceImpl;
import com.dlink.mapper.MetadataVolumnMapper;
import com.dlink.model.MetadataVolume;
import com.dlink.service.MetadataVolumeService;
import org.springframework.stereotype.Service;

/**
 * MetadataVolumeServiceImpl
 *
 * @author cl1226
 * @since 2023/6/15 15:07
 **/
@Service
public class MetadataVolumeServiceImpl extends SuperServiceImpl<MetadataVolumnMapper, MetadataVolume> implements MetadataVolumeService {
}

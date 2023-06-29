package com.dlink.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.dlink.common.result.Result;
import com.dlink.db.service.ISuperService;
import com.dlink.dto.SearchCondition;
import com.dlink.model.FileEntity;
import com.dlink.model.FileModel;

import javax.servlet.http.HttpServletResponse;
import java.util.List;

/**
 * FileEntityService
 *
 * @author cl1226
 * @since 2023/6/27 16:35
 **/
public interface FileEntityService extends ISuperService<FileEntity> {

    Page<FileEntity> page(SearchCondition searchCondition);

    FileEntity create(FileModel fileModel);

    Result show(Integer id);

    void download(HttpServletResponse response, Integer id);

    Result remove(List<Integer> ids);
}

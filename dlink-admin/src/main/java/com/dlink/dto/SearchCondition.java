package com.dlink.dto;

import lombok.Data;

import java.util.List;

/**
 * SearchCondition
 *
 * @author cl1226
 * @since 2023/5/17 14:49
 **/
@Data
public class SearchCondition {

    private Integer catalogueId;

    private String name;

    private Integer pageIndex;

    private Integer pageSize;

    private List<Integer> ids;

}

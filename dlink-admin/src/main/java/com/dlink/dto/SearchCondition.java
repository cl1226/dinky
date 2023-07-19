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

    private Integer id;

    private Integer catalogueId;

    private Integer appId;

    private Integer apiId;

    private String name;

    private Integer pageIndex;

    private Integer pageSize;

    private String dialect;

    private List<Integer> ids;

    private String url;

    private String beginDate;

    private String endDate;

    private Integer status;

    private List<String> datasourceType;

    private String itemType;

    private String type;

    private Integer clusterId;

    private String clusterName;

    private String hostname;

}

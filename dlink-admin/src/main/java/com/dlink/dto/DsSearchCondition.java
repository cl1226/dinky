package com.dlink.dto;

import lombok.Data;

/**
 * DsSearchCondition
 *
 * @author cl1226
 * @since 2023/6/3 13:43
 **/
@Data
public class DsSearchCondition {

    private String projectCode;
    private Integer pageNo;
    private Integer pageSize;
    private String searchVal;
    private String executorName;
    private String host;
    private String stateType;
    private String startDate;
    private String endDate;

    private Integer index;
    private Integer processInstanceId;
    private String executeType;
    private String buttonType;

}

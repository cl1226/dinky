package com.dlink.dto;

import lombok.Getter;
import lombok.Setter;

/**
 * WorkflowNode
 *
 * @author cl1226
 * @since 2023/04/23 15:26
 */
@Getter
@Setter
public class WorkflowNode {

    private String id;
    private String label;
    private Integer jobId;
    private String nodeType;
    private String nodeInfo;
    private String group;

}

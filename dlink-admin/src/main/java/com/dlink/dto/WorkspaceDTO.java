package com.dlink.dto;

import com.dlink.model.HadoopCluster;
import com.dlink.model.User;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/**
 * WorkspaceDTO
 *
 * @author cl1226
 * @since 2023/7/31 14:42
 **/
@Data
public class WorkspaceDTO {

    private Integer id;

    private String name;

    private String code;

    private Integer clusterId;

    private String clusterName;

    private Boolean enabled;

    private String description;

    private String obsPath;

    private List<WorkspaceUserDTO> users;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;

    private String projectCode;

}

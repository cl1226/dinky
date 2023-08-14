package com.dlink.dto;

import com.dlink.db.annotation.Save;
import com.dlink.model.Role;
import lombok.Data;

import javax.validation.constraints.NotNull;
import java.util.List;

/**
 * WorkspaceUserDTO
 *
 * @author cl1226
 * @since 2023/8/4 13:35
 **/
@Data
public class WorkspaceUserDTO {

    private Integer id;

    private String username;

    private String label;

    private String nickname;

    private Integer value;

    private List<Role> roleList;

}

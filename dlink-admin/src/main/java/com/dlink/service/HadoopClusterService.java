package com.dlink.service;

import com.dlink.common.result.Result;
import com.dlink.db.service.ISuperService;
import com.dlink.dto.UserDTO;
import com.dlink.model.ClusterUserRole;
import com.dlink.model.HadoopCluster;
import com.dlink.model.HadoopClusterModel;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * HadoopClusterService
 *
 * @author cl1226
 * @since 2023/6/28 10:39
 **/
public interface HadoopClusterService extends ISuperService<HadoopCluster> {

    Result save(HadoopClusterModel model);

    List<HadoopClusterModel> listAll();

    List<UserDTO> listBindUser(Integer clusterId);

    Result bindUserRole(ClusterUserRole clusterUserRole);

    Result unbindUserRole(ClusterUserRole clusterUserRole);

    List<HadoopClusterModel> listByUser();

    Result detail(Integer id);

    Result upload(MultipartFile file, String uuid);

    Result load(HadoopClusterModel model);

}

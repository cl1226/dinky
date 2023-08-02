import { request2, CODE } from '@/components/Common/crud'
import { message } from 'antd'
import { l } from '@/utils/intl'
import { extend } from 'umi-request'

export const requestNoCluster = extend({
  headers: {},
})

// 获取集群列表
export const requestClusterList = async () => {
  return requestNoCluster('/api/hadoop/cluster', {
    method: 'GET',
  })
}

// 获取集群列表
export const getClusterList = async () => {
  try {
    const { code, msg, datas } = await requestClusterList()
    if (code == CODE.SUCCESS) {
      return datas
    } else {
      message.warn(msg)
      return []
    }
  } catch (error) {
    message.error(l('app.request.geterror.try'))
    return []
  }
}

// 获取集群详情
export const requestClusterDetail = async (id: number) => {
  return request2('/api/hadoop/cluster/detail', {
    method: 'GET',
    params: {
      id,
    },
  })
}
// 获取集群详情
export const getClusterDetail = async (id: number) => {
  try {
    const { code, msg, datas } = await requestClusterDetail(id)
    if (code == CODE.SUCCESS) {
      const { yarnQueueModels, ...cluster } = datas
      return {
        cluster: cluster || {},
        yarnQueue: yarnQueueModels || [],
      }
    } else {
      message.warn(msg)
      return null
    }
  } catch (error) {
    message.error(l('app.request.geterror.try'))
    return null
  }
}

// 获取集群 配置
export const requestClusterConfig = async (params: any) => {
  return request2('/api/hadoop/cluster/load', {
    method: 'POST',
    data: {
      ...params,
    },
  })
}

// 获取集群 配置
export const getClusterConfig = async (params: any) => {
  try {
    const { code, msg, datas } = await requestClusterConfig(params)
    if (code == CODE.SUCCESS && datas) {
      return {
        cluster: datas?.Cluster || {},
        yarnQueue: datas?.YarnQueue || [],
      }
    } else {
      message.warn(msg)
      return null
    }
  } catch (error) {
    message.error(l('app.request.geterror.try'))
    return null
  }
}

// 创建 集群
export const requestCreateCluster = async (params: any) => {
  return request2('/api/hadoop/cluster', {
    method: 'PUT',
    data: {
      ...params,
    },
  })
}
// 创建 集群
export const createCluster = async (params: any) => {
  try {
    const { code, msg } = await requestCreateCluster(params)
    if (code == CODE.SUCCESS) {
      return true
    } else {
      message.warn(msg)
      return false
    }
  } catch (error) {
    message.error(l('app.request.geterror.try'))
    return false
  }
}

// 上传xml
export const requestUploadXml = (params) => {
  return request2('/api/hadoop/cluster/uploadXml ', {
    method: 'POST',
    // headers: {
    //   // 'Content-Type': 'multipart/form-data;',
    // },
    requestType: 'form',
    data: params,
  })
}
// 上传xml
export const postUploadXml = async (params: any) => {
  try {
    const { code, msg, datas } = await requestUploadXml(params)
    if (code == CODE.SUCCESS) {
      return datas || []
    } else {
      message.warn(msg)
      return []
    }
  } catch (error) {
    message.error(l('app.request.geterror.try'))
    return []
  }
}

// 获取uuid
export const requestUuid = async () => {
  return request2('/api/hadoop/cluster/getUuid', {
    method: 'GET',
    params: {},
  })
}

// 获取uuid
export const getUuid = async () => {
  try {
    const { code, msg, datas } = await requestUuid()
    if (code == CODE.SUCCESS) {
      return datas || ''
    } else {
      message.warn(msg)
      return ''
    }
  } catch (error) {
    message.error(l('app.request.geterror.try'))
    return ''
  }
}

// 获取角色列表
export async function requestRoleList(params) {
  return request2('/api/role/page', {
    method: 'POST',
    data: {
      ...params,
    },
  })
}

// 获取角色列表
export const getRoleList = async (params) => {
  try {
    const { code, msg, datas } = await requestRoleList(params)
    if (code == CODE.SUCCESS) {
      const { records, total, current, size } = datas
      return {
        list: records,
        total,
        pn: current,
        ps: size,
      }
    } else {
      message.warn(msg)
      return {
        list: [],
        total: 0,
        pn: 1,
        ps: 10,
      }
    }
  } catch (error) {
    message.error(l('app.request.geterror.try'))
    return {
      list: [],
      total: 0,
      pn: 1,
      ps: 10,
    }
  }
}

// 删除角色
export async function requestDeleteRole(ids: (string | number)[]) {
  return request2('/api/dataservice/config', {
    method: 'DELETE',
    data: { ids },
  })
}

// 删除角色
export const deleteRole = async (ids: (string | number)[]) => {
  const hide = message.loading(l('app.request.delete'))
  try {
    const { code, msg } = await requestDeleteRole(ids)
    hide()
    if (code == CODE.SUCCESS) {
      message.success(msg)
      return true
    } else {
      message.warn(msg)
      return false
    }
  } catch (error) {
    hide()
    message.error(l('app.request.delete.error'))
    return false
  }
}
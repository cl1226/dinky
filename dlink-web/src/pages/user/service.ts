import { request2, CODE } from '@/components/Common/crud'
import { message } from 'antd'
import { l } from '@/utils/intl'
import { getStorageClusterId } from '@/components/Common/crud'

// 获取用户集群列表
export const requestClusterByUser = async () => {
  return request2('/api/hadoop/cluster/listByUser', {
    method: 'GET',
  })
}

// 获取用户集群列表
export const getClusterByUser = async () => {
  try {
    const { code, msg, datas } = await requestClusterByUser()
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

// 获取工作空间列表
export const requestWorkspaceList = async (id) => {
  return request2('/api/workspace', {
    method: 'GET',
    params: {
      clusterId: id,
    },
  })
}

// 获取工作空间列表
export const getWorkspaceList = async (id) => {
  try {
    const { code, msg, datas } = await requestWorkspaceList(id)
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

// 获取当前用户的工作空间列表
export const requestWorkspaceByUser = async () => {
  return request2('/api/workspace/listByUser', {
    method: 'GET',
    params: {
      clusterId: getStorageClusterId(),
    },
  })
}

// 获取当前用户的工作空间列表
export const getWorkspaceByUser = async () => {
  try {
    const { code, msg, datas } = await requestWorkspaceByUser()
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

// 创建 工作空间
export const requestCreateWorkspace = async (params: any) => {
  return request2('/api/workspace', {
    method: 'PUT',
    data: {
      ...params,
    },
  })
}
// 创建 工作空间
export const createWorkspace = async (params: any) => {
  try {
    const { code, msg } = await requestCreateWorkspace(params)
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

// 删除工作空间
export async function requestDeleteWorkspace(id: (string | number)[]) {
  return request2('/api/workspace', {
    method: 'DELETE',
    data: { id },
  })
}

// 删除工作空间
export const deleteWorkspace = async (id: (string | number)[]) => {
  const hide = message.loading(l('app.request.delete'))
  try {
    const { code, msg } = await requestDeleteWorkspace(id)
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

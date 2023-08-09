import { request2, CODE } from '@/components/Common/crud'
import { message } from 'antd'
import { l } from '@/utils/intl'
import { getStorageClusterId } from '@/components/Common/crud'

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

// 客户端管理-获取列表
export async function requestClientList(params) {
  return request2('/api/environment/instance/page', {
    method: 'POST',
    data: {
      ...params,
    },
  })
}

// 客户端管理-获取列表
export const getClientList = async (params) => {
  try {
    const { code, msg, datas } = await requestClientList(params)
    if (code == CODE.SUCCESS) {
      const { records, total, current, size } = datas
      return {
        current: current,
        data: records,
        pageSize: size,
        success: true,
        total: total,
      }
    } else {
      message.warn(msg)
      return {
        data: [],
        success: false,
      }
    }
  } catch (error) {
    message.error(l('app.request.geterror.try'))
    return {
      data: [],
      success: false,
    }
  }
}

// 客户端管理-创建
export const requestAddorUpdateClient = (params) => {
  return request2('/api/environment/instance ', {
    method: 'PUT',
    data: {
      ...params,
    },
  })
}
// 客户端管理-创建
export const addorUpdateClient = async (fields: any) => {
  const tipsTitle = fields.id ? l('app.request.update') : l('app.request.add')
  const hide = message.loading(l('app.request.running') + tipsTitle)
  try {
    const { code, msg } = await requestAddorUpdateClient({ ...fields })
    hide()
    if (code == CODE.SUCCESS) {
      return true
    } else {
      message.warn(msg)
      return false
    }
  } catch (error) {
    hide()
    message.error(l('app.request.error'))
    return false
  }
}

// 客户端管理-删除
export const requestDeleteClient = async (id: number) => {
  return request2(`/api/environment/instance?id=${id}`, {
    method: 'DELETE',
  })
}

// 客户端管理-删除
export const deleteClient = async (id: number) => {
  const hide = message.loading(l('app.request.delete'))
  try {
    const { code, msg } = await requestDeleteClient(id)
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

// 客户端管理-测试
export const requestClientTest = async (params: any) => {
  return request2('/api/environment/instance/testConnect', {
    method: 'POST',
    data: {
      ...params,
    },
  })
}

// 客户端管理-测试
export const postClientTest = async (params: any) => {
  try {
    const { code, msg } = await requestClientTest(params)
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

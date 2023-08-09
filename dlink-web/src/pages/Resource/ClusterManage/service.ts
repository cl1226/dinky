import { request2, CODE } from '@/components/Common/crud'
import { message } from 'antd'
import { l } from '@/utils/intl'

// 获取hadoop列表
export const requestHadoopList = async () => {
  return request2('/api/hadoop/cluster', {
    method: 'GET',
  })
}

// 获取hadoop列表
export const getHadoopList = async () => {
  try {
    const { code, msg, datas } = await requestHadoopList()
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

// 获取hadoop列表
export const requestHadoopDetail = async (id: number) => {
  return request2('/api/hadoop/cluster/detail', {
    method: 'GET',
    params: {
      id,
    },
  })
}
// 获取hadoop列表
export const getHadoopDetail = async (id: number) => {
  try {
    const { code, msg, datas } = await requestHadoopDetail(id)
    if (code == CODE.SUCCESS) {
      const { yarnQueueModels, ...hadoop } = datas
      return {
        hadoop: hadoop || {},
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

// 获取hadoop 配置
export const requestHadoopConfig = async (params: any) => {
  return request2('/api/hadoop/cluster/load', {
    method: 'POST',
    data: {
      ...params,
    },
  })
}

// 获取hadoop 配置
export const getHadoopConfig = async (params: any) => {
  try {
    const { code, msg, datas } = await requestHadoopConfig(params)
    if (code == CODE.SUCCESS && datas) {
      return {
        hadoop: datas?.Cluster || {},
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

// 创建 hadoop
export const requestCreateHadoop = async (params: any) => {
  return request2('/api/hadoop/cluster', {
    method: 'PUT',
    data: {
      ...params,
    },
  })
}
// 创建 hadoop
export const createHadoop = async (params: any) => {
  try {
    const { code, msg } = await requestCreateHadoop(params)
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

// 获取租户
export const requestTenantList = async (params) => {
  return request2('/api/hadoop/tenant', {
    method: 'GET',
    params: {
      ...params,
    },
  })
}

// 获取租户
export const getTenantList = async (params) => {
  try {
    const { code, msg, datas } = await requestTenantList(params)
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

// 删除租户
export async function requestDeleteTenant(id: number) {
  return request2(`/api/hadoop/tenant?id=${id}`, {
    method: 'DELETE',
  })
}

// 删除租户
export const deleteTenant = async (id: number) => {
  const hide = message.loading(l('app.request.delete'))
  try {
    const { code, msg } = await requestDeleteTenant(id)
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

// 创建租户
export const requestAddorUpdateTenant = (params) => {
  return request2('/api/hadoop/tenant ', {
    method: 'PUT',
    data: {
      ...params,
    },
  })
}
// 创建租户
export const addorUpdateTenant = async (fields: any) => {
  const tipsTitle = fields.id ? l('app.request.update') : l('app.request.add')
  const hide = message.loading(l('app.request.running') + tipsTitle)
  try {
    const { code, msg } = await requestAddorUpdateTenant({ ...fields })
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

// 获取队列
export const requestQueueOptions = async (params) => {
  return request2('/api/hadoop/cluster/getQueuesByClusterId', {
    method: 'GET',
    params: {
      ...params,
    },
  })
}

// 获取队列
export const getQueueOptions = async (params) => {
  try {
    const { code, msg, datas } = await requestQueueOptions(params)
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

// 获取环境列表
export async function requestShellList(params) {
  return request2('/api/environment/instance/page', {
    method: 'POST',
    data: {
      ...params,
    },
  })
}

// 获取环境列表
export const getShellList = async (params) => {
  try {
    const { code, msg, datas } = await requestShellList(params)
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

// 创建环境
export const requestAddorUpdateShell = (params) => {
  return request2('/api/environment/instance ', {
    method: 'PUT',
    data: {
      ...params,
    },
  })
}
// 创建环境
export const addorUpdateShell = async (fields: any) => {
  const tipsTitle = fields.id ? l('app.request.update') : l('app.request.add')
  const hide = message.loading(l('app.request.running') + tipsTitle)
  try {
    const { code, msg } = await requestAddorUpdateShell({ ...fields })
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

// 删除环境
export async function requestDeleteShell(id: number) {
  return request2(`/api/environment/instance?id=${id}`, {
    method: 'DELETE',
  })
}

// 删除环境
export const deleteShell = async (id: number) => {
  const hide = message.loading(l('app.request.delete'))
  try {
    const { code, msg } = await requestDeleteShell(id)
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

// 环境测试
export const requestShellTest = async (params: any) => {
  return request2('/api/environment/instance/testConnect', {
    method: 'POST',
    data: {
      ...params,
    },
  })
}

// 环境测试
export const postShellTest = async (params: any) => {
  try {
    const { code, msg } = await requestShellTest(params)
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

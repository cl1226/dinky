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

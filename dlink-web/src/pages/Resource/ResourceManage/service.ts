import { request2, CODE } from '@/components/Common/crud'
import { message } from 'antd'
import { l } from '@/utils/intl'

export interface IGetApiConfigListParams {
  catalogueId?: number
  name?: string
  pageIndex: number
  pageSize: number
  type?: 'File' | 'Jar'
}

export interface IAddFileParams {
  catalogueId?: number
  type: 'File' | 'Jar'
  name?: string
  filePath?: string
  description?: string
  str?: string
  uploadType: 'create' | 'upload'
  id?: number
}

export async function addFile(params: IAddFileParams) {
  return request2('/api/file/manage', {
    method: 'PUT',
    data: {
      ...params,
    },
  })
}

export async function addOrUpdateCatalogue(url: string, params: any) {
  return request2(url, {
    method: 'PUT',
    data: {
      ...params,
    },
  })
}

export const handleAddOrUpdateCatalogue = async (url: string, fields: any) => {
  const tipsTitle = fields.id ? l('app.request.update') : l('app.request.add')
  const hide = message.loading(l('app.request.running') + tipsTitle)
  try {
    const { code, msg } = await addOrUpdateCatalogue(url, { ...fields })
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

// 获取api列表
export async function requestApiConfigList(params: IGetApiConfigListParams) {
  return request2('/api/file/manage/page', {
    method: 'POST',
    data: {
      ...params,
    },
  })
}

// 获取api列表
export const getApiConfigList = async (params: IGetApiConfigListParams) => {
  try {
    const { code, msg, datas } = await requestApiConfigList(params)
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

// 删除api
export async function requestDeleteApiConfig(ids: (string | number)[]) {
  return request2('/api/file/manage', {
    method: 'DELETE',
    data: { ids },
  })
}

// 删除api
export const deleteApiConfig = async (ids: (string | number)[]) => {
  const hide = message.loading(l('app.request.delete'))
  try {
    const { code, msg } = await requestDeleteApiConfig(ids)
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

// 查看详情
export async function showDetail(id: number) {
  return request2('/api/file/manage/showFile', {
    method: 'GET',
    params: {
      id,
    },
  })
}

// 获取主程序包
export const requestJarTree = async () => {
  return request2('/api/jar/catalogue/getAllTreeAndData', {
    method: 'GET',
    params: {},
  })
}

// 获取主程序包
export const getJarTree = async () => {
  try {
    const { code, datas } = await requestJarTree()
    if (code == CODE.SUCCESS) {
      return datas
    } else {
      return null
    }
  } catch (error) {
    return null
  }
}

// 获取资源
export const requestSourceTree = async () => {
  return request2('/api/file/catalogue/getAllTreeAndData', {
    method: 'GET',
    params: {},
  })
}

// 获取主程序包
export const getSourceTree = async () => {
  try {
    const { code, datas } = await requestSourceTree()
    if (code == CODE.SUCCESS) {
      return datas
    } else {
      return null
    }
  } catch (error) {
    return null
  }
}

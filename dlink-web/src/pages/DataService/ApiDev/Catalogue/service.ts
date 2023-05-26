import { request2, CODE } from '@/components/Common/crud'
import { message } from 'antd'
import { l } from '@/utils/intl'

export interface IGetApiConfigListParams {
  catalogueId?: number
  name?: string
  pageIndex: number
  pageSize: number
}
export const getAllCatalogueTreeData = () => {
  return request2('/api/dataservice/catalogue/getCatalogueTreeData', {
    method: 'GET',
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

export const removeCatalogueById = async (id: number) => {
  const hide = message.loading(l('app.request.delete'))
  try {
    const { code, msg } = await request2(`/api/dataservice/catalogue?id=${id}`, {
      method: 'DELETE',
    })
    hide()
    if (code == CODE.SUCCESS) {
      message.success(msg)
    } else {
      message.warn(msg)
    }
    return true
  } catch (error) {
    hide()
    message.error(l('app.request.delete.error'))
    return false
  }
}

// 获取api列表
export async function requestApiConfigList(params: IGetApiConfigListParams) {
  return request2('/api/dataservice/config/page', {
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
  return request2('/api/dataservice/config', {
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

// api上线
export async function updateApiConfigOnline(id: number) {
  return request2('/api/dataservice/config/online', {
    method: 'GET',
    params: {
      id,
    },
  })
}

// api下线
export async function updateApiConfigOffline(id: number) {
  return request2('/api/dataservice/config/offline', {
    method: 'GET',
    params: {
      id,
    },
  })
}

// 删除api
export const updateApiConfigStatus = async (id: number, mode: 'offline' | 'online') => {
  const reqApiMaps = {
    offline: updateApiConfigOffline,
    online: updateApiConfigOnline,
  }
  try {
    const { code, msg } = await reqApiMaps[mode](id)
    if (code == CODE.SUCCESS) {
      message.success(msg)
      return true
    } else {
      message.warn(msg)
      return false
    }
  } catch (error) {
    console.log(error)
    message.error(l('app.request.failed'))
    return false
  }
}

/*
 *
 *  Licensed to the Apache Software Foundation (ASF) under one or more
 *  contributor license agreements.  See the NOTICE file distributed with
 *  this work for additional information regarding copyright ownership.
 *  The ASF licenses this file to You under the Apache License, Version 2.0
 *  (the "License"); you may not use this file except in compliance with
 *  the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

import { extend } from 'umi-request'
import { TableListParams } from '@/components/Common/data'
import { message } from 'antd'
import { l } from '@/utils/intl'
import { EAsyncCode } from '@/components/SelectHelp/type.d'
import cookies from 'js-cookie'

export const request2 = extend({
  headers: {},
})

export const getStorageWorkspaceId = () => {
  return cookies.get('workspaceId') ? Number(cookies.get('workspaceId')) : ''
}
export const getStorageClusterId = () => {
  return cookies.get('clusterId') ? Number(cookies.get('clusterId')) : ''
}

export const getStorageTenantId = () => {
  return localStorage.getItem('dlink-tenantId') || ''
}

export const CODE = {
  SUCCESS: 0,
  ERROR: 1,
}

export async function queryData(url: string, params?: TableListParams) {
  return request2(url, {
    method: 'POST',
    data: {
      ...params,
    },
  })
}

export async function getData(url: string, params?: any) {
  return request2(url, {
    method: 'GET',
    params: {
      ...params,
    },
  })
}

export async function removeData(url: string, params: any[]) {
  return request2(url, {
    method: 'DELETE',
    data: {
      ...params,
    },
  })
}

export async function addOrUpdateData(url: string, params: any) {
  return request2(url, {
    method: 'PUT',
    data: {
      ...params,
    },
  })
}

export async function postDataArray(url: string, params: number[]) {
  return request2(url, {
    method: 'POST',
    data: {
      ...params,
    },
  })
}

export async function postAll(url: string, params?: any) {
  return request2(url, {
    method: 'POST',
    data: {
      ...params,
    },
  })
}

export async function getInfoById(url: string, id: number) {
  return request2(url, {
    method: 'GET',
    params: {
      id: id,
    },
  })
}

export const handleAddOrUpdate = async (url: string, fields: any) => {
  const tipsTitle = fields.id ? l('app.request.update') : l('app.request.add')
  const hide = message.loading(l('app.request.running') + tipsTitle)
  try {
    const { code, msg } = await addOrUpdateData(url, { ...fields })
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

export const handleAddOrUpdateWithResult = async (url: string, fields: any) => {
  const tipsTitle = fields.id ? l('app.request.update') : l('app.request.add')
  const hide = message.loading(l('app.request.running') + tipsTitle)
  try {
    const { code, msg, datas } = await addOrUpdateData(url, { ...fields })
    hide()
    if (code == CODE.SUCCESS) {
      message.success(msg)
    } else {
      message.warn(msg)
    }
    return datas
  } catch (error) {
    hide()
    message.error(l('app.request.error'))
    return null
  }
}

export const handleRemove = async (url: string, selectedRows: any) => {
  const hide = message.loading(l('app.request.delete'))
  if (!selectedRows) return true
  try {
    const { code, msg } = await removeData(
      url,
      selectedRows.map((row) => row.id),
    )
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

export const handleRemoveById = async (url: string, id: number) => {
  const hide = message.loading(l('app.request.delete'))
  try {
    const { code, msg } = await removeData(url, [id])
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

export const handleSubmit = async (url: string, title: string, selectedRows: any[]) => {
  const hide = message.loading(l('app.request.running') + title)
  if (!selectedRows) return true
  try {
    const { code, msg } = await postDataArray(
      url,
      selectedRows.map((row) => row.id),
    )
    hide()
    if (code == CODE.SUCCESS) {
      message.success(msg)
    } else {
      message.warn(msg)
    }
    return true
  } catch (error) {
    hide()
    message.error(title + l('app.request.error.try'))
    return false
  }
}

export const updateEnabled = (url: string, selectedRows: any, enabled: boolean) => {
  selectedRows.forEach((item) => {
    handleAddOrUpdate(url, { id: item.id, enabled: enabled })
  })
}

export const handleOption = async (url: string, title: string, param: any) => {
  const hide = message.loading(l('app.request.running') + title)
  try {
    const { code, msg } = await postAll(url, param)
    hide()
    if (code == CODE.SUCCESS) {
      message.success(msg)
    } else {
      message.warn(msg)
    }
    return true
  } catch (error) {
    hide()
    message.error(title + l('app.request.error.try'))
    return false
  }
}

export const handleData = async (url: string, id: any) => {
  try {
    const { code, datas, msg } = await getData(url, id)
    if (code == CODE.SUCCESS) {
      return datas
    } else {
      message.warn(msg)
      return false
    }
  } catch (error) {
    message.error(l('app.request.geterror.error'))
    return false
  }
}

export const handleInfo = async (url: string, id: number) => {
  try {
    const { datas } = await getInfoById(url, id)
    return datas
  } catch (error) {
    message.error(l('app.request.geterror.error'))
    return false
  }
}

export const previewCronSchedule = async (url: string, schedule: number) => {
  return request2(url, {
    method: 'GET',
    params: {
      schedule: schedule,
    },
  })
}

export const getSchedulerStatistics = async (key) => {
  return request2('/api/workflow/catalogue/dataStatistics', {
    method: 'GET',
    params: {
      key,
    },
  })
}

export const getTaskEnum = async (type) => {
  return request2('/api/workflow/catalogue/getTaskEnum', {
    method: 'GET',
    params: {
      type,
    },
  })
}

export const getCatalogueTreeDataByType = async (type) => {
  return request2('/api/catalogue/getCatalogueTreeDataByType', {
    method: 'GET',
    params: {
      type,
    },
  })
}

export const getCommonSelectOptions = async (menuCode: EAsyncCode, params?: any) => {
  let url = '/api/menu/listByType'
  let option = {
    method: 'GET',
    params: {
      type: menuCode,
      ...(params || {}),
    },
  }
  if (menuCode === EAsyncCode.rootCatalogue) {
    url = '/api/workflow/catalogue/getAllRootCatalogueData'
    option = {
      method: 'POST',
      params: {
        ...(params || {}),
      },
    }
  } else if (menuCode === EAsyncCode.cluster) {
    url = '/api/hadoop/cluster'
    option = {
      method: 'GET',
      params: {
        ...(params || {}),
      },
    }
  } else if (
    menuCode === EAsyncCode.datasourceDb ||
    menuCode === EAsyncCode.datasourceId ||
    menuCode === EAsyncCode.datasourceType
  ) {
    url = `/api/dataservice/config/getMenu/${menuCode}`
    option = {
      method: 'GET',
      params: {
        ...(params || {}),
      },
    }
  }

  try {
    const { code, datas } = await request2(url, option)

    if (code == CODE.SUCCESS) {
      return datas
    } else {
      return []
    }
  } catch (error) {
    console.log('getCommonSelectOptions error:', error)
    return []
  }
}

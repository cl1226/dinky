import { request2, CODE } from '@/components/Common/crud'
import { message } from 'antd'
import { l } from '@/utils/intl'

// 获取app列表
export async function requestAppList(params) {
  return request2('/api/app/config/page', {
    method: 'POST',
    data: {
      ...params,
    },
  })
}

// 获取app列表
export const getApplicationList = async (params) => {
  try {
    const { code, msg, datas } = await requestAppList(params)
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

// 创建应用
export const requestAddorUpdateApp = (params) => {
  return request2('/api/app/config', {
    method: 'PUT',
    data: {
      ...params,
    },
  })
}
// 创建应用
export const handleAddOrUpdateApp = async (fields: any) => {
  const tipsTitle = fields.id ? l('app.request.update') : l('app.request.add')
  const hide = message.loading(l('app.request.running') + tipsTitle)
  try {
    const { code, msg } = await requestAddorUpdateApp({ ...fields })
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

// 创建应用
export const requestGetSecret = () => {
  return request2('/api/app/config/generate/token', {
    method: 'Get',
  })
}

// 删除app
export async function requestDeleteApp(ids: (string | number)[]) {
  return request2('/api/app/config', {
    method: 'DELETE',
    data: { ids },
  })
}

// 删除app
export const deleteApp = async (ids: (string | number)[]) => {
  const hide = message.loading(l('app.request.delete'))
  try {
    const { code, msg } = await requestDeleteApp(ids)
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

import { request2, CODE } from '@/components/Common/crud'
import { message } from 'antd'
import { l } from '@/utils/intl'
export interface IGetListParams {
  catalogueId?: number
  name?: string
  pageIndex: number
  pageSize: number
}
// 获取列表
export async function requestApiConfigList(params: IGetListParams) {
  return request2('/api/metadata/task/pageInstance', {
    method: 'POST',
    data: {
      ...params,
    },
  })
}

// 获取api列表
export const getApiConfigList = async (params: IGetListParams) => {
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

// 获取日志
export const requestTaskLog = (id?: number) => {
  return request2('/api/metadata/task/showLog', {
    method: 'GET',
    params: {
      id,
    },
  })
}

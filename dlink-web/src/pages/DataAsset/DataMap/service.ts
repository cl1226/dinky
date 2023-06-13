import { request2, CODE } from '@/components/Common/crud'
import { message } from 'antd'
import { l } from '@/utils/intl'

// sql测试接口
export const requestDataDirectoryList = async (params) => {
  return request2('/api/metadata/page', {
    method: 'POST',
    data: {
      ...params,
    },
  })
}

// 获取详情列表
export const getDataDirectoryList = async (params) => {
  try {
    const { code, msg, datas } = await requestDataDirectoryList(params)
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

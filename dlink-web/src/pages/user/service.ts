import { request2, CODE } from '@/components/Common/crud'
import { message } from 'antd'
import { l } from '@/utils/intl'
// 获取hadoop列表
export const requestClusterList = async () => {
  return request2('/api/hadoop/cluster', {
    method: 'GET',
  })
}

// 获取hadoop列表
export const getClusterList = async () => {
  try {
    const { code, msg, datas } = await requestClusterList()
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

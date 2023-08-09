import { request2, CODE } from '@/components/Common/crud'
import { message } from 'antd'
import { l } from '@/utils/intl'

// 获取用户集群列表
export const requestClusterByUser = async () => {
  return request2('/api/hadoop/cluster/listByUser', {
    method: 'GET',
  })
}

// 获取用户集群列表
export const getClusterByUser = async () => {
  try {
    const { code, msg, datas } = await requestClusterByUser()
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

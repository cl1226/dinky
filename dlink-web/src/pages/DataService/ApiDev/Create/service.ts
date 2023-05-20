import { request2, CODE } from '@/components/Common/crud'
// 获取api列表
export const requestExecuteSql = async (params) => {
  return request2('/api/dataservice/config/executeSql', {
    method: 'POST',
    data: {
      ...params,
    },
  })
}

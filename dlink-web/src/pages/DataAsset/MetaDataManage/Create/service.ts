import { request2, CODE } from '@/components/Common/crud'

// 创建API
export const requestCreateApi = async (params) => {
  return request2('/api/metadata/task', {
    method: 'PUT',
    data: params,
  })
}

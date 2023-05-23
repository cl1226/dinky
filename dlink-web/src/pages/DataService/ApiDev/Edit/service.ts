import { request2, CODE } from '@/components/Common/crud'

// 验证path
export const requestApiDetail = (id: number) => {
  return request2('/api/dataservice/config/detail', {
    method: 'GET',
    params: {
      id: id,
    },
  })
}

import { request2, CODE } from '@/components/Common/crud'

export const requestApiDetail = (id: number) => {
  return request2('/api/metadata/task/detail', {
    method: 'GET',
    params: {
      id: id,
    },
  })
}

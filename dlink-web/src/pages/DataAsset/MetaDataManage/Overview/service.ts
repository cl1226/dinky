import { request2, CODE } from '@/components/Common/crud'
import { message } from 'antd'
import { l } from '@/utils/intl'


// 获取访问量趋势
export const getOldStatistic = (params) => {
  return request2('/api/accesslog/summary/countByDay', {
    method: 'GET',
    params: {
      ...params,
    },
  })
}

// 获取App详情
export const requestAppDetail = (id: number) => {
  return request2('/api/app/config/detail', {
    method: 'GET',
    params: {
      id: id,
    },
  })
}

// 获取app列表
export async function requestAppList(params) {
  return request2('/api/app/config/page', {
    method: 'POST',
    data: {
      ...params,
    },
  })
}


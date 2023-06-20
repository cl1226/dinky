import { request2, CODE } from '@/components/Common/crud'

// 获取访问量趋势
export const getOldStatistic = (params) => {
  return request2('/api/accesslog/summary/countByDay', {
    method: 'GET',
    params: {
      ...params,
    },
  })
}

// 元数据Top5
export const getMetaDataStatistic = () => {
  return request2('/api/metadata/task/statistics/metadata', {
    method: 'GET',
  })
}

// 获取app列表
export async function getTaskInstanceStatistic() {
  return request2('/api/metadata/task/statistics/taskInstance', {
    method: 'GET',
  })
}

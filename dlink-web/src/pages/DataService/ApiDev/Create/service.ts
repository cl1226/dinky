import { request2, CODE } from '@/components/Common/crud'

// 验证path
export async function requestCheckPath(path: string) {
  return request2('/api/dataservice/config/checkPath', {
    method: 'GET',
    params: {
      path: path,
    },
  })
}

// sql测试接口
export const requestExecuteSql = async (params) => {
  return request2('/api/dataservice/config/executeSql', {
    method: 'POST',
    data: {
      ...params,
    },
  })
}

// 测试api
export const requestApiTest = async (url, params) => {
  return request2(`/debugapi${url}`, {
    method: 'POST',
    data: {
      ...params,
    },
  })
}

// 创建API
export const requestCreateApi = async (params) => {
  return request2('/api/dataservice/config', {
    method: 'PUT',
    data: params,
  })
}

import { request2, CODE } from '@/components/Common/crud'
import { message } from 'antd'
import { l } from '@/utils/intl'

// 获取汇总
export const requestSummary = () => {
  return request2('/api/accesslog/summary', {
    method: 'GET',
  })
}

// 获取访问量趋势
export const requestSummaryCount = (params) => {
  return request2('/api/accesslog/summary/countByDay', {
    method: 'GET',
    params: {
      ...params,
    },
  })
}

// 获取访问量趋势
export const getSummaryCount = async (params) => {
  try {
    const { code, datas } = await requestSummaryCount(params)
    if (code == CODE.SUCCESS) {
      const x: string[] = []
      const success: number[] = []
      const fail: number[] = []
      ~(datas || []).forEach((item) => {
        x.push(item.date)
        success.push(item.successNum)
        fail.push(item.failNum)
      })
      return {
        x,
        success,
        fail,
      }
    } else {
      return {
        x: [],
        success: [],
        fail: [],
      }
    }
  } catch (error) {
    return {
      x: [],
      success: [],
      fail: [],
    }
  }
}

// 获取访问量Top5
export const requestTop5Api = (params) => {
  return request2('/api/accesslog/summary/top5api', {
    method: 'GET',
    params: {
      ...params,
    },
  })
}

// 获取访问量Top5
export const getTop5Api = async (params) => {
  try {
    const { code, datas } = await requestTop5Api(params)
    if (code == CODE.SUCCESS) {
      const x: string[] = []
      const y: number[] = []
      ~(datas || []).forEach((item) => {
        x.push(item.url)
        y.push(item.num)
      })
      return {
        x,
        y,
      }
    } else {
      return {
        x: [],
        y: [],
      }
    }
  } catch (error) {
    return {
      x: [],
      y: [],
    }
  }
}

// 获取访问时长Top5
export const requestTop5Duration = (params) => {
  return request2('/api/accesslog/summary/top5duration', {
    method: 'GET',
    params: {
      ...params,
    },
  })
}

// 获取访问时长Top5
export const getTop5Duration = async (params) => {
  try {
    const { code, datas } = await requestTop5Duration(params)
    if (code == CODE.SUCCESS) {
      const x: string[] = []
      const y: number[] = []
      ~(datas || []).forEach((item) => {
        x.push(item.url)
        y.push(item.duration)
      })
      return {
        x,
        y,
      }
    } else {
      return {
        x: [],
        y: [],
      }
    }
  } catch (error) {
    return {
      x: [],
      y: [],
    }
  }
}

// 获取详情列表
export const requestSummaryDetail = (params) => {
  return request2('/api/accesslog/summary/detail/page', {
    method: 'POST',
    data: {
      ...params,
    },
  })
}

// 获取详情列表
export const getSummaryDetailList = async (params) => {
  try {
    const { code, msg, datas } = await requestSummaryDetail(params)
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

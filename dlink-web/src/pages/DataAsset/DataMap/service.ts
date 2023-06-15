import { request2, CODE } from '@/components/Common/crud'
import { message } from 'antd'
import { l } from '@/utils/intl'
import { transferByteSize } from '@/utils/utils'

// 获取数据总览统计
export const requestStatistics = async () => {
  return request2('/api/metadata/statistics', {
    method: 'GET',
    params: {},
  })
}

// 获取详情
export const getStatistics = async () => {
  try {
    const { code, datas } = await requestStatistics()
    if (code == CODE.SUCCESS) {
      return datas.map((item) => {
        const [newSize, newUnit] = transferByteSize(item.dataVol)
        return {
          ...item,
          dataVol: newSize,
          dataUnit: newUnit,
        }
      })
    } else {
      return null
    }
  } catch (error) {
    return null
  }
}

// 获取总览下拉统计
export const requestStatisticsDetail = async (params) => {
  return request2('/api/metadata/statistics/detail', {
    method: 'GET',
    params: params,
  })
}

// 获取总览下拉统计
export const getStatisticsDetail = async (type) => {
  try {
    const { code, datas } = await requestStatisticsDetail({ type })
    if (code == CODE.SUCCESS) {
      return datas
    } else {
      return null
    }
  } catch (error) {
    return null
  }
}

// 获取列表
export const requestDataDirectoryList = async (params) => {
  return request2('/api/metadata/page', {
    method: 'POST',
    data: {
      ...params,
    },
  })
}

// 获取列表
export const getDataDirectoryList = async (params) => {
  try {
    const { code, msg, datas } = await requestDataDirectoryList(params)
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

// 获取详情
export const requestDataDirectoryDetail = async (params) => {
  return request2('/api/metadata/detail', {
    method: 'POST',
    data: {
      ...params,
    },
  })
}

// 获取详情
export const getDataDirectoryDetail = async (itemType, id) => {
  try {
    const { code, datas } = await requestDataDirectoryDetail({
      itemType: itemType,
      id: Number(id),
    })
    if (code == CODE.SUCCESS) {
      return {
        ...datas,
        tabKey: `${datas.type}/${datas.id}`,
      }
    } else {
      return null
    }
  } catch (error) {
    return null
  }
}

// 获取数据预览
export const requestDataPreview = async (params) => {
  return request2('/api/metadata/preview', {
    method: 'GET',
    params: {
      ...params,
    },
  })
}

// 获取详情
export const getDataPreview = async (id) => {
  try {
    const { code, datas } = await requestDataPreview({
      id: Number(id),
    })
    if (code == CODE.SUCCESS) {
      return {
        columns: datas.columns || [],
        rowData: datas.rowData || [],
      }
    } else {
      return null
    }
  } catch (error) {
    return null
  }
}

import { request2, CODE } from '@/components/Common/crud'
import { message } from 'antd'
import { l } from '@/utils/intl'


export interface ProcessInstanceParams {
  projectCode?: number
  searchVal?: string
  pageNo: number
  pageSize: number
  executorName?: string
  host?: string
  stateType?: string
  startDate?: string
  endDate?: string
}

// 获取工作流实例列表
export async function requestProcessList(params: ProcessInstanceParams) {
  return request2('/api/workflow/task/pageFlowInstance', {
    method: 'POST',
    data: {
      ...params,
    },
  })
}

// 获取任务实例列表
export async function requestTaskList(params: ProcessInstanceParams) {
  return request2('/api/workflow/task/pageTaskInstance', {
    method: 'POST',
    data: {
      ...params,
    },
  })
}

// 获取工作流实例列表
export const getProcessInstanceList = async (params: ProcessInstanceParams) => {
  try {
    const { code, msg, datas } = await requestProcessList(params)
    if (code == CODE.SUCCESS) {
      const { totalList, total, currentPage, pageSize } = datas
      return {
        list: totalList,
        total,
        pn: currentPage,
        ps: pageSize,
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

// 获取任务实例列表
export const getTaskInstanceList = async (params: ProcessInstanceParams) => {
  try {
    const { code, msg, datas } = await requestTaskList(params)
    if (code == CODE.SUCCESS) {
      const { totalList, total, currentPage, pageSize } = datas
      return {
        list: totalList,
        total,
        pn: currentPage,
        ps: pageSize,
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
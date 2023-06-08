import { request2, CODE } from '@/components/Common/crud'
import { message } from 'antd'
import { l } from '@/utils/intl'

export interface ProcessInstanceParams {
  projectCode?: string
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
// 重跑
export const updateProcessRerun = async (processInstanceId: string, projectCode: string) => {
  try {
    const { code, msg } = await request2('/api/workflow/task/rerun', {
      method: 'POST',
      data: {
        processInstanceId,
        projectCode,
      },
    })
    if (code == CODE.SUCCESS) {
      return true
    } else {
      message.warn(msg)
      return false
    }
  } catch (error) {
    message.error(l('app.request.error'))
    return false
  }
}
// 停止
export const updateProcessStop = async (processInstanceId: string, projectCode: string) => {
  try {
    const { code, msg } = await request2('/api/workflow/task/stop', {
      method: 'POST',
      data: {
        processInstanceId,
        projectCode,
      },
    })
    if (code == CODE.SUCCESS) {
      return true
    } else {
      message.warn(msg)
      return false
    }
  } catch (error) {
    message.error(l('app.request.error'))
    return false
  }
}
// 暂停
export const updateProcessPause = async (processInstanceId: string, projectCode: string) => {
  try {
    const { code, msg } = await request2('/api/workflow/task/pause', {
      method: 'POST',
      data: {
        processInstanceId,
        projectCode,
      },
    })
    if (code == CODE.SUCCESS) {
      return true
    } else {
      message.warn(msg)
      return false
    }
  } catch (error) {
    message.error(l('app.request.error'))
    return false
  }
}
// 恢复运行
export const updateProcessSuspend = async (processInstanceId: string, projectCode: string) => {
  try {
    const { code, msg } = await request2('/api/workflow/task/suspend', {
      method: 'POST',
      data: {
        processInstanceId,
        projectCode,
      },
    })
    if (code == CODE.SUCCESS) {
      return true
    } else {
      message.warn(msg)
      return false
    }
  } catch (error) {
    message.error(l('app.request.error'))
    return false
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

// 获取任务状态统计
export const requestTaskStateCount = (params) => {
  return request2('/api/workflow/task/getTaskStateCount', {
    method: 'POST',
    data: {
      ...params,
    },
  })
}

// 获取任务状态统计
export const getTaskStateCount = async (params) => {
  try {
    const { code, datas } = await requestTaskStateCount(params)
    if (code == CODE.SUCCESS) {
      const chartList: any = []
      const tableList: any = []
      const { taskCountDtos } = datas

      ~(taskCountDtos || []).forEach((item, index) => {
        chartList.push({
          value: item.count,
          name: item.taskStateType,
        })
        tableList.push({
          rowIndex: index,
          count: item.count,
          state: item.taskStateType,
        })
      })
      return {
        chartList,
        tableList,
      }
    } else {
      return {
        chartList: [],
        tableList: [],
      }
    }
  } catch (error) {
    return {
      chartList: [],
      tableList: [],
    }
  }
}

// 获取流程状态统计
export const requestFlowStateCount = (params) => {
  return request2('/api/workflow/task/getProcessStateCount ', {
    method: 'POST',
    data: {
      ...params,
    },
  })
}

// 获取流程状态统计
export const getFlowStateCount = async (params) => {
  try {
    const { code, datas } = await requestFlowStateCount(params)
    if (code == CODE.SUCCESS) {
      const chartList: any = []
      const tableList: any = []
      const { taskCountDtos } = datas

      ~(taskCountDtos || []).forEach((item, index) => {
        chartList.push({
          value: item.count,
          name: item.taskStateType,
        })
        tableList.push({
          rowIndex: index,
          count: item.count,
          state: item.taskStateType,
        })
      })
      return {
        chartList,
        tableList,
      }
    } else {
      return {
        chartList: [],
        tableList: [],
      }
    }
  } catch (error) {
    return {
      chartList: [],
      tableList: [],
    }
  }
}

// 获取流程定义统计
export const requestTaskDefineCount = () => {
  return request2('/api/workflow/task/getTaskDefineCount ', {
    method: 'POST',
    data: {},
  })
}

// 获取流程定义统计
export const getTaskDefineCount = async () => {
  try {
    const { code, datas } = await requestTaskDefineCount()
    if (code == CODE.SUCCESS) {
      const x: string[] = []
      const y: number[] = []
      const { userList } = datas || {}
      ~(userList || []).forEach((item, index) => {
        x.push(item.userName)
        y.push(item.count)
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

/* eslint-disable @typescript-eslint/no-unused-vars */
import { DND_RENDER_ID, NODE_WIDTH, NODE_HEIGHT } from './constant'
import { uuidv4, NsGraph, NsGraphStatusCommand } from '@antv/xflow'
import type { NsRenameNodeCmd } from './cmd-extensions/cmd-rename-node-modal'
import type { NsNodeCmd, NsEdgeCmd, NsGraphCmd } from '@antv/xflow'
import { message } from 'antd'
import { getInfoById, getData, handleAddOrUpdate } from '@/components/Common/crud'
import { l } from '@/utils/intl'
import moment from 'moment'
export interface IMeta {
  flowId: string
  flowName?: string
  lockStatus?: boolean
  status?: string
  schedulerType?: boolean
  cron?: string
}

/** 状态 类型 */
enum GraphStatusEnum {
  CREATE = 'CREATE',
  DEPLOY = 'DEPLOY',
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
}

export const StatusEnum = { ...GraphStatusEnum, ...NsGraphStatusCommand.StatusEnum }

export enum ESchedulerType {
  'SINGLE' = 'SINGLE',
  'CYCLE' = 'CYCLE',
}

/** 后端接口调用 */
export namespace XFlowApi {
  export const NODE_COMMON_PROPS = {
    renderKey: DND_RENDER_ID,
    width: NODE_WIDTH,
    height: NODE_HEIGHT,
  } as const

  /** 查图的meta元信息 */
  export const queryGraphMeta: NsGraphCmd.GraphMeta.IArgs['graphMetaService'] = async (
    args: any,
  ) => {
    return { ...args, flowId: args.meta.flowId }
  }
  /** 加载图数据的api */
  export const loadGraphData = async (graphMeta: NsGraph.IGraphMeta) => {
    const result = await getInfoById('/api/workflow/task', graphMeta.meta.flowId)
    let nodes: NsGraph.INodeConfig[] = []
    let edges: NsGraph.IEdgeConfig[] = []
    const { graphData, id, name, lockStatus, status, schedulerType, cron } = result.datas
    if (!!graphData) {
      const graphDataObj = JSON.parse(graphData)
      nodes = graphDataObj.nodes
      edges = graphDataObj.edges
    }

    return {
      nodes,
      edges,
      flowId: id,
      flowName: name,
      lockStatus,
      status,
      schedulerType,
      cron,
    }
  }

  /** 保存图数据的api */
  export const saveGraphData: NsGraphCmd.SaveGraphData.IArgs['saveGraphDataService'] = async (
    graphMeta: NsGraph.IGraphMeta,
    graphData: NsGraph.IGraphData,
  ) => {
    let workflowTask = {
      id: graphMeta.meta.flowId,
      graphData: JSON.stringify(graphData),
      schedulerType: graphMeta.schedulerType,
      cron: graphMeta.cron,
    }
    const success = await handleAddOrUpdate('/api/workflow/task', workflowTask)
    return {
      success: success,
    }
  }
  /** 部署图数据的api */
  export const deployDagService: any = async (
    graphMeta: NsGraph.IGraphMeta,
    graphData: NsGraph.IGraphData,
    otherForm = {},
  ) => {
    const workflowTask = {
      id: graphMeta.meta.flowId,
      graphData: JSON.stringify(graphData),
      ...otherForm,
    }
    const saveResult = await handleAddOrUpdate('/api/workflow/task', workflowTask)

    if (!saveResult) return false

    const id = graphMeta.meta.flowId
    const result = await getData('/api/workflow/task/releaseTask', { id })
    if (result.code == 0) {
      message.success(result.msg)
      return true
    } else {
      message.warn(result.msg)
      return false
    }
  }
  /** 上线数据的api */
  export const onlineDagService: any = async (graphMeta: NsGraph.IGraphMeta) => {
    const hide = message.loading(l('app.request.running') + '上线')
    let id = graphMeta.meta.flowId
    const result = await getData('/api/workflow/task/onLineTask', { id })
    hide()
    if (result.code == 0) {
      message.success(result.msg)
      return true
    } else {
      message.warn(result.msg)
      return false
    }
  }

  /** 下线数据的api */
  export const offlineDagService: any = async (graphMeta: NsGraph.IGraphMeta) => {
    const hide = message.loading(l('app.request.running') + '下线')
    let id = graphMeta.meta.flowId
    const result = await getData('/api/workflow/task/offLineTask', { id })
    hide()
    if (result.code == 0) {
      message.success(result.msg)
      return true
    } else {
      message.warn(result.msg)
      return false
    }
  }

  /** 抢锁的api */
  export const lockService: any = async (graphMeta: NsGraph.IGraphMeta) => {
    const hide = message.loading(l('app.request.running') + '抢锁')
    const id = graphMeta.meta.flowId
    const result = await getData('/api/workflow/task/getLock', { id })
    hide()
    if (result.code == 0) {
      message.success(result.msg)
      const { lockStatus, status } = result.datas
      return {
        ...graphMeta.meta,
        lockStatus,
        status,
      }
    } else {
      message.warn(result.msg)
      return graphMeta.meta
    }
  }
  /** 解锁的api */
  export const unLockService: any = async (graphMeta: NsGraph.IGraphMeta) => {
    const hide = message.loading(l('app.request.running') + '解锁')
    const id = graphMeta.meta.flowId
    const result = await getData('/api/workflow/task/releaseLock', { id })
    hide()
    if (result.code == 0) {
      message.success(result.msg)
      const { lockStatus, status } = result.datas
      return {
        ...graphMeta.meta,
        lockStatus,
        status,
      }
    } else {
      message.warn(result.msg)
      return graphMeta.meta
    }
  }

  /** 开始执行api */
  export const startDagService: any = async (graphMeta: NsGraph.IGraphMeta) => {
    const hide = message.loading(l('app.request.running') + '开始执行')
    const id = graphMeta.meta.flowId
    const result = await getData('/api/workflow/task/startTask', { id })
    hide()
    if (result.code == 0) {
      message.success(result.msg)
    } else {
      message.warn(result.msg)
    }
  }

  /** 添加节点api */
  export const addNode: NsNodeCmd.AddNode.IArgs['createNodeService'] = async (
    args: NsNodeCmd.AddNode.IArgs,
  ) => {
    console.info('addNode service running, add node:', args)
    const portItems = [
      {
        type: NsGraph.AnchorType.INPUT,
        group: NsGraph.AnchorGroup.TOP,
        tooltip: '输入桩1',
      },
      {
        type: NsGraph.AnchorType.OUTPUT,
        group: NsGraph.AnchorGroup.BOTTOM,
        tooltip: '输出桩',
      },
    ] as NsGraph.INodeAnchor[]

    const { id, ports = portItems, groupChildren } = args.nodeConfig
    const nodeId = id || uuidv4()
    /** 这里添加连线桩 */
    const node: NsNodeCmd.AddNode.IArgs['nodeConfig'] = {
      ...NODE_COMMON_PROPS,
      ...args.nodeConfig,
      id: nodeId,
      ports: (ports as NsGraph.INodeAnchor[]).map((port) => {
        return { ...port, id: uuidv4() }
      }),
    }
    /** group没有链接桩 */
    if (groupChildren && groupChildren.length) {
      node.ports = []
    }
    return node
  }

  /** 更新节点 name，可能依赖接口判断是否重名，返回空字符串时，不更新 */
  export const renameNode: NsRenameNodeCmd.IUpdateNodeNameService = async (
    name,
    node,
    graphMeta,
  ) => {
    console.log('rename node', node, name, graphMeta)
    return { err: null, nodeName: name }
  }

  /** 删除节点的api */
  export const delNode: NsNodeCmd.DelNode.IArgs['deleteNodeService'] = async (args) => {
    console.info('delNode service running, del node:', args.nodeConfig.id)
    return true
  }

  /** 添加边的api */
  export const addEdge: NsEdgeCmd.AddEdge.IArgs['createEdgeService'] = async (args) => {
    console.info('addEdge service running, add edge:', args)
    const { edgeConfig } = args
    return {
      ...edgeConfig,
      id: uuidv4(),
    }
  }

  /** 删除边的api */
  export const delEdge: NsEdgeCmd.DelEdge.IArgs['deleteEdgeService'] = async (args) => {
    console.info('delEdge service running, del edge:', args)
    return true
  }

  let runningNodeId = 0
  const statusMap = {} as NsGraphStatusCommand.IStatusInfo['statusMap']
  let graphStatus: NsGraphStatusCommand.StatusEnum = NsGraphStatusCommand.StatusEnum.DEFAULT
  export const graphStatusService: NsGraphStatusCommand.IArgs['graphStatusService'] = async () => {
    if (runningNodeId < 4) {
      statusMap[`node${runningNodeId}`] = { status: NsGraphStatusCommand.StatusEnum.SUCCESS }
      statusMap[`node${runningNodeId + 1}`] = {
        status: NsGraphStatusCommand.StatusEnum.PROCESSING,
      }
      runningNodeId += 1
      graphStatus = NsGraphStatusCommand.StatusEnum.PROCESSING
    } else {
      runningNodeId = 0
      statusMap.node4 = { status: NsGraphStatusCommand.StatusEnum.SUCCESS }
      graphStatus = NsGraphStatusCommand.StatusEnum.SUCCESS
    }
    return {
      graphStatus: graphStatus,
      statusMap: statusMap,
    }
  }
}

// 将当前组件的form转换为传参的meta
export const getJsonCron = (formValues) => {
  const { timerange, crontab, timezoneId } = formValues

  const tempCron: any = {}
  tempCron.timezoneId = timezoneId
  tempCron.crontab = crontab
  const [startTime, endTime] = timerange || []
  if (startTime && endTime) {
    tempCron.startTime = moment(startTime).format('YYYY-MM-DD HH:mm:ss')
    tempCron.endTime = moment(endTime).format('YYYY-MM-DD HH:mm:ss')
  }

  return JSON.stringify(tempCron)
}

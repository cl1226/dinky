/* eslint-disable @typescript-eslint/no-unused-vars */
import { DND_RENDER_ID, NODE_WIDTH, NODE_HEIGHT } from './constant'
import { uuidv4, NsGraph, NsGraphStatusCommand } from '@antv/xflow'
import type { NsRenameNodeCmd } from './cmd-extensions/cmd-rename-node-modal'
import type { NsNodeCmd, NsEdgeCmd, NsGraphCmd } from '@antv/xflow'
import type { NsDeployDagCmd } from './cmd-extensions/cmd-deploy'
import { message } from 'antd'
import {
  CODE,
  getInfoById,
  getData,
  handleAddOrUpdate,
} from "@/components/Common/crud";
import {l} from "@/utils/intl";

/** 后端接口调用 */
export namespace XFlowApi {
  export const NODE_COMMON_PROPS = {
    renderKey: DND_RENDER_ID,
    width: NODE_WIDTH,
    height: NODE_HEIGHT,
  } as const

  /** 查图的meta元信息 */
  export const queryGraphMeta: NsGraphCmd.GraphMeta.IArgs['graphMetaService'] = async args => {
    return { ...args, flowId: args.meta.flowId }
  }
  /** 加载图数据的api */
  export const loadGraphData = async (meta: NsGraph.IGraphMeta) => {
    const result = await getInfoById('/api/workflow/task', meta.meta.flowId)
    let nodes: NsGraph.INodeConfig[] = []
    let edges: NsGraph.IEdgeConfig[] = []
    if (!!result.datas.graphData) {
      let graphData = JSON.parse(result.datas.graphData)
      nodes = graphData.nodes
      edges = graphData.edges
      return { nodes, edges }
    } else {
      return { nodes, edges } 
    }
  }

  /** 保存图数据的api */
  export const saveGraphData: NsGraphCmd.SaveGraphData.IArgs['saveGraphDataService'] = async (
    meta: NsGraph.IGraphMeta,
    graphData: NsGraph.IGraphData,
  ) => {
    let workflowTask = {
      id: meta.meta.flowId,
      graphData: JSON.stringify(graphData)
    }
    const success = await handleAddOrUpdate('/api/workflow/task', workflowTask);
    return {
      success: success
    }
  }
  /** 部署图数据的api */
  export const deployDagService: NsDeployDagCmd.IDeployDagService = async (
    meta: NsGraph.IGraphMeta,
    graphData: NsGraph.IGraphData,
  ) => {
    const hide = message.loading(l('app.request.running') + "部署");
    let id = meta.meta.flowId
    const result = await getData('/api/workflow/task/releaseTask', {id});
    hide();
    if (result.code == 0) {
      message.success(result.msg);
    } else {
      message.warn(result.msg);
    }
  }
  /** 上线数据的api */
  export const onlineDagService: NsDeployDagCmd.IDeployDagService = async (
    meta: NsGraph.IGraphMeta,
    graphData: NsGraph.IGraphData,
  ) => {
    const hide = message.loading(l('app.request.running') + "上线");
    let id = meta.meta.flowId
    const result = await getData('/api/workflow/task/onLineTask', {id});
    hide();
    if (result.code == 0) {
      message.success(result.msg);
    } else {
      message.warn(result.msg);
    }
  }

  /** 下线数据的api */
  export const offlineDagService: NsDeployDagCmd.IDeployDagService = async (
    meta: NsGraph.IGraphMeta,
    graphData: NsGraph.IGraphData,
  ) => {
    const hide = message.loading(l('app.request.running') + "下线");
    let id = meta.meta.flowId
    const result = await getData('/api/workflow/task/offLineTask', {id});
    hide();
    if (result.code == 0) {
      message.success(result.msg);
    } else {
      message.warn(result.msg);
    }
    }
    
  /** 抢锁的api */
  export const lockService:any = async (
    meta: NsGraph.IGraphMeta
  ) => {
    const hide = message.loading(l('app.request.running') + "抢锁");
    let id = meta.meta.flowId
    const result = await getData('/api/workflow/task/getLock', {id});
    hide();
    if (result.code == 0) {
        message.success(result.msg);
    } else {
        message.warn(result.msg);
    }
  }
  /** 解锁的api */
  export const unLockService:any = async (
    meta: NsGraph.IGraphMeta
  ) => {
    const hide = message.loading(l('app.request.running') + "解锁");
    let id = meta.meta.flowId
    const result = await getData('/api/workflow/task/releaseLock', {id});
    hide();
    if (result.code == 0) {
        message.success(result.msg);
    } else {
      message.warn(result.msg);
    }
  }

  /** 配置调度的api */
  export const schedulerDagService: NsDeployDagCmd.IDeployDagService = async (
    meta: NsGraph.IGraphMeta,
    graphData: NsGraph.IGraphData,
  ) => {
    const hide = message.loading(l('app.request.running') + "配置调度");
    let id = meta.meta.flowId
    const result = await getData('/api/workflow/task/schedulerTask', {id});
    hide();
    if (result.code == 0) {
      message.success(result.msg);
    } else {
      message.warn(result.msg);
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
      ports: (ports as NsGraph.INodeAnchor[]).map(port => {
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
  export const delNode: NsNodeCmd.DelNode.IArgs['deleteNodeService'] = async args => {
    console.info('delNode service running, del node:', args.nodeConfig.id)
    return true
  }

  /** 添加边的api */
  export const addEdge: NsEdgeCmd.AddEdge.IArgs['createEdgeService'] = async args => {
    console.info('addEdge service running, add edge:', args)
    const { edgeConfig } = args
    return {
      ...edgeConfig,
      id: uuidv4(),
    }
  }

  /** 删除边的api */
  export const delEdge: NsEdgeCmd.DelEdge.IArgs['deleteEdgeService'] = async args => {
    console.info('delEdge service running, del edge:', args)
    return true
  }

  let runningNodeId = 0
  const statusMap = {} as NsGraphStatusCommand.IStatusInfo['statusMap']
  let graphStatus: NsGraphStatusCommand.StatusEnum = NsGraphStatusCommand.StatusEnum.DEFAULT
  export const graphStatusService: NsGraphStatusCommand.IArgs['graphStatusService'] = async () => {
    if (runningNodeId < 4) {
      statusMap[`node${runningNodeId}`] = { status: NsGraphStatusCommand.StatusEnum.SUCCESS }
      statusMap[`node${runningNodeId + 1}`] = { status: NsGraphStatusCommand.StatusEnum.PROCESSING }
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
  export const stopGraphStatusService: NsGraphStatusCommand.IArgs['graphStatusService'] =
    async () => {
      Object.entries(statusMap).forEach(([, val]) => {
        const { status } = val as { status: NsGraphStatusCommand.StatusEnum }
        if (status === NsGraphStatusCommand.StatusEnum.PROCESSING) {
          val.status = NsGraphStatusCommand.StatusEnum.ERROR
        }
      })
      return {
        graphStatus: NsGraphStatusCommand.StatusEnum.ERROR,
        statusMap: statusMap,
      }
    }
  export const saveGraphStatusService: NsGraphStatusCommand.IArgs['graphStatusService'] = async () => {
    return {
      graphStatus: NsGraphStatusCommand.StatusEnum.PROCESSING,
      statusMap: statusMap,
    }
  }
  export const deployGraphStatusService: NsGraphStatusCommand.IArgs['graphStatusService'] = async () => {
    return {
      graphStatus: NsGraphStatusCommand.StatusEnum.WARNING,
      statusMap: statusMap,
    }
  }
  export const onlineGraphStatusService: NsGraphStatusCommand.IArgs['graphStatusService'] = async () => {
    return {
      graphStatus: NsGraphStatusCommand.StatusEnum.SUCCESS,
      statusMap: statusMap,
    }
  }
  export const offlineGraphStatusService: NsGraphStatusCommand.IArgs['graphStatusService'] = async () => {
    return {
      graphStatus: NsGraphStatusCommand.StatusEnum.ERROR,
      statusMap: statusMap,
    }
  }
}

import type {} from '@antv/xflow'
import { createCmdConfig, DisposableCollection, XFlowGraphCommands, MODELS } from '@antv/xflow'

import type { IGraphPipelineCommand, NsGraphCmd, IApplication } from '@antv/xflow'
import { XFlowApi } from './service'
import { commandContributions } from './cmd-extensions'

export const useCmdConfig = createCmdConfig((config) => {
  // 注册全局Command扩展
  config.setCommandContributions(() => commandContributions)
  // 设置hook
  config.setRegisterHookFn((hooks) => {
    const list = [
      hooks.graphMeta.registerHook({
        name: 'get graph meta from backend',
        handler: async (args) => {
          args.graphMetaService = XFlowApi.queryGraphMeta
        },
      }),
      hooks.saveGraphData.registerHook({
        name: 'save graph data',
        handler: async (args) => {
          if (!args.saveGraphDataService) {
            args.saveGraphDataService = XFlowApi.saveGraphData
          }
        },
      }),
      hooks.addNode.registerHook({
        name: 'get node config from backend api',
        handler: async (args) => {
          args.createNodeService = XFlowApi.addNode
        },
      }),
      hooks.delNode.registerHook({
        name: 'get edge config from backend api',
        handler: async (args) => {
          args.deleteNodeService = XFlowApi.delNode
        },
      }),
      hooks.addEdge.registerHook({
        name: 'get edge config from backend api',
        handler: async (args) => {
          args.createEdgeService = XFlowApi.addEdge
          args.edgeConfig = {
            ...args.edgeConfig,
            connector: { name: 'rounded' },
            router: {
              name: 'manhattan',
            },
          }
        },
      }),
      hooks.delEdge.registerHook({
        name: 'get edge config from backend api',
        handler: async (args) => {
          args.deleteEdgeService = XFlowApi.delEdge
        },
      }),
    ]
    const toDispose = new DisposableCollection()
    toDispose.pushAll(list)
    return toDispose
  })
})

/** 查询图的节点和边的数据 */
export const initGraphCmds = async (
  app: IApplication,
  afterLoadGraph: (remainMeta: any) => void,
) => {
  await app.executeCommandPipeline([
    /** 1. 从服务端获取数据 */
    {
      commandId: XFlowGraphCommands.LOAD_DATA.id,
      getCommandOption: async () => {
        return {
          args: {
            loadDataService: XFlowApi.loadGraphData,
          },
        }
      },
    } as IGraphPipelineCommand<NsGraphCmd.GraphLoadData.IArgs>,
    /** 2. 执行布局算法 */
    {
      commandId: XFlowGraphCommands.GRAPH_LAYOUT.id,
      getCommandOption: async (ctx) => {
        const { graphData } = ctx.getResult()
        const { nodes, edges, ...remainMeta } = graphData
        afterLoadGraph && afterLoadGraph(remainMeta)

        return {
          args: {
            layoutType: 'dagre',
            layoutOptions: {
              type: 'dagre',
              /** 布局方向 */
              rankdir: 'TB',
              /** 节点间距 */
              nodesep: 60,
              /** 层间距 */
              ranksep: 30,
            },
            graphData: { nodes, edges },
          },
        }
      },
    } as IGraphPipelineCommand<NsGraphCmd.GraphLayout.IArgs>,
    /** 3. 画布内容渲染 */
    {
      commandId: XFlowGraphCommands.GRAPH_RENDER.id,
      getCommandOption: async (ctx) => {
        const { graphData } = ctx.getResult()
        return {
          args: {
            graphData,
          },
        }
      },
    } as IGraphPipelineCommand<NsGraphCmd.GraphRender.IArgs>,
    /** 4. 缩放画布 */
    {
      commandId: XFlowGraphCommands.GRAPH_ZOOM.id,
      getCommandOption: async () => {
        return {
          args: { factor: 'fit', zoomOptions: { maxScale: 0.9 } },
        }
      },
    } as IGraphPipelineCommand<NsGraphCmd.GraphZoom.IArgs>,
  ])
}

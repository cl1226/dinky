import type { IToolbarItemOptions } from '@antv/xflow'
import { createToolbarConfig } from '@antv/xflow'
import type { IModelService } from '@antv/xflow'
import {
  XFlowGraphCommands,
  XFlowDagCommands,
  NsGraphStatusCommand,
  MODELS,
  IconStore,
} from '@antv/xflow'
import {
  UngroupOutlined,
  SaveOutlined,
  CloudSyncOutlined,
  GroupOutlined,
  GatewayOutlined,
  PlaySquareOutlined,
  StopOutlined,
  CarryOutOutlined,
  ApiOutlined
} from '@ant-design/icons'
import { XFlowApi } from './service'
import { CustomCommands } from './cmd-extensions/constants'
import type { NsDeployDagCmd } from './cmd-extensions/cmd-deploy'
import type { NsGraphCmd, NsGraph } from '@antv/xflow'

export namespace NSToolbarConfig {
  /** 注册icon 类型 */
  IconStore.set('SaveOutlined', SaveOutlined)
  IconStore.set('CloudSyncOutlined', CloudSyncOutlined)
  IconStore.set('CarryOutOutlined', CarryOutOutlined)
  IconStore.set('ApiOutlined', ApiOutlined)
  IconStore.set('GatewayOutlined', GatewayOutlined)
  IconStore.set('GroupOutlined', GroupOutlined)
  IconStore.set('UngroupOutlined', UngroupOutlined)
  IconStore.set('PlaySquareOutlined', PlaySquareOutlined)
  IconStore.set('StopOutlined', StopOutlined)

  /** toolbar依赖的状态 */
  export interface IToolbarState {
    isMultiSelectionActive: boolean
    isNodeSelected: boolean
    isGroupSelected: boolean
    isProcessing: boolean
    status: string
  }

  export const getDependencies = async (modelService: IModelService) => {
    return [
      await MODELS.SELECTED_CELLS.getModel(modelService),
      await MODELS.GRAPH_ENABLE_MULTI_SELECT.getModel(modelService),
      await NsGraphStatusCommand.MODEL.getModel(modelService)
    ]
  }

  /** toolbar依赖的状态 */
  export const getToolbarState = async (modelService: IModelService, graphMeta: NsGraph.IGraphMeta) => {
    // isMultiSelectionActive
    const { isEnable: isMultiSelectionActive } = await MODELS.GRAPH_ENABLE_MULTI_SELECT.useValue(
      modelService,
    )
    // isGroupSelected
    const isGroupSelected = await MODELS.IS_GROUP_SELECTED.useValue(modelService)
    // isNormalNodesSelected: node不能是GroupNode
    const isNormalNodesSelected = await MODELS.IS_NORMAL_NODES_SELECTED.useValue(modelService)
    // statusInfo
    const statusInfo = await NsGraphStatusCommand.MODEL.useValue(modelService)
    
    if (statusInfo.graphStatus == NsGraphStatusCommand.StatusEnum.DEFAULT) {
      statusInfo.graphStatus = graphMeta.meta.status
    }
    // processing: 保存, success: 上线, error: 下线, warning: 部署
    console.log("workflow status: " + statusInfo.graphStatus)
    return {
      isNodeSelected: isNormalNodesSelected,
      isGroupSelected,
      isMultiSelectionActive,
      isProcessing: statusInfo.graphStatus === NsGraphStatusCommand.StatusEnum.PROCESSING,
      status: statusInfo.graphStatus
    } as NSToolbarConfig.IToolbarState
  }

  export const getToolbarItems = async (state: IToolbarState, graphMeta: NsGraph.IGraphMeta) => {
    const toolbarGroup1: IToolbarItemOptions[] = []
    const toolbarGroup2: IToolbarItemOptions[] = []
    const toolbarGroup3: IToolbarItemOptions[] = []
    const toolbarGroup4: IToolbarItemOptions[] = []

    /** 保存数据 */
    toolbarGroup1.push({
      id: XFlowGraphCommands.SAVE_GRAPH_DATA.id,
      iconName: 'SaveOutlined',
      text: '保存',
      isEnabled: state.status == 'processing' || state.status == 'CREATE' || state.status == 'DEPLOY' || state.status == 'warning' || state.status == 'OFFLINE' || state.status == 'error',
      onClick: async ({ commandService }) => {
        commandService.executeCommand<NsGraphCmd.SaveGraphData.IArgs>(
          XFlowGraphCommands.SAVE_GRAPH_DATA.id,
          { saveGraphDataService: (meta, graphData) => XFlowApi.saveGraphData(meta, graphData) },
        ),
        commandService.executeCommand<NsGraphStatusCommand.IArgs>(
          XFlowDagCommands.QUERY_GRAPH_STATUS.id,
          {
            graphStatusService: XFlowApi.saveGraphStatusService
          },
        )
      },
    })
    /** 部署服务按钮 */
    toolbarGroup1.push({
      iconName: 'CloudSyncOutlined',
      text: '部署',
      isEnabled: state.status == 'processing' || state.status == 'CREATE' || state.status == 'DEPLOY' || state.status == 'warning' || state.status == 'OFFLINE' || state.status == 'error',
      id: CustomCommands.DEPLOY_SERVICE.id,
      onClick: ({ commandService }) => {
        commandService.executeCommand<NsDeployDagCmd.IArgs>(CustomCommands.DEPLOY_SERVICE.id, {
          deployDagService: (meta, graphData) => XFlowApi.deployDagService(meta, graphData),
        }),
        commandService.executeCommand<NsGraphStatusCommand.IArgs>(
          XFlowDagCommands.QUERY_GRAPH_STATUS.id,
          {
            graphStatusService: XFlowApi.deployGraphStatusService
          },
        )
      },
    })
    /** 上线服务按钮 */
    toolbarGroup2.push({
      iconName: 'CarryOutOutlined',
      text: '上线',
      isEnabled: state.status == 'DEPLOY' || state.status == 'warning' || state.status == 'OFFLINE' || state.status == 'error',
      id: CustomCommands.ONLINE_SERVICE.id,
      onClick: ({ commandService }) => {
        commandService.executeCommand<NsDeployDagCmd.IArgs>(CustomCommands.DEPLOY_SERVICE.id, {
          deployDagService: (meta, graphData) => XFlowApi.onlineDagService(meta, graphData),
        }),
        commandService.executeCommand<NsGraphStatusCommand.IArgs>(
          XFlowDagCommands.QUERY_GRAPH_STATUS.id,
          {
            graphStatusService: XFlowApi.onlineGraphStatusService
          },
        )
      },
    })
    /** 下线服务按钮 */
    toolbarGroup2.push({
      iconName: 'ApiOutlined',
      text: '下线',
      isEnabled: state.status == 'ONLINE' || state.status == 'success',
      id: CustomCommands.OFFLINE_SERVICE.id,
      onClick: ({ commandService }) => {
        commandService.executeCommand<NsDeployDagCmd.IArgs>(CustomCommands.DEPLOY_SERVICE.id, {
          deployDagService: (meta, graphData) => XFlowApi.offlineDagService(meta, graphData),
        }),
        commandService.executeCommand<NsGraphStatusCommand.IArgs>(
          XFlowDagCommands.QUERY_GRAPH_STATUS.id,
          {
            graphStatusService: XFlowApi.offlineGraphStatusService
          },
        )
      },
    })

    toolbarGroup3.push({
      id: XFlowDagCommands.QUERY_GRAPH_STATUS.id + 'scheduler',
      text: '配置调度',
      iconName: 'GatewayOutlined',
      isEnabled: state.status == 'ONLINE' || state.status == 'success',
      onClick: ({ commandService }) => {
        commandService.executeCommand<NsDeployDagCmd.IArgs>(XFlowDagCommands.QUERY_GRAPH_STATUS.id, {
            deployDagService: (meta, graphData) => XFlowApi.schedulerDagService(meta, graphData)
          }
        )
      },
    })

    toolbarGroup3.push({
      id: XFlowDagCommands.QUERY_GRAPH_STATUS.id + 'play',
      text: '开始执行',
      iconName: 'PlaySquareOutlined',
      isEnabled: state.status == 'ONLINE' || state.status == 'success',
      onClick: async ({ commandService }) => {
        commandService.executeCommand<NsGraphStatusCommand.IArgs>(
          XFlowDagCommands.QUERY_GRAPH_STATUS.id,
          {
            graphStatusService: XFlowApi.graphStatusService
          },
        )
      },
    })

    return [
      { name: 'graphData', items: toolbarGroup1 },
      { name: 'groupOperations', items: toolbarGroup2 },
      {
        name: 'customCmd',
        items: toolbarGroup3,
      },
      {
        name: 'customCmd',
        items: toolbarGroup4,
      },
    ]
  }
}
export const useToolbarConfig = createToolbarConfig((toolbarConfig) => {
  /** 生产 toolbar item */
  toolbarConfig.setToolbarModelService(async (toolbarModel, modelService, toDispose) => {
    const updateToolbarModel = async () => {
      const graphMeta = await MODELS.GRAPH_META.useValue(modelService)
      const state = await NSToolbarConfig.getToolbarState(modelService, graphMeta)
      console.log("graphMeta: " + JSON.stringify(graphMeta.meta))
      const toolbarItems = await NSToolbarConfig.getToolbarItems(state, graphMeta)
      toolbarModel.setValue(toolbar => {
        toolbar.mainGroups = toolbarItems
      })
    }
    const models = await NSToolbarConfig.getDependencies(modelService)
    const subscriptions = models.map(model => {
      return model.watch(async () => {
        updateToolbarModel()
      })
    })
    toDispose.pushAll(subscriptions)
  })
})

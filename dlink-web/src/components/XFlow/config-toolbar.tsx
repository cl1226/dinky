import type { IToolbarItemOptions } from '@antv/xflow'
import { createToolbarConfig } from '@antv/xflow'
import type { IModelService, IGraphPipelineCommand } from '@antv/xflow'
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
  ApiOutlined,
  LockOutlined,
  UnlockOutlined,
} from '@ant-design/icons'
import { getStorageTenantId } from '../Common/crud'
import { XFlowApi, StatusEnum } from './service'
import { CustomCommands } from './cmd-extensions/constants'
import type { NsDeployDagCmd } from './cmd-extensions/cmd-deploy'
import type { NsGraphCmd, NsGraph } from '@antv/xflow'
import { Popconfirm } from 'antd'

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
  IconStore.set('LockOutlined', LockOutlined)
  IconStore.set('UnlockOutlined', UnlockOutlined)
  /** toolbar依赖的状态 */
  export interface IToolbarState {
    status: string
    lockStatus: boolean
  }

  export const getDependencies = async (modelService: IModelService) => {
    return [await MODELS.GRAPH_META.getModel(modelService)]
  }

  /** toolbar依赖的状态 */
  export const getToolbarState = async (
    modelService: IModelService,
    graphMeta: NsGraph.IGraphMeta,
  ) => {
    console.log('workflow status: ' + graphMeta.meta.status)
    return {
      status: graphMeta.meta.status,
      lockStatus: graphMeta.meta.lockStatus,
    } as NSToolbarConfig.IToolbarState
  }

  export const getToolbarItems = async (state: IToolbarState, graphMeta: NsGraph.IGraphMeta) => {
    const toolbarGroup1: IToolbarItemOptions[] = []
    const toolbarGroup2: IToolbarItemOptions[] = []
    const toolbarGroup3: IToolbarItemOptions[] = []

    /** 抢锁按钮 */
    toolbarGroup1.push({
      id: CustomCommands.LOCK_SERVICE.id,
      iconName: 'LockOutlined',
      text: '抢锁',
      isEnabled: !state.lockStatus,
      onClick: async ({ commandService, modelService }) => {
        const result = await XFlowApi.lockService(graphMeta)
        const graphMetaModel = await MODELS.GRAPH_META.getModel(modelService)
        graphMetaModel.setValue({
          ...graphMeta,
          meta: result,
        })
      },
    })
    /** 解锁按钮 */
    toolbarGroup1.push({
      iconName: 'UnlockOutlined',
      text: '解锁',
      isEnabled: state.lockStatus,
      id: CustomCommands.UNLOCK_SERVICE.id,
      onClick: async ({ commandService, modelService }) => {
        const result = await XFlowApi.unLockService(graphMeta)
        const graphMetaModel = await MODELS.GRAPH_META.getModel(modelService)
        graphMetaModel.setValue({
          ...graphMeta,
          meta: result,
        })
      },
    })

    /** 部署服务按钮 */
    toolbarGroup2.push({
      iconName: 'CloudSyncOutlined',
      text: '部署',
      isEnabled:
        state.lockStatus &&
        (state.status === 'CREATE' || state.status === 'DEPLOY' || state.status === 'OFFLINE'),
      id: CustomCommands.DEPLOY_SERVICE.id,
      onClick: async ({ commandService, modelService }) => {
        await commandService.executeCommand<NsDeployDagCmd.IArgs>(
          CustomCommands.DEPLOY_SERVICE.id,
          {
            deployDagService: (meta, graphData) => XFlowApi.deployDagService(meta, graphData),
          },
        )

        const graphMetaModel = await MODELS.GRAPH_META.getModel(modelService)
        graphMetaModel.setValue({
          ...graphMeta,
          meta: {
            ...graphMeta.meta,
            status: StatusEnum.DEPLOY,
          },
        })
      },
    })

    /** 上线服务按钮 */
    toolbarGroup2.push({
      iconName: 'CarryOutOutlined',
      text: '上线',
      isEnabled: state.lockStatus && (state.status == 'DEPLOY' || state.status === 'OFFLINE'),
      id: CustomCommands.ONLINE_SERVICE.id,
      onClick: async ({ commandService, modelService }) => {
        const result = await XFlowApi.onlineDagService(graphMeta)
        if (result) {
          const graphMetaModel = await MODELS.GRAPH_META.getModel(modelService)
          graphMetaModel.setValue({
            ...graphMeta,
            meta: {
              ...graphMeta.meta,
              status: StatusEnum.ONLINE,
            },
          })
        }
      },
      render: (props) => {
        return (
          <Popconfirm
            title="请确认已部署后再点击上线！"
            placement="bottom"
            onConfirm={() => {
              props.onClick()
            }}
          >
            {props.children}
          </Popconfirm>
        )
      },
    })
    /** 下线服务按钮 */
    toolbarGroup2.push({
      iconName: 'ApiOutlined',
      text: '下线',
      isEnabled: state.lockStatus && state.status == 'ONLINE',
      id: CustomCommands.OFFLINE_SERVICE.id,
      onClick: async ({ commandService, modelService }) => {
        const result = await XFlowApi.offlineDagService(graphMeta)
        if (result) {
          const graphMetaModel = await MODELS.GRAPH_META.getModel(modelService)
          graphMetaModel.setValue({
            ...graphMeta,
            meta: {
              ...graphMeta.meta,
              status: StatusEnum.OFFLINE,
            },
          })
        }
      },
    })

    toolbarGroup3.push({
      id: XFlowDagCommands.QUERY_GRAPH_STATUS.id + 'play',
      text: '开始执行',
      iconName: 'PlaySquareOutlined',
      isEnabled: state.status == 'ONLINE',
      onClick: async ({ commandService, modelService }) => {
        await XFlowApi.startDagService(graphMeta)
      },
    })

    return [
      { name: 'lockCmd', items: toolbarGroup1 },
      { name: 'statusCmd', items: toolbarGroup2 },
      {
        name: 'customCmd',
        items: toolbarGroup3,
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
      console.log('graphMeta: ' + JSON.stringify(graphMeta.meta))

      const toolbarItems = await NSToolbarConfig.getToolbarItems(state, graphMeta)
      toolbarModel.setValue((toolbar) => {
        toolbar.mainGroups = toolbarItems
      })
    }
    const models = await NSToolbarConfig.getDependencies(modelService)

    const subscriptions = models.map((model) => {
      return model.watch(async () => {
        updateToolbarModel()
      })
    })
    toDispose.pushAll(subscriptions)
  })
})

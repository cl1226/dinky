import type { IToolbarItemOptions, IModelService, NsGraph } from '@antv/xflow'
import { createToolbarConfig, XFlowDagCommands, MODELS, IconStore } from '@antv/xflow'

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
import { XFlowApi, StatusEnum, ESchedulerType } from './service'
import { CustomCommands } from './cmd-extensions/constants'
import type { NsDeployDagCmd } from './cmd-extensions/cmd-deploy'
import { message, Popconfirm } from 'antd'
import { NS_CANVAS_FORM } from './config-model-service'
import moment from 'moment'
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

  // 将当前组件的form转换为传参的meta
  const getJsonCron = (formValues) => {
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

  export const getDependencies = async (modelService: IModelService) => {
    return [await MODELS.GRAPH_META.getModel(modelService)]
  }

  /** toolbar依赖的状态 */
  export const getToolbarState = async (
    graphMeta: NsGraph.IGraphMeta,
    modelService: IModelService,
  ) => {
    console.log('workflow status: ' + graphMeta.meta.status)
    return {
      status: graphMeta.meta.status,
      lockStatus: graphMeta.meta.lockStatus,
    } as NSToolbarConfig.IToolbarState
  }

  export const getToolbarItems = async (
    state: IToolbarState,
    graphMeta: NsGraph.IGraphMeta,
    modelService: IModelService,
  ) => {
    const toolbarGroup1: IToolbarItemOptions[] = []
    const toolbarGroup2: IToolbarItemOptions[] = []
    const toolbarGroup3: IToolbarItemOptions[] = []
    const setGraphMeta = async (value) => {
      const graphMetaModel = await MODELS.GRAPH_META.getModel(modelService)
      graphMetaModel.setValue({
        ...graphMeta,
        meta: value,
      })
    }

    /** 抢锁按钮 */
    toolbarGroup1.push({
      id: CustomCommands.LOCK_SERVICE.id,
      iconName: 'LockOutlined',
      text: '抢锁',
      isEnabled: !state.lockStatus,
      onClick: async () => {
        const result = await XFlowApi.lockService(graphMeta)
        setGraphMeta(result)
      },
    })
    /** 解锁按钮 */
    toolbarGroup1.push({
      iconName: 'UnlockOutlined',
      text: '解锁',
      isEnabled: state.lockStatus,
      id: CustomCommands.UNLOCK_SERVICE.id,
      onClick: async () => {
        const result = await XFlowApi.unLockService(graphMeta)
        setGraphMeta(result)
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
      onClick: async ({ commandService }) => {
        const ctx = await modelService.awaitModel<NS_CANVAS_FORM.ICanvasForm>(NS_CANVAS_FORM.id)

        const { canvasForm } = await ctx.getValidValue()

        canvasForm
          .validateFields()
          .then(async (values) => {
            console.log('values', values)
            const { schedulerType } = values
            let cron: any = null
            if (schedulerType === ESchedulerType.CYCLE) {
              cron = getJsonCron(values)
            }
            const canvasForm = {
              schedulerType,
              cron,
            }

            await commandService.executeCommand<NsDeployDagCmd.IArgs>(
              CustomCommands.DEPLOY_SERVICE.id,
              {
                deployDagService: (meta, graphData) =>
                  XFlowApi.deployDagService(meta, graphData, canvasForm),
              },
            )
            setGraphMeta({
              ...graphMeta.meta,
              status: StatusEnum.DEPLOY,
              ...canvasForm
            })
          })
          .catch(({ errorFields }) => {
            const msg = errorFields?.[0]?.['errors']?.[0] || '操作失败'
            message.warn(msg)
          })

        return
      },
    })

    /** 上线服务按钮 */
    toolbarGroup2.push({
      iconName: 'CarryOutOutlined',
      text: '上线',
      isEnabled: state.lockStatus && (state.status == 'DEPLOY' || state.status === 'OFFLINE'),
      id: CustomCommands.ONLINE_SERVICE.id,
      onClick: async () => {
        const result = await XFlowApi.onlineDagService(graphMeta)
        if (result) {
          setGraphMeta({
            ...graphMeta.meta,
            status: StatusEnum.ONLINE,
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
      onClick: async () => {
        const result = await XFlowApi.offlineDagService(graphMeta)
        if (result) {
          setGraphMeta({
            ...graphMeta.meta,
            status: StatusEnum.OFFLINE,
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
      const state = await NSToolbarConfig.getToolbarState(graphMeta, modelService)
      console.log('graphMeta: ' + JSON.stringify(graphMeta.meta))
      const toolbarItems = await NSToolbarConfig.getToolbarItems(state, graphMeta, modelService)
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

import type { IProps } from './index'
import type { NsGraph, NsNodeCmd } from '@antv/xflow'
import { XFlowNodeCommands, createGraphConfig, IEvent, useXFlowApp } from '@antv/xflow'
import { createHookConfig, DisposableCollection } from '@antv/xflow'
import { DND_RENDER_ID, GROUP_NODE_RENDER_ID } from './constant'
import { AlgoNode } from './react-node/algo-node'
import { GroupNode } from './react-node/group'
// import { useTabState } from './config-model-service'
export const useGraphHookConfig = createHookConfig<IProps>((config, proxy) => {
  // 获取 Props
  const props = proxy.getValue()

  config.setRegisterHook((hooks) => {
    const disposableList = [
      // 注册增加 react Node Render
      hooks.reactNodeRender.registerHook({
        name: 'add react node',
        handler: async (renderMap) => {
          renderMap.set(DND_RENDER_ID, AlgoNode)
          renderMap.set(GROUP_NODE_RENDER_ID, GroupNode)
        },
      }),
      // 注册修改graphOptions配置的钩子
      hooks.graphOptions.registerHook({
        name: 'custom-x6-options',
        after: 'dag-extension-x6-options',
        handler: async (options) => {
          options.grid = true
          options.keyboard = {
            enabled: true,
          }
        },
      }),
      // 注册增加 graph event
      hooks.x6Events.registerHook({
        name: 'add',
        handler: async (events) => {
          events.push({
            eventName: 'node:moved',
            callback: (e, cmds) => {
              const { node } = e
              cmds.executeCommand<NsNodeCmd.MoveNode.IArgs>(XFlowNodeCommands.MOVE_NODE.id, {
                id: node.id,
                position: node.getPosition(),
              })
            },
          } as NsGraph.IEvent<'node:moved'>)
        },
      }),
    ]
    const toDispose = new DisposableCollection()
    toDispose.pushAll(disposableList)
    return toDispose
  })
})
export const useGraphConfig = createGraphConfig<IProps>((graphConfig) => {
  // graphConfig.setEdgeRender('Edge', (props) => {
  //   return <div className="react-edge"> {props.data.label} </div>
  // })

  const event: IEvent<'blank:click'> = {
    eventName: 'blank:click',
    callback: async (eventArgs, command, modelService) => {
      console.log('blank:click', eventArgs)
      // const [tabState, setTabState] = await useTabState(modelService)
      // if (tabState) {
      //   setTabState({
      //     visible: false,
      //   })
      // }
    },
  }
  /**  这里绑定事件  */
  graphConfig.setEvents([event])
})

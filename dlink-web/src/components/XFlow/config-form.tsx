import type { NsGraph, NsNodeCmd } from '@antv/xflow'
import { controlMapService, ControlShapeEnum } from './form-controls'
import { MODELS, XFlowNodeCommands, NsJsonSchemaForm } from '@antv/xflow'
import { set } from 'lodash'

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(() => resolve(true), ms))
}

export const formSchemaService: NsJsonSchemaForm.IFormSchemaService = async (args) => {
  // const { targetData, modelService, targetType } = args
  /** 可以使用获取 graphMeta */
  // const graphMeta = await MODELS.GRAPH_META.useValue(modelService)

  return {
    tabs: [],
  }
}

export const formValueUpdateService: NsJsonSchemaForm.IFormValueUpdateService = async (args) => {
  const { values, commandService, targetData } = args
  const updateNode = (node: NsGraph.INodeConfig) => {
    return commandService.executeCommand<NsNodeCmd.UpdateNode.IArgs>(
      XFlowNodeCommands.UPDATE_NODE.id,
      { nodeConfig: node },
    )
  }
  const nodeConfig: NsGraph.INodeConfig = {
    ...(targetData as NsGraph.INodeConfig),
  }
  values.forEach((val) => {
    set(nodeConfig, val.name, val.value)
  })
  updateNode(nodeConfig)
}

export { controlMapService }

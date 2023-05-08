import type { NsJsonSchemaForm, NsGraph, NsNodeCmd } from '@antv/xflow'
import { controlMapService, ControlShapeEnum } from './form-controls'
import { MODELS, XFlowNodeCommands } from '@antv/xflow'
import { set } from 'lodash'

export function delay(ms: number) {
  return new Promise(resolve => setTimeout(() => resolve(true), ms))
}

export const formSchemaService: NsJsonSchemaForm.IFormSchemaService = async args => {
  const { targetData, modelService, targetType } = args
  /** 可以使用获取 graphMeta */
  const graphMeta = await MODELS.GRAPH_META.useValue(modelService)
  
  if (targetType === 'canvas') {
    return {
      tabs: [
        {
          name: '作业信息',
          groups: [
            {
              name: 'groupName',
              controls: [
                {
                  name: 'id',
                  label: '作业ID',
                  shape: ControlShapeEnum.SpanShape,
                  value: graphMeta.meta.flowId
                },
                {
                  name: 'name',
                  label: '作业名称',
                  shape: ControlShapeEnum.SpanShape,
                  value: graphMeta.meta.flowName
                },
                {
                  name: 'cron',
                  label: '执行计划',
                  shape: ControlShapeEnum.SpanShape,
                  value: graphMeta.meta.cron
                }
              ]
            }
          ],
        },
      ],
    }
  } else {
    const nodeSchema: NsJsonSchemaForm.ISchema = {
      tabs: [
        {
          name: '节点信息',
          groups: [
            {
              name: 'node1',
              controls: [
                {
                  name: 'label',
                  label: '节点名称',
                  shape: 'Input',
                  value: targetData!.label,
                  required: true,
                  defaultValue: 'FlinkSQL'
                },
                {
                  name: 'jobId',
                  label: '节点作业',
                  shape: ControlShapeEnum.SelectorShape,
                  value: targetData!.jobId,
                  required: true,
                }
              ],
            },
          ],
        }
      ],
    }
    return nodeSchema
  }
}

export const formValueUpdateService: NsJsonSchemaForm.IFormValueUpdateService = async args => {
  const { values, commandService, targetData } = args
  const updateNode = (node: NsGraph.INodeConfig) => {
    return commandService.executeCommand<NsNodeCmd.UpdateNode.IArgs>(
      XFlowNodeCommands.UPDATE_NODE.id,
      { nodeConfig: node },
    )
  }
  const nodeConfig: NsGraph.INodeConfig = {
    ...(targetData as NsGraph.INodeConfig) ,
  }
  values.forEach(val => {
    set(nodeConfig, val.name, val.value)
  })
  updateNode(nodeConfig)
}

export { controlMapService }

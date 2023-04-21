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
  console.log('formSchemaService', graphMeta, args)
  
  if (targetType === 'canvas') {
    return {
      tabs: [
        {
          name: '工作流信息',
          groups: [
            {
              name: 'groupName',
              controls: [
                {
                  name: '工作流ID',
                  label: '项目名',
                  shape: 'Input',
                  disabled: false,
                  required: true,
                  tooltip: '图的业务项目名',
                  extra: '和图的ID对应',
                  placeholder: 'please write something',
                  value: '',
                  defaultValue: '', // 可以认为是默认值
                  hidden: false,
                  options: [{ title: '', value: '' }],
                  originData: {}, // 原始数据
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
                  value: targetData.label,
                  required: true,
                  defaultValue: 'FlinkSQL'
                },
                {
                  name: 'jobId',
                  label: '节点作业',
                  shape: ControlShapeEnum.SelectorShape,
                  value: targetData.jobId,
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
  console.log('formValueUpdateService  values:', values, args)
  const nodeConfig: NsGraph.INodeConfig = {
    ...targetData,
  }
  values.forEach(val => {
    set(nodeConfig, val.name, val.value)
  })
  updateNode(nodeConfig)
}

export { controlMapService }

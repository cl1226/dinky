import type { NsJsonSchemaForm } from '@antv/xflow'
import { controlMapService, ControlShapeEnum } from './form-controls'
import { MODELS } from '@antv/xflow'

export function delay(ms: number) {
  return new Promise(resolve => setTimeout(() => resolve(true), ms))
}

export const formSchemaService: NsJsonSchemaForm.IFormSchemaService = async args => {
  const { targetData, modelService, targetType } = args
  /** 可以使用获取 graphMeta */
  const graphMeta = await MODELS.GRAPH_META.useValue(modelService)
  console.log('formSchemaService', graphMeta, args)

  const nodeSchema: NsJsonSchemaForm.ISchema = {
    tabs: [
      {
        name: '节点信息',
        groups: [
          {
            name: 'node1',
            controls: [
              {
                name: 'name',
                label: '节点名称',
                shape: 'Input',
                value: '',
                required: true,
                defaultValue: 'FlinkSQL'
              },
              {
                name: 'job',
                label: '节点作业',
                shape: ControlShapeEnum.SelectorShape,
                value: '',
                required: true,
              }
            ],
          },
        ],
      }
    ],
  }

  if (targetType === 'canvas') {
    return {
      tabs: [
        {
          name: '画布配置',
          groups: [],
        },
      ],
    }
  } else {
    return nodeSchema
  }
}

export const formValueUpdateService: NsJsonSchemaForm.IFormValueUpdateService = async args => {
  console.log('formValueUpdateService', args)
}

export { controlMapService }

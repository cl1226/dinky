import {
  XFlow,
  XFlowCanvas,
  JsonSchemaForm,
  createGraphConfig,
  NsJsonSchemaForm,
  XFlowNodeCommands,
  MODELS,
} from '@antv/xflow'

export namespace CustomJsonForm {
  export const getCustomRenderComponent: NsJsonSchemaForm.ICustomRender = (
    targetType,
    targetData,
    modelService,
    commandService,
  ) => {
    const graphMeta = MODELS.GRAPH_META.useValue(modelService)

    console.log('getCustomRenderComponent', targetType, targetData, graphMeta)
    if (targetType === 'node') {
      return () => (
        <div className="custom-form-component"> node: {targetData?.label} custom componnet </div>
      )
    }
    if (targetType === 'canvas') {
      return () => <div className="custom-form-component"> canvas custom componnet</div>
    }

    return null
  }
}

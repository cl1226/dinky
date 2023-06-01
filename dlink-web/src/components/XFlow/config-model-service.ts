import type { IModelService } from '@antv/xflow'
import { createModelServiceConfig } from '@antv/xflow'

export namespace NS_LOADING_STATE {
  export const id = 'test'
  export interface IState {
    loading: boolean
  }
}

export namespace NS_CANVAS_FORM {
  export const id = 'canvas_form'
  export interface ICanvasForm {
    canvasForm: any
  }
}

export namespace NS_FLOW_TASK_FORM {
  export const id = 'flow_task_enum'
  export interface ITASKForm {
    taskForm: any
  }
}

export const useModelServiceConfig = createModelServiceConfig((config) => {
  config.registerModel((registry) => {
    return registry.registerModel({
      id: NS_LOADING_STATE.id,
      getInitialValue: () => {
        loading: true
      },
    })
  })
})

export const useLoadingState = async (contextService: IModelService) => {
  const ctx = await contextService.awaitModel<NS_LOADING_STATE.IState>(NS_LOADING_STATE.id)
  return ctx.getValidValue()
}

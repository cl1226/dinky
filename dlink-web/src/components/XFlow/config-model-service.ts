import type { IModelService, NsModel } from '@antv/xflow'
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

export namespace NS_TAB_STATE {
  export const id = 'tab_state'
  export interface ITabState {
    visible: boolean
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

  config.registerModel((registry) => {
    return registry.registerModel({
      id: NS_TAB_STATE.id,
      getInitialValue: () => {
        return {
          visible: false,
        }
      },
    })
  })
})

export const useLoadingState = async (contextService: IModelService) => {
  const ctx = await contextService.awaitModel<NS_LOADING_STATE.IState>(NS_LOADING_STATE.id)
  return ctx.getValidValue()
}

export const useTabState = async (contextService: IModelService) => {
  const ctx = await contextService.awaitModel<NS_TAB_STATE.ITabState>(NS_TAB_STATE.id)
  return [await ctx.getValidValue(), ctx.setValue] as [
    NS_TAB_STATE.ITabState,
    NsModel.ISetValue<NS_TAB_STATE.ITabState>,
  ]
}

import type { IModelService, NsModel } from '@antv/xflow'
import { createModelServiceConfig } from '@antv/xflow'
import { useState, useEffect } from 'react'
export namespace NS_LOADING_STATE {
  export const id = 'test'
  export interface IState {
    loading: boolean
  }
}

export namespace NS_CANVAS_FORM {
  export const id = 'canvas_form'
  export interface ICanvasForm {
    schedulerType: any
    [key: string]: any
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
      id: NS_CANVAS_FORM.id,
      getInitialValue: () => ({
        schedulerType: '',
        cron: null,
      }),
    })
  })
})

export const useLoadingState = async (contextService: IModelService) => {
  const ctx = await contextService.awaitModel<NS_LOADING_STATE.IState>(NS_LOADING_STATE.id)
  return ctx.getValidValue()
}

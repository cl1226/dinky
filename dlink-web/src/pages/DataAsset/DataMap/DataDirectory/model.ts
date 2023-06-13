import type { Reducer } from 'umi'

export type StateType = {
  pageLoading?: boolean
  filterForm?: any
}
export type ModelType = {
  namespace: string
  state: StateType
  effects: {}
  reducers: {
    toggleLoading: Reducer<StateType>
    saveFilterForm: Reducer<StateType>
  }
}
const Model: ModelType = {
  namespace: 'DataDirectory',
  state: {
    pageLoading: false,
  },
  effects: {},
  reducers: {
    toggleLoading(state, { payload }) {
      return {
        ...state,
        pageLoading: payload,
      }
    },
    saveFilterForm(state, { payload }) {
      return {
        ...state,
        filterForm: payload,
      }
    },
  },
}

export default Model

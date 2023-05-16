import type { Reducer } from 'umi'

export type StateType = {}

export type ModelType = {
  namespace: string
  state: StateType
  effects: {}
  reducers: {}
}

const Model: ModelType = {
  namespace: 'Catalogue',
  state: {},
  effects: {},
  reducers: {},
}

export default Model

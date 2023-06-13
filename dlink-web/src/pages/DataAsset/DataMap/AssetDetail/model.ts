import type { Reducer } from 'umi'

export type StateType = {
  tabs?: any
  currentTab?: any
  activeKey?: any
}
export type ModelType = {
  namespace: string
  state: StateType
  effects: {}
  reducers: {}
}
const Model: ModelType = {
  namespace: 'AssetDetail',
  state: {
    tabs: [
      {
        key: '1',
        title: '一号',
      },
      {
        key: '2',
        title: '二号号',
      },
    ],
    currentTab: {
      key: '1',
      title: '一号',
    },
    activeKey: null,
  },
  effects: {},
  reducers: {
    changeCurrentTab(state, { payload }) {
      payload = parseInt(payload)
      const newTabs = state?.tabs
      let newCurrent = state?.currentTab
      for (let i = 0; i < newTabs.length; i++) {
        if (newTabs[i].key == payload) {
          newCurrent = newTabs[i]
        }
      }
      return {
        ...state,
        currentTab: { ...newCurrent },
        tabs: newTabs,
      }
    },
    closeTabs(state, { payload }) {
      const { deleteType, current } = payload
      let newTabs = state.tabs
      let newCurrent = newTabs[0]
      if (deleteType == 'CLOSE_OTHER') {
        const keys = [current.key]
        newCurrent = current
        newTabs = newTabs.filter((item) => keys.includes(item.key))
      } else {
        newTabs = []
      }

      return {
        ...state,
        current: { ...newCurrent },
        tabs: newTabs,
      }
    },
    saveTabs(state, { payload }) {
      let newCurrent = state.currentTab
      for (let i = 0; i < payload.panes.length; i++) {
        if (payload.panes[i].key == payload.activeKey) {
          newCurrent = payload.panes[i]
        }
      }
      if (payload.panes.length == 0) {
        return {
          ...state,
          current: undefined,
          tabs: payload.panes,
        }
      }
      return {
        ...state,
        current: { ...newCurrent },
        tabs: payload.panes,
      }
    },
  },
}

export default Model

import type { Reducer } from 'umi'
import { history } from 'umi'
export type StateType = {
  tabs?: any
  currentTab?: any
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
    tabs: [],
    currentTab: undefined,
  },
  effects: {},
  reducers: {
    changeCurrentTab(state, { payload }) {
      const newTabs = state?.tabs
      let newCurrent = state?.currentTab
      for (let i = 0; i < newTabs.length; i++) {
        if (newTabs[i].tabKey === payload) {
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
      const { deleteType, currentTab } = payload
      let newTabs = state.tabs
      let newCurrent = newTabs[0]
      if (deleteType == 'CLOSE_OTHER') {
        const keys = [currentTab.tabKey]
        newCurrent = currentTab
        newTabs = newTabs.filter((item) => keys.includes(item.tabKey))
      } else {
        newTabs = []
        history.push('/dataAsset/dataMap/dataDirectory')
      }

      return {
        ...state,
        currentTab: { ...newCurrent },
        tabs: [...newTabs],
      }
    },
    saveTabs(state, { payload }) {
      const { tabs, activeKey } = payload
      let newCurrent = state.currentTab
      for (let i = 0; i < tabs.length; i++) {
        if (tabs[i].tabKey == activeKey) {
          newCurrent = tabs[i]
        }
      }
      if (tabs.length == 0) {
        history.push('/dataAsset/dataMap/dataDirectory')
        return {
          ...state,
          currentTab: undefined,
          tabs: [],
        }
      }
      return {
        ...state,
        currentTab: { ...newCurrent },
        tabs: [...tabs],
      }
    },
  },
}

export default Model

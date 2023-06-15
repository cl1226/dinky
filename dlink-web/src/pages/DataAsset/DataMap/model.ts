import type { Effect, Reducer } from 'umi'
import { history } from 'umi'
import { getDataDirectoryDetail } from '@/pages/DataAsset/DataMap/service'

export type StateType = {
  directoryPageLoading?: boolean
  filterForm?: {
    datasourceType?: string
    itemType?: string
  }
  tabs?: any
  currentTab?: any
  detailPageLoading?: boolean
}
export type ModelType = {
  namespace: string
  state: StateType
  effects: {
    openTab: Effect
  }
  reducers: {
    toggleDirectoryLoading: Reducer<StateType>
    saveFilterForm: Reducer<StateType>
    toggleDetailLoading: Reducer<StateType>
    changeCurrentTab: Reducer<StateType>
    closeTabs: Reducer<StateType>
    saveTabs: Reducer<StateType>
  }
}
const Model: ModelType = {
  namespace: 'DataAssetMap',
  state: {
    directoryPageLoading: false,
    filterForm: undefined,
    tabs: [],
    currentTab: undefined,
    detailPageLoading: false,
  },
  effects: {
    *openTab({ payload }, { call, put, select }) {
      const { itemType, id } = payload

      yield put({
        type: 'changePageLoading',
        payload: true,
      })

      const result = yield call(getDataDirectoryDetail, itemType, id)

      const cacheTabs = yield select((state) => state.DataAssetMap.tabs)

      yield put({
        type: 'changePageLoading',
        payload: false,
      })

      const newTabs = [...cacheTabs]
      const findTabIndex = newTabs.findIndex((tab) => tab.tabKey === result.tabKey)
      if (findTabIndex > -1) {
        newTabs[findTabIndex] = result
      } else {
        newTabs.push(result)
      }

      yield put({
        type: 'saveTabs',
        payload: {
          tabs: newTabs,
          activeKey: result.tabKey,
        },
      })
    },
  },
  reducers: {
    toggleDirectoryLoading(state, { payload }) {
      return {
        ...state,
        directoryPageLoading: payload,
      }
    },
    saveFilterForm(state, { payload }) {
      return {
        ...state,
        filterForm: payload,
      }
    },

    toggleDetailLoading(state, { payload }) {
      return {
        ...state,
        detailPageLoading: payload,
      }
    },
    changeCurrentTab(state, { payload }) {
      const newTabs = state?.tabs
      let newCurrent = state?.currentTab
      for (let i = 0; i < newTabs.length; i++) {
        if (newTabs[i].tabKey === payload) {
          newCurrent = newTabs[i]
        }
      }
      history.push(`/dataAsset/dataMap/assetDetail/${newCurrent.type}/${newCurrent.id}`)
      return {
        ...state,
        currentTab: { ...newCurrent },
        tabs: newTabs,
      }
    },
    closeTabs(state, { payload }) {
      const { deleteType, currentTab } = payload
      let newTabs = state?.tabs
      let newCurrent = newTabs[0]
      if (deleteType == 'CLOSE_OTHER') {
        const keys = [currentTab.tabKey]
        newCurrent = currentTab
        newTabs = newTabs.filter((item) => keys.includes(item.tabKey))
        history.push(`/dataAsset/dataMap/assetDetail/${newCurrent.type}/${newCurrent.id}`)
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
      let newCurrent = state?.currentTab
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
      history.push(`/dataAsset/dataMap/assetDetail/${newCurrent.type}/${newCurrent.id}`)
      return {
        ...state,
        currentTab: { ...newCurrent },
        tabs: [...tabs],
      }
    },
  },
}

export default Model

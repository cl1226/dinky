/*
 *
 *  Licensed to the Apache Software Foundation (ASF) under one or more
 *  contributor license agreements.  See the NOTICE file distributed with
 *  this work for additional information regarding copyright ownership.
 *  The ASF licenses this file to You under the Apache License, Version 2.0
 *  (the "License"); you may not use this file except in compliance with
 *  the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

import type { Reducer } from 'umi'
import type { SqlMetaData } from '@/components/Studio/StudioEvent/data'

export type TaskType = {
  id?: number
  catalogueId?: number
  name?: string
  alias?: string
  dialect?: string
  type?: string
  checkPoint?: number
  savePointStrategy?: number
  savePointPath?: string
  parallelism?: number
  fragment?: boolean
  statementSet?: boolean
  batchModel?: boolean
  config?: []
  clusterId?: any
  clusterName?: string
  clusterConfigurationId?: number
  clusterConfigurationName?: string
  databaseId?: number
  databaseName?: string
  jarId?: number
  envId?: number
  jobInstanceId?: number
  note?: string
  enabled?: boolean
  createTime?: Date
  updateTime?: Date
  statement?: string
  session: string
  maxRowNum: number
  jobName: string
  useResult: boolean
  useChangeLog: boolean
  useAutoCancel: boolean
  useSession: boolean
}

export type TabsItemType = {
  title: string
  key: number
  treeId: string | number
  value: string
  icon: any
  closable: boolean
  path: string[]
  task?: TaskType
  monaco?: any
  isModified: boolean
  sqlMetaData?: SqlMetaData
  metaStore?: MetaStoreCatalogType[]
}

export type TabsType = {
  activeKey: number
  panes?: TabsItemType[]
}

export type ConnectorType = {
  tablename: string
}

export type SessionType = {
  session?: string
  sessionConfig?: {
    type?: string
    clusterId?: number
    clusterName?: string
    address?: string
  }
  createUser?: string
  createTime?: string
  connectors: ConnectorType[]
}

export type MetaStoreCatalogType = {
  name: string
  databases: MetaStoreDataBaseType[]
}

export type MetaStoreDataBaseType = {
  name: string
  tables: MetaStoreTableType[]
  views: string[]
  functions: string[]
  userFunctions: string[]
  modules: string[]
}

export type MetaStoreTableType = {
  name: string
  columns: MetaStoreColumnType[]
}

export type MetaStoreColumnType = {
  name: string
  type: string
}

export type StateType = {
  current?: TabsItemType
  currentPath?: string[]
  tabs?: TabsType

  rightClickMenu?: boolean
}

export type ModelType = {
  namespace: string
  state: StateType
  effects: {}
  reducers: {
    saveCurrentPath: Reducer<StateType>

    saveTabs: Reducer<StateType>
    closeTabs: Reducer<StateType>
    changeActiveKey: Reducer<StateType>
    showRightClickMenu: Reducer<StateType>

    renameTab: Reducer<StateType>
  }
}
const Model: ModelType = {
  namespace: 'Scheduler',
  state: {
    current: undefined,
    currentPath: ['Guide Page'],
    tabs: {
      activeKey: 0,
      panes: [],
    },
    rightClickMenu: false,
  },

  effects: {},

  reducers: {
    saveCurrentPath(state, { payload }) {
      return {
        ...state,
        currentPath: payload,
      }
    },
    saveTabs(state, { payload }) {
      let newCurrent = state.current
      for (let i = 0; i < payload.panes.length; i++) {
        if (payload.panes[i].key == payload.activeKey) {
          newCurrent = payload.panes[i]
        }
      }
      if (payload.panes.length == 0) {
        return {
          ...state,
          current: undefined,
          tabs: payload,
          currentPath: ['Guide Page'],
        }
      }
      return {
        ...state,
        current: {
          ...newCurrent,
          isModified: false,
        },
        tabs: { ...payload },
        currentPath: newCurrent?.path,
      }
    },
    deleteTabByKey(state, { payload }) {
      const newTabs = state.tabs
      for (let i = 0; i < newTabs.panes.length; i++) {
        if (newTabs.panes[i].key == payload) {
          newTabs.panes.splice(i, 1)
          break
        }
      }
      let newCurrent = undefined
      if (newTabs.panes.length > 0) {
        if (newTabs.activeKey == payload) {
          newCurrent = newTabs.panes[newTabs.panes.length - 1]
          newTabs.activeKey = newCurrent.key
        } else {
          newCurrent = state.current
        }
      } else {
        newTabs.activeKey = undefined
      }
      return {
        ...state,
        current: { ...newCurrent },
        tabs: { ...newTabs },
      }
    },
    closeTabs(state, { payload }) {
      const { deleteType, current } = payload
      const newTabs = state.tabs
      let newCurrent = newTabs.panes[0]
      if (deleteType == 'CLOSE_OTHER') {
        const keys = [current.key]
        newCurrent = current
        newTabs.activeKey = current.key
        newTabs.panes = newTabs.panes.filter((item) => keys.includes(item.key))
      } else {
        newTabs.panes = []
      }

      return {
        ...state,
        current: { ...newCurrent },
        tabs: { ...newTabs },
      }
    },
    changeActiveKey(state, { payload }) {
      payload = parseInt(payload)
      const newTabs = state?.tabs
      let newCurrent = state?.current
      for (let i = 0; i < newTabs.panes.length; i++) {
        if (newTabs.panes[i].key == payload) {
          newTabs.activeKey = payload
          newCurrent = newTabs.panes[i]
        }
      }
      return {
        ...state,
        current: { ...newCurrent },
        tabs: { ...newTabs },
        currentPath: newCurrent.path,
      }
    },
    showRightClickMenu(state, { payload }) {
      return {
        ...state,
        rightClickMenu: payload,
      }
    },

    renameTab(state, { payload }) {
      const newTabs = state.tabs
      let newCurrent = state.current
      for (let i = 0; i < newTabs.panes.length; i++) {
        if (newTabs.panes[i].key == payload.key) {
          newTabs.panes[i].title = payload.title
          newTabs.panes[i].icon = payload.icon
          newTabs.panes[i].task.alias = payload.title
          newTabs.panes[i].path[newTabs.panes[i].path.length - 1] = payload.title
        }
        if (newTabs.panes[i].key == newCurrent.key) {
          newCurrent.title = payload.title
          newCurrent.icon = payload.icon
          newCurrent.task.alias = payload.title
          newCurrent.path[newCurrent.path.length - 1] = payload.title
        }
      }
      if (newTabs.panes.length == 0) {
        return {
          ...state,
          current: undefined,
          tabs: { ...newTabs },
          currentPath: ['Guide Page'],
        }
      }
      return {
        ...state,
        current: {
          ...newCurrent,
        },
        tabs: { ...newTabs },
        currentPath: newCurrent.path,
      }
    },
  },
}

export default Model

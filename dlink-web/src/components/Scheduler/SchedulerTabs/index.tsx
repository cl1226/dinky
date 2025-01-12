/*
 * @Author: Rebecca Li
 * @Date: 2023-04-25 08:23:53
 * @LastEditors: Rebecca Li
 * @LastEditTime: 2023-04-26 11:40:19
 */
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

import { Dropdown, Menu, Tabs } from 'antd'
import { connect } from 'umi'
import { StateType } from '@/pages/Scheduler/model'
import styles from './index.less'
import SchedulerEdit from '../SchedulerEdit'
import { XFlowEditor } from '@/components/XFlow'
import SchedulerHome from '@/components/Scheduler/SchedulerHome'
import { Dispatch } from '@@/plugin-dva/connect'
import { l } from '@/utils/intl'

const { TabPane } = Tabs

const EditorTabs = (props: any) => {
  const { tabs, current, width } = props

  const onChange = (activeKey: any) => {
    props.changeActiveKey(activeKey)
  }

  const onEdit = (targetKey: any, action: any) => {
    if (action === 'remove') {
      remove(targetKey)
    }
  }

  const remove = (targetKey: any) => {
    let newActiveKey = tabs.activeKey
    let lastIndex = 0
    tabs.panes.forEach((pane, i) => {
      if (pane.key.toString() === targetKey) {
        lastIndex = i - 1
      }
    })
    let panes = tabs.panes
    const newPanes = panes.filter((pane) => pane.key.toString() != targetKey)
    if (newPanes.length && newActiveKey.toString() === targetKey) {
      if (lastIndex > 0) {
        newActiveKey = newPanes[lastIndex].key
      } else {
        newActiveKey = newPanes[0].key
      }
    }
    props.saveTabs(newPanes, newActiveKey)
  }

  const handleClickMenu = (e: any, current) => {
    props.closeTabs(current, e.key)
  }

  const menu = (pane) => (
    <Menu onClick={(e) => handleClickMenu(e, pane)}>
      <Menu.Item key="CLOSE_ALL">
        <span>{l('right.menu.closeAll')}</span>
      </Menu.Item>
      <Menu.Item key="CLOSE_OTHER">
        <span>{l('right.menu.closeOther')}</span>
      </Menu.Item>
    </Menu>
  )

  const Tab = (pane: any) => (
    <span>
      {pane.key === 0 ? (
        <>
          {pane.icon} {pane.title}
        </>
      ) : (
        <Dropdown overlay={menu(pane)} trigger={['contextMenu']}>
          <span className="ant-dropdown-link">
            <>
              {pane.icon} {pane.title}
            </>
          </span>
        </Dropdown>
      )}
    </span>
  )

  // as different dialet return different Panle
  const getTabPane = (pane, i) => {
    return (
      <TabPane tab={Tab(pane)} key={pane.key} closable={pane.closable}>
        <SchedulerEdit width={width} tabkey={pane.key} activeKey={current.key} />
      </TabPane>
    )
  }

  return (
    <>
      {tabs.panes.length === 0 ? (
        <SchedulerHome />
      ) : (
        <Tabs
          hideAdd
          type="editable-card"
          size="small"
          onChange={onChange}
          activeKey={tabs.activeKey + ''}
          onEdit={onEdit}
          className={styles['edit-tabs']}
        >
          {tabs.panes.map((pane, i) => getTabPane(pane, i))}
        </Tabs>
      )}
    </>
  )
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  closeTabs: (current: any, key: string) =>
    dispatch({
      type: 'Scheduler/closeTabs',
      payload: {
        deleteType: key,
        current,
      },
    }),
  saveTabs: (newPanes: any, newActiveKey: number) =>
    dispatch({
      type: 'Scheduler/saveTabs',
      payload: {
        activeKey: newActiveKey,
        panes: newPanes,
      },
    }),
  changeActiveKey: (activeKey: number) =>
    dispatch({
      type: 'Scheduler/changeActiveKey',
      payload: activeKey,
    }),
})

export default connect(
  ({ Scheduler }: { Scheduler: StateType }) => ({
    current: Scheduler.current,
    tabs: Scheduler.tabs,
    activeKey: Scheduler.tabs,
  }),
  mapDispatchToProps,
)(EditorTabs)

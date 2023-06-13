import React, { useRef, useState, useEffect } from 'react'
import styles from './index.less'
import PageWrap from '@/components/Common/PageWrap'
import { Tabs, Menu, Dropdown, Button } from 'antd'
import { l } from '@/utils/intl'
import { connect } from 'umi'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { Scrollbars } from 'react-custom-scrollbars'
import { Dispatch } from '@@/plugin-dva/connect'

const { TabPane } = Tabs

const getDetailContent = (paneItem) => {
  return (
    <div className={styles['detail-content']}>
      <div className="top-detail">
        <div className="left-header">
          <img src="" alt="" />
        </div>
        <div className="right-header">
          <div className="title">dbms_om</div>
          <div className="tip-list">
            <div className="tip-item">/db_dev</div>
            <div className="tip-item">创建人: hw_008618921220523_01/dlg_agency</div>
          </div>
          <Button style={{ position: 'absolute', right: 0, top: 0 }}>删除</Button>
        </div>
      </div>
    </div>
  )
}

const AssetDetailTabs = (props: any) => {
  const { tabs, currentTab } = props

  const onChange = (activeKey: any) => {
    props.changeCurrentTab(activeKey)
  }

  const onEdit = (targetKey: any, action: any) => {
    if (action === 'remove') {
      remove(targetKey)
    }
  }

  const remove = (targetKey: any) => {
    let newActiveKey = currentTab.key
    let lastIndex = 0
    tabs.forEach((pane, i) => {
      if (pane.key.toString() === targetKey) {
        lastIndex = i - 1
      }
    })

    const newPanes = tabs.filter((pane) => pane.key.toString() != targetKey)
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
  const getTabPane = (pane, i) => {
    return (
      <TabPane tab={Tab(pane)} key={pane.key} closable={pane.closable}>
        <Scrollbars style={{ height: '100%' }}>
          <div style={{ padding: 20 }}>{getDetailContent(pane)}</div>
        </Scrollbars>
      </TabPane>
    )
  }
  return (
    <div style={{ margin: -24 }}>
      {currentTab ? (
        <Tabs
          tabBarExtraContent={{
            left: (
              <div className={styles['page-back-btn']}>
                <ArrowLeftOutlined />
              </div>
            ),
          }}
          hideAdd
          type="editable-card"
          size="small"
          onChange={onChange}
          activeKey={currentTab.key}
          onEdit={onEdit}
          className={styles['edit-tabs']}
        >
          {tabs.map((pane, i) => getTabPane(pane, i))}
        </Tabs>
      ) : null}
    </div>
  )
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  changeCurrentTab: (activeKey: number) =>
    dispatch({
      type: 'AssetDetail/changeCurrentTab',
      payload: activeKey,
    }),
  closeTabs: (current: any, key: string) =>
    dispatch({
      type: 'AssetDetail/closeTabs',
      payload: {
        deleteType: key,
        current,
      },
    }),
  saveTabs: (newPanes: any, newActiveKey: number) =>
    dispatch({
      type: 'AssetDetail/saveTabs',
      payload: {
        activeKey: newActiveKey,
        panes: newPanes,
      },
    }),
})

export default connect(
  ({ AssetDetail }) => ({
    tabs: AssetDetail.tabs,
    currentTab: AssetDetail.currentTab,
  }),
  mapDispatchToProps,
)(AssetDetailTabs)

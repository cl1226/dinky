import React, { useRef, useState, useEffect } from 'react'
import styles from './index.less'
import { connect, history, useParams } from 'umi'
import { Tabs, Menu, Dropdown, Button, Spin } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { Scrollbars } from 'react-custom-scrollbars'
import { Dispatch } from '@@/plugin-dva/connect'
import { getIcon } from '@/pages/DataAsset/DataMap/Icon'
import { l } from '@/utils/intl'
import { StateType } from '@/pages/DataAsset/DataMap/model'

import DetailTab from './DetailTab'
import TableInfoTab from './TableInfoTab'
import ColumnInfoTab from './ColumnInfoTab'
import LineageTab from './LineageTab'
import DataPreviewTab from './DataPreviewTab'

const { TabPane } = Tabs

const getDetailContent = (paneItem) => {
  const { type } = paneItem
  const tabs = [
    {
      label: '详情',
      key: '1',
      children: <DetailTab basicInfo={paneItem} />,
    },
  ]
  if (type === 'Database') {
    tabs.push({
      label: '表信息',
      key: '2',
      children: <TableInfoTab basicInfo={paneItem} />,
    })
  } else if (type === 'Table') {
    tabs.push(
      ...[
        {
          label: '列属性',
          key: '2',
          children: <ColumnInfoTab basicInfo={paneItem} />,
        },
        {
          label: '血缘',
          key: '3',
          children: <LineageTab basicInfo={paneItem} />,
        },
        {
          label: '数据预览',
          key: '4',
          children: <DataPreviewTab basicInfo={paneItem} />,
        },
      ],
    )
  } else if (type === 'Column') {
    tabs.push(
      ...[
        {
          label: '血缘',
          key: '2',
          children: <LineageTab basicInfo={paneItem} />,
        },
      ],
    )
  }
  return (
    <div className={styles['detail-content']}>
      <div className="top-detail">
        <div className="left-header">{getIcon(paneItem.type, 34)}</div>
        <div className="right-header">
          <div className="title">{paneItem.name}</div>
          <div className="tip-list">
            <div className="tip-item">{`数据源：${paneItem.datasourceName}`}</div>

            {paneItem.position && <div className="tip-item">{paneItem.position}</div>}
          </div>
        </div>
      </div>
      <Tabs size={'small'} defaultActiveKey="1" items={tabs} />
    </div>
  )
}

const AssetDetailTabs = (props: any) => {
  const { itemType, id } = useParams() as any
  const { tabs, currentTab, pageLoading } = props

  useEffect(() => {
    props.asyncOpenTab(itemType, id)
  }, [])

  const onChange = (activeKey: any) => {
    if (activeKey === currentTab.tabKey) return
    props.changeCurrentTab(activeKey)

    history.push(`/dataAsset/dataMap/assetDetail/${activeKey}`)
  }

  const removeTab = (targetKey: any) => {
    let newActiveKey = currentTab.tabKey
    const newTabs = tabs.filter((tab) => tab.tabKey !== targetKey)
    const targetIndex = tabs.findIndex((tab) => tab.tabKey === targetKey)

    if (newTabs.length && targetKey === currentTab.tabKey) {
      newActiveKey = newTabs[targetIndex === newTabs.length ? targetIndex - 1 : targetIndex].tabKey
    }

    props.saveTabs(newTabs, newActiveKey)
  }

  const menu = (pane) => (
    <Menu onClick={(e) => props.closeTabs(pane, e.key)}>
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
      <Dropdown overlay={menu(pane)} trigger={['contextMenu']}>
        <span className={styles['tab-pane-name']}>
          {getIcon(pane.type, 16)}

          {pane.name}
        </span>
      </Dropdown>
    </span>
  )
  const getTabPane = (pane, i) => {
    return (
      <TabPane tab={Tab(pane)} key={pane.tabKey}>
        <Scrollbars style={{ height: 'calc(100vh - 48px - 36px)', backgroundColor: '#fff' }}>
          <div style={{ padding: 20 }}>{getDetailContent(pane)}</div>
        </Scrollbars>
      </TabPane>
    )
  }
  return (
    <div style={{ margin: -24 }}>
      {currentTab ? (
        <Spin spinning={pageLoading}>
          <Tabs
            tabBarExtraContent={{
              left: (
                <div
                  className={styles['page-back-btn']}
                  onClick={() => {
                    history.push('/dataAsset/dataMap/dataDirectory')
                  }}
                >
                  <ArrowLeftOutlined />
                </div>
              ),
            }}
            hideAdd
            type="editable-card"
            size="small"
            onChange={onChange}
            activeKey={currentTab.tabKey}
            onEdit={(targetKey: any, action: any) => {
              if (action === 'remove') {
                removeTab(targetKey)
              }
            }}
            className={styles['edit-tabs']}
          >
            {tabs.map((pane, i) => getTabPane(pane, i))}
          </Tabs>
        </Spin>
      ) : null}
    </div>
  )
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  asyncOpenTab: (itemType: any, id: any) =>
    dispatch({
      type: 'DataAssetMap/openTab',
      payload: {
        itemType,
        id,
      },
    }),
  changeCurrentTab: (activeKey: string) =>
    dispatch({
      type: 'DataAssetMap/changeCurrentTab',
      payload: activeKey,
    }),
  closeTabs: (currentTab: any, tabKey: string) =>
    dispatch({
      type: 'DataAssetMap/closeTabs',
      payload: {
        deleteType: tabKey,
        currentTab,
      },
    }),
  saveTabs: (newTabs: any, newActiveKey: string) =>
    dispatch({
      type: 'DataAssetMap/saveTabs',
      payload: {
        tabs: newTabs,
        activeKey: newActiveKey,
      },
    }),
})

export default connect(
  ({ DataAssetMap }: { DataAssetMap: StateType }) => ({
    tabs: DataAssetMap.tabs,
    currentTab: DataAssetMap.currentTab,
    pageLoading: DataAssetMap.detailPageLoading,
  }),
  mapDispatchToProps,
)(AssetDetailTabs)

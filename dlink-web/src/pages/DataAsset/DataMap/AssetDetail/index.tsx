import React, { useRef, useState, useEffect } from 'react'
import styles from './index.less'
import { Tabs, Menu, Dropdown, Button } from 'antd'
import { l } from '@/utils/intl'
import { connect, history, useParams } from 'umi'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { Scrollbars } from 'react-custom-scrollbars'
import { Dispatch } from '@@/plugin-dva/connect'
import { getDataDirectoryDetail } from '@/pages/DataAsset/DataMap/service'
import DetailTab from './DetailTab'
import TableInfoTab from './TableInfoTab'
import ColumnInfoTab from './ColumnInfoTab'
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
  }else if(type === 'Column'){
    tabs.push(...[
      {
        label: '列属性',
        key: '2',
        children: <ColumnInfoTab basicInfo={paneItem} />,
      }
    ])
  }
  return (
    <div className={styles['detail-content']}>
      <div className="top-detail">
        <div className="left-header">
          <img src={`/dataAsset/dataMap/${paneItem.type || 'Table'}.svg`} alt="" />
        </div>
        <div className="right-header">
          <div className="title">{paneItem.name}</div>
          <div className="tip-list">
            {`数据源：${paneItem.datasourceName}`}
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
  const { tabs, currentTab } = props

  useEffect(() => {
    initDetail()
  }, [])

  const initDetail = async () => {
    const result = await getDataDirectoryDetail(itemType, id)
    if (result) {
      const newTabs = [...tabs]
      const findTabIndex = newTabs.findIndex((tab) => tab.tabKey === result.tabKey)
      if (findTabIndex > -1) {
        newTabs[findTabIndex] = result
      } else {
        newTabs.push(result)
      }
      props.saveTabs(newTabs, result.tabKey)
    }
  }
  const onChange = (activeKey: any) => {
    if (activeKey === currentTab.tabKey) return
    props.changeCurrentTab(activeKey)

    history.push(`/dataAsset/dataMap/assetDetail/${activeKey}`)
  }

  const removeTab = (targetKey: any) => {
    let newActiveKey = currentTab.tabKey
    const newTabs = tabs.filter((tab) => tab.tabKey !== targetKey)
    const targetIndex = tabs.findIndex((tab) => tab.tabKey === targetKey)
    console.log('targetKey', targetKey, currentTab, currentTab.tabKey)
    if (newTabs.length && targetKey === currentTab.tabKey) {
      newActiveKey = newTabs[targetIndex === newTabs.length ? targetIndex - 1 : targetIndex].tabKey
    }
    console.log(newTabs, newActiveKey)
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
        <span className="ant-dropdown-link">
          {pane.icon} {pane.name}
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
      ) : null}
    </div>
  )
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  changeCurrentTab: (activeKey: string) =>
    dispatch({
      type: 'AssetDetail/changeCurrentTab',
      payload: activeKey,
    }),
  closeTabs: (currentTab: any, tabKey: string) =>
    dispatch({
      type: 'AssetDetail/closeTabs',
      payload: {
        deleteType: tabKey,
        currentTab,
      },
    }),
  saveTabs: (newTabs: any, newActiveKey: string) =>
    dispatch({
      type: 'AssetDetail/saveTabs',
      payload: {
        tabs: newTabs,
        activeKey: newActiveKey,
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

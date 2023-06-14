import React, { useRef, useState, useEffect } from 'react'
import styles from './index.less'
import { Tabs, Menu, Dropdown, Button } from 'antd'
import { l } from '@/utils/intl'
import { connect, history, useParams } from 'umi'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { Scrollbars } from 'react-custom-scrollbars'
import { Dispatch } from '@@/plugin-dva/connect'
import { getDataDirectoryDetail } from '@/pages/DataAsset/DataMap/service'

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
      <Tabs
        size={'small'}
        defaultActiveKey="1"
        items={[
          {
            label: '详情',
            key: '1',
            children: <>1111</>,
          },
          {
            label: '表信息',
            key: '2',
            children: <>222</>,
          },
          {
            label: '视图信息',
            key: '3',
            children: <>333</>,
          },
        ]}
      />
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
    console.log(result)
    if (result) {
      props.saveTabs([...(tabs || []), result], result.tabKey)
    }
  }
  const onChange = (activeKey: any) => {
    props.changeCurrentTab(activeKey)
  }

  const removeTab = (targetKey: any) => {
    let newActiveKey = currentTab.key
    let lastIndex = 0
    tabs.forEach((pane, i) => {
      if (pane.key.toString() === targetKey) {
        lastIndex = i - 1
      }
    })

    const newTabs = tabs.filter((pane) => pane.key.toString() != targetKey)
    if (newTabs.length && newActiveKey.toString() === targetKey) {
      if (lastIndex > 0) {
        newActiveKey = newTabs[lastIndex].key
      } else {
        newActiveKey = newTabs[0].key
      }
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
        <span className="ant-dropdown-link">
          {pane.icon} {pane.name}
        </span>
      </Dropdown>
    </span>
  )
  const getTabPane = (pane, i) => {
    console.log('getTabPane', pane)
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
          {tabs.map((pane, i) => {  console.log('xxxx', tabs)
           return getTabPane(pane, i)})}
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
  closeTabs: (current: any, key: string) =>
    dispatch({
      type: 'AssetDetail/closeTabs',
      payload: {
        deleteType: key,
        current,
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

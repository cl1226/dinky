import React, { useState, useEffect } from 'react'
import styles from './index.less'
import { connect, history, useParams } from 'umi'
import { Tabs, Menu, Dropdown, Spin } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { Scrollbars } from 'react-custom-scrollbars'
import { Dispatch } from '@@/plugin-dva/connect'
import { getIcon } from '@/pages/DataAsset/DataMap/Icon'
import { l } from '@/utils/intl'
import { StateType } from '@/pages/DataAsset/DataMap/model'
import { IAssetDetail } from '@/pages/DataAsset/DataMap/type.d'

import DetailTab from './DetailTab'
import TableInfoTab from './TableInfoTab'
import ColumnInfoTab from './ColumnInfoTab'
import LineageTab from './LineageTab'
import DataPreviewTab from './DataPreviewTab'

const { TabPane } = Tabs

const AssetDetailTabs = (props) => {
  const { itemType, id } = useParams() as { itemType: string; id: string }
  const { tabs, currentTab, pageLoading } = props
  const [tabKey, setTabKey] = useState('detail')
  useEffect(() => {
    props.asyncOpenTab(itemType, id)
  }, [])

  const onChange = (activeKey: string) => {
    if (activeKey === currentTab.tabKey) return
    props.changeCurrentTab(activeKey)
  }

  const removeTab = (targetKey: string) => {
    let newActiveKey = currentTab.tabKey
    const newTabs = tabs.filter((tab) => tab.tabKey !== targetKey)
    const targetIndex = tabs.findIndex((tab) => tab.tabKey === targetKey)

    if (newTabs.length && targetKey === currentTab.tabKey) {
      newActiveKey = newTabs[targetIndex === newTabs.length ? targetIndex - 1 : targetIndex].tabKey
    }

    props.saveTabs(newTabs, newActiveKey)
  }

  const getDetailContent = (paneItem: IAssetDetail) => {
    const { type } = paneItem
    const tabs = [
      {
        label: '详情',
        key: 'detail',
        children: <DetailTab basicInfo={paneItem} />,
      },
    ]
    if (type === 'Database') {
      tabs.push({
        label: '表信息',
        key: 'tableInfo',
        children: <TableInfoTab basicInfo={paneItem} />,
      })
    } else if (type === 'Table') {
      tabs.push(
        {
          label: '列属性',
          key: 'columnInfo',
          children: <ColumnInfoTab basicInfo={paneItem} />,
        },
        {
          label: '血缘',
          key: 'lineage',
          children: <LineageTab basicInfo={paneItem} currentKey={tabKey} />,
        },
        {
          label: '数据预览',
          key: 'dataPreview',
          children: <DataPreviewTab basicInfo={paneItem} />,
        },
      )
    } else if (type === 'Column') {
      tabs.push({
        label: '血缘',
        key: 'lineage',
        children: <LineageTab basicInfo={paneItem} currentKey={tabKey} />,
      })
    }

    return (
      <div className={styles['detail-content']}>
        <div className="top-detail">
          <div className="left-header">{getIcon(paneItem.type, 34)}</div>
          <div className="right-header">
            <div className="title">{paneItem.name}</div>
            <div className="tip-list">
              <div className="tip-item">{`数据源：${paneItem.datasourceName}`}</div>

              {paneItem.position && <div className="tip-item">{`路径：${paneItem.position}`}</div>}
            </div>
          </div>
        </div>
        <Tabs
          size={'small'}
          onChange={(key: string) => setTabKey(`${currentTab.type}/${currentTab.id}/${key}`)}
          defaultActiveKey="detail"
          items={tabs}
        />
      </div>
    )
  }

  const menu = (pane: IAssetDetail) => (
    <Menu onClick={(e) => props.closeTabs(pane, e.key)}>
      <Menu.Item key="CLOSE_ALL">
        <span>{l('right.menu.closeAll')}</span>
      </Menu.Item>
      <Menu.Item key="CLOSE_OTHER">
        <span>{l('right.menu.closeOther')}</span>
      </Menu.Item>
    </Menu>
  )
  const Tab = (pane: IAssetDetail) => (
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
            onEdit={(targetKey: any, action: 'add' | 'remove') => {
              if (action === 'remove') {
                removeTab(targetKey)
              }
            }}
            className={styles['edit-tabs']}
          >
            {tabs.map((tab, i) => getTabPane(tab, i))}
          </Tabs>
        </Spin>
      ) : null}
    </div>
  )
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  asyncOpenTab: (itemType: string, id: string | number) =>
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
  closeTabs: (currentTab: IAssetDetail, tabKey: string) =>
    dispatch({
      type: 'DataAssetMap/closeTabs',
      payload: {
        deleteType: tabKey,
        currentTab,
      },
    }),
  saveTabs: (newTabs: IAssetDetail, newActiveKey: string) =>
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

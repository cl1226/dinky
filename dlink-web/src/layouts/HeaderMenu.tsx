import { HeaderViewProps } from '@ant-design/pro-layout/lib/Header'
import { Dropdown, Select, Space } from 'antd'
import type { MenuProps } from 'antd'
import { history } from 'umi'
import styles from './index.less'
import { useState } from 'react'
const saPath = '/sa'
const dashboardPath = '/dashboard'

export default (props: HeaderViewProps, defaultDom: React.ReactNode) => {
  const { matchMenuKeys, menuData, history } = props as any
  const { location } = history
  console.log('props', props)
  const pathName = menuData?.find((item) => item.path === matchMenuKeys[0])?.name || ''

  if (matchMenuKeys[0] === saPath || matchMenuKeys[0] === dashboardPath) {
    return false
  }
  const onMenuClick: MenuProps['onClick'] = ({ item, key }) => {
    history.push(key)
  }

  const onWorkspaceChange = (value: string) => {
    console.log(`selected ${value}`)
  }

  const filterMenuData = (list) => {
    return list
      .filter((item) => {
        return !item.hideInHeaderMenu
      })
      .map((item) => ({
        label: item.name,
        key: item.path,
      }))
  }
  return (
    <div className={styles['header-menu']}>
      <Dropdown
        overlayClassName={styles['header-drop-menu']}
        overlayStyle={{ top: 48 }}
        menu={{ items: filterMenuData(menuData), onClick: onMenuClick }}
      >
        <div className="btn-box">{pathName}</div>
      </Dropdown>
      <div className="driver"></div>
      <div className="workspace-box">
        <span>工作空间</span>
        <Select
          className="select-box"
          size={'small'}
          onChange={onWorkspaceChange}
          popupClassName={styles['workspace-drop']}
          options={[
            {
              value: 'jack',
              label: 'Jack',
            },
            {
              value: 'lucy',
              label: 'Lucy',
            },
          ]}
        />
      </div>
      <div className="driver"></div>
      <div className="cluster-box">
        <span>{localStorage.getItem('dlink-clusterName')}</span>
      </div>
    </div>
  )
}

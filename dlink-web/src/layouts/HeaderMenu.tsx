import { HeaderViewProps } from '@ant-design/pro-layout/lib/Header'
import { Dropdown, Select, Space } from 'antd'
import type { MenuProps } from 'antd'
import { history } from 'umi'
import styles from './index.less'
import { getWorkspaceByUser } from '@/pages/user/service'
import { getStorageClusterId } from '@/components/Common/crud'
import { useState, useEffect } from 'react'
import cookies from 'js-cookie'

const saPath = '/sa'
const dashboardPath = '/dashboard'
const userPath = '/user'

const SpaceSelector = () => {
  const [dataSource, setDataSource] = useState<any>([])
  const [currentSpace, setCurrentSpace] = useState(Number(cookies.get('workspaceId')))

  const getDataSource = async () => {
    if (!getStorageClusterId()) return
    const list = await getWorkspaceByUser()

    setDataSource(list)
  }

  const onWorkspaceChange = (value) => {
    setCurrentSpace(value)
    cookies.set('workspaceId', value.toString(), { path: '/' }) // 放入cookie中
    location.reload()
  }

  useEffect(() => {
    getDataSource()
  }, [])

  return (
    <Select
      className="select-box"
      size={'small'}
      onChange={onWorkspaceChange}
      popupClassName={styles['workspace-drop']}
      value={currentSpace}
      options={dataSource.map((item) => ({ label: item.name, value: item.id }))}
    />
  )
}

export default (props: HeaderViewProps, defaultDom: React.ReactNode) => {
  const { matchMenuKeys, menuData } = props as any

  const pathName = menuData?.find((item) => item.path === matchMenuKeys[0])?.name || ''

  // 匹配到sa及dashboard路由时隐藏

  const getContent = () => {
    // 登录或超管页面 无附加header
    if (matchMenuKeys[0] === saPath || matchMenuKeys[0] === userPath) {
      return null
    } else if (matchMenuKeys[0] === dashboardPath) {
      return (
        <div className="cluster-box">
          <span>{localStorage.getItem('dlink-clusterName')}</span>
        </div>
      )
    }

    return (
      <>
        <Dropdown
          overlayClassName={styles['header-drop-menu']}
          overlayStyle={{ top: 48 }}
          menu={{
            items: filterMenuData(menuData),
            onClick: ({ key }) => {
              history.push(key)
            },
          }}
        >
          <div className="btn-box">{pathName}</div>
        </Dropdown>
        <div className="driver"></div>
        <div className="workspace-box">
          <span>工作空间</span>
          <SpaceSelector />
        </div>
        <div className="driver"></div>
        <div className="cluster-box">
          <span>{localStorage.getItem('dlink-clusterName')}</span>
        </div>
      </>
    )
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
  return <div className={styles['header-menu']}>{getContent()}</div>
}

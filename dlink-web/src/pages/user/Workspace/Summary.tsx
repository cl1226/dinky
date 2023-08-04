import React, { useEffect, useState } from 'react'
import { Button, Col, Space, Input, Divider, Modal } from 'antd'
import styles from './index.less'
import { history } from 'umi'
import { getWorkspaceList } from '@/pages/user/service'
import { getStorageClusterId } from '@/components/Common/crud'
import cookies from 'js-cookie'

export default () => {
  const [dataSource, setDataSource] = useState<any>([])
  const getDataSource = async () => {
    const list = await getWorkspaceList(getStorageClusterId())

    setDataSource(list)
  }

  useEffect(() => {
    getDataSource()
  }, [])

  const munuList = [
    {
      label: '数据开发',
      url: '/dataDev',
    },
    {
      label: '数据服务',
      url: '/dataService',
    },
    {
      label: '数据资产',
      url: '/dataAsset',
    },

    {
      label: '运维中心',
      url: '/devops',
    },
    {
      label: '元数据中心',
      url: '/datacenter',
    },
  ]
  return (
    <div className={styles['summary-page']}>
      <h3>工作空间</h3>
      <div className="space-list">
        {dataSource.map((item) => (
          <div className="space-item">
            <div className="title-row">
              <span className="title">{item.name}</span>
              <span className="time">{item.createTime}</span>
            </div>
            <div className="menu-list">
              {munuList.map((menu) => (
                <a
                  onClick={() => {
                    cookies.set('workspaceId', item.id.toString(), { path: '/' }) // 放入cookie中
                    history.push(menu.url)
                  }}
                >
                  {menu.label}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

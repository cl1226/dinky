import React, { useEffect, useState } from 'react'
import { Empty, Tag } from 'antd'
import styles from './index.less'
import { history } from 'umi'
import { getWorkspaceByUser } from '@/pages/user/service'
import cookies from 'js-cookie'

export default () => {
  const [dataSource, setDataSource] = useState<any>([])
  const getDataSource = async () => {
    const list = await getWorkspaceByUser()

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
      label: '元数据中心',
      url: '/datacenter',
    },
  ]
  return (
    <div className={styles['summary-page']}>
      <h3>
        工作空间
        <Tag
          style={{ cursor: 'pointer', marginLeft: 10 }}
          color="blue"
          onClick={() => {
            history.replace('/user/cluster')
          }}
        >
          返回集群列表
        </Tag>
      </h3>

      {dataSource.length ? (
        <>
          <div className="space-list">
            {dataSource.map((item) => (
              <div className="space-item" key={item.id}>
                <div className="title-row">
                  <span className="title">{item.name}</span>
                  <span className="time">{item.createTime}</span>
                </div>
                <div className="info-row">
                  <span style={{ marginRight: 12 }}>{item.code}</span>
                  <span>{`${item.userIds.split(',').length}名成员`}</span>
                </div>
                <div className="menu-list">
                  {munuList.map((menu) => (
                    <a
                      key={menu.url}
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
        </>
      ) : (
        <Empty description="暂无工作空间" />
      )}
    </div>
  )
}

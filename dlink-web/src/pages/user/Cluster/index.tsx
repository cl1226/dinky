import React, { useEffect, useState } from 'react'
import styles from './index.less'
import { Button, Card, Empty } from 'antd'

import cookies from 'js-cookie'
import { history, useModel } from 'umi'
import { getClusterByUser } from '@/pages/user/service'
import PageWrap from '@/components/Common/PageWrap'

const Cluster = () => {
  const { initialState, setInitialState } = useModel('@@initialState')
  const [clusterList, setClusterList] = useState<any>([])
  const initHadoop = async () => {
    const result = await getClusterByUser()
    setClusterList(result)
  }
  useEffect(() => {
    localStorage.removeItem('dlink-clusterName')
    initHadoop()
  }, [])

  const onSelectCluster = async (item) => {
    cookies.set('clusterId', item.id.toString(), { path: '/' }) // 放入cookie中，优先，在fetchUserInfo中需传参

    const userInfo = await initialState?.fetchUserInfo?.()
    if (userInfo) {
      setInitialState({
        ...initialState,
        currentUser: userInfo,
      })
    }

    localStorage.setItem('dlink-clusterName', item.name.toString())
    cookies.remove('worksapceId')
    history.push(`/dashboard/workspace`)
  }

  return (
    <PageWrap pageHeaderRender={false} backgroundColor="transparent">
      <div className={styles['cluster-list']}>
        {clusterList.map((item) => (
          <Card className={'cluster-card'} hoverable bordered={false}>
            <div className="title-row">{item.name}</div>
            <div className="info-row">
              <div className="label-text">集群类型:</div>
              <div className="value-text">{item.type}</div>
            </div>
            <div className="info-row">
              <div className="label-text">集群状态:</div>
              <div className="value-text">{item.enabled ? '可用' : '不可用'}</div>
            </div>
            <div className="info-row">
              <div className="label-text">Kerberos认证:</div>
              <div className="value-text">{item.enabled ? '是' : '否'}</div>
            </div>
            <div className="info-row">
              <div className="label-text">创建时间:</div>
              <div className="value-text">{item.createTime}</div>
            </div>
            <div className="action-row">
              <Button type="primary" onClick={() => onSelectCluster(item)}>
                进入控制台
              </Button>
            </div>
          </Card>
        ))}
      </div>
      {!clusterList.length && <Empty description="暂无集群" />}
    </PageWrap>
  )
}

export default Cluster

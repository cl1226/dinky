import React, { useEffect, useRef, useState } from 'react'
import { PageContainer } from '@ant-design/pro-layout'
import styles from './index.less'
import { getClusterByUser } from '@/pages/user/service'
import { Button, Card, Col, Empty, Row } from 'antd'
import cookies from 'js-cookie'
import { history } from 'umi'

const Cluster = () => {
  const [clusterList, setClusterList] = useState<any>([])
  const initHadoop = async () => {
    const result = await getClusterByUser()
    setClusterList(result)
  }
  useEffect(() => {
    localStorage.removeItem('dlink-clusterName')
    initHadoop()
  }, [])
  const onSelectCluster = (item) => {
    localStorage.setItem('dlink-clusterName', item.name.toString())
    cookies.set('clusterId', item.id.toString(), { path: '/' }) // 放入cookie中
    cookies.remove('worksapceId')
    history.push(`/dashboard/workspace`)
  }

  return (
    <PageContainer pageHeaderRender={false} title={false}>
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
    </PageContainer>
  )
}

export default Cluster

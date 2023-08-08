import React, { useEffect, useRef, useState } from 'react'
import styles from './index.less'
import { PlusOutlined } from '@ant-design/icons'
import { Button, Card } from 'antd'
import { history } from 'umi'

import { getClusterList } from '@/pages/SuperAdmin/service'
import { ICluster } from '@/pages/SuperAdmin/type.d'
import PageWrap from '@/components/Common/PageWrap'

const ClusterPage: React.FC<{}> = (props: any) => {
  const [clusterList, setClusterList] = useState<ICluster[]>([])
  const initCluster = async () => {
    const result = await getClusterList()
    setClusterList(result)
  }
  useEffect(() => {
    initCluster()
  }, [])

  return (
    <PageWrap backgroundColor="transparent">
      <div className={styles['cluster-list']}>
        {clusterList.map((item) => (
          <Card className={'cluster-card'} hoverable bordered={false}>
            <div className="title-row">{item.name}</div>
            <div className="img-row">
              <img src="/registration/cluster/hadoop-card.svg" alt="" />
            </div>
            <div className="action-row">
              <Button onClick={() => history.push(`/sa/cluster/view/${item.id}`)}>查看详情</Button>
              <Button type="primary" onClick={() => history.push(`/sa/cluster/edit/${item.id}`)}>
                集群配置
              </Button>
            </div>
          </Card>
        ))}
        <Card
          className={'cluster-card'}
          hoverable
          bordered={false}
          onClick={() => history.push('/sa/cluster/create')}
        >
          <div className="add-wrap">
            <PlusOutlined />
          </div>
        </Card>
      </div>
    </PageWrap>
  )
}

export default ClusterPage

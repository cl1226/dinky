import React, { useRef, useState } from 'react'
import styles from './index.less'
import { PlusOutlined } from '@ant-design/icons'
import { Button, Card } from 'antd'
import { PageContainer } from '@ant-design/pro-layout'
import { history } from 'umi'

const HadoopPage: React.FC<{}> = (props: any) => {
  return (
    <PageContainer title={false}>
      <div className={styles['hadoop-list']}>
        <Card className={styles['hadoop-card']} hoverable bordered={false}>
          <div className="title-row">配置暗示</div>
          <div className="img-row">
            <img src="/registration/cluster/hadoop-card.svg" alt="" />
          </div>
          <div className="action-row">
            <Button onClick={() => history.push('/registration/cluster/hadoop/view/222')}>
              查看详情
            </Button>
            <Button
              type="primary"
              onClick={() => history.push('/registration/cluster/hadoop/edit/222')}
            >
              集群配置
            </Button>
          </div>
        </Card>
        <Card
          className={styles['hadoop-card']}
          hoverable
          bordered={false}
          onClick={() => history.push('/registration/cluster/hadoop/create')}
        >
          <div className="add-wrap">
            <PlusOutlined />
          </div>
        </Card>
      </div>
    </PageContainer>
  )
}

export default HadoopPage

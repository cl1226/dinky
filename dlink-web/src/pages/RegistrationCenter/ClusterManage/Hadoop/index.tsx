import React, { useEffect, useRef, useState } from 'react'
import styles from './index.less'
import { PlusOutlined } from '@ant-design/icons'
import { Button, Card } from 'antd'
import { PageContainer } from '@ant-design/pro-layout'
import { history } from 'umi'
import { getHadoopList } from '@/pages/RegistrationCenter/ClusterManage/service'
import { IHadoop } from '@/pages/RegistrationCenter/ClusterManage/Hadoop/data.d'
const HadoopPage: React.FC<{}> = (props: any) => {
  const [hadoopList, setHadoopList] = useState<IHadoop[]>([])
  const initHadoop = async () => {
    const result = await getHadoopList()
    setHadoopList(result)
  }
  useEffect(() => {
    initHadoop()
  }, [])
  return (
    <PageContainer title={false}>
      <div className={styles['hadoop-list']}>
        {hadoopList.map((item) => (
          <Card className={styles['hadoop-card']} hoverable bordered={false}>
            <div className="title-row">{item.name}</div>
            <div className="img-row">
              <img src="/registration/cluster/hadoop-card.svg" alt="" />
            </div>
            <div className="action-row">
              <Button onClick={() => history.push(`/registration/cluster/hadoop/view/${item.id}`)}>
                查看详情
              </Button>
              <Button
                type="primary"
                onClick={() => history.push(`/registration/cluster/hadoop/edit/${item.id}`)}
              >
                集群配置
              </Button>
            </div>
          </Card>
        ))}
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

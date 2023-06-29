import React, { useEffect, useRef, useState } from 'react'
import styles from './index.less'
import { Tabs } from 'antd'
import { Scrollbars } from 'react-custom-scrollbars'
import { useParams } from 'umi'
import Basic from './Basic'
import Yarn from './Yarn'
import { getHadoopDetail } from '@/pages/RegistrationCenter/ClusterManage/service'
import { IHadoop, IYarnQueueItem } from '@/pages/RegistrationCenter/ClusterManage/Hadoop/data.d'

const HadoopConfig: React.FC<{ mode: 'create' | 'view' | 'edit' }> = (props: any) => {
  const { mode } = props
  const pageParams: { id?: string } = useParams()
  const [isInited, setIsInited] = useState(false)
  const [hadoopDetail, setHadoopDetail] = useState<IHadoop | undefined>(undefined)
  const [yarnQueue, setYarnQueue] = useState<IYarnQueueItem[]>([])

  const initHadoopDetail = async () => {
    const result = await getHadoopDetail(Number(pageParams.id))
    if (result) {
      const { hadoop, yarnQueue } = result
      setHadoopDetail(hadoop)
      setYarnQueue(yarnQueue)
      setIsInited(true)
    }
  }
  const refreshHadoopInfo = (cluster, yarnQueue) => {
    setHadoopDetail(cluster)
    setYarnQueue(yarnQueue)
  }
  useEffect(() => {
    if ((mode === 'view' || mode === 'edit') && pageParams.id) {
      initHadoopDetail()
    } else {
      setIsInited(true)
    }
  }, [])
  return (
    <div className={styles['config-wrap']}>
      {isInited ? (
        <Tabs
          items={[
            {
              label: `基本配置`,
              key: 'basic',
              children: (
                <div className={styles['tab-wrap']}>
                  <Scrollbars style={{ height: '100%' }}>
                    <div style={{ padding: 10 }}>
                      <Basic
                        mode={mode}
                        detailInfo={{ hadoop: hadoopDetail, yarnQueue: yarnQueue }}
                        refreshHadoopInfo={refreshHadoopInfo}
                      />
                    </div>
                  </Scrollbars>
                </div>
              ),
            },
            {
              label: `Yarn队列`,
              key: 'yarn',
              children: (
                <div className={styles['tab-wrap']}>
                  <Scrollbars style={{ height: '100%' }}>
                    <div style={{ padding: 10 }}>
                      <Yarn mode={mode} detailInfo={yarnQueue} />
                    </div>
                  </Scrollbars>
                </div>
              ),
            },
          ]}
        />
      ) : null}
    </div>
  )
}

export default HadoopConfig

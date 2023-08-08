import React, { useEffect, useRef, useState } from 'react'
import styles from './index.less'
import { Tabs } from 'antd'
import { Scrollbars } from 'react-custom-scrollbars'
import { useParams } from 'umi'
import Basic from './Basic'
import User from './User'
import { getClusterDetail } from '@/pages/SuperAdmin/service'
import { ICluster, IYarnQueueItem } from '@/pages/SuperAdmin/type.d'

const ClusterConfig: React.FC<{ mode: 'create' | 'view' | 'edit' }> = (props: any) => {
  const { mode } = props
  const pageParams: { id?: string } = useParams()
  const [isInited, setIsInited] = useState(false)
  const [clusterDetail, setClusterDetail] = useState<ICluster | undefined>(undefined)
  const [yarnQueue, setYarnQueue] = useState<IYarnQueueItem[]>([])

  const initClusterDetail = async () => {
    const result = await getClusterDetail(Number(pageParams.id))
    if (result) {
      const { cluster, yarnQueue } = result
      setClusterDetail(cluster)
      setYarnQueue(yarnQueue)
      setIsInited(true)
    }
  }

  useEffect(() => {
    if ((mode === 'view' || mode === 'edit') && pageParams.id) {
      initClusterDetail()
    } else {
      setIsInited(true)
    }
  }, [])
  return (
    <div className={styles['config-wrap']}>
      {isInited ? (
        <Tabs
          className={'tabs-wrap'}
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
                        detailInfo={{ cluster: clusterDetail, yarnQueue: yarnQueue }}
                      />
                    </div>
                  </Scrollbars>
                </div>
              ),
            },
            {
              label: `绑定用户`,
              key: 'user',
              children: (
                <div className={styles['tab-wrap']}>
                  <Scrollbars style={{ height: '100%' }}>
                    <div style={{ padding: 10 }}>
                      <User mode={mode} detailInfo={clusterDetail?.id} />
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

export default ClusterConfig

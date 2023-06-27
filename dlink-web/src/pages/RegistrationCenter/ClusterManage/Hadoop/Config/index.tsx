import React, { useEffect, useRef, useState } from 'react'
import styles from './index.less'
import { Tabs } from 'antd'
import { Scrollbars } from 'react-custom-scrollbars'
import { useParams } from 'umi'
import Basic from './Basic'
import Yarn from './Yarn'
const HadoopConfig: React.FC<{ mode: 'create' | 'view' | 'edit' }> = (props: any) => {
  const { mode } = props
  const pageParams = useParams()
  useEffect(() => {
    console.log(pageParams)
  }, [])
  return (
    <div className={styles['config-wrap']}>
      <Tabs
        items={[
          {
            label: `基本配置`,
            key: 'basic',
            children: (
              <div className={styles['tab-wrap']}>
                <Scrollbars style={{ height: '100%' }}>
                  <div style={{ padding: 10 }}>
                    <Basic mode={mode} />
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
                    <Yarn mode={mode} />
                  </div>
                </Scrollbars>
              </div>
            ),
          },
        ]}
      />
    </div>
  )
}

export default HadoopConfig

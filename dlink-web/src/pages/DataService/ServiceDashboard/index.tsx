import React, { useCallback, useEffect, useState } from 'react'
import styles from './index.less'
import { Tabs, Card, Col, Form, Row } from 'antd'
import { PageContainer } from '@ant-design/pro-layout'
import { Scrollbars } from 'react-custom-scrollbars'
import Summary from './Summary'
import DetailList from './DetailList'
const ServiceDashboard: React.FC<{}> = (props: any) => {
  return (
    <PageContainer title={false}>
      <div className={styles['dashboard-wrap']}>
        <Tabs
          items={[
            {
              label: `汇总`,
              key: 'summary',
              children: (
                <div className={styles['tab-wrap']}>
                  <Scrollbars style={{ height: '100%' }}>
                    <div style={{ padding: 10 }}>
                      <Summary />
                    </div>
                  </Scrollbars>
                </div>
              ),
            },
            {
              label: `详情`,
              key: 'detail',
              children: (
                <div className={styles['tab-wrap']}>
                  <Scrollbars style={{ height: '100%' }}>
                    <div style={{ padding: 10 }}>
                      <DetailList></DetailList>
                    </div>
                  </Scrollbars>
                </div>
              ),
            },
          ]}
        />
      </div>
    </PageContainer>
  )
}

export default ServiceDashboard
